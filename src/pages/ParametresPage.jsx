import { useState } from 'react';
import { changePassword } from '../lib/supabaseClient';

const ROLE_LABEL = {
  national: 'Direction Nationale',
  coordination: 'Coordination Provinciale',
  sous_coordination: 'Sous-Coordination',
  centre: 'Administrateur Centre',
};

export default function ParametresPage({ profile, user }) {
  const [newPwd, setNewPwd]       = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState('');
  const [error, setError]         = useState('');
  const [showPwd, setShowPwd]     = useState(false);

  const handleChangePwd = async (e) => {
    e.preventDefault(); setMsg(''); setError('');
    if (newPwd !== confirmPwd) return setError('Les mots de passe ne correspondent pas.');
    if (newPwd.length < 8)    return setError('Minimum 8 caractères requis.');
    setLoading(true);
    const { error } = await changePassword(newPwd);
    setLoading(false);
    if (error) setError(error.message);
    else { setMsg('Mot de passe modifié avec succès !'); setNewPwd(''); setConfirmPwd(''); }
  };

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ').slice(0,2).map(w=>w[0].toUpperCase()).join('');

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Paramètres</h1>
          <p className="page-subtitle">Gérez votre compte et vos préférences</p>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))', gap:20}}>
        {/* Profil */}
        <div className="card" style={{padding:24}}>
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:18,color:'var(--text-primary)'}}>👤 Mon Profil</h3>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,paddingBottom:20,borderBottom:'1px solid var(--border)',marginBottom:18}}>
            <div style={{width:72,height:72,borderRadius:18,background:'linear-gradient(135deg,var(--teal-light),var(--teal-dark))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:800,color:'#fff',boxShadow:'0 4px 16px rgba(0,143,181,0.3)'}}>
              {initials}
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:16,fontWeight:700,color:'var(--text-primary)'}}>{profile?.full_name||'Utilisateur'}</div>
              <div style={{fontSize:13,color:'var(--text-muted)',marginTop:2}}>{user?.email}</div>
              <span className="badge badge-teal" style={{marginTop:8}}>{ROLE_LABEL[profile?.role]||profile?.role}</span>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[
              { label:'Rôle', val: ROLE_LABEL[profile?.role]||'—' },
              { label:'Email', val: user?.email||'—' },
              { label:'Compte actif', val: '✅ Oui' },
            ].map(row => (
              <div key={row.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:13}}>
                <span style={{color:'var(--text-muted)',fontWeight:500}}>{row.label}</span>
                <span style={{fontWeight:600,color:'var(--text-primary)'}}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Changer mot de passe */}
        <div className="card" style={{padding:24}}>
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:18,color:'var(--text-primary)'}}>🔑 Changer le mot de passe</h3>
          {msg   && <div className="alert alert-success">✅ {msg}</div>}
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <form onSubmit={handleChangePwd} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="form-field">
              <label className="form-label">Nouveau mot de passe</label>
              <div style={{position:'relative',display:'flex',alignItems:'center'}}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={newPwd}
                  onChange={e=>setNewPwd(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  required
                  style={{paddingRight:40}}
                />
                <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{position:'absolute',right:10,background:'none',border:'none',opacity:0.5,fontSize:16}}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Confirmer le mot de passe</label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirmPwd}
                onChange={e=>setConfirmPwd(e.target.value)}
                placeholder="Répétez le mot de passe"
                required
              />
            </div>
            {/* Indicateur force */}
            {newPwd && (
              <div style={{display:'flex',gap:4}}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{flex:1,height:3,borderRadius:2,background: newPwd.length >= i*3 ? (newPwd.length >= 10 ? 'var(--green)' : 'var(--orange)') : 'var(--border)'}} />
                ))}
                <span style={{fontSize:11,color:'var(--text-muted)',marginLeft:6,whiteSpace:'nowrap'}}>
                  {newPwd.length < 8 ? 'Trop court' : newPwd.length < 10 ? 'Moyen' : 'Fort'}
                </span>
              </div>
            )}
            <button type="submit" className="btn btn-teal" disabled={loading} style={{marginTop:4}}>
              {loading ? <><span className="spinner" style={{width:14,height:14,borderWidth:2}} /> Modification…</> : '🔒 Changer le mot de passe'}
            </button>
          </form>
        </div>

        {/* Infos app */}
        <div className="card" style={{padding:24}}>
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:18,color:'var(--text-primary)'}}>ℹ️ À propos de PAIDE</h3>
          <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
            <img src="/logo_paide.jpg" alt="PAIDE" style={{width:90,height:90,objectFit:'contain',borderRadius:16,background:'var(--surface-alt)',padding:8}} />
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[
              { label:'Application', val:'PAIDE Manager' },
              { label:'Version', val:'Beta v0.1' },
              { label:'Plateforme', val:'Web + PWA' },
              { label:'Base de données', val:'Supabase' },
            ].map(row => (
              <div key={row.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:13}}>
                <span style={{color:'var(--text-muted)',fontWeight:500}}>{row.label}</span>
                <span style={{fontWeight:600,color:'var(--text-primary)'}}>{row.val}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:18,padding:'10px 14px',background:'var(--teal-ultra)',borderRadius:10,fontSize:12,color:'var(--teal-dark)',textAlign:'center',fontWeight:500}}>
            Programme d'Appui aux Initiatives de Développement de l'Enfant
          </div>
        </div>
      </div>
    </div>
  );
}
