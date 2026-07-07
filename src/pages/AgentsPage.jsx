import { useState, useEffect } from 'react';
import { getAgentsByCentre, getCentres, createAgent, updateAgent, deleteAgent, uploadFichierAgent } from '../lib/api';
import AgentFicheModal from '../components/agent/AgentFicheModal';

const EMPTY = {
  noms:'', sexe:'Masculin', email:'', telephone:'', adresse_electronique:'',
  matricule:'', grade:'', fonction:'', salaire:'', prime:'',
  date_embauche:'', type_piece_identite:'', numero_piece_identite:'',
  date_naissance:'', lieu_naissance:'', nationalite:'Congo (RDC)',
  niveau_etude:'', specialite:'', annees_experience:'',
  nom_urgence:'', tel_urgence:'',
  status:'actif',
};

function Field({ label, value, onChange, type='text', required, children, span }) {
  return (
    <div className="form-field" style={span ? {gridColumn:'1/-1'} : {}}>
      <label className="form-label">{label}</label>
      {children || <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} required={required} />}
    </div>
  );
}

const STATUS_BADGE = { actif:'badge-green', inactif:'badge-gray', suspendu:'badge-red' };
const TYPE_LABEL   = { piece_identite:"Pièce d'identité", carte_service:'Carte de Service', diplome:'Diplôme', autre:'Autre document' };

