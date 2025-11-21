import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { code, shop } = req.query;
  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI;

  // Échange le code contre un token d’accès
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      code,
      redirect_uri: redirectUri
    })
  });
  const { access_token } = await tokenRes.json();

  // Stocke shop+token selon ta stratégie (cookie, session, DB)
  // Exemple: en cookie temporaire (à sécuriser en prod)
  res.setHeader('Set-Cookie', [
    `shop=${shop}; Path=/; HttpOnly; Secure; SameSite=Strict;`,
    `access_token=${access_token}; Path=/; HttpOnly; Secure; SameSite=Strict;`
  ]);
  res.redirect('/'); // redirige vers la home
}
