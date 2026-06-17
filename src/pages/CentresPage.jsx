import { useState, useEffect } from 'react';
import { getCentres, createCentre, updateCentre, deleteCentre } from '../lib/api';
import { createUserWithLogin, resetUserPassword } from '../lib/adminApi';

function Field({ label, value, onChange, type='text', required, span }) {
  return (
    <div className="form-field" style={span ? { gridColumn:'1/-1' } : {}}>
      <label className="form-label">{label}</label>
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} required={required} />
    </div>
  );
}

export default function CentresPage({ profile }) {
  const [centres, setCentres]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [showReset, setShowReset] = useState(null);
  const [newPwd, setNewPwd]       = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [form, setForm] = useState({
    name:'', lieu_affectation:'', province:'', adresse:'', telephone:'', email_centre:'',
    login_email:'', login_password:'', login_nom:''
  });

  const isNational = profile?.role === 'national';
  const isCentre   = profile?.role === 'centre';
  // Le rôle centre a les mêmes droits de gestion que le national sur son propre centre
  const canManage  = isNational || isCentre;

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await getCentres();
    // Le rôle centre ne voit que son propre centre
    if (isCentre && profile?.centre_id) {
      setCentres((data||[]).filter(c => c.id === profile.centre_id));
    } else {
      setCentres(data || []);
    }
    setLoading(false);
  };

  const reset = () => setForm({
    name:'', lieu_affectation:'', province:'', adresse:'', telephone:'',
    email_centre:'', login_email:'', login_password:'', login_nom:''
  });

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (editing) {
      const { error } = await updateCentre(editing.id, {
        name: form.name, lieu_affectation: form.lieu_affectation,
        province: form.province, adresse: form.adresse,
        telephone: form.telephone, email: form.email_centre
      });
      if (error) return setError(error.message);
      setSuccess('Centre mis à jour !');
    } else {
      // Seul le national peut créer un nouveau centre
      const { data:c, error:e1 } = await createCentre({
        name: form.name, lieu_affectation: form.lieu_affectation,
        province: form.province, adresse: form.adresse,
        telephone: form.telephone, email: form.email_centre
      });
      if (e1) return setError(e1.message);
      if (form.login_email && form.login_password) {
        const { error:e2 } = await createUserWithLogin({
          email: form.login_email, password: form.login_password,
          full_name: form.login_nom || `Admin - ${form.name}`,
          role: 'centre', centre_id: c.id
        });
        // Ne pas bloquer si erreur login — centre déjà créé
        if (e2) {
          setSuccess(`Centre "${form.name}" créé avec succès !`);
          setError(`⚠️ Login non créé : ${e2.message}`);
          setShowForm(false); setEditing(null); reset(); load();
          return;
        }
      }
      setSuccess(`Centre "${form.name}" créé avec succès ! Login configuré.`);
    }
    setShowForm(false); setEditing(null); reset(); load();
  };

  const handleEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name, lieu_affectation: c.lieu_affectation||'',
      province: c.province||'', adresse: c.adresse||'',
      telephone: c.telephone||'', email_centre: c.email||'',
      login_email:'', login_password:'', login_nom:''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce centre ?')) return;
    await deleteCentre(id); load();
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPwd.length < 8) return setError('Minimum 8 caractères.');
    const { error } = await resetUserPassword(showReset.auth_user_id, newPwd);
    if (error) return setError(error.message);
    setSuccess('Mot de passe réinitialisé !'); setShowReset(null); setNewPwd('');
  };

  const sf = (k,v) => setForm(f => ({...f, [k]:v}));

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🏛️ Centres PAIDE</h1>
          <p className="page-subtitle">{centres.length} centre(s) enregistré(s)</p>
        </div>
        {/* Le national peut créer, le centre peut modifier le sien */}
        {canManage && (
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {isNational && (
              <button className="btn btn-teal" onClick={() => { setShowForm(true); setEditing(null); reset(); }}>
                + Nouveau Centre
              </button>
            )}
            {isCentre && !showForm && centres.length > 0 && (
              <button className="btn btn-teal" onClick={() => handleEdit(centres[0])}>
                ✏️ Modifier mon Centre
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-teal">🏛️</div>
          <div><div className="stat-value">{centres.length}</div><div className="stat-label">Centres</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">✅</div>
          <div><div className="stat-value">{centres.filter(c=>c.status==='actif'||!c.status).length}</div><div className="stat-label">Opérationnels</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">🌍</div>
          <div><div className="stat-value">{[...new Set(centres.map(c=>c.province).filter(Boolean))].length}</div><div className="stat-label">Provinces</div></div>
        </div>
      </div>

      {/* Alerts */}
      {success && <div className="alert alert-success">✅ {success}</div>}
      {error   && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Form — national crée/modifie, centre modifie uniquement */}
      {showForm && canManage && (
        <div className="form-card">
          <h3 style={{fontSize:18, fontWeight:700, marginBottom:4}}>
            {editing ? '✏️ Modifier le Centre' : '➕ Nouveau Centre'}
          </h3>
          <p style={{fontSize:13, color:'var(--text-muted)', marginBottom:20}}>
            {editing ? 'Modifiez les informations du centre.' : 'Remplissez les informations pour créer un nouveau centre.'}
          </p>
          <form onSubmit={submit}>
            <div className="form-section">📋 Informations du Centre</div>
            <div className="form-grid">
              <Field label="Nom du Centre *" value={form.name} onChange={v=>sf('name',v)} required />
              <Field label="Lieu d'affectation *" value={form.lieu_affectation} onChange={v=>sf('lieu_affectation',v)} required />
              <Field label="Province" value={form.province} onChange={v=>sf('province',v)} />
              <Field label="Téléphone" value={form.telephone} onChange={v=>sf('telephone',v)} />
              <Field label="Email du Centre" value={form.email_centre} type="email" onChange={v=>sf('email_centre',v)} />
              <Field label="Adresse complète" value={form.adresse} onChange={v=>sf('adresse',v)} />
            </div>

            {/* Login admin : uniquement pour la création par le national */}
            {!editing && isNational && (
              <>
                <div className="form-section">🔐 Login Administrateur (optionnel)</div>
                <div className="form-grid">
                  <Field label="Nom complet de l'admin" value={form.login_nom} onChange={v=>sf('login_nom',v)} />
                  <Field label="Email de connexion" value={form.login_email} type="email" onChange={v=>sf('login_email',v)} />
                  <Field label="Mot de passe (min. 8 car.)" value={form.login_password} type="password" onChange={v=>sf('login_password',v)} />
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</button>
              <button type="submit" className="btn btn-teal">{editing ? 'Mettre à jour' : 'Créer le Centre'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Reset password modal */}
      {showReset && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">🔑 Réinitialiser le mot de passe</h3>
            <p className="modal-sub">Centre : <strong>{showReset.name}</strong></p>
            <form onSubmit={handleReset} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div className="form-field">
                <label className="form-label">Nouveau mot de passe</label>
                <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} required />
              </div>
              {error && <div className="alert alert-error">⚠️ {error}</div>}
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowReset(null); setError(''); }}>Annuler</button>
                <button type="submit" className="btn btn-teal">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /><p>Chargement des centres…</p></div>
      ) : centres.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🏛️</div>
          <h3>Aucun centre enregistré</h3>
          <p>Cliquez sur "Nouveau Centre" pour commencer.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {centres.map(centre => (
            <div key={centre.id} className="card" style={{padding:22}}>
              <div style={{display:'flex', alignItems:'flex-start', gap:12, marginBottom:14}}>
                <div style={{width:44,height:44,borderRadius:12,background:'var(--teal-ultra)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>🏛️</div>
                <div style={{flex:1,minWidth:0}}>
                  <h3 style={{fontSize:15,fontWeight:700,color:'var(--text-primary)',marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{centre.name}</h3>
                  <p style={{fontSize:13,color:'var(--text-muted)'}}>📍 {centre.lieu_affectation}</p>
                </div>
                <span className="badge badge-teal">{centre.status||'actif'}</span>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
                {centre.province  && <div style={{fontSize:13,color:'var(--text-secondary)',display:'flex',gap:6}}><span>🌍</span>{centre.province}</div>}
                {centre.telephone && <div style={{fontSize:13,color:'var(--text-secondary)',display:'flex',gap:6}}><span>📞</span>{centre.telephone}</div>}
                {centre.email     && <div style={{fontSize:13,color:'var(--text-secondary)',display:'flex',gap:6}}><span>✉️</span>{centre.email}</div>}
              </div>

              {/* Actions : national → tout, centre → modifier son centre uniquement */}
              {canManage && (
                <div style={{display:'flex',gap:8,paddingTop:12,borderTop:'1px solid var(--border)',flexWrap:'wrap'}}>
                  <button className="btn btn-ghost" style={{flex:1,padding:'8px 0',fontSize:13,minWidth:80}} onClick={() => handleEdit(centre)}>
                    ✏️ Modifier
                  </button>
                  {isNational && (
                    <>
                      <button className="btn" style={{padding:'8px 12px',background:'var(--teal-ultra)',color:'var(--teal-dark)',fontSize:13,borderRadius:8}} onClick={() => setShowReset(centre)}>
                        🔑
                      </button>
                      <button className="btn btn-danger" style={{padding:'8px 12px',fontSize:13,borderRadius:8}} onClick={() => handleDelete(centre.id)}>
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
