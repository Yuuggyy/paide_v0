import { useState, useEffect } from 'react';
import { getCentres, createCentre, updateCentre, deleteCentre } from '../lib/api';
import { createUserWithLogin, resetUserPassword } from '../lib/adminApi';

export default function CentresPage({ profile }) {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showResetPwd, setShowResetPwd] = useState(null);
  const [newPwd, setNewPwd] = useState('');
  const [form, setForm] = useState({
    name: '', lieu_affectation: '', province: '',
    adresse: '', telephone: '', email_centre: '',
    // Login admin du centre
    login_email: '', login_password: '', login_nom: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setError(''); setSuccess('');

    if (editing) {
      const { error } = await updateCentre(editing.id, {
        name: form.name, lieu_affectation: form.lieu_affectation,
        province: form.province, adresse: form.adresse, telephone: form.telephone,
        email: form.email_centre
      });
      if (error) return setError(error.message);
      setSuccess('Centre mis à jour avec succès !');
    } else {
      // 1. Créer le centre
      const { data: centre, error: centreErr } = await createCentre({
        name: form.name, lieu_affectation: form.lieu_affectation,
        province: form.province, adresse: form.adresse,
        telephone: form.telephone, email: form.email_centre
      });
      if (centreErr) return setError(centreErr.message);

      // 2. Créer le login de l'admin centre si renseigné
      if (form.login_email && form.login_password) {
        const { error: loginErr } = await createUserWithLogin({
          email: form.login_email,
          password: form.login_password,
          full_name: form.login_nom || `Admin - ${form.name}`,
          role: 'centre',
          centre_id: centre.id
        });
        if (loginErr) return setError(`Centre créé mais erreur login : ${loginErr.message}`);
        setSuccess(`Centre "${form.name}" créé avec son login admin !`);
      } else {
        setSuccess(`Centre "${form.name}" créé sans login (vous pourrez l'ajouter plus tard).`);
      }
    }

    setShowForm(false);
    setEditing(null);
    resetForm();
    loadCentres();
  };

  const resetForm = () => setForm({
    name: '', lieu_affectation: '', province: '',
    adresse: '', telephone: '', email_centre: '',
    login_email: '', login_password: '', login_nom: ''
  });

  const handleEdit = (centre) => {
    setEditing(centre);
    setForm({
      name: centre.name, lieu_affectation: centre.lieu_affectation,
      province: centre.province || '', adresse: centre.adresse || '',
      telephone: centre.telephone || '', email_centre: centre.email || '',
      login_email: '', login_password: '', login_nom: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce centre et tout son contenu ?')) return;
    await deleteCentre(id);
    loadCentres();
  };

  const handleResetPwd = async (e) => {
    e.preventDefault();
    if (newPwd.length < 8) return setError('Minimum 8 caractères.');
    const { error } = await resetUserPassword(showResetPwd.auth_user_id, newPwd);
    if (error) return setError(error.message);
    setSuccess('Mot de passe réinitialisé !');
    setShowResetPwd(null);
    setNewPwd('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🏛️ Centres PAIDE</h2>
          <p style={styles.subtitle}>{centres.length} centre(s) enregistré(s)</p>
        </div>
        {isNational && (
          <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }} style={styles.btnPrimary}>
            + Nouveau Centre
          </button>
        )}
      </div>

      {success && <div style={styles.success}>✅ {success}</div>}
      {error && <div style={styles.error}>❌ {error}</div>}

      {showForm && isNational && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{editing ? 'Modifier le Centre' : 'Nouveau Centre'}</h3>
          <form onSubmit={handleSubmit}>

            {/* Infos du centre */}
            <div style={styles.sectionTitle}>📋 Informations du Centre</div>
            <div style={styles.grid2}>
              <Field label="Nom du Centre *" value={form.name} onChange={v => setForm({...form, name: v})} required />
              <Field label="Lieu d'affectation *" value={form.lieu_affectation} onChange={v => setForm({...form, lieu_affectation: v})} required />
              <Field label="Province" value={form.province} onChange={v => setForm({...form, province: v})} />
              <Field label="Téléphone" value={form.telephone} onChange={v => setForm({...form, telephone: v})} />
              <Field label="Email du Centre" value={form.email_centre} type="email" onChange={v => setForm({...form, email_centre: v})} />
              <Field label="Adresse complète" value={form.adresse} onChange={v => setForm({...form, adresse: v})} />
            </div>

            {/* Login admin centre — seulement à la création */}
            {!editing && (
              <>
                <div style={{...styles.sectionTitle, marginTop: '20px'}}>🔐 Login Administrateur du Centre</div>
                <p style={styles.hint}>Optionnel — vous pourrez créer le login plus tard depuis Paramètres.</p>
                <div style={styles.grid2}>
                  <Field label="Nom complet de l'admin" value={form.login_nom} onChange={v => setForm({...form, login_nom: v})} />
                  <Field label="Email de connexion" value={form.login_email} type="email" onChange={v => setForm({...form, login_email: v})} />
                  <Field label="Mot de passe (min. 8 car.)" value={form.login_password} type="password" onChange={v => setForm({...form, login_password: v})} />
                </div>
              </>
            )}

            <div style={styles.formActions}>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} style={styles.btnSecondary}>Annuler</button>
              <button type="submit" style={styles.btnPrimary}>{editing ? 'Mettre à jour' : 'Créer le Centre'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Reset mot de passe modal */}
      {showResetPwd && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>🔑 Réinitialiser le mot de passe</h3>
            <p style={styles.modalSub}>Centre : <b>{showResetPwd.name}</b></p>
            <form onSubmit={handleResetPwd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Field label="Nouveau mot de passe" value={newPwd} type="password" onChange={v => setNewPwd(v)} required />
              {error && <div style={styles.error}>{error}</div>}
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowResetPwd(null)} style={styles.btnSecondary}>Annuler</button>
                <button type="submit" style={styles.btnPrimary}>Confirmer</button>
              </div>
            </form>
          </div>
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
                <span style={{ ...styles.badge, background: '#dcfce7', color: '#166534' }}>
                  {centre.status || 'actif'}
                </span>
              </div>
              <div style={styles.cardBody}>
                {centre.province && <p style={styles.info}><b>Province :</b> {centre.province}</p>}
                {centre.telephone && <p style={styles.info}><b>Tél :</b> {centre.telephone}</p>}
                {centre.email && <p style={styles.info}><b>Email :</b> {centre.email}</p>}
              </div>
              {isNational && (
                <div style={styles.cardActions}>
                  <button onClick={() => handleEdit(centre)} style={styles.btnEdit}>✏️ Modifier</button>
                  <button onClick={() => setShowResetPwd(centre)} style={styles.btnKey}>🔑 MDP</button>
                  <button onClick={() => handleDelete(centre.id)} style={styles.btnDelete}>🗑️</button>
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
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} required={required}
        style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px' }} />
    </div>
  );
}

const styles = {
  container: { padding: '32px', fontFamily: "'Segoe UI', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6c757d', marginTop: '4px' },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#1a3a5c', padding: '10px 0 8px', borderBottom: '2px solid #e5e7eb', marginBottom: '16px' },
  hint: { fontSize: '12px', color: '#9ca3af', marginBottom: '12px', fontStyle: 'italic' },
  btnPrimary: { background: '#1a3a5c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  btnSecondary: { background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnEdit: { background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  btnKey: { background: '#fef9c3', color: '#854d0e', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  btnDelete: { background: '#fef2f2', color: '#dc2626', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle: { fontSize: '18px', fontWeight: '700', color: '#1a3a5c', marginBottom: '20px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  success: { background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
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
  cardActions: { display: 'flex', gap: '8px', padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '12px', padding: '28px', width: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#1a3a5c', marginBottom: '8px' },
  modalSub: { fontSize: '14px', color: '#6c757d', marginBottom: '20px' },
};
