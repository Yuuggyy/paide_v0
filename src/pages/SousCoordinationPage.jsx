import { useState, useEffect } from 'react';
import { createUserWithLogin } from '../lib/adminApi';
import { supabase } from '../lib/supabaseClient';

export default function SousCoordinationPage({ profile }) {
  const [sousCoord, setSousCoord] = useState([]);
  const [coordinations, setCoordinations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', zone: '', coordination_id: '', login_email: '', login_password: '', login_nom: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isNational = profile?.role === 'national';

  useEffect(() => {
    loadSousCoord();
    supabase.from('coordinations').select('*').then(({ data }) => setCoordinations(data || []));
  }, []);

  const loadSousCoord = async () => {
    const { data } = await supabase.from('sous_coordinations').select('*, coordinations(nom)').order('nom');
    setSousCoord(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const { data: sc, error: scErr } = await supabase
      .from('sous_coordinations')
      .insert({ nom: form.nom, zone: form.zone, coordination_id: form.coordination_id || null })
      .select().single();

    if (scErr) return setError(scErr.message);

    if (form.login_email && form.login_password) {
      const { error: loginErr } = await createUserWithLogin({
        email: form.login_email,
        password: form.login_password,
        full_name: form.login_nom || `Sous-Coordinateur - ${form.nom}`,
        role: 'sous_coordination',
        sous_coordination_id: sc.id
      });
      if (loginErr) return setError(`Sous-coordination créée mais erreur login : ${loginErr.message}`);
    }

    setSuccess(`Sous-coordination "${form.nom}" créée avec succès !`);
    setShowForm(false);
    setForm({ nom: '', zone: '', coordination_id: '', login_email: '', login_password: '', login_nom: '' });
    loadSousCoord();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette sous-coordination ?')) return;
    await supabase.from('sous_coordinations').delete().eq('id', id);
    loadSousCoord();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📌 Sous-Coordinations Provinciales</h2>
          <p style={styles.subtitle}>{sousCoord.length} sous-coordination(s)</p>
        </div>
        {isNational && (
          <button onClick={() => setShowForm(true)} style={styles.btnPrimary}>+ Nouvelle Sous-Coordination</button>
        )}
      </div>

      <div style={styles.banner}>
        🚧 Module en construction — Fonctionnalités complètes disponibles en V1
      </div>

      {success && <div style={styles.success}>✅ {success}</div>}
      {error && <div style={styles.error}>❌ {error}</div>}

      {showForm && isNational && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Nouvelle Sous-Coordination</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.grid2}>
              <Field label="Nom *" value={form.nom} onChange={v => setForm({...form, nom: v})} required />
              <Field label="Zone / Territoire" value={form.zone} onChange={v => setForm({...form, zone: v})} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Coordination parente</label>
                <select value={form.coordination_id} onChange={e => setForm({...form, coordination_id: e.target.value})}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px' }}>
                  <option value="">-- Aucune --</option>
                  {coordinations.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            </div>
            <div style={styles.sectionTitle}>🔐 Login du Sous-Coordinateur</div>
            <div style={styles.grid2}>
              <Field label="Nom complet" value={form.login_nom} onChange={v => setForm({...form, login_nom: v})} />
              <Field label="Email de connexion" value={form.login_email} type="email" onChange={v => setForm({...form, login_email: v})} />
              <Field label="Mot de passe (min. 8 car.)" value={form.login_password} type="password" onChange={v => setForm({...form, login_password: v})} />
            </div>
            <div style={styles.formActions}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.btnSecondary}>Annuler</button>
              <button type="submit" style={styles.btnPrimary}>Créer</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {sousCoord.map(sc => (
          <div key={sc.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>📌</span>
              <div style={{ flex: 1 }}>
                <h3 style={styles.cardTitle}>{sc.nom}</h3>
                {sc.zone && <p style={styles.cardSub}>📍 {sc.zone}</p>}
                {sc.coordinations?.nom && <p style={styles.cardSub}>🗂️ {sc.coordinations.nom}</p>}
              </div>
              {isNational && (
                <button onClick={() => handleDelete(sc.id)} style={styles.btnDelete}>🗑️</button>
              )}
            </div>
          </div>
        ))}
        {sousCoord.length === 0 && (
          <p style={styles.empty}>Aucune sous-coordination créée.</p>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} required={required}
        style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px' }} />
    </div>
  );
}

const styles = {
  container: { padding: '32px', fontFamily: "'Segoe UI', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6c757d', marginTop: '4px' },
  banner: { background: '#fef9c3', border: '1px solid #fde68a', color: '#854d0e', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' },
  sectionTitle: { fontSize: '14px', fontWeight: '700', color: '#1a3a5c', padding: '12px 0 8px', borderBottom: '2px solid #e5e7eb', marginBottom: '12px', marginTop: '16px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle: { fontSize: '18px', fontWeight: '700', color: '#1a3a5c', marginBottom: '16px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: { background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px' },
  cardIcon: { fontSize: '24px' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1a3a5c', margin: 0 },
  cardSub: { fontSize: '13px', color: '#6c757d', margin: '2px 0 0' },
  btnPrimary: { background: '#1a3a5c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  btnSecondary: { background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnDelete: { background: '#fef2f2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  success: { background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  empty: { color: '#9ca3af', fontStyle: 'italic', padding: '20px', textAlign: 'center' },
};
