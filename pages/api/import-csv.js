import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { getShopifyClient } from '../../lib/shopify';

/**
 * HELPERS pour regroupement & mapping
 */

// Regroupe toutes lignes du CSV par Handle (produit principal)
function groupByHandle(records) {
  const byHandle = {};
  for (const r of records) {
    if (!r.Handle) continue;
    if (!byHandle[r.Handle]) byHandle[r.Handle] = [];
    byHandle[r.Handle].push(r);
  }
  return byHandle;
}

// Transforme les lignes d'un produit en structure Shopify ProductInput
function toShopifyProduct(handleRows) {
  // Prend la première ligne (produit principal)
  const main = handleRows[0];

  // Title, Body, Vendor, Published/Status, Type, Tags
  const title = main.Title?.trim() || '';
  const descriptionHtml = main['Body (HTML)'] || '';
  const vendor = main.Vendor || '';
  const productType = main.Type || main['Product Category'] || '';
  const tags = main.Tags ? main.Tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const published = main.Published?.toLowerCase() === 'true' || main.Status === 'active';

  // OPTIONS
  // Récupère toutes options (Option1, Option2, ...)
  const optionNames = [];
  for (let i = 1; i <= 3; i++) {
    const name = main[`Option${i} Name`] || main[`Option${i} Name`];
    if (name && !optionNames.includes(name)) optionNames.push(name);
  }
  const options = optionNames.map((optName, i) => ({
    name: optName,
    values: Array.from(new Set(handleRows.map(r => r[`Option${i+1} Value`]).filter(Boolean)))
  }));

  // VARIANTS
  const variants = handleRows.map(r => ({
    title: r.Title || '',
    sku: r['Variant SKU'] || '',
    price: r['Variant Price'] || '',
    compareAtPrice: r['Variant Compare At Price'] || undefined,
    inventoryManagement: r['Variant Inventory Tracker'] || undefined,
    inventoryPolicy: r['Variant Inventory Policy'] || undefined,
    fulfillmentService: r['Variant Fulfillment Service'] || undefined,
    taxable: r['Variant Taxable'] === 'True',
    requiresShipping: r['Variant Requires Shipping'] === 'True',
    barcode: r['Variant Barcode'] || undefined,
    weight: r['Variant Grams'] ? parseFloat(r['Variant Grams']) : undefined,
    weightUnit: r['Variant Weight Unit'] || undefined,
    options: [
      r['Option1 Value'] || '',
      r['Option2 Value'] || '',
      r['Option3 Value'] || ''
    ].filter(Boolean),
    image: r['Variant Image'] || undefined
  }));

  // IMAGES
  // Récupère toutes images uniques sur le produit & variantes
  const imageSrcs = Array.from(new Set(
    handleRows
      .map(r => [
        r['Image Src'],
        r['Variant Image']
      ])
      .flat()
      .filter(Boolean)
  ));

  const images = imageSrcs.map(url => ({ src: url }));

  return {
    title,
    descriptionHtml,
    vendor,
    productType,
    tags,
    published,
    options,
    images,
    variants
  };
}

export default async function handler(req, res) {
  // Auth dynamique via cookies
  const shop = req.cookies.shop;
  const accessToken = req.cookies.access_token;
  if (!shop || !accessToken) return res.status(403).json({ error: 'Non authentifié.' });

  const filePath = path.join(process.cwd(), 'public', 'products.csv');
  let csvData;
  try {
    csvData = await fs.promises.readFile(filePath, 'utf-8');
  } catch (err) {
    return res.status(500).json({ error: 'Fichier public/products.csv introuvable.' });
  }

  // Parse CSV
  let records;
  try {
    records = parse(csvData, { columns: true, skip_empty_lines: true, delimiter: ';' });
  } catch (err) {
    return res.status(400).json({ error: 'Erreur de parsing CSV.' });
  }

  // Regroupe par Handle & mapping
  const grouped = groupByHandle(records);
  const productsToImport = Object.values(grouped).map(toShopifyProduct);

  const shopify = getShopifyClient({ shop, accessToken });

  // Pour chaque produit, crée-le sur Shopify via GraphQL
  let results = [];
  for (const prodInput of productsToImport) {
    try {
      const mutation = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product { id, title }
          userErrors { field, message }
        }
      }
      `;
      const data = await shopify.clients.graphql(shop, mutation, { input: prodInput });
      results.push({ product: data.productCreate.product, errors: data.productCreate.userErrors });
    } catch (err) {
      results.push({ error: err.message, product: prodInput.title });
    }
  }

  res.status(200).json({ results });
}
