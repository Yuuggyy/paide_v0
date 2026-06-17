import { useState, useEffect } from 'react';
import { getAgentsByCentre, getCentres, createAgent, updateAgent, deleteAgent } from '../lib/api';
import AgentFicheModal from '../components/agent/AgentFicheModal';

const EMPTY = {
  noms:'', sexe:'Masculin', email:'', adresse_electronique:'',
  matricule:'', grade:'', fonction:'', salaire:'', prime:'',
  date_embauche:'', type_piece_identite:'', numero_piece_identite:'', status:'actif',
};

function Field({ label, value, onChange, type='text', required, children }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children || <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} required={required} />}
    </div>
  );
}

export default function AgentsPage({ profile }) {
  const [agents, setAgents]               = useState([]);
  const [centres, setCentres]             = useState([]);
  const [selCentre, setSelCentre]         = useState(profile?.centre_id || '');
  const [loading, setLoading]             = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [editing, setEditing]             = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [form, setForm]                   = useState(EMPTY);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');

  const isNational = profile?.role === 'national';
  const isCentre   = profile?.role === 'centre';
  // National et Centre ont les mêmes droits de gestion des agents
  const canManage  = isNational || isCentre;

  useEffect(() => {
    if (isNational) getCentres().then(({data}) => setCentres(data||[]));
    // Le centre a son centre_id fixe
    const cId = isCentre ? profile.centre_id : selCentre;
    if (cId) load(cId);
  }, []);

  useEffect(() => {
    if (isNational && selCentre) load(selCentre);
  }, [selCentre]);

  const effectiveCentre = isCentre ? profile.centre_id : selCentre;

  const load = async (cId) => {
    setLoading(true);
    const { data } = await getAgentsByCentre(cId);
    setAgents(data||[]);
    setLoading(false);
  };

  const sf = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    const payload = { ...form, centre_id: effectiveCentre, salaire: parseFloat(form.salaire)||0, prime: parseFloat(form.prime)||0 };
    const { error } = editing ? await updateAgent(editing.id, payload) : await createAgent(payload);
    if (error) return setError(error.message);
    setSuccess(editing ? 'Agent mis à jour !' : 'Agent créé avec succès !');
    setShowForm(false); setEditing(null); setForm(EMPTY);
    load(effectiveCentre);
  };

  const handleEdit = (a) => {
    setEditing(a);
    setForm({ ...a, salaire: a.salaire?.toString()||'', prime: a.prime?.toString()||'' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet agent ?')) return;
    await deleteAgent(id); load(effectiveCentre);
  };

  const STATUS_BADGE = { actif:'badge-green', inactif:'badge-gray', suspendu:'badge-red' };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Gestion des Agents</h1>
          <p className="page-subtitle">{agents.length} agent(s) enregistré(s)</p>
        </div>
        {/* Bouton visible pour national ET centre, mais seulement si un centre est sélectionné */}
        {canManage && effectiveCentre && (
          <button className="btn btn-teal" onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY); }}>
            + Nouvel Agent
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-teal">👥</div>
          <div><div className="stat-value">{agents.length}</div><div className="stat-label">Total agents</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">✅</div>
          <div><div className="stat-value">{agents.filter(a=>a.status==='actif').length}</div><div className="stat-label">Actifs</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">⚠️</div>
          <div><div className="stat-value">{agents.filter(a=>a.status!=='actif').length}</div><div className="stat-label">Inactifs/Suspendus</div></div>
        </div>
      </div>

      {/* Alerts */}
      {success && <div className="alert alert-success">✅ {success}</div>}
      {error   && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Filtre centre — national uniquement, centre a son centre fixe */}
      {isNational && (
        <div className="filter-bar">
          <label className="form-label" style={{whiteSpace:'nowrap'}}>🏛️ Centre :</label>
          <select value={selCentre} onChange={e=>setSelCentre(e.target.value)} style={{maxWidth:320}}>
            <option value="">-- Sélectionner un centre --</option>
            {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Formulaire */}
      {showForm && canManage && (
        <div className="form-card">
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:4}}>{editing ? '✏️ Modifier l\'Agent' : '➕ Nouvel Agent'}</h3>
          <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:8}}>Remplissez les informations de l'agent.</p>
          <form onSubmit={submit}>
            <div className="form-section">📋 Identification Personnelle</div>
            <div className="form-grid-3">
              <Field label="Noms complets *" value={form.noms} onChange={v=>sf('noms',v)} required />
              <Field label="Sexe">
                <select value={form.sexe} onChange={e=>sf('sexe',e.target.value)}>
                  <option>Masculin</option><option>Féminin</option>
                </select>
              </Field>
              <Field label="Email" value={form.email} type="email" onChange={v=>sf('email',v)} />
              <Field label="Adresse physique / électronique" value={form.adresse_electronique} onChange={v=>sf('adresse_electronique',v)} />
            </div>
            <div className="form-section">🏢 Identification Administrative</div>
            <div className="form-grid-3">
              <Field label="Matricule" value={form.matricule} onChange={v=>sf('matricule',v)} />
              <Field label="Grade" value={form.grade} onChange={v=>sf('grade',v)} />
              <Field label="Fonction" value={form.fonction} onChange={v=>sf('fonction',v)} />
              <Field label="Salaire (USD)" value={form.salaire} type="number" onChange={v=>sf('salaire',v)} />
              <Field label="Prime (USD)" value={form.prime} type="number" onChange={v=>sf('prime',v)} />
              <Field label="Date d'embauche" value={form.date_embauche} type="date" onChange={v=>sf('date_embauche',v)} />
              <Field label="Type pièce d'identité">
                <select value={form.type_piece_identite} onChange={e=>sf('type_piece_identite',e.target.value)}>
                  <option value="">-- Sélectionner --</option>
                  <option>Carte Nationale d'Identité</option>
                  <option>Passeport</option><option>Permis de conduire</option><option>Autre</option>
                </select>
              </Field>
              <Field label="N° Pièce d'identité" value={form.numero_piece_identite} onChange={v=>sf('numero_piece_identite',v)} />
              <Field label="Statut">
                <select value={form.status} onChange={e=>sf('status',e.target.value)}>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </Field>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</button>
              <button type="submit" className="btn btn-teal">{editing ? 'Mettre à jour' : 'Créer l\'Agent'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Contenu */}
      {!effectiveCentre && isNational ? (
        <div className="empty-state"><div className="emoji">🏛️</div><h3>Sélectionnez un centre</h3><p>Choisissez un centre dans le filtre ci-dessus pour voir ses agents.</p></div>
      ) : loading ? (
        <div className="loading-center"><div className="spinner" /><p>Chargement…</p></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="table-wrapper desktop-table">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>{['Matricule','Noms','Sexe','Grade','Fonction','Salaire','Statut','Actions'].map(h=>(
                    <th key={h}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {agents.map(a => (
                    <tr key={a.id}>
                      <td><code style={{background:'var(--teal-ultra)',padding:'2px 7px',borderRadius:5,fontSize:12,color:'var(--teal-dark)'}}>{a.matricule||'—'}</code></td>
                      <td style={{fontWeight:600,color:'var(--text-primary)'}}>{a.noms}</td>
                      <td>{a.sexe}</td>
                      <td>{a.grade||'—'}</td>
                      <td>{a.fonction||'—'}</td>
                      <td style={{fontWeight:600,color:'var(--green-dark)'}}>${a.salaire||0}</td>
                      <td><span className={`badge ${STATUS_BADGE[a.status]||'badge-gray'}`}>{a.status}</span></td>
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn-icon" onClick={()=>setSelectedAgent(a)} title="Voir fiche">👁️</button>
                          {canManage && <button className="btn-icon" onClick={()=>handleEdit(a)} title="Modifier">✏️</button>}
                          {canManage && <button className="btn-icon btn-icon-danger" onClick={()=>handleDelete(a.id)} title="Supprimer">🗑️</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {agents.length===0 && <div className="empty-state"><div className="emoji">👥</div><h3>Aucun agent</h3><p>Aucun agent enregistré pour ce centre.</p></div>}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="mobile-list">
            {agents.length===0
              ? <div className="empty-state"><div className="emoji">👥</div><h3>Aucun agent</h3><p>Ajoutez un premier agent.</p></div>
              : agents.map(a => (
                <div key={a.id} className="agent-card-mobile">
                  <div className="agent-card-mobile-header">
                    <div>
                      <div style={{fontWeight:700,fontSize:15,color:'var(--text-primary)'}}>{a.noms}</div>
                      <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{a.fonction||'—'} · {a.grade||'—'}</div>
                    </div>
                    <span className={`badge ${STATUS_BADGE[a.status]||'badge-gray'}`}>{a.status}</span>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8,fontSize:13,color:'var(--text-secondary)'}}>
                    {a.matricule && <span>🪪 {a.matricule}</span>}
                    {a.salaire   && <span>💵 ${a.salaire}</span>}
                    {a.sexe      && <span>👤 {a.sexe}</span>}
                  </div>
                  <div className="agent-card-mobile-actions">
                    <button className="btn btn-ghost" style={{flex:1,padding:'8px',fontSize:13}} onClick={()=>setSelectedAgent(a)}>👁️ Fiche</button>
                    {canManage && <button className="btn btn-teal" style={{flex:1,padding:'8px',fontSize:13}} onClick={()=>handleEdit(a)}>✏️ Modifier</button>}
                    {canManage && <button className="btn btn-danger" style={{padding:'8px 12px',fontSize:13,borderRadius:8}} onClick={()=>handleDelete(a.id)}>🗑️</button>}
                  </div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {selectedAgent && <AgentFicheModal agent={selectedAgent} onClose={()=>setSelectedAgent(null)} />}
    </div>
  );
}
