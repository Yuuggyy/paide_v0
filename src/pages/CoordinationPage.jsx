import { useState, useEffect } from 'react';
import { createUserWithLogin } from '../lib/adminApi';
import { supabase } from '../lib/supabaseClient';
import { getCoordinations, getSousCoordinations, getCentresByCoordination, getAgentsByCentreIds } from '../lib/api';
import SousCoordDetail from '../components/hierarchy/SousCoordDetail';

const normalize = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* ══════════════════════════════════════
   NIVEAU 2 — Détail d'une coordination :
   ses agents (agrégés) + la barre de ses sous-coordinations
══════════════════════════════════════ */
function CoordinationDetail({ coord, onBack, isNational }) {
  const [sousCoords, setSousCoords] = useState([]);
  const [agents, setAgents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selectedSousCoord, setSelectedSousCoord] = useState(null);

  useEffect(() => { load(); }, [coord?.id]);

  const load = async () => {
    if (!coord?.id) return;
    setLoading(true);
    const { data: sc } = await getSousCoordinations(coord.id);
    setSousCoords(sc || []);
    const { data: centresData } = await getCentresByCoordination(coord.id);
    const { data: agentsData } = await getAgentsByCentreIds((centresData || []).map(c => c.id));
    setAgents(agentsData || []);
    setLoading(false);
  };

  if (selectedSousCoord) {
    return <SousCoordDetail sousCoord={selectedSousCoord} onBack={() => setSelectedSousCoord(null)} />;
  }

  const q = normalize(search);
  const filteredSousCoords = q ? sousCoords.filter(sc => normalize(sc.nom).includes(q) || normalize(sc.zone).includes(q)) : sousCoords;
  const filteredAgents = q ? agents.filter(a => normalize(a.noms).includes(q) || normalize(a.fonction).includes(q)) : agents;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {onBack && (
          <button className="btn btn-ghost" style={{ padding: '8px 14px' }} onClick={onBack}>← Retour</button>
        )}
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            🗂️ {coord?.nom}
          </h2>
          {coord?.province && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>📍 {coord.province}</p>}
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">📌</div>
          <div>
            <div className="stat-value">{sousCoords.length}</div>
            <div className="stat-label">Sous-coordinations</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">👥</div>
          <div>
            <div className="stat-value">{agents.length}</div>
            <div className="stat-label">Agents (total)</div>
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
          placeholder="Rechercher une sous-coordination ou un agent…"
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
            👥 Agents de la coordination ({filteredAgents.length})
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
            📌 Sous-coordinations ({filteredSousCoords.length})
          </h3>
          {filteredSousCoords.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Aucune sous-coordination pour le moment.</p>
          ) : (
            <div className="cards-grid">
              {filteredSousCoords.map(sc => (
                <div key={sc.id} className="card" style={{ padding: '16px 18px', cursor: 'pointer' }} onClick={() => setSelectedSousCoord(sc)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>📌</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{sc.nom}</div>
                      {sc.zone && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>📍 {sc.zone}</div>}
                    </div>
                    <span style={{ fontSize: 16, opacity: 0.4 }}>›</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   NIVEAU 1 — Page principale
══════════════════════════════════════ */
export default function CoordinationPage({ profile }) {
  const [coordinations, setCoordinations] = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ nom: '', province: '', login_email: '', login_password: '', login_nom: '' });
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [search, setSearch]         = useState('');
  const [selectedCoord, setSelectedCoord] = useState(null);

  const isNational     = profile?.role === 'national';
  const isCoordination  = profile?.role === 'coordination';

  useEffect(() => { loadCoordinations(); }, []);

  const loadCoordinations = async () => {
    const { data } = await getCoordinations();
    setCoordinations(data || []);
    // Un profil "coordination" atterrit directement sur SA coordination
    if (isCoordination && profile?.coordination_id) {
      const mine = (data || []).find(c => c.id === profile.coordination_id);
      if (mine) setSelectedCoord(mine);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const { data: coord, error: coordErr } = await supabase
      .from('coordinations')
      .insert({ nom: form.nom, province: form.province })
      .select().single();

    if (coordErr) return setError(coordErr.message);

    if (form.login_email && form.login_password) {
      const { error: loginErr } = await createUserWithLogin({
        email: form.login_email,
        password: form.login_password,
        full_name: form.login_nom || `Coordinateur - ${form.nom}`,
        role: 'coordination',
        coordination_id: coord.id
      });
      if (loginErr) return setError(`Coordination créée mais erreur login : ${loginErr.message}`);
    }

    setSuccess(`Coordination "${form.nom}" créée avec succès !`);
    setShowForm(false);
    setForm({ nom: '', province: '', login_email: '', login_password: '', login_nom: '' });
    loadCoordinations();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette coordination ? Les sous-coordinations et centres liés perdront leur rattachement.')) return;
    await supabase.from('coordinations').delete().eq('id', id);
    loadCoordinations();
  };

  // Profil "coordination" (ou national ayant sélectionné une coordination) → vue détail directe
  if (selectedCoord) {
    return (
      <div className="page-wrapper">
        <CoordinationDetail
          coord={selectedCoord}
          isNational={isNational}
          onBack={isNational ? () => setSelectedCoord(null) : null}
        />
      </div>
    );
  }

  // Sinon (national sans sélection, ou coordination sans coordination_id assigné) → liste
  const q = normalize(search);
  const filteredCoordinations = q ? coordinations.filter(c => normalize(c.nom).includes(q) || normalize(c.province).includes(q)) : coordinations;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">🗂️ Coordinations Provinciales</h1>
          <p className="page-subtitle">{coordinations.length} coordination(s)</p>
        </div>
        {isNational && (
          <button className="btn btn-teal" onClick={() => setShowForm(true)}>+ Nouvelle Coordination</button>
        )}
      </div>

      {isCoordination && !profile?.coordination_id && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          ⚠️ Votre compte n'est rattaché à aucune coordination. Contactez la direction nationale.
        </div>
      )}

      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>✅ {success}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

      {isNational && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1.5px solid var(--border)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 20, maxWidth: 420,
        }}>
          <span style={{ fontSize: 15, opacity: 0.5 }}>🔎</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une coordination…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, opacity: 0.5 }}>✕</button>
          )}
        </div>
      )}

      {showForm && isNational && (
        <div className="form-card">
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Nouvelle Coordination Provinciale</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Nom de la Coordination *</label>
                <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
              </div>
              <div className="form-field">
                <label className="form-label">Province</label>
                <input value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} />
              </div>
            </div>
            <div className="form-section">🔐 Login du Coordinateur</div>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Nom complet</label>
                <input value={form.login_nom} onChange={e => setForm({ ...form, login_nom: e.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label">Email de connexion</label>
                <input type="email" value={form.login_email} onChange={e => setForm({ ...form, login_email: e.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label">Mot de passe (min. 8 car.)</label>
                <input type="password" value={form.login_password} onChange={e => setForm({ ...form, login_password: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" className="btn btn-teal">Créer</button>
            </div>
          </form>
        </div>
      )}

      {filteredCoordinations.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🗂️</div>
          <h3>{search ? `Aucun résultat pour "${search}"` : 'Aucune coordination créée pour le moment.'}</h3>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredCoordinations.map(c => (
            <div key={c.id} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setSelectedCoord(c)}>
                <span style={{ fontSize: 22 }}>🗂️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{c.nom}</div>
                  {c.province && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>📍 {c.province}</div>}
                </div>
                <span style={{ fontSize: 16, opacity: 0.4 }}>›</span>
              </div>
              {isNational && (
                <div style={{ display: 'flex', gap: 8, paddingTop: 12, marginTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-ghost" style={{ flex: 1, padding: '8px', fontSize: 13 }} onClick={() => setSelectedCoord(c)}>
                    👁️ Voir le détail
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1, padding: '8px', fontSize: 13 }} onClick={() => handleDelete(c.id)}>
                    🗑️ Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
