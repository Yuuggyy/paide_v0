import { useState, useEffect } from 'react';
import { getFilieresByCentre, createFiliere, updateFiliere, deleteFiliere, getCentres , getSousCoordinations } from '../lib/api';

export default function FilieresPage({ profile }) {
  const [filieres, setFilieres]   = useState([]);
  const [centres, setCentres]     = useState([]);
  const [selCentre, setSelCentre] = useState(profile?.centre_id||'');
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({ nom:'', description:'', status:'actif' });
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);

  const isNational = profile?.role === 'national';
  const isCentre   = profile?.role === 'centre';
  const canManage  = isNational || isCentre || profile?.role === 'coordination' || profile?.role === 'sous_coordination';
  const isSousCoord    = profile?.role === 'sous_coordination';
  const isCoordination = profile?.role === 'coordination';
  const effectiveCentre = isCentre ? (profile?.centre_id || null) : (selCentre || null);

  useEffect(() => {
    if (isNational || isCoordination || isSousCoord) getCentres().then(({data}) => {
      if (isSousCoord && profile?.sous_coordination_id) {
        setCentres((data||[]).filter(c => c.sous_coordination_id === profile.sous_coordination_id));
      } else if (isCoordination && profile?.coordination_id) {
        // Coordination: load their sous-coordinations to filter centres
        getSousCoordinations(profile.coordination_id).then(({ data: scData }) => {
          const scIds = (scData||[]).map(sc => sc.id);
          setCentres((data||[]).filter(c => scIds.includes(c.sous_coordination_id)));
        });
      } else {
        setCentres(data||[]);
      }
    });
    if (effectiveCentre) load(effectiveCentre);
  }, []);

  useEffect(() => {
    if (isNational && selCentre) load(selCentre);
  }, [selCentre]);

  const load = async (cId) => {
    setLoading(true);
    const { data } = await getFilieresByCentre(cId);
    setFilieres(data||[]);
    setLoading(false);
  };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    const payload = { ...form, centre_id: effectiveCentre };
    const { error } = editing ? await updateFiliere(editing.id, payload) : await createFiliere(payload);
    if (error) return setError(error.message);
    setSuccess(editing ? 'Filière mise à jour !' : 'Filière créée !');
    setShowForm(false); setEditing(null); setForm({ nom:'', description:'', status:'actif' });
    load(effectiveCentre);
  };

  const handleEdit = (f) => {
    setEditing(f);
    setForm({ nom:f.nom, description:f.description||'', status:f.status||'actif' });
    setShowForm(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette filière ?')) return;
    await deleteFiliere(id); load(effectiveCentre);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">📚 Filières</h1>
          <p className="page-subtitle">{filieres.length} filière(s) enregistrée(s)</p>
        </div>
        {/* Bouton visible pour national ET centre dès qu'un centre est connu */}
        {canManage && (
          <button className="btn btn-teal" onClick={() => { setShowForm(true); setEditing(null); setForm({ nom:'', description:'', status:'actif' }); }}>
            + Nouvelle Filière
          </button>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-teal">📚</div>
          <div><div className="stat-value">{filieres.length}</div><div className="stat-label">Total filières</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">✅</div>
          <div><div className="stat-value">{filieres.filter(f=>f.status==='actif'||!f.status).length}</div><div className="stat-label">Actives</div></div>
        </div>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error   && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Filtre centre — national uniquement */}
      {(isNational || isCoordination || isSousCoord) && (
        <div className="filter-bar">
          <label className="form-label" style={{whiteSpace:'nowrap'}}>🏛️ Centre :</label>
          <select value={selCentre} onChange={e=>setSelCentre(e.target.value)} style={{maxWidth:320}}>
            <option value="">-- Sélectionner --</option>
            {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {showForm && canManage && (
        <div className="form-card">
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:16}}>{editing ? '✏️ Modifier la Filière' : '➕ Nouvelle Filière'}</h3>
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Nom de la filière *</label>
                <input value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} required />
              </div>
              <div className="form-field">
                <label className="form-label">Statut</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
              <div className="form-field" style={{gridColumn:'1/-1'}}>
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} style={{resize:'vertical'}} />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</button>
              <button type="submit" className="btn btn-teal">{editing ? 'Mettre à jour' : 'Créer'}</button>
            </div>
          </form>
        </div>
      )}

      {(!effectiveCentre && isNational) ? (
        <div className="empty-state"><div className="emoji">🏛️</div><h3>Sélectionnez un centre</h3><p>Choisissez un centre pour voir ses filières.</p></div>
      ) : loading ? (
        <div className="loading-center"><div className="spinner" /><p>Chargement…</p></div>
      ) : filieres.length === 0 ? (
        <div className="empty-state"><div className="emoji">📚</div><h3>Aucune filière</h3><p>Ajoutez la première filière de ce centre.</p></div>
      ) : (
        <div className="cards-grid">
          {filieres.map(f => (
            <div key={f.id} className="card" style={{padding:20}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
                <div style={{width:42,height:42,borderRadius:10,background:'var(--teal-ultra)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>📚</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:15,color:'var(--text-primary)',marginBottom:3}}>{f.nom}</div>
                  <span className={`badge ${f.status==='actif' ? 'badge-green' : 'badge-gray'}`}>{f.status||'actif'}</span>
                </div>
              </div>
              {f.description && <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:14,lineHeight:1.5}}>{f.description}</p>}
              {canManage && (
                <div style={{display:'flex',gap:8,paddingTop:12,borderTop:'1px solid var(--border)'}}>
                  <button className="btn btn-ghost" style={{flex:1,padding:'8px',fontSize:13}} onClick={()=>handleEdit(f)}>✏️ Modifier</button>
                  <button className="btn btn-danger" style={{padding:'8px 12px',fontSize:13,borderRadius:8}} onClick={()=>handleDelete(f.id)}>🗑️</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
