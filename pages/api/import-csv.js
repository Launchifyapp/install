import { getShopifyClient } from '../../lib/shopify';
import { parse } from 'csv-parse/sync';

export default async function handler(req, res) {
  // Lis le shop/token depuis le cookie
  const shop = req.cookies.shop;
  const accessToken = req.cookies.access_token;

  if (!shop || !accessToken) return res.status(403).json({ error: 'Non authentifié.' });

  // Recevoir le CSV et le parser
  const records = parse(req.body, { columns: true });
  const shopify = getShopifyClient({ shop, accessToken });

  let results = [];
  for (const product of records) {
    try {
      const mutation = `mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product { id title }
          userErrors { field message }
        }
      }`;
      const input = { title: product.title, variants: [{ price: product.price }], descriptionHtml: product.description };
      const data = await shopify.clients.graphql(shop, mutation, { input });
      results.push(data.productCreate);
    } catch (err) {
      results.push({ error: err.message, product });
    }
  }
  res.status(200).json({ results });
}
