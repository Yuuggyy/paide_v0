import { useState, useEffect } from 'react';
import { getRapportsByCentre, createRapport, updateRapport, deleteRapport, getAgentsByCentre, getCentres } from '../lib/api';

const TYPE_STYLE = {
  retard:        { badge:'badge-orange', emoji:'⏰' },
  suspension:    { badge:'badge-red',    emoji:'🚫' },
  avertissement: { badge:'badge-orange', emoji:'⚠️' },
  felicitation:  { badge:'badge-green',  emoji:'🌟' },
  autre:         { badge:'badge-gray',   emoji:'📋' },
};

const EMPTY = {
  agent_id:'', type_rapport:'retard', description:'',
  date_rapport: new Date().toISOString().split('T')[0], severite:'moyen',
};

export default function RapportsPage({ profile }) {
  const [rapports, setRapports]   = useState([]);
  const [agents, setAgents]       = useState([]);
  const [centres, setCentres]     = useState([]);
  const [selCentre, setSelCentre] = useState(profile?.centre_id || '');
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null); // id du rapport en cours d'édition
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [form, setForm]           = useState(EMPTY);

  const isNational = profile?.role === 'national';
  const isCentre   = profile?.role === 'centre';
  const canManage  = isNational || isCentre;
  const effectiveCentre = isCentre ? (profile?.centre_id || null) : (selCentre || null);

  useEffect(() => {
    if (isNational) getCentres().then(({ data }) => setCentres(data || []));
    if (effectiveCentre) { load(effectiveCentre); loadAgents(effectiveCentre); }
  }, []);

  useEffect(() => {
    if (isNational && selCentre) { load(selCentre); loadAgents(selCentre); }
  }, [selCentre]);

  const load = async (cId) => {
    setLoading(true);
    const { data } = await getRapportsByCentre(cId);
    setRapports(data || []);
    setLoading(false);
  };

  const loadAgents = async (cId) => {
    const { data } = await getAgentsByCentre(cId);
    setAgents(data || []);
  };

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditing(r.id);
    setForm({
      agent_id:     r.agent_id     || '',
      type_rapport: r.type_rapport || 'retard',
      description:  r.description  || '',
      date_rapport: r.date_rapport || new Date().toISOString().split('T')[0],
      severite:     r.severite     || 'moyen',
    });
    setError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce renseignement ?')) return;
    setError('');
    const { error } = await deleteRapport(id);
    if (error) return setError(error.message);
    setSuccess('Renseignement supprimé.');
    load(effectiveCentre);
  };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');

    if (editing) {
      const { error } = await updateRapport(editing, {
        agent_id:     form.agent_id,
        type_rapport: form.type_rapport,
        description:  form.description,
        date_rapport: form.date_rapport,
        severite:     form.severite,
      });
      if (error) return setError(error.message);
      setSuccess('Renseignement mis à jour !');
    } else {
      const { error } = await createRapport({ ...form, centre_id: effectiveCentre });
      if (error) return setError(error.message);
      setSuccess('Renseignement enregistré !');
    }

    setShowForm(false);
    setEditing(null);
    setForm(EMPTY);
    load(effectiveCentre);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Renseignements</h1>
          <p className="page-subtitle">{rapports.length} renseignement(s) enregistré(s)</p>
        </div>
        {canManage && (
          <button className="btn btn-teal" onClick={openCreate}>
            + Nouveau Renseignement
          </button>
        )}
      </div>

      <div className="stat-grid">
        {[
          { label:'Total',         val: rapports.length, icon:'📋', cls:'stat-icon-teal' },
          { label:'Félicitations', val: rapports.filter(r => r.type_rapport === 'felicitation').length, icon:'🌟', cls:'stat-icon-green' },
          { label:'Avertissements',val: rapports.filter(r => ['avertissement','suspension'].includes(r.type_rapport)).length, icon:'⚠️', cls:'stat-icon-orange' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div><div className="stat-value">{s.val}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {success && <div className="alert alert-success">✅ {success} <button onClick={()=>setSuccess('')} style={{marginLeft:8,background:'none',border:'none',cursor:'pointer'}}>✕</button></div>}
      {error   && <div className="alert alert-error">⚠️ {error} <button onClick={()=>setError('')} style={{marginLeft:8,background:'none',border:'none',cursor:'pointer'}}>✕</button></div>}

      {isNational && (
        <div className="filter-bar">
          <label className="form-label" style={{whiteSpace:'nowrap'}}>🏛️ Centre :</label>
          <select value={selCentre} onChange={e => setSelCentre(e.target.value)} style={{maxWidth:320}}>
            <option value="">-- Sélectionner --</option>
            {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {showForm && canManage && (
        <div className="form-card">
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:16}}>
            {editing ? '✏️ Modifier le Renseignement' : '➕ Nouveau Renseignement'}
          </h3>
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Agent concerné *</label>
                <select value={form.agent_id} onChange={e => sf('agent_id', e.target.value)} required>
                  <option value="">-- Sélectionner un agent --</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.noms} ({a.matricule||'—'})</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Type</label>
                <select value={form.type_rapport} onChange={e => sf('type_rapport', e.target.value)}>
                  <option value="retard">⏰ Retard</option>
                  <option value="avertissement">⚠️ Avertissement</option>
                  <option value="suspension">🚫 Suspension</option>
                  <option value="felicitation">🌟 Félicitation</option>
                  <option value="autre">📋 Autre</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Sévérité</label>
                <select value={form.severite} onChange={e => sf('severite', e.target.value)}>
                  <option value="faible">Faible</option>
                  <option value="moyen">Moyen</option>
                  <option value="élevé">Grave (Élevé)</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Date</label>
                <input type="date" value={form.date_rapport} onChange={e => sf('date_rapport', e.target.value)} />
              </div>
              <div className="form-field" style={{gridColumn:'1/-1'}}>
                <label className="form-label">Description *</label>
                <textarea value={form.description} onChange={e => sf('description', e.target.value)} required rows={4} style={{resize:'vertical'}} />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</button>
              <button type="submit" className="btn btn-teal">{editing ? 'Mettre à jour' : 'Enregistrer'}</button>
            </div>
          </form>
        </div>
      )}

      {(!effectiveCentre && isNational) ? (
        <div className="empty-state"><div className="emoji">🏛️</div><h3>Sélectionnez un centre</h3><p>Choisissez un centre pour voir ses renseignements.</p></div>
      ) : loading ? (
        <div className="loading-center"><div className="spinner" /><p>Chargement…</p></div>
      ) : rapports.length === 0 ? (
        <div className="empty-state"><div className="emoji">📋</div><h3>Aucun renseignement</h3><p>Aucun renseignement enregistré pour ce centre.</p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {rapports.map(r => {
            const ts = TYPE_STYLE[r.type_rapport] || TYPE_STYLE.autre;
            return (
              <div key={r.id} className="card" style={{padding:16}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
                  <div style={{width:40,height:40,borderRadius:10,background:'var(--surface-alt)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{ts.emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}>
                      <span style={{fontWeight:700,fontSize:14,color:'var(--text-primary)'}}>{r.agents?.noms||'Agent inconnu'}</span>
                      <span className={`badge ${ts.badge}`}>{r.type_rapport}</span>
                      {r.severite && <span className="badge badge-gray">{r.severite}</span>}
                    </div>
                    <p style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.5,marginBottom:4}}>{r.description}</p>
                    <span style={{fontSize:11,color:'var(--text-muted)'}}>📅 {r.date_rapport}</span>
                  </div>
                  {canManage && (
                    <div style={{display:'flex',gap:8,flexShrink:0,alignItems:'center'}}>
                      <button
                        className="btn btn-ghost"
                        style={{padding:'6px 12px',fontSize:12}}
                        onClick={() => openEdit(r)}
                      >✏️ Modifier</button>
                      <button
                        className="btn"
                        style={{padding:'6px 12px',fontSize:12,background:'#fee2e2',color:'#dc2626',border:'none'}}
                        onClick={() => handleDelete(r.id)}
                      >🗑️ Supprimer</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
