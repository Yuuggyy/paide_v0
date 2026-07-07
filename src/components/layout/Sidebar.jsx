import { useState, useEffect } from 'react';

const NAV = [
  { key: 'centres',           label: 'Centres',             icon: '🏛️', color: '#008fb5' },
  { key: 'coordination',      label: 'Coordinations',       icon: '🗂️', color: '#f7941d' },
  { key: 'sous_coordination', label: 'Sous-Coordinations',  icon: '📌', color: '#00a651' },
  { key: 'agents',            label: 'Agents',              icon: '👥', color: '#008fb5' },
  { key: 'filieres',          label: 'Filières',            icon: '📚', color: '#f7941d' },
  { key: 'calendrier',        label: 'Calendrier',          icon: '📅', color: '#00a651' },
  { key: 'rapports',          label: 'Renseignements',      icon: '📋', color: '#008fb5' },
  { key: 'parametres',        label: 'Paramètres',          icon: '⚙️', color: '#8ca5b5' },
];

const ROLE_LABEL = {
  national:          'Direction Nationale',
  coordination:      'Coordination Provinciale',
  sous_coordination: 'Sous-Coordination',
  centre:            'Admin Centre',
};
const ROLE_COLOR = {
  national:          '#008fb5',
  coordination:      '#f7941d',
  sous_coordination: '#00a651',
  centre:            '#7c3aed',
};

