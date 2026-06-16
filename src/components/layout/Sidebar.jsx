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
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const role       = profile?.role;
  const roleColor  = ROLE_COLOR[role] || '#008fb5';

  const visible = NAV.filter(item => {
    if (role === 'centre')
      return ['agents','filieres','calendrier','rapports','parametres'].includes(item.key);
    if (role === 'coordination' || role === 'sous_coordination')
      return ['centres','agents','rapports','parametres'].includes(item.key);
    return true;
  });

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ').slice(0,2).map(w => w[0].toUpperCase()).join('');

  const w = isMobile ? (mobileOpen ? '280px' : '0px') : (collapsed ? '72px' : '260px');

  const Item = ({ item }) => {
    const active = currentPage === item.key;
    return (
      <button
        onClick={() => { onNavigate(item.key); if (isMobile) setMobileOpen(false); }}
        title={collapsed && !isMobile ? item.label : ''}
        style={{
          display:'flex', alignItems:'center',
          gap: 10, padding:'10px 11px',
          borderRadius:10, border:'none',
          borderLeft:`3px solid ${active ? item.color : 'transparent'}`,
          background: active ? `${item.color}18` : 'transparent',
          cursor:'pointer', width:'100%', textAlign:'left',
          transition:'all 0.15s ease',
          justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
        }}
      >
        <span style={{ fontSize:19, flexShrink:0 }}>{item.icon}</span>
        {(!collapsed || isMobile) && (
          <span style={{
            flex:1, fontSize:13.5, whiteSpace:'nowrap', overflow:'hidden',
            color: active ? '#fff' : 'rgba(255,255,255,0.6)',
            fontWeight: active ? 600 : 400,
          }}>
            {item.label}
          </span>
        )}
        {active && (!collapsed || isMobile) && (
          <span style={{ width:6, height:6, borderRadius:'50%', background: item.color, flexShrink:0 }} />
        )}
      </button>
    );
  };

  const SidebarInner = () => (
    <div style={{
      width: w, height:'100%',
      background:'linear-gradient(180deg, #0d1b2a 0%, #122333 100%)',
      display:'flex', flexDirection:'column',
      overflow:'hidden',
      boxShadow:'3px 0 20px rgba(0,0,0,0.18)',
      fontFamily:"'Inter',sans-serif",
      transition:'width 0.25s cubic-bezier(0.4,0,0.2,1)',
    }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
          {/* Logo miniature */}
          <div style={{ width:42, height:42, borderRadius:11, background:'#fff', padding:4, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 10px rgba(0,0,0,0.2)' }}>
            <img src="/logo_paide.jpg" alt="PAIDE" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
          </div>
          {(!collapsed || isMobile) && (
            <div>
              <div style={{ fontSize:17, fontWeight:900, color:'#fff', letterSpacing:'-0.3px', lineHeight:1.1 }}>PAIDE</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:'1.5px', textTransform:'uppercase' }}>Manager</div>
            </div>
          )}
        </div>
        {!isMobile && (
          <button onClick={() => setCollapsed(!collapsed)} style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>{collapsed ? '▶' : '◀'}</span>
          </button>
        )}
      </div>

      {/* User */}
      {(!collapsed || isMobile) && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px', background:'rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, background:`linear-gradient(135deg, ${roleColor}, ${roleColor}99)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff' }}>
            {initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {profile?.full_name || 'Utilisateur'}
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:roleColor, marginTop:2 }}>
              {ROLE_LABEL[role] || 'Membre'}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
        {(!collapsed || isMobile) && (
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.22)', letterSpacing:'1.2px', textTransform:'uppercase', padding:'8px 10px 6px' }}>
            Navigation
          </div>
        )}
        {visible.map(item => <Item key={item.key} item={item} />)}
      </nav>

      {/* Footer */}
      <div style={{ padding:'10px 10px 16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        {(!collapsed || isMobile) && (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 8px 8px' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#00a651', flexShrink:0 }} />
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.28)', fontWeight:500 }}>En ligne</span>
          </div>
        )}
        <button
          onClick={onLogout}
          title={(collapsed && !isMobile) ? 'Déconnexion' : ''}
          style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 11px', borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', justifyContent:(collapsed && !isMobile)?'center':'flex-start' }}
        >
          <span style={{ fontSize:18 }}>🚪</span>
          {(!collapsed || isMobile) && <span style={{ fontSize:13, fontWeight:600, color:'#f87171' }}>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  if (isMobile) return (
    <>
      <div style={{ position:'fixed', top:0, left:0, right:0, height:56, background:'#0d1b2a', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', zIndex:200, boxShadow:'0 2px 12px rgba(0,0,0,0.25)' }}>
        <button onClick={() => setMobileOpen(true)} style={{ fontSize:22, color:'#fff', background:'none', border:'none', padding:'4px 6px' }}>☰</button>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'#fff', padding:3, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src="/logo_paide.jpg" alt="PAIDE" style={{ width:'100%', objectFit:'contain' }} />
          </div>
          <span style={{ fontSize:16, fontWeight:900, color:'#fff' }}>PAIDE</span>
        </div>
        <div style={{ width:40 }} />
      </div>
      {mobileOpen && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(3px)', zIndex:150 }} onClick={() => setMobileOpen(false)} />}
      <div style={{ position:'fixed', top:0, left:0, bottom:0, width:280, zIndex:200, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition:'transform 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
        <SidebarInner />
      </div>
    </>
  );

  return (
    <>
      <div style={{ width:w, flexShrink:0, transition:'width 0.25s cubic-bezier(0.4,0,0.2,1)' }} />
      <div style={{ position:'fixed', left:0, top:0, bottom:0, width:w, zIndex:100, transition:'width 0.25s cubic-bezier(0.4,0,0.2,1)', overflow:'hidden' }}>
        <SidebarInner />
      </div>
    </>
  );
}
