import { useState } from 'react';
import { changePassword } from '../lib/supabaseClient';

export default function ParametresPage({ profile, user }) {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleChangePwd = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (newPwd !== confirmPwd) return setError('Les mots de passe ne correspondent pas.');
    if (newPwd.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.');
    setLoading(true);
    const { error } = await changePassword(newPwd);
    if (error) setError(error.message);
    else { setMsg('Mot de passe modifié avec succès !'); setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); }
    setLoading(false);
  };

  const roleLabel = {
    national: 'Direction Nationale',
    coordination: 'Coordination Provinciale',
    sous_coordination: 'Sous-Coordination Provinciale',
    centre: 'Admin Centre',
  }[profile?.role] || 'Utilisateur';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚙️ Paramètres</h2>

      {/* Profil */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Mon Profil</h3>
        <div style={styles.profileRow}>
          <div style={styles.avatar}>{user?.email?.[0]?.toUpperCase()}</div>
          <div>
            <p style={styles.name}>{profile?.full_name || 'Administrateur'}</p>
            <p style={styles.email}>{user?.email}</p>
            <span style={styles.roleBadge}>{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* Changement de mot de passe */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🔐 Changer le Mot de Passe</h3>
        <form onSubmit={handleChangePwd} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nouveau mot de passe</label>
            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
              placeholder="Minimum 8 caractères" style={styles.input} required minLength={8} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Confirmer le mot de passe</label>
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
              placeholder="Répéter le mot de passe" style={styles.input} required />
          </div>

          {error && <div style={styles.error}>❌ {error}</div>}
          {msg && <div style={styles.success}>✅ {msg}</div>}

          <button type="submit" disabled={loading} style={styles.btnPrimary}>
            {loading ? 'Modification...' : 'Modifier le mot de passe'}
          </button>
        </form>
      </div>

      {/* Infos système */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>ℹ️ Informations Système</h3>
        <div style={styles.infoGrid}>
          <InfoItem label="Application" value="PAIDE Manager V0" />
          <InfoItem label="Version" value="1.0.0" />
          <InfoItem label="Base de données" value="Supabase (PostgreSQL)" />
          <InfoItem label="ID Utilisateur" value={user?.id?.slice(0, 8) + '...'} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a3a5c', margin: 0 }}>{value}</p>
    </div>
  );
}

const styles = {
  container: { padding: '32px', fontFamily: "'Segoe UI', sans-serif", maxWidth: '720px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1a3a5c', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '17px', fontWeight: '700', color: '#1a3a5c', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e5e7eb' },
  profileRow: { display: 'flex', alignItems: 'center', gap: '16px' },
  avatar: { width: '56px', height: '56px', borderRadius: '50%', background: '#1a3a5c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', flexShrink: 0 },
  name: { fontSize: '18px', fontWeight: '700', color: '#1a3a5c', margin: '0 0 4px' },
  email: { fontSize: '14px', color: '#6c757d', margin: '0 0 8px' },
  roleBadge: { background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' },
  success: { background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' },
  btnPrimary: { background: '#1a3a5c', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', alignSelf: 'flex-start' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
};
