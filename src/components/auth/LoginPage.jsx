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
    <div style={s.root}>
      {/* ── LEFT ── */}
      <div style={s.left}>
        <div style={s.blob1} /><div style={s.blob2} /><div style={s.blob3} />

        <div style={s.lContent}>
          {/* Logo */}
          <div style={s.logoWrap}>
            <img src="/logo_paide.jpg" alt="PAIDE" style={s.logo} />
          </div>

          <p style={s.fullName}>Programme d'Appui aux Initiatives<br/>de Développement de l'Enfant</p>

          <div style={s.divider} />

          <div style={s.features}>
            {[
              { icon: '🏛️', text: 'Gestion des Centres' },
              { icon: '👥', text: 'Suivi des Agents' },
              { icon: '🗂️', text: 'Coordinations Provinciales' },
              { icon: '📊', text: 'Rapports & Statistiques' },
              { icon: '📅', text: 'Calendrier des Activités' },
            ].map((f,i) => (
              <div key={i} style={s.fRow}>
                <div style={s.fIcon}>{f.icon}</div>
                <span style={s.fText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={s.version}>PAIDE V0 · Beta</p>
      </div>

      {/* ── RIGHT ── */}
      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardTop}>
            <div style={s.cardLogoSmall}>
              <img src="/logo_paide.jpg" alt="PAIDE" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h2 style={s.title}>Connexion</h2>
            <p style={s.sub}>Accédez à votre espace PAIDE Manager</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Adresse email</label>
              <div style={s.inputWrap}>
                <span style={s.icon}>✉️</span>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required style={s.inp}
                />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Mot de passe</label>
              <div style={s.inputWrap}>
                <span style={s.icon}>🔒</span>
                <input
                  type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required style={s.inp}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={s.eye}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={s.err}>
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} style={s.submit}>
              {loading
                ? <><span className="spinner" /> Connexion…</>
                : <>Se connecter &nbsp;→</>
              }
            </button>
          </form>

          <p style={s.footer}>
            PAIDE © {new Date().getFullYear()} · Accès réservé au personnel autorisé
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },

  /* Left */
  left: {
    flex: 1,
    background: 'linear-gradient(145deg, #005f7a 0%, #008fb5 50%, #00b4d8 100%)',
    padding: '52px 60px',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  blob1: { position:'absolute', width:380, height:380, borderRadius:'50%', background:'rgba(0,166,81,0.1)', top:-80, right:-80, pointerEvents:'none' },
  blob2: { position:'absolute', width:240, height:240, borderRadius:'50%', background:'rgba(247,148,29,0.1)', bottom:60, left:-60, pointerEvents:'none' },
  blob3: { position:'absolute', width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.05)', top:'45%', right:'8%', pointerEvents:'none' },

  lContent: { position:'relative', zIndex:1 },

  logoWrap: {
    width: 140, height: 140,
    background: '#fff',
    borderRadius: 24,
    display:'flex', alignItems:'center', justifyContent:'center',
    padding: 12,
    marginBottom: 28,
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  logo: { width:'100%', height:'100%', objectFit:'contain' },

  fullName: { fontSize:15, color:'rgba(255,255,255,0.75)', lineHeight:1.7, marginBottom:32 },
  divider: { width:48, height:3, background:'linear-gradient(90deg,#f7941d,#faab4a)', borderRadius:2, marginBottom:32 },

  features: { display:'flex', flexDirection:'column', gap:14 },
  fRow: { display:'flex', alignItems:'center', gap:14 },
  fIcon: {
    width:38, height:38, borderRadius:10, flexShrink:0,
    background:'rgba(255,255,255,0.12)',
    display:'flex', alignItems:'center', justifyContent:'center', fontSize:17,
  },
  fText: { fontSize:15, color:'rgba(255,255,255,0.85)', fontWeight:500 },

  version: { position:'absolute', bottom:28, left:60, fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase' },

  /* Right */
  right: {
    width: 500, flexShrink:0,
    display:'flex', alignItems:'center', justifyContent:'center',
    padding: '40px 32px',
    background: '#f0f7fa',
  },
  card: {
    background:'#fff', borderRadius:24, padding:'44px 40px',
    width:'100%',
    boxShadow:'0 20px 60px rgba(0,95,122,0.12), 0 4px 16px rgba(0,95,122,0.06)',
    border:'1px solid rgba(0,143,181,0.1)',
  },

  cardTop: { marginBottom:32, textAlign:'center' },
  cardLogoSmall: {
    width:80, height:80, margin:'0 auto 16px',
    background:'#f0f7fa', borderRadius:16, padding:8,
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  title: { fontSize:26, fontWeight:800, color:'#0d1b2a', letterSpacing:'-0.4px', marginBottom:6 },
  sub:   { fontSize:14, color:'#8ca5b5' },

  form: { display:'flex', flexDirection:'column', gap:18 },
  field: { display:'flex', flexDirection:'column', gap:7 },
  label: { fontSize:13, fontWeight:600, color:'#4a6378' },
  inputWrap: {
    display:'flex', alignItems:'center',
    border:'1.5px solid #e2edf2', borderRadius:10,
    background:'#f7f9fc', overflow:'hidden',
    transition:'border-color 0.2s, box-shadow 0.2s',
  },
  icon: { padding:'0 13px', fontSize:16, flexShrink:0 },
  inp: {
    flex:1, padding:'13px 0',
    border:'none', background:'transparent',
    fontSize:14, color:'#0d1b2a', fontFamily:"'Inter',sans-serif",
  },
  eye: { padding:'0 13px', background:'none', border:'none', fontSize:16, opacity:0.5, flexShrink:0 },

  err: {
    display:'flex', alignItems:'flex-start', gap:8,
    background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10,
    padding:'11px 14px', fontSize:13.5, color:'#dc2626', fontWeight:500,
  },

  submit: {
    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
    background:'linear-gradient(135deg, #33adc8, #006e8e)',
    color:'#fff', border:'none', borderRadius:12,
    padding:15, fontSize:15, fontWeight:700,
    cursor:'pointer',
    boxShadow:'0 4px 20px rgba(0,143,181,0.35)',
    marginTop:4,
  },

  footer: { textAlign:'center', fontSize:12, color:'#8ca5b5', marginTop:24, lineHeight:1.6 },
};
