import { useState, useEffect } from 'react';
import { getRapportsByCentre, createRapport, getAgentsByCentre, getCentres } from '../lib/api';

const TYPE_COLORS = {
  retard: { bg: '#fef9c3', color: '#854d0e' },
  suspension: { bg: '#fee2e2', color: '#dc2626' },
  avertissement: { bg: '#ffedd5', color: '#ea580c' },
  felicitation: { bg: '#dcfce7', color: '#166534' },
  autre: { bg: '#f1f5f9', color: '#475569' },
};

export default function RapportsPage({ profile }) {
  const [rapports, setRapports] = useState([]);
  const [agents, setAgents] = useState([]);
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(profile?.centre_id || '');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ agent_id: '', type_rapport: 'retard', description: '', date_rapport: new Date().toISOString().split('T')[0], severite: 'moyen' });

  const isNational = profile?.role === 'national';

  useEffect(() => {
    if (isNational) getCentres().then(({data}) => setCentres(data || []));
    if (selectedCentre) { loadRapports(selectedCentre); loadAgents(selectedCentre); }
  }, []);

  useEffect(() => {
    if (selectedCentre) { loadRapports(selectedCentre); loadAgents(selectedCentre); }
  }, [selectedCentre]);

  const loadRapports = async (id) => {
    const { data } = await getRapportsByCentre(id);
    setRapports(data || []);
  };

  const loadAgents = async (id) => {
    const { data } = await getAgentsByCentre(id);
    setAgents(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createRapport({ ...form, centre_id: selectedCentre });
    setShowForm(false);
    setForm({ agent_id: '', type_rapport: 'retard', description: '', date_rapport: new Date().toISOString().split('T')[0], severite: 'moyen' });
    loadRapports(selectedCentre);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📋 Renseignements des Agents</h2>
          <p style={styles.subtitle}>{rapports.length} rapport(s) enregistré(s)</p>
        </div>
        {selectedCentre && (
          <button onClick={() => setShowForm(true)} style={styles.btnPrimary}>+ Nouveau Rapport</button>
        )}
      </div>

      {isNational && (
        <div style={styles.filterBar}>
          <label style={styles.label}>Centre :</label>
          <select value={selectedCentre} onChange={e => setSelectedCentre(e.target.value)} style={styles.select}>
            <option value="">-- Choisir --</option>
            {centres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Nouveau Rapport</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Agent concerné</label>
                <select value={form.agent_id} onChange={e => setForm({...form, agent_id: e.target.value})} required style={styles.select}>
                  <option value="">-- Sélectionner --</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.noms} ({a.matricule})</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Type de rapport</label>
                <select value={form.type_rapport} onChange={e => setForm({...form, type_rapport: e.target.value})} style={styles.select}>
                  <option value="retard">Retard</option>
                  <option value="suspension">Suspension</option>
                  <option value="avertissement">Avertissement</option>
                  <option value="felicitation">Félicitation</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Date</label>
                <input type="date" value={form.date_rapport} onChange={e => setForm({...form, date_rapport: e.target.value})} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Sévérité</label>
                <select value={form.severite} onChange={e => setForm({...form, severite: e.target.value})} style={styles.select}>
                  <option value="faible">Faible</option>
                  <option value="moyen">Moyen</option>
                  <option value="élevé">Élevé</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.label}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  style={{ ...styles.input, height: '80px', resize: 'vertical' }} rows={3} />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.btnSecondary}>Annuler</button>
              <button type="submit" style={styles.btnPrimary}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.rapportList}>
        {rapports.map(r => {
          const colors = TYPE_COLORS[r.type_rapport] || TYPE_COLORS.autre;
          return (
            <div key={r.id} style={styles.rapportCard}>
              <div style={styles.rapportHeader}>
                <span style={{ ...styles.typeBadge, background: colors.bg, color: colors.color }}>
                  {r.type_rapport.toUpperCase()}
                </span>
                <span style={styles.agentName}>{r.agents?.noms} <code style={styles.matricule}>({r.agents?.matricule})</code></span>
                <span style={styles.date}>{r.date_rapport}</span>
                <span style={{ ...styles.severite, opacity: 0.8 }}>⚠️ {r.severite}</span>
              </div>
              {r.description && <p style={styles.desc}>{r.description}</p>}
            </div>
          );
        })}
        {rapports.length === 0 && <p style={styles.empty}>Aucun rapport pour ce centre.</p>}
      </div>
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
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitle: { fontSize: '18px', fontWeight: '700', color: '#1a3a5c', marginBottom: '16px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  rapportList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  rapportCard: { background: '#fff', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  rapportHeader: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  typeBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  agentName: { fontSize: '14px', fontWeight: '600', color: '#1a3a5c', flex: 1 },
  matricule: { fontSize: '12px', color: '#9ca3af' },
  date: { fontSize: '13px', color: '#6c757d' },
  severite: { fontSize: '13px', color: '#374151' },
  desc: { fontSize: '13px', color: '#374151', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' },
  btnPrimary: { background: '#1a3a5c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  btnSecondary: { background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  empty: { textAlign: 'center', color: '#9ca3af', padding: '40px', fontStyle: 'italic' },
};
