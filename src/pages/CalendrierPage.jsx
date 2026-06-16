import { useState, useEffect } from 'react';
import { getCalendrierByCentre, createCours, updateCours, deleteCours, getCentres, getFilieresByCentre } from '../lib/api';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function CalendrierPage({ profile }) {
  const [cours, setCours] = useState([]);
  const [centres, setCentres] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(profile?.centre_id || '');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ titre: '', instructeur: '', jour_semaine: 'Lundi', heure_debut: '', heure_fin: '', salle: '', filiere_id: '' });

  const isNational = profile?.role === 'national';

  useEffect(() => {
    if (isNational) getCentres().then(({data}) => setCentres(data || []));
    if (selectedCentre) { loadCours(selectedCentre); loadFilieres(selectedCentre); }
  }, []);

  useEffect(() => {
    if (selectedCentre) { loadCours(selectedCentre); loadFilieres(selectedCentre); }
  }, [selectedCentre]);

  const loadCours = async (id) => {
    const { data } = await getCalendrierByCentre(id);
    setCours(data || []);
  };

  const loadFilieres = async (id) => {
    const { data } = await getFilieresByCentre(id);
    setFilieres(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, centre_id: selectedCentre };
    if (editing) { await updateCours(editing.id, payload); }
    else { await createCours(payload); }
    setShowForm(false);
    setEditing(null);
    setForm({ titre: '', instructeur: '', jour_semaine: 'Lundi', heure_debut: '', heure_fin: '', salle: '', filiere_id: '' });
    loadCours(selectedCentre);
  };

  const handleEdit = (c) => {
    setEditing(c);
    setForm({ titre: c.titre, instructeur: c.instructeur || '', jour_semaine: c.jour_semaine, heure_debut: c.heure_debut || '', heure_fin: c.heure_fin || '', salle: c.salle || '', filiere_id: c.filiere_id || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce cours ?')) return;
    await deleteCours(id);
    loadCours(selectedCentre);
  };

  // Grouper par jour
  const coursByJour = JOURS.reduce((acc, jour) => {
    acc[jour] = cours.filter(c => c.jour_semaine === jour);
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📅 Calendrier des Cours</h2>
          <p style={styles.subtitle}>{cours.length} cours planifié(s)</p>
        </div>
        {selectedCentre && (
          <button onClick={() => { setShowForm(true); setEditing(null); }} style={styles.btnPrimary}>
            + Ajouter un Cours
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
          <h3 style={styles.formTitle}>{editing ? 'Modifier Cours' : 'Nouveau Cours'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.grid3}>
              <div>
                <label style={styles.label}>Titre du cours</label>
                <input value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} required style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Instructeur</label>
                <input value={form.instructeur} onChange={e => setForm({...form, instructeur: e.target.value})} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Filière</label>
                <select value={form.filiere_id} onChange={e => setForm({...form, filiere_id: e.target.value})} style={styles.select}>
                  <option value="">-- Aucune --</option>
                  {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Jour</label>
                <select value={form.jour_semaine} onChange={e => setForm({...form, jour_semaine: e.target.value})} style={styles.select}>
                  {JOURS.map(j => <option key={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Heure début</label>
                <input type="time" value={form.heure_debut} onChange={e => setForm({...form, heure_debut: e.target.value})} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Heure fin</label>
                <input type="time" value={form.heure_fin} onChange={e => setForm({...form, heure_fin: e.target.value})} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Salle</label>
                <input value={form.salle} onChange={e => setForm({...form, salle: e.target.value})} style={styles.input} />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.btnSecondary}>Annuler</button>
              <button type="submit" style={styles.btnPrimary}>{editing ? 'Mettre à jour' : 'Ajouter'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Grille par jour */}
      <div style={styles.calGrid}>
        {JOURS.map(jour => (
          <div key={jour} style={styles.dayCol}>
            <div style={styles.dayHeader}>{jour}</div>
            <div style={styles.dayBody}>
              {coursByJour[jour].length === 0 ? (
                <p style={styles.noCours}>—</p>
              ) : (
                coursByJour[jour].map(c => (
                  <div key={c.id} style={styles.coursCard}>
                    <p style={styles.coursTitle}>{c.titre}</p>
                    {c.heure_debut && <p style={styles.coursMeta}>⏰ {c.heure_debut.slice(0,5)} – {c.heure_fin?.slice(0,5)}</p>}
                    {c.instructeur && <p style={styles.coursMeta}>👨‍🏫 {c.instructeur}</p>}
                    {c.filieres?.nom && <p style={styles.coursMeta}>📚 {c.filieres.nom}</p>}
                    {c.salle && <p style={styles.coursMeta}>🚪 {c.salle}</p>}
                    <div style={styles.coursActions}>
                      <button onClick={() => handleEdit(c)} style={styles.btnIconSm}>✏️</button>
                      <button onClick={() => handleDelete(c.id)} style={styles.btnIconSm}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
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
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', overflowX: 'auto' },
  dayCol: { minWidth: '130px', background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' },
  dayHeader: { background: '#1a3a5c', color: '#fff', padding: '10px', textAlign: 'center', fontSize: '13px', fontWeight: '700' },
  dayBody: { padding: '8px', minHeight: '100px', display: 'flex', flexDirection: 'column', gap: '8px' },
  noCours: { textAlign: 'center', color: '#d1d5db', fontSize: '20px', marginTop: '20px' },
  coursCard: { background: '#eff6ff', borderRadius: '8px', padding: '10px', border: '1px solid #bfdbfe' },
  coursTitle: { fontSize: '13px', fontWeight: '700', color: '#1d4ed8', margin: '0 0 4px' },
  coursMeta: { fontSize: '11px', color: '#374151', margin: '2px 0' },
  coursActions: { display: 'flex', gap: '4px', marginTop: '6px' },
  btnPrimary: { background: '#1a3a5c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  btnSecondary: { background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnIconSm: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' },
};