export default function Sidebar({ currentPage, onNavigate, user, profile, onLogout }) {
  const [collapsed, setCollapsed]   = useState(false);
  const [isMobile, setIsMobile]     = useState(() => window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // Fermer le drawer quand on change de page (mobile)
  const handleNavigate = (key) => {
    onNavigate(key);
    if (isMobile) setMobileOpen(false);
  };

  const role      = profile?.role;
  const roleColor = ROLE_COLOR[role] || '#008fb5';

  const visible = NAV.filter(item => {
    if (role === 'centre')
      return ['centres','agents','filieres','calendrier','rapports','parametres'].includes(item.key);
    if (role === 'coordination')
      return ['coordination','agents','rapports','parametres'].includes(item.key);
    if (role === 'sous_coordination')
      return ['sous_coordination','agents','rapports','parametres'].includes(item.key);
    return true;
  });

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ').slice(0,2).map(w => w[0].toUpperCase()).join('');

  const sidebarW = isMobile ? '280px' : (collapsed ? '72px' : '260px');

  /* ── Item de navigation ── */
  const NavItem = ({ item }) => {
    const active = currentPage === item.key;
    const showLabel = !collapsed || isMobile;
    return (
      <button
        onClick={() => handleNavigate(item.key)}
        title={!showLabel ? item.label : undefined}
        style={{
          display:'flex', alignItems:'center',
          gap:10, padding:'11px 12px',
          borderRadius:10, border:'none',
          borderLeft:`3px solid ${active ? item.color : 'transparent'}`,
          background: active ? `${item.color}22` : 'transparent',
          cursor:'pointer', width:'100%', textAlign:'left',
          transition:'all 0.15s ease',
          justifyContent: showLabel ? 'flex-start' : 'center',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{fontSize:20,flexShrink:0,lineHeight:1}}>{item.icon}</span>
        {showLabel && (
          <span style={{
            flex:1, fontSize:14, whiteSpace:'nowrap', overflow:'hidden',
            color: active ? '#fff' : 'rgba(255,255,255,0.65)',
            fontWeight: active ? 600 : 400,
          }}>
            {item.label}
          </span>
        )}
        {active && showLabel && (
          <span style={{width:6,height:6,borderRadius:'50%',background:item.color,flexShrink:0}} />
        )}
      </button>
    );
  };

  /* ── Contenu de la sidebar ── */
  const SidebarContent = () => (
    <div style={{
      width: sidebarW,
      height: '100%',
      background: 'linear-gradient(180deg, #0d1b2a 0%, #122333 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '3px 0 20px rgba(0,0,0,0.2)',
      fontFamily: "'Inter', sans-serif",
      /* Safe area iOS (PWA) */
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
    }}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 14px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
          <div style={{width:40,height:40,borderRadius:10,background:'#fff',padding:4,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 3px 10px rgba(0,0,0,0.2)'}}>
            <img src="/logo_paide.jpg" alt="PAIDE" style={{width:'100%',height:'100%',objectFit:'contain'}} />
          </div>
          {(!collapsed || isMobile) && (
            <div>
              <div style={{fontSize:17,fontWeight:900,color:'#fff',letterSpacing:'-0.3px',lineHeight:1.1}}>PAIDE</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:'1.5px',textTransform:'uppercase'}}>Manager</div>
            </div>
          )}
        </div>
        {/* Bouton collapse — desktop seulement */}
        {!isMobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            style={{width:28,height:28,borderRadius:7,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
            <span style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>{collapsed ? '▶' : '◀'}</span>
          </button>
        )}
        {/* Bouton fermer — mobile seulement */}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)}
            style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.08)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
            <span style={{fontSize:16,color:'rgba(255,255,255,0.7)'}}>✕</span>
          </button>
        )}
      </div>

      {/* Profil utilisateur */}
      {(!collapsed || isMobile) && (
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{width:38,height:38,borderRadius:10,flexShrink:0,background:`linear-gradient(135deg,${roleColor},${roleColor}99)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff'}}>
            {initials}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:'#f1f5f9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {profile?.full_name || 'Utilisateur'}
            </div>
            <div style={{fontSize:11,fontWeight:600,color:roleColor,marginTop:1}}>
              {ROLE_LABEL[role] || 'Membre'}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{flex:1,padding:'8px 8px',display:'flex',flexDirection:'column',gap:2,overflowY:'auto'}}>
        {(!collapsed || isMobile) && (
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:'1.2px',textTransform:'uppercase',padding:'8px 10px 4px'}}>
            Navigation
          </div>
        )}
        {visible.map(item => <NavItem key={item.key} item={item} />)}
      </nav>

      {/* Footer */}
      <div style={{padding:'8px 10px 12px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        {(!collapsed || isMobile) && (
          <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 6px 6px'}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#00a651',flexShrink:0}} />
            <span style={{fontSize:11,color:'rgba(255,255,255,0.28)',fontWeight:500}}>En ligne</span>
          </div>
        )}
        <button onClick={onLogout}
          title={(!isMobile && collapsed) ? 'Déconnexion' : undefined}
          style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',borderRadius:10,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',cursor:'pointer',justifyContent:(!isMobile&&collapsed)?'center':'flex-start',WebkitTapHighlightColor:'transparent'}}>
          <span style={{fontSize:18}}>🚪</span>
          {(!collapsed || isMobile) && <span style={{fontSize:13,fontWeight:600,color:'#f87171'}}>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  /* ── MOBILE : topbar + drawer ── */
  if (isMobile) return (
    <>
      {/* Topbar fixe */}
      <div style={{
        position:'fixed', top:0, left:0, right:0,
        height: 'calc(56px + env(safe-area-inset-top))',
        paddingTop: 'env(safe-area-inset-top)',
        background: '#0d1b2a',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding: `env(safe-area-inset-top) 16px 0`,
        paddingBottom: 0,
        zIndex: 200,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}>
        <button onClick={() => setMobileOpen(true)}
          style={{fontSize:22,color:'#fff',background:'none',border:'none',padding:'8px',cursor:'pointer',WebkitTapHighlightColor:'transparent',lineHeight:1}}>
          ☰
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#fff',padding:3,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <img src="/logo_paide.jpg" alt="PAIDE" style={{width:'100%',objectFit:'contain'}} />
          </div>
          <span style={{fontSize:16,fontWeight:900,color:'#fff'}}>PAIDE</span>
          <span style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontWeight:500}}>{ROLE_LABEL[role]||''}</span>
        </div>
        <div style={{width:40}} />
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(3px)',zIndex:150}}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Drawer */}
      <div style={{
        position:'fixed', top:0, left:0, bottom:0, width:280,
        zIndex:201,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        willChange: 'transform',
      }}>
        <SidebarContent />
      </div>
    </>
  );

  /* ── DESKTOP : sidebar fixe ── */
  return (
    <>
      {/* Espace réservé pour pousser le contenu */}
      <div style={{width:sidebarW,flexShrink:0,transition:'width 0.25s cubic-bezier(0.4,0,0.2,1)'}} />
      {/* Sidebar fixe */}
      <div style={{
        position:'fixed', left:0, top:0, bottom:0,
        width:sidebarW,
        zIndex:100,
        transition:'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow:'hidden',
      }}>
        <SidebarContent />
      </div>
    </>
  );
}
