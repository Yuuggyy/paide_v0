import { useState } from 'react';
import { signIn } from '../../lib/supabaseClient';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await signIn(email, password);
    if (error) {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    } else {
      onLogin(data.user);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.logoCircle}>
            <span style={styles.logoLetter}>P</span>
          </div>
          <h1 style={styles.brand}>PAIDE</h1>
          <p style={styles.brandSub}>Plateforme Administrative<br />Intégrée de Développement</p>
          <div style={styles.features}>
            {['Gestion des Centres', 'Suivi des Agents', 'Coordinations Provinciales', 'Rapports & Statistiques'].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureDot}></span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.wave}></div>
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.formBox}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Connexion</h2>
            <p style={styles.formSub}>Accédez à votre espace PAIDE</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Adresse email</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Mot de passe</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {error && (
              <div style={styles.errorBox}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? (
                <span style={styles.loader}></span>
              ) : (
                <>Se connecter <span>→</span></>
              )}
            </button>
          </form>

          <p style={styles.footer}>
            PAIDE © {new Date().getFullYear()} — Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
  },
  left: {
    flex: 1,
    background: 'linear-gradient(145deg, #0f2a4a 0%, #1e4976 50%, #2563eb 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: { position: 'relative', zIndex: 2 },
  logoCircle: {
    width: '72px', height: '72px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '20px',
  },
  logoLetter: { fontSize: '36px', fontWeight: '800', color: '#fff' },
  brand: { fontSize: '42px', fontWeight: '800', color: '#fff', letterSpacing: '-1px', marginBottom: '8px' },
  brandSub: { fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '48px' },
  features: { display: 'flex', flexDirection: 'column', gap: '16px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '15px' },
  featureDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', flexShrink: 0 },
  wave: {
    position: 'absolute', right: '-80px', top: '50%', transform: 'translateY(-50%)',
    width: '200px', height: '200px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)', zIndex: 1,
  },
  right: {
    width: '480px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f4f8',
    padding: '40px',
  },
  formBox: {
    background: '#fff',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  },
  formHeader: { marginBottom: '32px' },
  formTitle: { fontSize: '28px', fontWeight: '700', color: '#0f2a4a', marginBottom: '6px' },
  formSub: { fontSize: '14px', color: '#6b7280' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  inputWrap: { display: 'flex', alignItems: 'center', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s' },
  inputIcon: { padding: '0 14px', fontSize: '16px' },
  input: {
    flex: 1, padding: '12px 14px 12px 0',
    border: 'none', background: 'transparent',
    fontSize: '14px', color: '#111827',
    fontFamily: "'Inter', sans-serif",
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #2563eb, #1e4976)',
    color: '#fff', border: 'none',
    padding: '14px', borderRadius: '10px',
    fontSize: '15px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
    marginTop: '4px',
  },
  loader: {
    width: '20px', height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  footer: { textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '24px' },
};
