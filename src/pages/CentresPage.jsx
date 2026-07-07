import { useState, useEffect } from 'react';
import { getCentres, createCentre, updateCentre, deleteCentre } from '../lib/api';
import { createUserWithLogin, deleteUsersOfCentre, resetUserPassword } from '../lib/adminApi';

function Field({ label, value, onChange, type = 'text', required, span, children }) {
  return (
    <div className="form-field" style={span ? { gridColumn: '1/-1' } : {}}>
      <label className="form-label">{label}</label>
      {children || (
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          required={required}
        />
      )}
    </div>
  );
}

export default function CentresPage({ profile }) {
  const [centres, setCentres]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [showReset, setShowReset] = useState(null);
  const [newPwd, setNewPwd]       = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [search, setSearch]       = useState('');

  const [form, setForm] = useState({
    name: '', lieu_affectation: '', province: '', adresse: '',
    telephone: '', email_centre: '',
    login_email: '', login_password: '', login_nom: '',
  });

  const isNational = profile?.role === 'national';
  const isCentre   = profile?.role === 'centre';

  useEffect(() => { load(); }, []);

  /* ── Charger les centres ── */
  const load = async () => {
    setLoading(true);
    const { data, error: loadErr } = await getCentres();
    if (loadErr) {
      setError('Erreur chargement : ' + loadErr.message);
      setLoading(false);
      return;
    }
    if (isCentre && profile?.centre_id) {
      setCentres((data || []).filter(c => c.id === profile.centre_id));
    } else {
      setCentres(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => setForm({
    name: '', lieu_affectation: '', province: '', adresse: '',
    telephone: '', email_centre: '',
    login_email: '', login_password: '', login_nom: '',
  });
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  /* ── Soumettre formulaire ── */
  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (editing) {
      /* Modification */
      const { error: updErr } = await updateCentre(editing.id, {
        name: form.name,
        lieu_affectation: form.lieu_affectation,
        province: form.province,
        adresse: form.adresse,
        telephone: form.telephone,
        email: form.email_centre,
      });
      if (updErr) return setError('Erreur mise à jour : ' + updErr.message);
      setSuccess('Centre mis à jour avec succès !');

    } else {
      /* Création — national uniquement */
      const { data: newCentre, error: createErr } = await createCentre({
        name: form.name,
        lieu_affectation: form.lieu_affectation,
        province: form.province,
        adresse: form.adresse,
        telephone: form.telephone,
        email: form.email_centre,
      });
      if (createErr) return setError('Erreur création : ' + createErr.message);

      /* Créer le login admin si renseigné */
      if (form.login_email && form.login_password) {
        const { error: loginErr } = await createUserWithLogin({
          email: form.login_email,
          password: form.login_password,
          full_name: form.login_nom || `Admin - ${form.name}`,
          role: 'centre',
          centre_id: newCentre.id,
        });
        if (loginErr) {
          /* Centre créé mais login échoué — afficher avertissement sans bloquer */
          setSuccess(`Centre "${form.name}" créé.`);
          setError(`Login non configuré : ${loginErr.message}`);
          setShowForm(false); setEditing(null); resetForm(); load();
          return;
        }
        setSuccess(`Centre "${form.name}" créé avec login configuré !`);
      } else {
        setSuccess(`Centre "${form.name}" créé !`);
      }
    }

    setShowForm(false); setEditing(null); resetForm(); load();
  };

  /* ── Supprimer un centre ── */
  const handleDelete = async (centre) => {
    const confirmed = window.confirm(
      `Supprimer "${centre.name}" ?\n\nTous les agents, filières, rapports et cours liés seront supprimés.`
    );
    if (!confirmed) return;

    setDeletingId(centre.id);
    setError(''); setSuccess('');

    /* Étape 1 — Supprimer les utilisateurs Auth liés à ce centre */
    await deleteUsersOfCentre(centre.id);
    /* On ne bloque pas si cette étape échoue — on continue la suppression du centre */

    /* Étape 2 — Supprimer le centre (CASCADE sur agents, filières, etc.) */
    const { error: delErr } = await deleteCentre(centre.id);

    if (delErr) {
      setError(`Impossible de supprimer "${centre.name}" : ${delErr.message}`);
      setDeletingId(null);
      return; /* NE PAS recharger — garder l'état actuel */
    }

    /* Étape 3 — Succès : mettre à jour l'UI localement IMMÉDIATEMENT */
    setCentres(prev => prev.filter(c => c.id !== centre.id));
    setSuccess(`Centre "${centre.name}" supprimé.`);
    setDeletingId(null);
    /* Puis recharger pour synchroniser */
    load();
  };

  /* ── Ouvrir formulaire modification ── */
  const handleEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      lieu_affectation: c.lieu_affectation || '',
      province: c.province || '',
      adresse: c.adresse || '',
      telephone: c.telephone || '',
      email_centre: c.email || '',
      login_email: '', login_password: '', login_nom: '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Réinitialiser mot de passe ── */
  const handleReset = async (e) => {
    e.preventDefault();
    if (newPwd.length < 8) return setError('Minimum 8 caractères.');
    const { error: pwdErr } = await resetUserPassword(showReset.auth_user_id, newPwd);
    if (pwdErr) return setError(pwdErr.message);
    setSuccess('Mot de passe réinitialisé !');
    setShowReset(null); setNewPwd(''); setError('');
  };

  /* Recherche insensible accents/majuscules — nom, lieu, province */
  const normalize = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filteredCentres = search.trim()
    ? centres.filter(c => {
        const q = normalize(search);
        return normalize(c.name).includes(q) || normalize(c.lieu_affectation).includes(q) || normalize(c.province).includes(q);
      })
    : centres;

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div className="page-wrapper">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🏛️ Centres PAIDE</h1>
          <p className="page-subtitle">{centres.length} centre(s) enregistré(s)</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isNational && (
            <button className="btn btn-teal" onClick={() => {
              setShowForm(true); setEditing(null); resetForm(); setError(''); setSuccess('');
            }}>
              + Nouveau Centre
            </button>
          )}
          {isCentre && !showForm && centres.length > 0 && (
            <button className="btn btn-ghost" onClick={() => handleEdit(centres[0])}>
              ✏️ Modifier mon Centre
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-teal">🏛️</div>
          <div>
            <div className="stat-value">{centres.length}</div>
            <div className="stat-label">Centres</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">✅</div>
          <div>
            <div className="stat-value">{centres.filter(c => !c.status || c.status === 'actif').length}</div>
            <div className="stat-label">Opérationnels</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">🌍</div>
          <div>
            <div className="stat-value">{[...new Set(centres.map(c => c.province).filter(Boolean))].length}</div>
            <div className="stat-label">Provinces</div>
          </div>
        </div>
      </div>

      {/* ── Barre de recherche ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff', border: '1.5px solid var(--border, #e2e8f0)',
        borderRadius: 10, padding: '10px 14px', marginBottom: 16, maxWidth: 420,
      }}>
        <span style={{ fontSize: 15, opacity: 0.5 }}>🔎</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un centre, un lieu, une province…"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 15, opacity: 0.5 }}>✕</button>
        )}
      </div>

      {/* ── Alerts ── */}
      {success && (
        <div className="alert alert-success" style={{ justifyContent: 'space-between' }}>
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.5 }}>✕</button>
        </div>
      )}
      {error && (
        <div className="alert alert-error" style={{ justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.5 }}>✕</button>
        </div>
      )}

      {/* ── Formulaire création / modification ── */}
      {showForm && (
        <div className="form-card">
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            {editing ? '✏️ Modifier le Centre' : '➕ Nouveau Centre'}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            {editing ? 'Modifiez les informations du centre.' : 'Créez un nouveau centre PAIDE.'}
          </p>
          <form onSubmit={submit}>

            <div className="form-section">📋 Informations du Centre</div>
            <div className="form-grid">
              <Field label="Nom du Centre *" value={form.name} onChange={v => sf('name', v)} required />
              <Field label="Lieu d'affectation *" value={form.lieu_affectation} onChange={v => sf('lieu_affectation', v)} required />
              <Field label="Province" value={form.province} onChange={v => sf('province', v)} />
              <Field label="Téléphone" value={form.telephone} onChange={v => sf('telephone', v)} />
              <Field label="Email du Centre" value={form.email_centre} type="email" onChange={v => sf('email_centre', v)} />
              <Field label="Adresse complète" value={form.adresse} onChange={v => sf('adresse', v)} />
            </div>

            {/* Login — seulement à la création, seulement par le national */}
            {!editing && isNational && (
              <>
                <div className="form-section">🔐 Login Administrateur du Centre</div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Optionnel. Laissez vide pour créer le login plus tard.
                </p>
                <div className="form-grid">
                  <Field label="Nom complet de l'admin" value={form.login_nom} onChange={v => sf('login_nom', v)} />
                  <Field label="Email de connexion" value={form.login_email} type="email" onChange={v => sf('login_email', v)} />
                  <Field label="Mot de passe (min. 8 car.)" value={form.login_password} type="password" onChange={v => sf('login_password', v)} />
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => {
                setShowForm(false); setEditing(null); setError('');
              }}>
                Annuler
              </button>
              <button type="submit" className="btn btn-teal">
                {editing ? 'Mettre à jour' : 'Créer le Centre'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal reset password ── */}
      {showReset && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">🔑 Réinitialiser le mot de passe</h3>
            <p className="modal-sub">Centre : <strong>{showReset.name}</strong></p>
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-field">
                <label className="form-label">Nouveau mot de passe</label>
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={8} />
              </div>
              {error && <div className="alert alert-error">⚠️ {error}</div>}
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowReset(null); setError(''); setNewPwd(''); }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-teal">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Liste des centres ── */}
      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
          <p>Chargement des centres…</p>
        </div>
      ) : centres.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🏛️</div>
          <h3>Aucun centre enregistré</h3>
          {isNational && <p>Cliquez sur "+ Nouveau Centre" pour commencer.</p>}
        </div>
      ) : filteredCentres.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🔍</div>
          <h3>Aucun résultat pour "{search}"</h3>
          <p>Essayez un autre nom, lieu ou province.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredCentres.map(centre => (
            <div key={centre.id} className="card" style={{ padding: '18px 20px' }}>

              {/* En-tête */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--teal-ultra)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    🏛️
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{centre.name}</div>
                    {centre.lieu_affectation && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        📍 {centre.lieu_affectation}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`badge ${!centre.status || centre.status === 'actif' ? 'badge-green' : 'badge-gray'}`}>
                  {centre.status || 'actif'}
                </span>
              </div>

              {/* Informations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                {centre.province && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 6 }}>
                    <span>🌍</span><span>{centre.province}</span>
                  </div>
                )}
                {centre.telephone && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 6 }}>
                    <span>📞</span><span>{centre.telephone}</span>
                  </div>
                )}
                {centre.email && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 6 }}>
                    <span>✉️</span><span>{centre.email}</span>
                  </div>
                )}
                {centre.adresse && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 6 }}>
                    <span>🏠</span><span>{centre.adresse}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {isNational && (
                <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button
                    className="btn btn-ghost"
                    style={{ flex: 1, padding: '8px', fontSize: 13 }}
                    onClick={() => handleEdit(centre)}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ flex: 1, padding: '8px', fontSize: 13 }}
                    onClick={() => handleDelete(centre)}
                    disabled={deletingId === centre.id}
                  >
                    {deletingId === centre.id ? '⏳ Suppression…' : '🗑️ Supprimer'}
                  </button>
                </div>
              )}
              {isCentre && (
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button
                    className="btn btn-ghost"
                    style={{ width: '100%', padding: '8px', fontSize: 13 }}
                    onClick={() => handleEdit(centre)}
                  >
                    ✏️ Modifier mes informations
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
