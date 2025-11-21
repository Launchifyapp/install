import { useRouter } from 'next/router';

export default function InstallResult() {
  const router = useRouter();
  const { success, shop } = router.query;

  if (success === 'false') {
    // Affichage en cas d'échec
    return (
      <div style={{ fontFamily:'serif', textAlign:'center', marginTop:100 }}>
        <h1 style={{ color: '#d33', fontWeight: 'bold', fontSize: 36, marginBottom:24 }}>
          ❌ Echec de l'installation
        </h1>
        <p style={{ fontSize: 22, marginBottom: 8 }}>
          Echec de l'installation.<br />
          Contactez <a href="mailto:contact@launchify.store" style={{color:"#157"}}>contact@launchify.store</a>
        </p>
      </div>
    );
  }

  // Affichage en cas de réussite
  return (
    <div style={{ fontFamily:'serif', textAlign:'center', marginTop:100 }}>
      <h1 style={{ color:'#55c777', fontWeight:'bold', fontSize:36, marginBottom:24 }}>
        ✅ Installation réussie !
      </h1>
      <p style={{ fontSize:22, marginBottom:8 }}>
        Félicitations, votre boutique Shopify a été automatisée.<br/>
        Vous pouvez maintenant personnaliser votre site et commencer à vendre !
      </p>
      <button
        style={{
          fontSize:20,
          background:"#6ecf93",
          border:"none",
          borderRadius:7,
          padding:"10px 38px",
          color:"#fff",
          marginTop:32,
          cursor:"pointer",
          fontWeight:"bold"
        }}
        onClick={() => {
          if (shop)
            window.location.href = `https://${shop}/admin`
        }}
      >
        Accéder à l'admin Shopify
      </button>
      <p style={{ marginTop:40, color:'#888', fontSize:18 }}>
        Si vous avez besoin d'aide, <a href="mailto:contact@launchify.store" style={{color:"#1249ea"}}>contactez le support</a>
      </p>
    </div>
  );
}
