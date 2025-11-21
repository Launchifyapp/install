import { useEffect, useState } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ici, tu peux lancer l'automatisation : appel au backend
    // fetch('/api/start-automation')...
    // Quand c'est fini, setLoading(false) ou passer à l'étape suivante

    async function automate() {
      try {
        // Exemple : lance l'import, création produits, etc.
        const res = await fetch('/api/start-automation', { method: 'POST' });
        // handle résultat, étape 2, 3, etc selon ton flow
      } catch (e) {
        // Gère l'erreur
      } finally {
        setLoading(false); // ou passe à la page suivante
      }
    }
    automate();
  }, []);

  return (
    <div style={{ fontFamily:'serif', textAlign:'center', marginTop:100 }}>
      <h1 style={{ fontWeight:"bold" }}>Installation en cours…</h1>
      <div style={{margin:"28px 0 14px 0", fontSize:21}}>
        Étape 1/3. Merci de patienter pendant l’automatisation complète de votre boutique Shopify.
      </div>
      {loading && (
        <div style={{
          margin: '38px auto',
          width: 64, height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            border:"6px solid #efefef",
            borderTop:"6px solid #338CF3",
            borderRadius:"50%",
            width:"52px",
            height:"52px",
            animation:'spin 1s linear infinite'
          }} />
          <style jsx>{`
            @keyframes spin {
              0% {transform: rotate(0deg);}
              100% {transform: rotate(360deg);}
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
