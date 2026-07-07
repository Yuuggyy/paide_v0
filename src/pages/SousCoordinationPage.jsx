import { useState, useEffect } from 'react';
import { createUserWithLogin } from '../lib/adminApi';
import { supabase } from '../lib/supabaseClient';
import { getSousCoordinations, getCoordinations } from '../lib/api';
import SousCoordDetail from '../components/hierarchy/SousCoordDetail';

const normalize = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function SousCoordinationPage({ profile }) {
  const [sousCoord, setSousCoord]   = useState([]);
  const [coordinations, setCoordinations] = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ nom: '', zone: '', coordination_id: '', login_email: '', login_password: '', login_nom: '' });
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);

  const isNational        = profile?.role === 'national';
  const isSousCoordination = profile?.role === 'sous_coordination';

  useEffect(() => {
    loadSousCoord();
    getCoordinations().then(({ data }) => setCoordinations(data || []));
  }, []);

  const loadSousCoord = async () => {
    const { data } = await getSousCoordinations();
    setSousCoord(data || []);
    // Un profil "sous_coordination" atterrit directement sur SA propre sous-coordination
    if (isSousCoordination && profile?.sous_coordination_id) {
      const mine = (data || []).find(sc => sc.id === profile.sous_coordination_id);
      if (mine) setSelected(mine);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const { data: sc, error: scErr } = await supabase
      .from('sous_coordinations')
      .insert({ nom: form.nom, zone: form.zone, coordination_id: form.coordination_id || null })
      .select().single();

    if (scErr) return setError(scErr.message);

    if (form.login_email && form.login_password) {
      const { error: loginErr } = await createUserWithLogin({
        email: form.login_email,
        password: form.login_password,
        full_name: form.login_nom || `Sous-Coordinateur - ${form.nom}`,
        role: 'sous_coordination',
        sous_coordination_id: sc.id
      });
      if (loginErr) return setError(`Sous-coordination créée mais erreur login : ${loginErr.message}`);
    }

    setSuccess(`Sous-coordination "${form.nom}" créée avec succès !`);
    setShowForm(false);
    setForm({ nom: '', zone: '', coordination_id: '', login_email: '', login_password: '', login_nom: '' });
    loadSousCoord();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette sous-coordination ? Les centres liés perdront leur rattachement.')) return;
    await supabase.from('sous_coordinations').delete().eq('id', id);
    loadSousCoord();
  };

  if (selected) {
    return (
      <div className="page-wrapper">
        <SousCoordDetail sousCoord={selected} onBack={isNational || (!isSousCoordination) ? () => setSelected(null) : null} />
      </div>
    );
  }

  const q = normalize(search);
  const filtered = q
    ? sousCoord.filter(sc => normalize(sc.nom).includes(q) || normalize(sc.zone).includes(q) || normalize(sc.coordinations?.nom).includes(q))
    : sousCoord;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">📌 Sous-Coordinations Provinciales</h1>
          <p className="page-subtitle">{sousCoord.length} sous-coordination(s)</p>
        </div>
        {isNational && (
          <button className="btn btn-teal" onClick={() => setShowForm(true)}>+ Nouvelle Sous-Coordination</button>
        )}
      </div>

      {isSousCoordination && !profile?.sous_coordination_id && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          ⚠️ Votre compte n'est rattaché à aucune sous-coordination. Contactez la direction nationale.
        </div>
      )}

      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>✅ {success}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff', border: '1.5px solid var(--border)',
        borderRadius: 10, padding: '10px 14px', marginBottom: 20, maxWidth: 420,
      }}>
        <span style={{ fontSize: 15, opacity: 0.5 }}>🔎</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une sous-coordination…"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, opacity: 0.5 }}>✕</button>
        )}
      </div>

      {showForm && isNational && (
        <div className="form-card">
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Nouvelle Sous-Coordination</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Nom *</label>
                <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
              </div>
              <div className="form-field">
                <label className="form-label">Zone / Territoire</label>
                <input value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label">Coordination parente *</label>
                <select value={form.coordination_id} onChange={e => setForm({ ...form, coordination_id: e.target.value })} required>
                  <option value="">-- Choisir --</option>
                  {coordinations.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            </div>
            <div className="form-section">🔐 Login du Sous-Coordinateur</div>
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

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📌</div>
          <h3>{search ? `Aucun résultat pour "${search}"` : 'Aucune sous-coordination créée.'}</h3>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map(sc => (
            <div key={sc.id} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setSelected(sc)}>
                <span style={{ fontSize: 22 }}>📌</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{sc.nom}</div>
                  {sc.zone && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>📍 {sc.zone}</div>}
                  {sc.coordinations?.nom && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>🗂️ {sc.coordinations.nom}</div>}
                </div>
                <span style={{ fontSize: 16, opacity: 0.4 }}>›</span>
              </div>
              {isNational && (
                <div style={{ display: 'flex', gap: 8, paddingTop: 12, marginTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-ghost" style={{ flex: 1, padding: '8px', fontSize: 13 }} onClick={() => setSelected(sc)}>
                    👁️ Voir le détail
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1, padding: '8px', fontSize: 13 }} onClick={() => handleDelete(sc.id)}>
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
