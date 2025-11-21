import { shopifyApi } from '@shopify/shopify-api';

export function getShopifyClient({ shop, accessToken }) {
  return shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SHOPIFY_SCOPES.split(','),
    hostName: shop,
    adminApiAccessToken: accessToken,
    apiVersion: '2025-10'
  });
}
