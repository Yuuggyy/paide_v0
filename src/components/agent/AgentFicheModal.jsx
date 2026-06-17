import { useState, useEffect } from 'react';
import { uploadFichierAgent, deleteFichierAgent } from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';

const TYPE_LABEL = {
  piece_identite: "Pièce d'identité",
  carte_service:  'Carte de Service',
  diplome:        'Diplôme / Certificat',
  autre:          'Autre document',
};

function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:3,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
      <span style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px'}}>{label}</span>
      <span style={{fontSize:14,fontWeight:500,color:'var(--text-primary)'}}>{value}</span>
    </div>
  );
}

export default function AgentFicheModal({ agent, onClose }) {
  const [fichiers, setFichiers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState('info');

  useEffect(() => { loadFichiers(); }, [agent.id]);

  const loadFichiers = async () => {
    const { data } = await supabase.from('fichiers_agents').select('*').eq('agent_id', agent.id);
    setFichiers(data||[]);
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf','jpg','jpeg','png'].includes(ext)) { alert('Format non supporté. PDF, JPG ou PNG uniquement.'); return; }
    setUploading(true);
    await uploadFichierAgent(agent.id, file, type);
    await loadFichiers();
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (fichier) => {
    if (!window.confirm('Supprimer ce fichier ?')) return;
    await deleteFichierAgent(fichier.id, fichier.url_fichier);
    loadFichiers();
  };

  const initials = (agent.noms||'?').split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('');

  const TABS = [
    { key:'info',    label:'👤 Personnel' },
    { key:'admin',   label:'🏢 Administratif' },
    { key:'formation', label:'🎓 Formation' },
    { key:'fichiers',  label:'📁 Documents' },
  ];

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{maxWidth:640}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
          <div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,var(--teal-light),var(--teal-dark))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#fff',flexShrink:0}}>
            {initials}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <h2 style={{fontSize:17,fontWeight:800,color:'var(--text-primary)',marginBottom:3}}>{agent.noms}</h2>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {agent.fonction  && <span className="badge badge-teal">{agent.fonction}</span>}
              {agent.grade     && <span className="badge badge-gray">{agent.grade}</span>}
              {agent.matricule && <span style={{fontSize:11,color:'var(--text-muted)',fontFamily:'monospace'}}>#{agent.matricule}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,background:'var(--surface-alt)',border:'1px solid var(--border)',fontSize:14,color:'var(--text-muted)',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:18,flexWrap:'wrap'}}>
          {TABS.map(t => (
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{padding:'7px 12px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,
                background: tab===t.key ? 'var(--teal)' : 'var(--surface-alt)',
                color: tab===t.key ? '#fff' : 'var(--text-secondary)',
                transition:'all 0.15s',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab : Personnel ── */}
        {tab === 'info' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 24px'}}>
            <InfoRow label="Noms complets" value={agent.noms} />
            <InfoRow label="Sexe" value={agent.sexe} />
            <InfoRow label="Date de naissance" value={agent.date_naissance} />
            <InfoRow label="Lieu de naissance" value={agent.lieu_naissance} />
            <InfoRow label="Nationalité" value={agent.nationalite} />
            <InfoRow label="Email" value={agent.email} />
            <InfoRow label="Téléphone" value={agent.telephone} />
            <InfoRow label="Adresse" value={agent.adresse_electronique} />
            <InfoRow label="Type pièce ID" value={agent.type_piece_identite} />
            <InfoRow label="N° pièce ID" value={agent.numero_piece_identite} />
            <InfoRow label="Contact urgence" value={agent.nom_urgence} />
            <InfoRow label="Tél. urgence" value={agent.tel_urgence} />
          </div>
        )}

        {/* ── Tab : Administratif ── */}
        {tab === 'admin' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 24px'}}>
            <InfoRow label="Matricule" value={agent.matricule} />
            <InfoRow label="Grade" value={agent.grade} />
            <InfoRow label="Fonction / Poste" value={agent.fonction} />
            <InfoRow label="Statut" value={agent.status} />
            <InfoRow label="Date d'embauche" value={agent.date_embauche} />
            <InfoRow label="Salaire" value={agent.salaire ? `$${agent.salaire}` : null} />
            <InfoRow label="Prime" value={agent.prime ? `$${agent.prime}` : null} />
          </div>
        )}

        {/* ── Tab : Formation ── */}
        {tab === 'formation' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 24px'}}>
            <InfoRow label="Niveau d'études" value={agent.niveau_etude} />
            <InfoRow label="Spécialité / Domaine" value={agent.specialite} />
            <InfoRow label="Années d'expérience" value={agent.annees_experience ? `${agent.annees_experience} an(s)` : null} />
          </div>
        )}

        {/* ── Tab : Documents ── */}
        {tab === 'fichiers' && (
          <div>
            {/* Upload */}
            <div style={{background:'var(--surface-alt)',borderRadius:12,padding:16,marginBottom:18}}>
              <h4 style={{fontSize:13,fontWeight:700,color:'var(--text-secondary)',marginBottom:12}}>Ajouter un document</h4>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10}}>
                {[
                  {type:'piece_identite',label:"Pièce d'identité",icon:'🪪'},
                  {type:'carte_service', label:'Carte de service', icon:'🏷️'},
                  {type:'diplome',       label:'Diplôme',           icon:'🎓'},
                  {type:'autre',         label:'Autre',             icon:'📎'},
                ].map(({type,label,icon}) => (
                  <label key={type} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'12px 8px',background:'#fff',borderRadius:10,border:'1.5px dashed var(--border)',cursor:'pointer',textAlign:'center',transition:'border-color 0.2s'}}>
                    <span style={{fontSize:22}}>{icon}</span>
                    <span style={{fontSize:11,fontWeight:600,color:'var(--text-secondary)'}}>{label}</span>
                    <span style={{fontSize:11,color:'var(--teal)',fontWeight:600}}>{uploading ? '⏳' : '+ Ajouter'}</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>handleUpload(e,type)} style={{display:'none'}} disabled={uploading} />
                  </label>
                ))}
              </div>
            </div>

            {/* Liste fichiers */}
            <h4 style={{fontSize:13,fontWeight:700,color:'var(--text-secondary)',marginBottom:10}}>
              Documents enregistrés ({fichiers.length})
            </h4>
            {fichiers.length === 0 ? (
              <div className="empty-state" style={{padding:32}}>
                <div className="emoji">📁</div>
                <h3>Aucun document</h3>
                <p>Ajoutez des fichiers via les boutons ci-dessus.</p>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {fichiers.map(f => (
                  <div key={f.id} style={{display:'flex',alignItems:'center',gap:10,background:'var(--surface-alt)',borderRadius:10,padding:'10px 14px',border:'1px solid var(--border)'}}>
                    <span style={{fontSize:20,flexShrink:0}}>{f.format==='pdf' ? '📄' : '🖼️'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.nom_fichier}</div>
                      <div style={{fontSize:11,color:'var(--text-muted)'}}>{TYPE_LABEL[f.type_fichier]||f.type_fichier}</div>
                    </div>
                    <a href={f.url_fichier} target="_blank" rel="noreferrer"
                      style={{padding:'5px 12px',borderRadius:7,background:'var(--teal-ultra)',color:'var(--teal-dark)',fontSize:12,fontWeight:600,textDecoration:'none',flexShrink:0}}>
                      Voir
                    </a>
                    <button onClick={()=>handleDelete(f)} style={{width:32,height:32,borderRadius:7,background:'#fef2f2',border:'1px solid #fecaca',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
