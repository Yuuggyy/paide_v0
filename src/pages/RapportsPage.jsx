import { useState, useEffect } from 'react';
import { getRapportsByCentre, createRapport, getAgentsByCentre, getCentres } from '../lib/api';

const TYPE_STYLE = {
  retard:        { badge:'badge-orange', emoji:'⏰' },
  suspension:    { badge:'badge-red',    emoji:'🚫' },
  avertissement: { badge:'badge-orange', emoji:'⚠️' },
  felicitation:  { badge:'badge-green',  emoji:'🌟' },
  autre:         { badge:'badge-gray',   emoji:'📋' },
};

export default function RapportsPage({ profile }) {
  const [rapports, setRapports]   = useState([]);
  const [agents, setAgents]       = useState([]);
  const [centres, setCentres]     = useState([]);
  const [selCentre, setSelCentre] = useState(profile?.centre_id||'');
  const [showForm, setShowForm]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [form, setForm] = useState({
    agent_id:'', type_rapport:'retard', description:'',
    date_rapport: new Date().toISOString().split('T')[0], severite:'moyen',
  });

  const isNational = profile?.role === 'national';
  const isCentre   = profile?.role === 'centre';
  const canManage  = isNational || isCentre;
  const effectiveCentre = isCentre ? profile.centre_id : selCentre;

  useEffect(() => {
    if (isNational) getCentres().then(({data}) => setCentres(data||[]));
    if (effectiveCentre) { load(effectiveCentre); loadAgents(effectiveCentre); }
  }, []);

  useEffect(() => {
    if (isNational && selCentre) { load(selCentre); loadAgents(selCentre); }
  }, [selCentre]);

  const load = async (cId) => {
    setLoading(true);
    const { data } = await getRapportsByCentre(cId);
    setRapports(data||[]);
    setLoading(false);
  };
  const loadAgents = async (cId) => {
    const { data } = await getAgentsByCentre(cId);
    setAgents(data||[]);
  };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    const { error } = await createRapport({ ...form, centre_id: effectiveCentre });
    if (error) return setError(error.message);
    setSuccess('Renseignement enregistré !');
    setShowForm(false);
    setForm({ agent_id:'', type_rapport:'retard', description:'', date_rapport: new Date().toISOString().split('T')[0], severite:'moyen' });
    load(effectiveCentre);
  };

  const sf = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Renseignements</h1>
          <p className="page-subtitle">{rapports.length} renseignement(s) enregistré(s)</p>
        </div>
        {/* Bouton visible pour national ET centre */}
        {canManage && effectiveCentre && (
          <button className="btn btn-teal" onClick={() => { setShowForm(true); setForm({ agent_id:'', type_rapport:'retard', description:'', date_rapport: new Date().toISOString().split('T')[0], severite:'moyen' }); }}>
            + Nouveau Renseignement
          </button>
        )}
      </div>

      <div className="stat-grid">
        {[
          { label:'Total',        val: rapports.length, icon:'📋', cls:'stat-icon-teal' },
          { label:'Félicitations',val: rapports.filter(r=>r.type_rapport==='felicitation').length, icon:'🌟', cls:'stat-icon-green' },
          { label:'Avertissements',val: rapports.filter(r=>['avertissement','suspension'].includes(r.type_rapport)).length, icon:'⚠️', cls:'stat-icon-orange' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div><div className="stat-value">{s.val}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error   && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Filtre centre — national uniquement */}
      {isNational && (
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
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:16}}>➕ Nouveau Renseignement</h3>
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Agent concerné *</label>
                <select value={form.agent_id} onChange={e=>sf('agent_id',e.target.value)} required>
                  <option value="">-- Sélectionner un agent --</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.noms} ({a.matricule||'—'})</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Type</label>
                <select value={form.type_rapport} onChange={e=>sf('type_rapport',e.target.value)}>
                  <option value="retard">⏰ Retard</option>
                  <option value="avertissement">⚠️ Avertissement</option>
                  <option value="suspension">🚫 Suspension</option>
                  <option value="felicitation">🌟 Félicitation</option>
                  <option value="autre">📋 Autre</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Sévérité</label>
                <select value={form.severite} onChange={e=>sf('severite',e.target.value)}>
                  <option value="faible">Faible</option>
                  <option value="moyen">Moyen</option>
                  <option value="grave">Grave</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Date</label>
                <input type="date" value={form.date_rapport} onChange={e=>sf('date_rapport',e.target.value)} />
              </div>
              <div className="form-field" style={{gridColumn:'1/-1'}}>
                <label className="form-label">Description *</label>
                <textarea value={form.description} onChange={e=>sf('description',e.target.value)} required rows={4} style={{resize:'vertical'}} />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={()=>setShowForm(false)}>Annuler</button>
              <button type="submit" className="btn btn-teal">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {!effectiveCentre && isNational ? (
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