export default function AgentsPage({ profile }) {
  const [agents, setAgents]               = useState([]);
  const [centres, setCentres]             = useState([]);
  const [selCentre, setSelCentre]         = useState(profile?.centre_id || '');
  const [loading, setLoading]             = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [editing, setEditing]             = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [form, setForm]                   = useState(EMPTY);
  const [pendingFiles, setPendingFiles]   = useState([]); // [{file, type}]
  const [uploading, setUploading]         = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');

  const isNational = profile?.role === 'national';
  const isCentre   = profile?.role === 'centre';
  const canManage  = isNational || isCentre;
  // coordination/sous_coordination : lecture seule, mais peuvent choisir un centre parmi les leurs (RLS scope deja)
  const canPickCentre = isNational || profile?.role === 'coordination' || profile?.role === 'sous_coordination';
  // centre_id toujours valide — jamais de chaîne vide
  const effectiveCentre = isCentre
    ? (profile?.centre_id || null)
    : (selCentre || null);

  useEffect(() => {
    if (canPickCentre) getCentres().then(({data}) => setCentres(data||[]));
    if (effectiveCentre) load(effectiveCentre);
  }, []);

  useEffect(() => {
    if (canPickCentre && selCentre) load(selCentre);
  }, [selCentre]);

  const load = async (cId) => {
    if (!cId) return;
    setLoading(true);
    const { data } = await getAgentsByCentre(cId);
    setAgents(data||[]);
    setLoading(false);
  };

  const sf = (k,v) => setForm(f=>({...f,[k]:v}));

  const addPendingFile = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf','jpg','jpeg','png'].includes(ext)) {
      setError('Format non supporté. Utilisez PDF, JPG ou PNG.'); return;
    }
    setPendingFiles(pf => [...pf, { file, type, name: file.name }]);
    e.target.value = '';
  };

  const removePendingFile = (idx) => setPendingFiles(pf => pf.filter((_,i)=>i!==idx));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    // Vérification centre_id valide avant envoi
    if (isNational && !effectiveCentre) {
      return setError('Sélectionnez un centre d\'abord.');
    }

    const payload = {
      ...form,
      centre_id: effectiveCentre,                    // UUID propre, jamais vide
      salaire: parseFloat(form.salaire)||0,
      prime:   parseFloat(form.prime)||0,
      annees_experience: parseInt(form.annees_experience)||0,
    };

    let agentId = editing?.id;

    if (editing) {
      const { error } = await updateAgent(editing.id, payload);
      if (error) return setError(error.message);
    } else {
      const { data, error } = await createAgent(payload);
      if (error) return setError(error.message);
      agentId = data.id;
    }

    // Upload des fichiers en attente
    if (pendingFiles.length > 0 && agentId) {
      setUploading(true);
      for (const pf of pendingFiles) {
        await uploadFichierAgent(agentId, pf.file, pf.type);
      }
      setUploading(false);
    }

    setSuccess(editing ? 'Agent mis à jour !' : 'Agent créé avec succès !');
    setShowForm(false); setEditing(null); setForm(EMPTY); setPendingFiles([]);
    load(effectiveCentre);
  };

  const handleEdit = (a) => {
    setEditing(a);
    setForm({
      ...EMPTY, ...a,
      salaire: a.salaire?.toString()||'',
      prime:   a.prime?.toString()||'',
      annees_experience: a.annees_experience?.toString()||'',
    });
    setPendingFiles([]);
    setShowForm(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet agent ?')) return;
    await deleteAgent(id); load(effectiveCentre);
  };

  const openForm = () => {
    if (isNational && !effectiveCentre) { setError('Sélectionnez d\'abord un centre.'); return; }
    setError(''); setShowForm(true); setEditing(null); setForm(EMPTY); setPendingFiles([]);
  };

  return (
    <div className="page-wrapper">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Gestion des Agents</h1>
          <p className="page-subtitle">{agents.length} agent(s) enregistré(s)</p>
        </div>
        {canManage && (
          <button className="btn btn-teal" onClick={openForm}>+ Nouvel Agent</button>
        )}
      </div>

      {/* ── Stats ── */}
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

      {/* ── Alerts ── */}
      {success && <div className="alert alert-success">✅ {success}</div>}
      {error   && <div className="alert alert-error">⚠️ {error}</div>}

      {/* ── Filtre centre (national, coordination, sous-coordination) ── */}
      {canPickCentre && (
        <div className="filter-bar">
          <label className="form-label" style={{whiteSpace:'nowrap'}}>🏛️ Centre :</label>
          <select value={selCentre} onChange={e=>setSelCentre(e.target.value)} style={{maxWidth:320}}>
            <option value="">-- Sélectionner un centre --</option>
            {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* ══════════════════════════════════════
          FORMULAIRE COMPLET
      ══════════════════════════════════════ */}
      {showForm && canManage && (
        <div className="form-card">
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:4}}>{editing ? '✏️ Modifier l\'Agent' : '➕ Nouvelle Fiche Agent'}</h3>
          <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:4}}>Fiche d'identification complète</p>

          <form onSubmit={submit}>

            {/* ── Section 1 : Identification personnelle ── */}
            <div className="form-section">👤 Identification Personnelle</div>
            <div className="form-grid-3">
              <Field label="Noms complets *" value={form.noms} onChange={v=>sf('noms',v)} required />
              <Field label="Sexe">
                <select value={form.sexe} onChange={e=>sf('sexe',e.target.value)}>
                  <option>Masculin</option><option>Féminin</option>
                </select>
              </Field>
              <Field label="Date de naissance" value={form.date_naissance} type="date" onChange={v=>sf('date_naissance',v)} />
              <Field label="Lieu de naissance" value={form.lieu_naissance} onChange={v=>sf('lieu_naissance',v)} />
              <Field label="Nationalité" value={form.nationalite} onChange={v=>sf('nationalite',v)} />
              <Field label="Email personnel" value={form.email} type="email" onChange={v=>sf('email',v)} />
              <Field label="Téléphone" value={form.telephone} onChange={v=>sf('telephone',v)} />
              <Field label="Adresse physique / électronique" value={form.adresse_electronique} onChange={v=>sf('adresse_electronique',v)} span />
            </div>

            {/* ── Section 2 : Pièce d'identité ── */}
            <div className="form-section">🪪 Pièce d'Identité</div>
            <div className="form-grid-3">
              <Field label="Type de pièce">
                <select value={form.type_piece_identite} onChange={e=>sf('type_piece_identite',e.target.value)}>
                  <option value="">-- Sélectionner --</option>
                  <option>Carte Nationale d'Identité</option>
                  <option>Passeport</option>
                  <option>Permis de conduire</option>
                  <option>Autre</option>
                </select>
              </Field>
              <Field label="Numéro de pièce" value={form.numero_piece_identite} onChange={v=>sf('numero_piece_identite',v)} />
            </div>

            {/* ── Section 3 : Identification administrative ── */}
            <div className="form-section">🏢 Identification Administrative</div>
            <div className="form-grid-3">
              <Field label="Matricule" value={form.matricule} onChange={v=>sf('matricule',v)} />
              <Field label="Grade" value={form.grade} onChange={v=>sf('grade',v)} />
              <Field label="Fonction / Poste" value={form.fonction} onChange={v=>sf('fonction',v)} />
              <Field label="Date d'embauche" value={form.date_embauche} type="date" onChange={v=>sf('date_embauche',v)} />
              <Field label="Salaire" value={form.salaire} type="number" onChange={v=>sf('salaire',v)} />
              <Field label="Prime" value={form.prime} type="number" onChange={v=>sf('prime',v)} />
              <Field label="Statut">
                <select value={form.status} onChange={e=>sf('status',e.target.value)}>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </Field>
            </div>

            {/* ── Section 4 : Formation & Expérience ── */}
            <div className="form-section">🎓 Formation & Expérience</div>
            <div className="form-grid-3">
              <Field label="Niveau d'études" value={form.niveau_etude} onChange={v=>sf('niveau_etude',v)} />
              <Field label="Spécialité / Domaine" value={form.specialite} onChange={v=>sf('specialite',v)} />
              <Field label="Années d'expérience" value={form.annees_experience} type="number" onChange={v=>sf('annees_experience',v)} />
            </div>

            {/* ── Section 5 : Contact d'urgence ── */}
            <div className="form-section">🚨 Contact d'Urgence</div>
            <div className="form-grid">
              <Field label="Nom du contact" value={form.nom_urgence} onChange={v=>sf('nom_urgence',v)} />
              <Field label="Téléphone du contact" value={form.tel_urgence} onChange={v=>sf('tel_urgence',v)} />
            </div>

            {/* ── Section 6 : Documents (PDF/JPG) ── */}
            <div className="form-section">📁 Documents Joints</div>
            <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:14}}>
              {editing ? 'Ajoutez de nouveaux documents (les existants sont conservés).' : 'Ajoutez les documents de l\'agent (PDF, JPG, PNG).'}
            </p>

            {/* Zone upload par type */}
            <div className="form-grid-3" style={{marginBottom:14}}>
              {[
                {type:'piece_identite', label:"Pièce d'identité", icon:'🪪'},
                {type:'carte_service',  label:'Carte de service',  icon:'🏷️'},
                {type:'diplome',        label:'Diplôme / Certificat', icon:'🎓'},
                {type:'autre',          label:'Autre document',    icon:'📎'},
              ].map(({type, label, icon}) => (
                <div key={type} style={{border:'2px dashed var(--border)',borderRadius:10,padding:'14px',textAlign:'center',background:'var(--surface-alt)',cursor:'pointer',transition:'border-color 0.2s'}}>
                  <div style={{fontSize:24,marginBottom:6}}>{icon}</div>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--text-secondary)',marginBottom:8}}>{label}</div>
                  <label style={{display:'inline-flex',alignItems:'center',gap:6,cursor:'pointer',background:'var(--teal-ultra)',color:'var(--teal-dark)',padding:'7px 14px',borderRadius:8,fontSize:12,fontWeight:600}}>
                    📎 Choisir
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>addPendingFile(e,type)} style={{display:'none'}} />
                  </label>
                </div>
              ))}
            </div>

            {/* Liste des fichiers en attente */}
            {pendingFiles.length > 0 && (
              <div style={{background:'var(--teal-ultra)',borderRadius:10,padding:14,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:'var(--teal-dark)',marginBottom:8}}>📋 {pendingFiles.length} fichier(s) à uploader :</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {pendingFiles.map((pf,i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,background:'#fff',borderRadius:8,padding:'7px 12px',fontSize:13}}>
                      <span>{pf.name.endsWith('.pdf') ? '📄' : '🖼️'}</span>
                      <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text-secondary)'}}>{pf.name}</span>
                      <span className="badge badge-teal" style={{fontSize:10}}>{TYPE_LABEL[pf.type]||pf.type}</span>
                      <button type="button" onClick={()=>removePendingFile(i)} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,color:'#dc2626'}}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); setPendingFiles([]); }}>Annuler</button>
              <button type="submit" className="btn btn-teal" disabled={uploading}>
                {uploading ? '⏳ Upload en cours…' : editing ? 'Mettre à jour' : 'Créer la Fiche Agent'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ── Contenu principal ── */}
      {(!effectiveCentre && canPickCentre) ? (
        <div className="empty-state">
          <div className="emoji">🏛️</div>
          <h3>Sélectionnez un centre</h3>
          <p>Choisissez un centre dans le filtre ci-dessus pour voir ses agents.</p>
        </div>
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
                      <td style={{fontWeight:600,color:'var(--green-dark)'}}>{a.salaire||0}</td>
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
              {agents.length===0 && (
                <div className="empty-state">
                  <div className="emoji">👥</div>
                  <h3>Aucun agent enregistré</h3>
                  <p>Cliquez sur "+ Nouvel Agent" pour créer la première fiche.</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="mobile-list">
            {agents.length===0 ? (
              <div className="empty-state">
                <div className="emoji">👥</div>
                <h3>Aucun agent</h3>
                <p>Appuyez sur "+ Nouvel Agent" pour commencer.</p>
              </div>
            ) : agents.map(a => (
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
                  {a.salaire   && <span>💵 {a.salaire}</span>}
                  {a.telephone && <span>📞 {a.telephone}</span>}
                </div>
                <div className="agent-card-mobile-actions">
                  <button className="btn btn-ghost" style={{flex:1,padding:'8px',fontSize:13}} onClick={()=>setSelectedAgent(a)}>👁️ Fiche</button>
                  {canManage && <button className="btn btn-teal" style={{flex:1,padding:'8px',fontSize:13}} onClick={()=>handleEdit(a)}>✏️ Modifier</button>}
                  {canManage && <button className="btn btn-danger" style={{padding:'8px 12px',fontSize:13,borderRadius:8}} onClick={()=>handleDelete(a.id)}>🗑️</button>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedAgent && <AgentFicheModal agent={selectedAgent} onClose={()=>setSelectedAgent(null)} />}
    </div>
  );
}
