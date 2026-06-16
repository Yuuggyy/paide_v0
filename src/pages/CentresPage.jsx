import { useState, useEffect } from 'react';
import { getCentres, createCentre, updateCentre, deleteCentre } from '../lib/api';

export default function CentresPage({ profile }) {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', lieu_affectation: '', province: '', adresse: '', telephone: '', email: '' });
  const [error, setError] = useState('');

  const isNational = profile?.role === 'national';

  useEffect(() => { loadCentres(); }, []);

  const loadCentres = async () => {
    setLoading(true);
    const { data } = await getCentres();
    setCentres(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (editing) {
      const { error } = await updateCentre(editing.id, form);
      if (error) return setError(error.message);
    } else {
      const { error } = await createCentre(form);
      if (error) return setError(error.message);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', lieu_affectation: '', province: '', adresse: '', telephone: '', email: '' });
    loadCentres();
  };

  const handleEdit = (centre) => {
    setEditing(centre);
    setForm({ name: centre.name, lieu_affectation: centre.lieu_affectation, province: centre.province || '', adresse: centre.adresse || '', telephone: centre.telephone || '', email: centre.email || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce centre ?')) return;
    await deleteCentre(id);
    loadCentres();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🏛️ Centres PAIDE</h2>
          <p style={styles.subtitle}>{centres.length} centre(s) enregistré(s)</p>
        </div>
        {isNational && (
          <button onClick={() => { setShowForm(true); setEditing(null); }} style={styles.btnPrimary}>
            + Nouveau Centre
          </button>
        )}
      </div>

      {showForm && isNational && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{editing ? 'Modifier le Centre' : 'Nouveau Centre'}</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grid2}>
              <Field label="Nom du Centre" value={form.name} onChange={v => setForm({...form, name: v})} required />
              <Field label="Lieu d'affectation" value={form.lieu_affectation} onChange={v => setForm({...form, lieu_affectation: v})} required />
              <Field label="Province" value={form.province} onChange={v => setForm({...form, province: v})} />
              <Field label="Téléphone" value={form.telephone} onChange={v => setForm({...form, telephone: v})} />
              <Field label="Email du Centre" value={form.email} type="email" onChange={v => setForm({...form, email: v})} />
              <Field label="Adresse complète" value={form.adresse} onChange={v => setForm({...form, adresse: v})} />
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <div style={styles.formActions}>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} style={styles.btnSecondary}>Annuler</button>
              <button type="submit" style={styles.btnPrimary}>{editing ? 'Mettre à jour' : 'Créer'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Chargement des centres...</div>
      ) : (
        <div style={styles.grid}>
          {centres.map(centre => (
            <div key={centre.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>🏛️</div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitle}>{centre.name}</h3>
                  <p style={styles.cardSub}>📍 {centre.lieu_affectation}</p>
                </div>
                <span style={{ ...styles.badge, background: centre.status === 'actif' ? '#dcfce7' : '#fee2e2', color: centre.status === 'actif' ? '#166534' : '#dc2626' }}>
                  {centre.status}
                </span>
              </div>
              <div style={styles.cardBody}>
                {centre.province && <p style={styles.info}><b>Province :</b> {centre.province}</p>}
                {centre.telephone && <p style={styles.info}><b>Tél :</b> {centre.telephone}</p>}
                {centre.email && <p style={styles.info}><b>Email :</b> {centre.email}</p>}
                {centre.created_by_name && <p style={styles.createdBy}>Créé par : {centre.created_by_name}</p>}
              </div>
              {isNational && (
                <div style={styles.cardActions}>
                  <button onClick={() => handleEdit(centre)} style={styles.btnEdit}>✏️ Modifier</button>
                  <button onClick={() => handleDelete(centre.id)} style={styles.btnDelete}>🗑️ Supprimer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px' }}
      />
    </div>
  );
}

const styles = {
  container: { padding: '32px', fontFamily: "'Segoe UI', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6c757d', marginTop: '4px' },
  btnPrimary: { background: '#1a3a5c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  btnSecondary: { background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnEdit: { background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  btnDelete: { background: '#fef2f2', color: '#dc2626', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle: { fontSize: '18px', fontWeight: '700', color: '#1a3a5c', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '13px' },
  loading: { textAlign: 'center', padding: '40px', color: '#6c757d' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' },
  cardIcon: { fontSize: '28px' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1a3a5c', margin: 0 },
  cardSub: { fontSize: '13px', color: '#6c757d', margin: '2px 0 0' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  cardBody: { padding: '16px 20px' },
  info: { fontSize: '13px', color: '#374151', margin: '4px 0' },
  createdBy: { fontSize: '11px', color: '#9ca3af', marginTop: '8px', fontStyle: 'italic' },
  cardActions: { display: 'flex', gap: '8px', padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' },
};
