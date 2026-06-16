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
    } else {
      onLogin(data.user);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoCircle}>P</div>
          <h1 style={styles.title}>PAIDE</h1>
          <p style={styles.subtitle}>Plateforme de Gestion Institutionnelle</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Adresse e-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@paide.com"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.footer}>© 2026 PAIDE — Tous droits réservés</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a3a5c 0%, #0d6efd 100%)',
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  logo: { textAlign: 'center', marginBottom: '32px' },
  logoCircle: {
    width: '64px', height: '64px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a3a5c, #0d6efd)',
    color: '#fff', fontSize: '28px', fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px',
  },
  title: { fontSize: '28px', fontWeight: '700', color: '#1a3a5c', margin: '0' },
  subtitle: { fontSize: '13px', color: '#6c757d', marginTop: '6px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#374151' },
  input: {
    padding: '12px 16px', borderRadius: '8px',
    border: '1.5px solid #d1d5db', fontSize: '14px',
    outline: 'none', transition: 'border 0.2s',
  },
  error: {
    background: '#fee2e2', color: '#dc2626',
    padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
  },
  button: {
    background: 'linear-gradient(135deg, #1a3a5c, #0d6efd)',
    color: '#fff', padding: '14px', borderRadius: '8px',
    border: 'none', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', marginTop: '8px',
  },
  footer: { textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#9ca3af' },
};
