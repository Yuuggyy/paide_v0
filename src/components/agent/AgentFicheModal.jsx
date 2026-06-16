import { useState, useEffect } from 'react';
import { uploadFichierAgent, deleteFichierAgent } from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';

export default function AgentFicheModal({ agent, onClose }) {
  const [fichiers, setFichiers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState('info');

  useEffect(() => { loadFichiers(); }, [agent.id]);

  const loadFichiers = async () => {
    const { data } = await supabase
      .from('fichiers_agents')
      .select('*')
      .eq('agent_id', agent.id);
    setFichiers(data || []);
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      alert('Format non supporté. Utilisez PDF, JPG ou PNG.');
      return;
    }
    setUploading(true);
    await uploadFichierAgent(agent.id, file, type);
    await loadFichiers();
    setUploading(false);
  };

  const handleDelete = async (fichier) => {
    if (!window.confirm('Supprimer ce fichier ?')) return;
    await deleteFichierAgent(fichier.id, fichier.url_fichier);
    loadFichiers();
  };

  const typeLabel = { piece_identite: "Pièce d'identité", carte_service: 'Carte de Service', autre: 'Autre document' };

  return (
    <div style={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={styles.agentAvatar}>{agent.noms[0]}</div>
          <div>
            <h2 style={styles.agentName}>{agent.noms}</h2>
            <p style={styles.agentMeta}>{agent.fonction} · {agent.grade} · <code>{agent.matricule}</code></p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[['info', '📋 Informations'], ['admin', '🏢 Administratif'], ['fichiers', '📁 Fichiers']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ ...styles.tab, ...(tab === key ? styles.tabActive : {}) }}>
              {label}
            </button>
          ))}
        </div>

        <div style={styles.modalBody}>
          {tab === 'info' && (
            <div style={styles.grid2}>
              <InfoRow label="Noms complets" value={agent.noms} />
              <InfoRow label="Sexe" value={agent.sexe} />
              <InfoRow label="Email" value={agent.email} />
              <InfoRow label="Adresse" value={agent.adresse_electronique} />
              <InfoRow label="Statut" value={agent.status} />
            </div>
          )}

          {tab === 'admin' && (
            <div style={styles.grid2}>
              <InfoRow label="Matricule" value={agent.matricule} />
              <InfoRow label="Grade" value={agent.grade} />
              <InfoRow label="Fonction" value={agent.fonction} />
              <InfoRow label="Salaire" value={`$${agent.salaire}`} />
              <InfoRow label="Prime" value={`$${agent.prime}`} />
              <InfoRow label="Date d'embauche" value={agent.date_embauche} />
              <InfoRow label="Type pièce ID" value={agent.type_piece_identite} />
              <InfoRow label="N° pièce ID" value={agent.numero_piece_identite} />
            </div>
          )}

          {tab === 'fichiers' && (
            <div>
              <div style={styles.uploadZone}>
                <h4 style={styles.uploadTitle}>Ajouter un document</h4>
                <div style={styles.uploadGrid}>
                  {['piece_identite', 'carte_service', 'autre'].map(type => (
                    <div key={type} style={styles.uploadItem}>
                      <p style={styles.uploadLabel}>{typeLabel[type]}</p>
                      <label style={styles.uploadBtn}>
                        {uploading ? 'Upload...' : '📎 Choisir fichier'}
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleUpload(e, type)} style={{ display: 'none' }} disabled={uploading} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h4 style={styles.sectionTitle}>Documents enregistrés</h4>
                {fichiers.length === 0 ? (
                  <p style={styles.empty}>Aucun document pour cet agent.</p>
                ) : (
                  <div style={styles.fichierList}>
                    {fichiers.map(f => (
                      <div key={f.id} style={styles.fichierItem}>
                        <span style={styles.fichierIcon}>{f.format === 'pdf' ? '📄' : '🖼️'}</span>
                        <div style={{ flex: 1 }}>
                          <p style={styles.fichierName}>{f.nom_fichier}</p>
                          <p style={styles.fichierType}>{typeLabel[f.type_fichier] || f.type_fichier}</p>
                        </div>
                        <a href={f.url_fichier} target="_blank" rel="noreferrer" style={styles.fichierLink}>Voir</a>
                        <button onClick={() => handleDelete(f)} style={styles.fichierDelete}>🗑️</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
      <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a3a5c' }}>{value || '—'}</p>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', sans-serif" },
  modalHeader: { display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', background: '#1a3a5c', color: '#fff' },
  agentAvatar: { width: '52px', height: '52px', borderRadius: '50%', background: '#0d6efd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', flexShrink: 0 },
  agentName: { fontSize: '20px', fontWeight: '700', margin: 0, color: '#fff' },
  agentMeta: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
  closeBtn: { marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' },
  tabs: { display: 'flex', borderBottom: '1px solid #e5e7eb' },
  tab: { flex: 1, padding: '14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#6c757d' },
  tabActive: { color: '#1a3a5c', fontWeight: '700', borderBottom: '2px solid #1a3a5c' },
  modalBody: { padding: '24px', overflowY: 'auto', flex: 1 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  uploadZone: { background: '#f8fafc', borderRadius: '10px', padding: '20px', border: '2px dashed #d1d5db' },
  uploadTitle: { fontSize: '15px', fontWeight: '700', color: '#1a3a5c', marginBottom: '16px' },
  uploadGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  uploadItem: { textAlign: 'center' },
  uploadLabel: { fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
  uploadBtn: { display: 'inline-block', background: '#1a3a5c', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#1a3a5c', marginBottom: '12px' },
  empty: { textAlign: 'center', color: '#9ca3af', padding: '20px', fontStyle: 'italic' },
  fichierList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fichierItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' },
  fichierIcon: { fontSize: '24px' },
  fichierName: { fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0 },
  fichierType: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' },
  fichierLink: { color: '#0d6efd', fontSize: '13px', fontWeight: '600', textDecoration: 'none' },
  fichierDelete: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
};
