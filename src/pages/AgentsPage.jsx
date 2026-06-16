import { useState, useEffect } from 'react';
import { getAgentsByCentre, getCentres, createAgent, updateAgent, deleteAgent } from '../lib/api';
import AgentFicheModal from '../components/agent/AgentFicheModal';

export default function AgentsPage({ profile }) {
  const [agents, setAgents] = useState([]);
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(profile?.centre_id || '');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [error, setError] = useState('');

  const isNational = profile?.role === 'national';
  const isCentreAdmin = profile?.role === 'centre';

  const emptyForm = {
    noms: '', sexe: 'Masculin', email: '', adresse_electronique: '',
    matricule: '', grade: '', fonction: '', salaire: '', prime: '',
    date_embauche: '', type_piece_identite: '', numero_piece_identite: '',
    status: 'actif', centre_id: selectedCentre
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (isNational) getCentres().then(({data}) => setCentres(data || []));
    if (selectedCentre) loadAgents(selectedCentre);
  }, []);

  useEffect(() => {
    if (selectedCentre) loadAgents(selectedCentre);
  }, [selectedCentre]);

  const loadAgents = async (centreId) => {
    setLoading(true);
    const { data } = await getAgentsByCentre(centreId);
    setAgents(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, centre_id: selectedCentre, salaire: parseFloat(form.salaire) || 0, prime: parseFloat(form.prime) || 0 };
    if (editing) {
      const { error } = await updateAgent(editing.id, payload);
      if (error) return setError(error.message);
    } else {
      const { error } = await createAgent(payload);
      if (error) return setError(error.message);
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    loadAgents(selectedCentre);
  };

  const handleEdit = (agent) => {
    setEditing(agent);
    setForm({ ...agent, salaire: agent.salaire?.toString() || '', prime: agent.prime?.toString() || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet agent ?')) return;
    await deleteAgent(id);
    loadAgents(selectedCentre);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>👥 Gestion des Agents</h2>
          <p style={styles.subtitle}>{agents.length} agent(s)</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }} style={styles.btnPrimary}>
          + Nouvel Agent
        </button>
      </div>

      {isNational && (
        <div style={styles.filterBar}>
          <label style={styles.label}>Sélectionner un Centre :</label>
          <select value={selectedCentre} onChange={e => setSelectedCentre(e.target.value)} style={styles.select}>
            <option value="">-- Choisir --</option>
            {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{editing ? 'Modifier Agent' : 'Nouvel Agent'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>📋 Identification Personnelle</h4>
              <div style={styles.grid3}>
                <Field label="Noms complets" value={form.noms} onChange={v => setForm({...form, noms: v})} required />
                <div>
                  <label style={styles.label}>Sexe</label>
                  <select value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})} style={styles.select}>
                    <option>Masculin</option>
                    <option>Féminin</option>
                  </select>
                </div>
                <Field label="Adresse e-mail" value={form.email} type="email" onChange={v => setForm({...form, email: v})} />
                <Field label="Adresse électronique / Physique" value={form.adresse_electronique} onChange={v => setForm({...form, adresse_electronique: v})} />
              </div>
            </div>

            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>🏢 Identification Administrative</h4>
              <div style={styles.grid3}>
                <Field label="Matricule" value={form.matricule} onChange={v => setForm({...form, matricule: v})} />
                <Field label="Grade" value={form.grade} onChange={v => setForm({...form, grade: v})} />
                <Field label="Fonction" value={form.fonction} onChange={v => setForm({...form, fonction: v})} />
                <Field label="Salaire (USD)" value={form.salaire} type="number" onChange={v => setForm({...form, salaire: v})} />
                <Field label="Prime (USD)" value={form.prime} type="number" onChange={v => setForm({...form, prime: v})} />
                <Field label="Date d'embauche" value={form.date_embauche} type="date" onChange={v => setForm({...form, date_embauche: v})} />
                <div>
                  <label style={styles.label}>Type pièce d'identité</label>
                  <select value={form.type_piece_identite} onChange={e => setForm({...form, type_piece_identite: e.target.value})} style={styles.select}>
                    <option value="">-- Sélectionner --</option>
                    <option>Carte Nationale d'Identité</option>
                    <option>Passeport</option>
                    <option>Permis de conduire</option>
                    <option>Autre</option>
                  </select>
                </div>
                <Field label="N° Pièce d'identité" value={form.numero_piece_identite} onChange={v => setForm({...form, numero_piece_identite: v})} />
                <div>
                  <label style={styles.label}>Statut</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={styles.select}>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </div>
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}
            <div style={styles.formActions}>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} style={styles.btnSecondary}>Annuler</button>
              <button type="submit" style={styles.btnPrimary}>{editing ? 'Mettre à jour' : 'Créer'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Chargement...</div>
      ) : (
        <div style={styles.table}>
          <table style={styles.tableEl}>
            <thead>
              <tr>
                {['Matricule','Noms','Sexe','Grade','Fonction','Salaire','Status','Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr key={agent.id} style={styles.tr}>
                  <td style={styles.td}><code>{agent.matricule}</code></td>
                  <td style={styles.td}><b>{agent.noms}</b></td>
                  <td style={styles.td}>{agent.sexe}</td>
                  <td style={styles.td}>{agent.grade}</td>
                  <td style={styles.td}>{agent.fonction}</td>
                  <td style={styles.td}>${agent.salaire}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, background: agent.status === 'actif' ? '#dcfce7' : '#fee2e2', color: agent.status === 'actif' ? '#166534' : '#dc2626'}}>
                      {agent.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => setSelectedAgent(agent)} style={styles.btnIcon} title="Voir fiche">👁️</button>
                    <button onClick={() => handleEdit(agent)} style={styles.btnIcon} title="Modifier">✏️</button>
                    <button onClick={() => handleDelete(agent.id)} style={styles.btnIconDanger} title="Supprimer">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {agents.length === 0 && <div style={styles.empty}>Aucun agent enregistré pour ce centre.</div>}
        </div>
      )}

      {selectedAgent && (
        <AgentFicheModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} required={required}
        style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px' }} />
    </div>
  );
}

const styles = {
  container: { padding: '32px', fontFamily: "'Segoe UI', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6c757d', marginTop: '4px' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  select: { padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', minWidth: '200px' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle: { fontSize: '18px', fontWeight: '700', color: '#1a3a5c', marginBottom: '20px' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#1a3a5c', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '13px', margin: '12px 0' },
  loading: { textAlign: 'center', padding: '40px', color: '#6c757d' },
  empty: { textAlign: 'center', padding: '40px', color: '#9ca3af', fontStyle: 'italic' },
  table: { background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' },
  tableEl: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f8fafc', padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151', borderBottom: '1px solid #e5e7eb' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#374151' },
  badge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  btnPrimary: { background: '#1a3a5c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  btnSecondary: { background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', marginRight: '4px' },
  btnIconDanger: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' },
};
