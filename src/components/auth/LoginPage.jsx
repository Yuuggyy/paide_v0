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
    setLoading(true);
    setError('');
    const { data, error } = await signIn(email, password);
    if (error) {
      setError('Identifiants incorrects. Vérifiez votre email et mot de passe.');
      setLoading(false);
    } else {
      onLogin(data.user);
    }
  };

  return (
    <div style={s.root}>
      {/* ── LEFT PANEL ── */}
      <div style={s.left}>
        {/* Background shapes */}
        <div style={s.shape1} />
        <div style={s.shape2} />
        <div style={s.shape3} />

        <div style={s.leftContent}>
          {/* Logo */}
          <div style={s.logo}>
            <span style={s.logoText}>P</span>
          </div>

          <h1 style={s.brandName}>PAIDE</h1>
          <p style={s.brandTagline}>Plateforme Administrative<br/>Intégrée de Développement</p>

          <div style={s.divider} />

          <div style={s.featureList}>
            {[
              { icon: '🏛️', label: 'Gestion des Centres' },
              { icon: '👥', label: 'Suivi des Agents' },
              { icon: '🗂️', label: 'Coordinations Provinciales' },
              { icon: '📊', label: 'Rapports & Statistiques' },
              { icon: '📅', label: 'Calendrier des Activités' },
            ].map((f, i) => (
              <div key={i} style={s.feature}>
                <div style={s.featureIcon}>{f.icon}</div>
                <span style={s.featureLabel}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Version badge */}
        <div style={s.versionBadge}>PAIDE V0 · Beta</div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={s.right}>
        <div style={s.formCard}>
          {/* Header */}
          <div style={s.formTop}>
            <div style={s.formIcon}>👋</div>
            <h2 style={s.formTitle}>Bon retour !</h2>
            <p style={s.formSub}>Connectez-vous à votre espace PAIDE</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={s.form}>
            {/* Email */}
            <div style={s.field}>
              <label style={s.label}>Adresse email</label>
              <div style={s.inputBox}>
                <span style={s.inputPrefix}>✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  style={s.input}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={s.label}>Mot de passe</label>
              <div style={s.inputBox}>
                <span style={s.inputPrefix}>🔒</span>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={s.input}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={s.eyeBtn}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={s.errorBox}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={s.submitBtn}>
              {loading ? (
                <>
                  <span style={s.spinner} />
                  Connexion en cours…
                </>
              ) : (
                <>Se connecter <span style={s.arrow}>→</span></>
              )}
            </button>
          </form>

          {/* Footer */}
          <p style={s.formFooter}>
            PAIDE © {new Date().getFullYear()} — Accès réservé au personnel autorisé
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── STYLES ── */
const s = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    background: '#eef2ff',
  },

  /* Left */
  left: {
    flex: 1,
    background: 'linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 55%, #2563eb 100%)',
    padding: '48px 56px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  shape1: {
    position: 'absolute', width: '400px', height: '400px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
    top: '-100px', right: '-100px',
    pointerEvents: 'none',
  },
  shape2: {
    position: 'absolute', width: '250px', height: '250px',
    borderRadius: '50%',
    background: 'rgba(249,115,22,0.08)',
    bottom: '60px', left: '-60px',
    pointerEvents: 'none',
  },
  shape3: {
    position: 'absolute', width: '180px', height: '180px',
    borderRadius: '50%',
    background: 'rgba(34,197,94,0.06)',
    top: '40%', right: '5%',
    pointerEvents: 'none',
  },
  leftContent: { position: 'relative', zIndex: 1 },

  logo: {
    width: '72px', height: '72px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(12px)',
    border: '1.5px solid rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  logoText: { fontSize: '36px', fontWeight: '900', color: '#fff', lineHeight: 1 },

  brandName: {
    fontSize: '52px', fontWeight: '900',
    color: '#fff', letterSpacing: '-2px',
    lineHeight: 1, marginBottom: '10px',
  },
  brandTagline: {
    fontSize: '16px', color: 'rgba(255,255,255,0.65)',
    lineHeight: 1.7, marginBottom: '36px',
  },
  divider: {
    width: '48px', height: '3px',
    background: 'linear-gradient(90deg, #f97316, #fb923c)',
    borderRadius: '2px', marginBottom: '32px',
  },
  featureList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  feature: { display: 'flex', alignItems: 'center', gap: '14px' },
  featureIcon: {
    width: '38px', height: '38px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '17px', flexShrink: 0,
  },
  featureLabel: { fontSize: '15px', color: 'rgba(255,255,255,0.82)', fontWeight: '500' },

  versionBadge: {
    position: 'absolute', bottom: '28px', left: '56px',
    fontSize: '11px', color: 'rgba(255,255,255,0.35)',
    fontWeight: '600', letterSpacing: '1px',
    textTransform: 'uppercase',
  },

  /* Right */
  right: {
    width: '500px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
    background: '#eef2ff',
  },
  formCard: {
    background: '#fff',
    borderRadius: '24px',
    padding: '48px 44px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(15,23,42,0.1), 0 4px 16px rgba(15,23,42,0.05)',
    border: '1px solid rgba(226,232,240,0.8)',
  },

  formTop: { marginBottom: '36px' },
  formIcon: {
    fontSize: '36px', marginBottom: '14px',
    display: 'block',
  },
  formTitle: {
    fontSize: '28px', fontWeight: '800',
    color: '#0f172a', letterSpacing: '-0.5px',
    marginBottom: '6px',
  },
  formSub: { fontSize: '14px', color: '#64748b' },

  form: { display: 'flex', flexDirection: 'column', gap: '18px' },

  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },

  inputBox: {
    display: 'flex', alignItems: 'center',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    background: '#f8fafc',
    overflow: 'hidden',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputPrefix: {
    padding: '0 14px',
    fontSize: '16px',
    lineHeight: 1,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: '13px 0',
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: '#0f172a',
    fontFamily: "'Inter', sans-serif",
  },
  eyeBtn: {
    padding: '0 14px',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    opacity: 0.6,
    flexShrink: 0,
  },

  errorBox: {
    display: 'flex', alignItems: 'flex-start', gap: '8px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '13.5px',
    color: '#dc2626',
    fontWeight: '500',
  },

  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '15px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(29,78,216,0.35)',
    transition: 'all 0.2s ease',
    marginTop: '4px',
  },
  arrow: { fontSize: '18px' },
  spinner: {
    width: '18px', height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },

  formFooter: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '28px',
    lineHeight: 1.6,
  },
};
