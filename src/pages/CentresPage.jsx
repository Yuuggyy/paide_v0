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
  const [centres, setCentres]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [showReset, setShowReset] = useState(null);
  const [newPwd, setNewPwd]     = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [form, setForm] = useState({
    name:'', lieu_affectation:'', province:'', adresse:'', telephone:'', email_centre:'',
    login_email:'', login_password:'', login_nom:''
  });

  const isNational = profile?.role === 'national';

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await getCentres();
    setCentres(data || []);
    setLoading(false);
  };

  const reset = () => setForm({ name:'', lieu_affectation:'', province:'', adresse:'', telephone:'', email_centre:'', login_email:'', login_password:'', login_nom:'' });

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (editing) {
      const { error } = await updateCentre(editing.id, { name:form.name, lieu_affectation:form.lieu_affectation, province:form.province, adresse:form.adresse, telephone:form.telephone, email:form.email_centre });
      if (error) return setError(error.message);
      setSuccess('Centre mis à jour !');
    } else {
      const { data:c, error:e1 } = await createCentre({ name:form.name, lieu_affectation:form.lieu_affectation, province:form.province, adresse:form.adresse, telephone:form.telephone, email:form.email_centre });
      if (e1) return setError(e1.message);
      if (form.login_email && form.login_password) {
        const { error:e2 } = await createUserWithLogin({ email:form.login_email, password:form.login_password, full_name:form.login_nom||`Admin - ${form.name}`, role:'centre', centre_id:c.id });
        if (e2) return setError(`Centre créé mais erreur login : ${e2.message}`);
      }
      setSuccess(`Centre "${form.name}" créé avec succès !`);
    }
    setShowForm(false); setEditing(null); reset(); load();
  };

  const handleEdit = (c) => {
    setEditing(c);
    setForm({ name:c.name, lieu_affectation:c.lieu_affectation, province:c.province||'', adresse:c.adresse||'', telephone:c.telephone||'', email_centre:c.email||'', login_email:'', login_password:'', login_nom:'' });
    setShowForm(true);
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
        {isNational && (
          <button className="btn btn-teal" onClick={() => { setShowForm(true); setEditing(null); reset(); }}>
            + Nouveau Centre
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-teal">🏛️</div>
          <div><div className="stat-value">{centres.length}</div><div className="stat-label">Centres actifs</div></div>
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
      {success && <div className="alert alert-success" style={{marginBottom:16}}>✅ {success}</div>}
      {error   && <div className="alert alert-error"   style={{marginBottom:16}}>⚠️ {error}</div>}

      {/* Form */}
      {showForm && isNational && (
        <div className="card" style={{padding:32, marginBottom:24}}>
          <h3 style={{fontSize:18, fontWeight:700, color:'#0d1b2a', marginBottom:4}}>
            {editing ? '✏️ Modifier le Centre' : '➕ Nouveau Centre'}
          </h3>
          <p style={{fontSize:13, color:'#8ca5b5', marginBottom:24}}>
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

            {!editing && (
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
                <button type="button" className="btn btn-ghost" onClick={() => setShowReset(null)}>Annuler</button>
                <button type="submit" className="btn btn-teal">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{textAlign:'center', padding:60, color:'#8ca5b5'}}>
          <div className="spinner" style={{borderColor:'rgba(0,143,181,0.2)', borderTopColor:'#008fb5', margin:'0 auto 16px'}} />
          <p>Chargement des centres…</p>
        </div>
      ) : centres.length === 0 ? (
        <div style={{textAlign:'center', padding:80}}>
          <div style={{fontSize:48, marginBottom:16}}>🏛️</div>
          <p style={{fontSize:16, fontWeight:600, color:'#0d1b2a', marginBottom:8}}>Aucun centre enregistré</p>
          <p style={{color:'#8ca5b5', fontSize:14}}>Cliquez sur "Nouveau Centre" pour commencer.</p>
        </div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:18}}>
          {centres.map(centre => (
            <div key={centre.id} className="card" style={{padding:22}}>
              {/* Card header */}
              <div style={{display:'flex', alignItems:'flex-start', gap:12, marginBottom:16}}>
                <div style={{width:44, height:44, borderRadius:12, background:'#e0f5fa', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0}}>
                  🏛️
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <h3 style={{fontSize:15, fontWeight:700, color:'#0d1b2a', marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                    {centre.name}
                  </h3>
                  <p style={{fontSize:13, color:'#8ca5b5'}}>📍 {centre.lieu_affectation}</p>
                </div>
                <span className="badge badge-teal">{centre.status || 'actif'}</span>
              </div>

              {/* Info */}
              <div style={{display:'flex', flexDirection:'column', gap:6, marginBottom:16}}>
                {centre.province && (
                  <div style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#4a6378'}}>
                    <span style={{color:'#008fb5'}}>🌍</span> {centre.province}
                  </div>
                )}
                {centre.telephone && (
                  <div style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#4a6378'}}>
                    <span style={{color:'#00a651'}}>📞</span> {centre.telephone}
                  </div>
                )}
                {centre.email && (
                  <div style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#4a6378'}}>
                    <span style={{color:'#f7941d'}}>✉️</span> {centre.email}
                  </div>
                )}
              </div>

              {/* Actions */}
              {isNational && (
                <div style={{display:'flex', gap:8, paddingTop:14, borderTop:'1px solid #e2edf2'}}>
                  <button className="btn btn-ghost" style={{flex:1, padding:'8px 0', fontSize:13}} onClick={() => handleEdit(centre)}>
                    ✏️ Modifier
                  </button>
                  <button className="btn" style={{padding:'8px 12px', background:'#e0f5fa', color:'#008fb5', fontSize:13, borderRadius:8}} onClick={() => setShowReset(centre)}>
                    🔑
                  </button>
                  <button className="btn btn-danger" style={{padding:'8px 12px', fontSize:13, borderRadius:8}} onClick={() => handleDelete(centre.id)}>
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
