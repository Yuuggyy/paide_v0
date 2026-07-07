import { useState, useEffect } from 'react';
import { getCentresBySousCoordination, getAgentsByCentreIds } from '../../lib/api';

const normalize = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function SousCoordDetail({ sousCoord, onBack }) {
  const [centres, setCentres] = useState([]);
  const [agents, setAgents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => { load(); }, [sousCoord?.id]);

  const load = async () => {
    if (!sousCoord?.id) return;
    setLoading(true);
    const { data: centresData } = await getCentresBySousCoordination(sousCoord.id);
    setCentres(centresData || []);
    const { data: agentsData } = await getAgentsByCentreIds((centresData || []).map(c => c.id));
    setAgents(agentsData || []);
    setLoading(false);
  };

  const q = normalize(search);
  const filteredCentres = q ? centres.filter(c => normalize(c.name).includes(q) || normalize(c.lieu_affectation).includes(q)) : centres;
  const filteredAgents   = q ? agents.filter(a => normalize(a.noms).includes(q) || normalize(a.fonction).includes(q)) : agents;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {onBack && (
          <button className="btn btn-ghost" style={{ padding: '8px 14px' }} onClick={onBack}>← Retour</button>
        )}
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            📌 {sousCoord?.nom}
          </h2>
          {sousCoord?.zone && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>📍 {sousCoord.zone}</p>}
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-teal">🏛️</div>
          <div>
            <div className="stat-value">{centres.length}</div>
            <div className="stat-label">Centres</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">👥</div>
          <div>
            <div className="stat-value">{agents.length}</div>
            <div className="stat-label">Agents</div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff', border: '1.5px solid var(--border)',
        borderRadius: 10, padding: '10px 14px', marginBottom: 20, maxWidth: 420,
      }}>
        <span style={{ fontSize: 15, opacity: 0.5 }}>🔎</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un centre ou un agent…"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, opacity: 0.5 }}>✕</button>
        )}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /><p>Chargement…</p></div>
      ) : (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            👥 Agents ({filteredAgents.length})
          </h3>
          {filteredAgents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>Aucun agent trouvé.</p>
          ) : (
            <div className="cards-grid" style={{ marginBottom: 28 }}>
              {filteredAgents.map(a => (
                <div key={a.id} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{a.noms}</div>
                  {a.fonction && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{a.fonction}</div>}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>🏛️ {a.centres?.name || '—'}</div>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            🏛️ Centres ({filteredCentres.length})
          </h3>
          {filteredCentres.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Aucun centre trouvé.</p>
          ) : (
            <div className="cards-grid">
              {filteredCentres.map(c => (
                <div key={c.id} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                  {c.lieu_affectation && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>📍 {c.lieu_affectation}</div>}
                  <span className={`badge ${!c.status || c.status === 'actif' ? 'badge-green' : 'badge-gray'}`} style={{ marginTop: 8, display: 'inline-block' }}>
                    {c.status || 'actif'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
