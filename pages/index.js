import { useState } from 'react';

export default function InstallPage() {
  const [shop, setShop] = useState('');
  const [valid, setValid] = useState(false);

  function validateShop(val) {
    return /^([\w-]+)\.myshopify\.com$/i.test(val.trim());
  }

  function handleChange(e) {
    setShop(e.target.value);
    setValid(validateShop(e.target.value));
  }

  function handleInstall(e) {
    e.preventDefault();
    if (!valid) return;
    window.location.href = `/api/auth/${encodeURIComponent(shop.trim())}`;
  }

  return (
    <div style={{ fontFamily:'serif', textAlign: 'center', marginTop: 80 }}>
      <h1 style={{ fontWeight:"bold" }}>Installer l'app Shopify automatique</h1>
      <p>Entrez votre nom de boutique Shopify pour lancer l'installation de l'app sur votre store.</p>
      <form onSubmit={handleInstall}>
        <input
          type="text"
          value={shop}
          onChange={handleChange}
          placeholder="votrestore.myshopify.com"
          style={{
            width: 320,
            height: 40,
            fontSize: 20,
            textAlign: 'center',
            border: '1px solid #ccc',
            borderRadius: 5,
            marginTop: 24,
            marginBottom: 16,
            outline: 'none',
          }}
        />
        <br/>
        <button
          type="submit"
          disabled={!valid}
          style={{
            width: 320,
            height: 40,
            fontSize: 20,
            background: '#efefef',
            borderRadius: 5,
            border: 'none',
            color: '#444',
            marginTop: 8,
            cursor: valid ? 'pointer' : 'not-allowed',
            opacity: valid ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        >
          Installer l'app sur Shopify
        </button>
      </form>
      <p style={{ marginTop: 40, color: '#888', fontSize: 18 }}>
        Après installation, l'automatisation de votre boutique démarre<br /> (pages, produits, thème).
      </p>
    </div>
  );
}
