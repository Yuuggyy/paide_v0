import { useState, useEffect } from 'react';
import { getFilieresByCentre, createFiliere, updateFiliere, deleteFiliere, getCentres } from '../lib/api';

export default function FilieresPage({ profile }) {
  const [filieres, setFilieres] = useState([]);
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(profile?.centre_id || '');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', description: '', status: 'actif' });

  const isNational = profile?.role === 'national';

  useEffect(() => {
    if (isNational) getCentres().then(({data}) => setCentres(data || []));
    if (selectedCentre) loadFilieres(selectedCentre);
  }, []);

  useEffect(() => {
    if (selectedCentre) loadFilieres(selectedCentre);
  }, [selectedCentre]);

  const loadFilieres = async (centreId) => {
    const { data } = await getFilieresByCentre(centreId);
    setFilieres(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateFiliere(editing.id, form);
    } else {
      await createFiliere({ ...form, centre_id: selectedCentre });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ nom: '', description: '', status: 'actif' });
    loadFilieres(selectedCentre);
  };

  const handleEdit = (f) => {
    setEditing(f);
    setForm({ nom: f.nom, description: f.description || '', status: f.status });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette filière ?')) return;
    await deleteFiliere(id);
    loadFilieres(selectedCentre);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📚 Filières</h2>
          <p style={styles.subtitle}>{filieres.length} filière(s)</p>
        </div>
        {selectedCentre && (
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ nom: '', description: '', status: 'actif' }); }} style={styles.btnPrimary}>
            + Nouvelle Filière
          </button>
        )}
      </div>

      {isNational && (
        <div style={styles.filterBar}>
          <label style={styles.label}>Centre :</label>
          <select value={selectedCentre} onChange={e => setSelectedCentre(e.target.value)} style={styles.select}>
            <option value="">-- Choisir un centre --</option>
            {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{editing ? 'Modifier Filière' : 'Nouvelle Filière'}</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Nom de la filière</label>
                <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required
                  style={styles.input} placeholder="ex: Informatique" />
              </div>
              <div>
                <label style={styles.label}>Statut</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={styles.select}>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.label}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  style={{ ...styles.input, height: '80px', resize: 'vertical' }} rows={3} />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.btnSecondary}>Annuler</button>
              <button type="submit" style={styles.btnPrimary}>{editing ? 'Mettre à jour' : 'Créer'}</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {filieres.map(f => (
          <div key={f.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>📚</span>
              <div style={{ flex: 1 }}>
                <h3 style={styles.cardTitle}>{f.nom}</h3>
              </div>
              <span style={{ ...styles.badge, background: f.status === 'actif' ? '#dcfce7' : '#fee2e2', color: f.status === 'actif' ? '#166534' : '#dc2626' }}>
                {f.status}
              </span>
            </div>
            {f.description && <p style={styles.desc}>{f.description}</p>}
            <div style={styles.cardActions}>
              <button onClick={() => handleEdit(f)} style={styles.btnEdit}>✏️ Modifier</button>
              <button onClick={() => handleDelete(f.id)} style={styles.btnDelete}>🗑️ Supprimer</button>
            </div>
          </div>
        ))}
        {filieres.length === 0 && selectedCentre && <p style={styles.empty}>Aucune filière pour ce centre.</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '32px', fontFamily: "'Segoe UI', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6c757d', marginTop: '4px' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  select: { padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', minWidth: '200px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle: { fontSize: '18px', fontWeight: '700', color: '#1a3a5c', marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: { background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' },
  cardIcon: { fontSize: '24px' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1a3a5c', margin: 0 },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  desc: { padding: '12px 20px', fontSize: '13px', color: '#6c757d', margin: 0 },
  cardActions: { display: 'flex', gap: '8px', padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' },
  btnPrimary: { background: '#1a3a5c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  btnSecondary: { background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnEdit: { background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  btnDelete: { background: '#fef2f2', color: '#dc2626', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  empty: { textAlign: 'center', color: '#9ca3af', padding: '40px', fontStyle: 'italic', gridColumn: '1 / -1' },
};
