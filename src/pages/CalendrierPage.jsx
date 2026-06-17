import { useState, useEffect } from 'react';
import { getCalendrierByCentre, createCours, updateCours, deleteCours, getCentres, getFilieresByCentre } from '../lib/api';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const EMPTY_FORM = { titre:'', instructeur:'', jour_semaine:'Lundi', heure_debut:'', heure_fin:'', salle:'', filiere_id:'' };

export default function CalendrierPage({ profile }) {
  const [cours, setCours]         = useState([]);
  const [centres, setCentres]     = useState([]);
  const [filieres, setFilieres]   = useState([]);
  const [selCentre, setSelCentre] = useState(profile?.centre_id || '');
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const isNational = profile?.role === 'national';
  const isCentre   = profile?.role === 'centre';
  const canManage  = isNational || isCentre;
  const effectiveCentre = isCentre ? (profile?.centre_id || null) : (selCentre || null);

  useEffect(() => {
    if (isNational) getCentres().then(({data}) => setCentres(data||[]));
    if (effectiveCentre) { loadCours(effectiveCentre); loadFilieres(effectiveCentre); }
  }, []);

  useEffect(() => {
    if (isNational && selCentre) { loadCours(selCentre); loadFilieres(selCentre); }
  }, [selCentre]);

  const loadCours    = async (id) => { const { data } = await getCalendrierByCentre(id); setCours(data||[]); };
  const loadFilieres = async (id) => { const { data } = await getFilieresByCentre(id); setFilieres(data||[]); };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    const payload = { ...form, centre_id: effectiveCentre };
    const { error } = editing ? await updateCours(editing.id, payload) : await createCours(payload);
    if (error) return setError(error.message);
    setSuccess(editing ? 'Cours mis à jour !' : 'Cours ajouté !');
    setShowForm(false); setEditing(null); setForm(EMPTY_FORM);
    loadCours(effectiveCentre);
  };

  const handleEdit = (c) => {
    setEditing(c);
    setForm({ titre:c.titre, instructeur:c.instructeur||'', jour_semaine:c.jour_semaine, heure_debut:c.heure_debut||'', heure_fin:c.heure_fin||'', salle:c.salle||'', filiere_id:c.filiere_id||'' });
    setShowForm(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce cours ?')) return;
    await deleteCours(id); loadCours(effectiveCentre);
  };

  const sf = (k,v) => setForm(f=>({...f,[k]:v}));
  const coursByJour = JOURS.reduce((acc,j) => { acc[j] = cours.filter(c=>c.jour_semaine===j); return acc; }, {});

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Calendrier des Cours</h1>
          <p className="page-subtitle">{cours.length} cours planifié(s)</p>
        </div>
        {/* Bouton visible pour national ET centre */}
        {canManage && (
          <button className="btn btn-teal" onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY_FORM); }}>
            + Ajouter un Cours
          </button>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-teal">📅</div>
          <div><div className="stat-value">{cours.length}</div><div className="stat-label">Cours planifiés</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">🗓️</div>
          <div><div className="stat-value">{JOURS.filter(j=>coursByJour[j].length>0).length}</div><div className="stat-label">Jours actifs</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">👨‍🏫</div>
          <div><div className="stat-value">{[...new Set(cours.map(c=>c.instructeur).filter(Boolean))].length}</div><div className="stat-label">Instructeurs</div></div>
        </div>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error   && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Filtre centre — national uniquement */}
      {isNational && (
        <div className="filter-bar">
          <label className="form-label" style={{whiteSpace:'nowrap'}}>🏛️ Centre :</label>
          <select value={selCentre} onChange={e=>setSelCentre(e.target.value)} style={{maxWidth:320}}>
            <option value="">-- Choisir un centre --</option>
            {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {showForm && canManage && (
        <div className="form-card">
          <h3 style={{fontSize:17,fontWeight:700,marginBottom:16}}>{editing ? '✏️ Modifier le Cours' : '➕ Nouveau Cours'}</h3>
          <form onSubmit={submit}>
            <div className="form-grid-3">
              <div className="form-field">
                <label className="form-label">Titre du cours *</label>
                <input value={form.titre} onChange={e=>sf('titre',e.target.value)} required />
              </div>
              <div className="form-field">
                <label className="form-label">Instructeur</label>
                <input value={form.instructeur} onChange={e=>sf('instructeur',e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Filière</label>
                <select value={form.filiere_id} onChange={e=>sf('filiere_id',e.target.value)}>
                  <option value="">-- Aucune --</option>
                  {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Jour</label>
                <select value={form.jour_semaine} onChange={e=>sf('jour_semaine',e.target.value)}>
                  {JOURS.map(j => <option key={j}>{j}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Heure début</label>
                <input type="time" value={form.heure_debut} onChange={e=>sf('heure_debut',e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Heure fin</label>
                <input type="time" value={form.heure_fin} onChange={e=>sf('heure_fin',e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Salle</label>
                <input value={form.salle} onChange={e=>sf('salle',e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</button>
              <button type="submit" className="btn btn-teal">{editing ? 'Mettre à jour' : 'Ajouter'}</button>
            </div>
          </form>
        </div>
      )}

      {(!effectiveCentre && isNational) ? (
        <div className="empty-state"><div className="emoji">🏛️</div><h3>Sélectionnez un centre</h3><p>Choisissez un centre pour voir son calendrier.</p></div>
      ) : (
        /* Calendrier scrollable sur mobile */
        <div style={{background:'var(--surface)',borderRadius:'var(--r-md)',border:'1px solid var(--border)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
          <div style={{overflowX:'auto', WebkitOverflowScrolling:'touch'}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(7, minmax(130px, 1fr))', gap:0, minWidth:700}}>
              {JOURS.map(jour => (
                <div key={jour} style={{borderRight:'1px solid var(--border)'}}>
                  <div style={{background:'var(--teal)',color:'#fff',padding:'10px 8px',textAlign:'center',fontSize:12,fontWeight:700,letterSpacing:'0.5px'}}>
                    {jour.slice(0,3).toUpperCase()}
                  </div>
                  <div style={{padding:8,minHeight:120,display:'flex',flexDirection:'column',gap:6}}>
                    {coursByJour[jour].length === 0 ? (
                      <p style={{textAlign:'center',color:'var(--border)',fontSize:18,marginTop:16}}>—</p>
                    ) : (
                      coursByJour[jour].map(c => (
                        <div key={c.id} style={{background:'var(--teal-ultra)',borderRadius:8,padding:'8px 10px',border:'1px solid rgba(0,143,181,0.2)'}}>
                          <p style={{fontSize:12,fontWeight:700,color:'var(--teal-dark)',marginBottom:3}}>{c.titre}</p>
                          {c.heure_debut && <p style={{fontSize:11,color:'var(--text-secondary)',margin:'1px 0'}}>⏰ {c.heure_debut.slice(0,5)}–{c.heure_fin?.slice(0,5)}</p>}
                          {c.instructeur && <p style={{fontSize:11,color:'var(--text-secondary)',margin:'1px 0'}}>👤 {c.instructeur}</p>}
                          {c.filieres?.nom && <p style={{fontSize:11,color:'var(--text-muted)',margin:'1px 0'}}>📚 {c.filieres.nom}</p>}
                          {c.salle && <p style={{fontSize:11,color:'var(--text-muted)',margin:'1px 0'}}>🚪 {c.salle}</p>}
                          {canManage && (
                            <div style={{display:'flex',gap:4,marginTop:5}}>
                              <button onClick={()=>handleEdit(c)} style={{background:'none',border:'none',cursor:'pointer',fontSize:12,padding:'2px 4px',borderRadius:4}} title="Modifier">✏️</button>
                              <button onClick={()=>handleDelete(c.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:12,padding:'2px 4px',borderRadius:4}} title="Supprimer">🗑️</button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {cours.length === 0 && effectiveCentre && (
            <div className="empty-state"><div className="emoji">📅</div><h3>Aucun cours planifié</h3><p>Ajoutez le premier cours de ce centre.</p></div>
          )}
        </div>
      )}
    </div>
  );
}
