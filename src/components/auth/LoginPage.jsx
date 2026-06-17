import { useState } from 'react';
import { signIn } from '../../lib/supabaseClient';

export default function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPwd, setShowPwd]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { data, error } = await signIn(email, password);
    if (error) { setError('Identifiants incorrects. Vérifiez votre email et mot de passe.'); setLoading(false); }
    else onLogin(data.user);
  };

  return (
    <>
      <style>{`
        .login-root {
          display: flex;
          min-height: 100vh;
          min-height: 100dvh;
          font-family: 'Inter', sans-serif;
        }
        .login-left {
          flex: 1;
          background: linear-gradient(145deg, #005f7a 0%, #008fb5 50%, #00b4d8 100%);
          padding: 52px 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .login-right {
          width: 500px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          background: #f0f7fa;
        }
        /* Tablet : réduire le panneau gauche */
        @media (max-width: 900px) {
          .login-left { padding: 36px 36px; }
          .login-right { width: 420px; }
        }
        /* Mobile : empiler verticalement, gauche en haut compact */
        @media (max-width: 640px) {
          .login-root { flex-direction: column; }
          .login-left {
            flex: none;
            padding: 28px 24px 24px;
            min-height: auto;
          }
          .login-left-logo   { width: 72px !important; height: 72px !important; margin-bottom: 14px !important; }
          .login-left-title  { font-size: 13px !important; margin-bottom: 18px !important; }
          .login-features    { display: none !important; }
          .login-divider     { display: none !important; }
          .login-version     { position: static !important; margin-top: 12px; font-size: 10px; color: rgba(255,255,255,0.3); }
          .login-right {
            width: 100%;
            flex: 1;
            padding: 24px 16px;
            align-items: flex-start;
          }
          .login-card {
            padding: 28px 20px !important;
            border-radius: 16px !important;
          }
        }
        /* Très petit écran */
        @media (max-width: 360px) {
          .login-right { padding: 16px 12px; }
          .login-card  { padding: 22px 16px !important; }
        }
      `}</style>

      <div className="login-root">
        {/* ── GAUCHE ── */}
        <div className="login-left">
          <div style={{position:'absolute',width:380,height:380,borderRadius:'50%',background:'rgba(0,166,81,0.1)',top:-80,right:-80,pointerEvents:'none'}} />
          <div style={{position:'absolute',width:240,height:240,borderRadius:'50%',background:'rgba(247,148,29,0.1)',bottom:60,left:-60,pointerEvents:'none'}} />

          <div style={{position:'relative',zIndex:1}}>
            <div className="login-left-logo" style={{width:130,height:130,background:'#fff',borderRadius:22,display:'flex',alignItems:'center',justifyContent:'center',padding:12,marginBottom:24,boxShadow:'0 8px 32px rgba(0,0,0,0.15)'}}>
              <img src="/logo_paide.jpg" alt="PAIDE" style={{width:'100%',height:'100%',objectFit:'contain'}} />
            </div>

            <p className="login-left-title" style={{fontSize:15,color:'rgba(255,255,255,0.75)',lineHeight:1.7,marginBottom:28}}>
              Programme d'Appui aux Initiatives<br/>de Développement de l'Enfant
            </p>

            <div className="login-divider" style={{width:48,height:3,background:'linear-gradient(90deg,#f7941d,#faab4a)',borderRadius:2,marginBottom:28}} />

            <div className="login-features" style={{display:'flex',flexDirection:'column',gap:14}}>
              {[
                {icon:'🏛️',text:'Gestion des Centres'},
                {icon:'👥',text:'Suivi des Agents'},
                {icon:'🗂️',text:'Coordinations Provinciales'},
                {icon:'📊',text:'Rapports & Statistiques'},
                {icon:'📅',text:'Calendrier des Activités'},
              ].map((f,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:38,height:38,borderRadius:10,flexShrink:0,background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>{f.icon}</div>
                  <span style={{fontSize:15,color:'rgba(255,255,255,0.85)',fontWeight:500}}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="login-version" style={{position:'absolute',bottom:24,left:52,fontSize:11,color:'rgba(255,255,255,0.3)',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase'}}>
            PAIDE V0 · Beta
          </p>
        </div>

        {/* ── DROITE ── */}
        <div className="login-right">
          <div className="login-card" style={{background:'#fff',borderRadius:22,padding:'40px 36px',width:'100%',maxWidth:440,boxShadow:'0 20px 60px rgba(0,95,122,0.12)',border:'1px solid rgba(0,143,181,0.1)'}}>
            <div style={{marginBottom:28,textAlign:'center'}}>
              <div style={{width:72,height:72,margin:'0 auto 14px',background:'#f0f7fa',borderRadius:16,padding:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <img src="/logo_paide.jpg" alt="PAIDE" style={{width:'100%',height:'100%',objectFit:'contain'}} />
              </div>
              <h2 style={{fontSize:24,fontWeight:800,color:'#0d1b2a',letterSpacing:'-0.4px',marginBottom:6}}>Connexion</h2>
              <p style={{fontSize:13,color:'#8ca5b5'}}>Accédez à votre espace PAIDE Manager</p>
            </div>

            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label style={{fontSize:13,fontWeight:600,color:'#4a6378'}}>Adresse email</label>
                <div style={{display:'flex',alignItems:'center',border:'1.5px solid #e2edf2',borderRadius:10,background:'#f7f9fc',overflow:'hidden'}}>
                  <span style={{padding:'0 13px',fontSize:16,flexShrink:0}}>✉️</span>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com" required
                    style={{flex:1,padding:'13px 0',border:'none',background:'transparent',fontSize:14,color:'#0d1b2a',fontFamily:"'Inter',sans-serif",minWidth:0}} />
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label style={{fontSize:13,fontWeight:600,color:'#4a6378'}}>Mot de passe</label>
                <div style={{display:'flex',alignItems:'center',border:'1.5px solid #e2edf2',borderRadius:10,background:'#f7f9fc',overflow:'hidden'}}>
                  <span style={{padding:'0 13px',fontSize:16,flexShrink:0}}>🔒</span>
                  <input type={showPwd?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                    style={{flex:1,padding:'13px 0',border:'none',background:'transparent',fontSize:14,color:'#0d1b2a',fontFamily:"'Inter',sans-serif",minWidth:0}} />
                  <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{padding:'0 13px',background:'none',border:'none',fontSize:16,opacity:0.5,flexShrink:0,cursor:'pointer'}}>
                    {showPwd?'🙈':'👁️'}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{display:'flex',alignItems:'flex-start',gap:8,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'11px 14px',fontSize:13,color:'#dc2626',fontWeight:500}}>
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'linear-gradient(135deg,#33adc8,#006e8e)',color:'#fff',border:'none',borderRadius:12,padding:'15px',fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px rgba(0,143,181,0.35)',marginTop:4,opacity:loading?0.8:1}}>
                {loading ? '⏳ Connexion…' : 'Se connecter →'}
              </button>
            </form>

            <p style={{textAlign:'center',fontSize:11,color:'#8ca5b5',marginTop:22,lineHeight:1.6}}>
              PAIDE © {new Date().getFullYear()} · Accès réservé au personnel autorisé
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
