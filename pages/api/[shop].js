import { shopifyApi, AuthScopes } from '@shopify/shopify-api';

export default async function handler(req, res) {
  const { shop } = req.query;
  const scopes = process.env.SHOPIFY_SCOPES;
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI;
  const apiKey = process.env.SHOPIFY_API_KEY;

  // build the auth URL
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}&response_type=code`;
  res.redirect(authUrl);
}
