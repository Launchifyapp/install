import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { getShopifyClient } from '../../lib/shopify';

export default async function handler(req, res) {
  // Récupère dynamiquement le shop et l'access_token (via cookie, session ou autre stratégie)
  const shop = req.cookies.shop;
  const accessToken = req.cookies.access_token;

  if (!shop || !accessToken) return res.status(403).json({ error: 'Non authentifié.' });

  // Lecture du fichier CSV dans public/
  const filePath = path.join(process.cwd(), 'public', 'products.csv');
  let csvData;
  try {
    csvData = await fs.promises.readFile(filePath, 'utf-8');
  } catch (err) {
    return res.status(500).json({ error: 'Fichier public/products.csv introuvable.' });
  }

  // Parsing du CSV
  let records;
  try {
    records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    });
  } catch (err) {
    return res.status(400).json({ error: 'Erreur de parsing CSV.' });
  }

  // Initialisation du client Shopify avec shop/token dynamiques
  const shopify = getShopifyClient({ shop, accessToken });

  // Import des produits via GraphQL
  let results = [];
  for (const product of records) {
    try {
      const mutation = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product { id title }
          userErrors { field message }
        }
      }
      `;
      const input = {
        title: product.title || product.Titre,
        descriptionHtml: product.description || product.Description,
        variants: [{ price: product.price || product.Prix }]
      };

      const data = await shopify.clients.graphql(shop, mutation, { input });
      results.push(data.productCreate);
    } catch (err) {
      results.push({ error: err.message, product });
    }
  }

  res.status(200).json({ results });
}
