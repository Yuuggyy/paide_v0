import { useState, useEffect } from 'react';

const NAV = [
  { key: 'centres',           label: 'Centres',             icon: '🏛️', accent: '#3b82f6' },
  { key: 'coordination',      label: 'Coordinations',       icon: '🗂️', accent: '#f97316' },
  { key: 'sous_coordination', label: 'Sous-Coordinations',  icon: '📌', accent: '#22c55e' },
  { key: 'agents',            label: 'Agents',              icon: '👥', accent: '#3b82f6' },
  { key: 'filieres',          label: 'Filières',            icon: '📚', accent: '#f97316' },
  { key: 'calendrier',        label: 'Calendrier',          icon: '📅', accent: '#22c55e' },
  { key: 'rapports',          label: 'Renseignements',      icon: '📋', accent: '#3b82f6' },
  { key: 'parametres',        label: 'Paramètres',          icon: '⚙️', accent: '#94a3b8' },
];

const ROLE_LABEL = {
  national:          'Direction Nationale',
  coordination:      'Coordination Provinciale',
  sous_coordination: 'Sous-Coordination',
  centre:            'Admin Centre',
};

const ROLE_COLOR = {
  national:          '#3b82f6',
  coordination:      '#f97316',
  sous_coordination: '#22c55e',
  centre:            '#8b5cf6',
};

export default function Sidebar({ currentPage, onNavigate, user, profile, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const role = profile?.role;
  const roleColor = ROLE_COLOR[role] || '#3b82f6';

  const visibleNav = NAV.filter(item => {
    if (role === 'centre')
      return ['agents', 'filieres', 'calendrier', 'rapports', 'parametres'].includes(item.key);
    if (role === 'coordination' || role === 'sous_coordination')
      return ['centres', 'agents', 'rapports', 'parametres'].includes(item.key);
    return true;
  });

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');

  const sidebarW = isMobile ? (mobileOpen ? '280px' : '0px') : (collapsed ? '72px' : '260px');

  const NavItem = ({ item }) => {
    const active = currentPage === item.key;
    return (
      <button
        onClick={() => { onNavigate(item.key); if (isMobile) setMobileOpen(false); }}
        title={collapsed && !isMobile ? item.label : ''}
        style={{
          ...ns.item,
          background: active
            ? `linear-gradient(90deg, ${item.accent}18, ${item.accent}08)`
            : 'transparent',
          borderLeft: `3px solid ${active ? item.accent : 'transparent'}`,
          justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
        }}
      >
        <span style={{ fontSize: '19px', flexShrink: 0 }}>{item.icon}</span>
        {(!collapsed || isMobile) && (
          <span style={{
            ...ns.label,
            color: active ? '#fff' : 'rgba(255,255,255,0.6)',
            fontWeight: active ? '600' : '400',
          }}>
            {item.label}
          </span>
        )}
        {active && (!collapsed || isMobile) && (
          <span style={{ ...ns.activePill, background: item.accent }} />
        )}
      </button>
    );
  };

  const SidebarContent = () => (
    <div style={{ ...ns.sidebar, width: sidebarW }}>
      {/* Header */}
      <div style={ns.header}>
        <div style={ns.logoRow}>
          <div style={ns.logoBox}>
            <span style={ns.logoLetter}>P</span>
          </div>
          {(!collapsed || isMobile) && (
            <div>
              <div style={ns.logoName}>PAIDE</div>
              <div style={ns.logoSub}>Manager</div>
            </div>
          )}
        </div>
        {!isMobile && (
          <button onClick={() => setCollapsed(!collapsed)} style={ns.collapseBtn}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
              {collapsed ? '▶' : '◀'}
            </span>
          </button>
        )}
      </div>

      {/* User profile */}
      {(!collapsed || isMobile) && (
        <div style={ns.userBox}>
          <div style={{ ...ns.avatar, background: `linear-gradient(135deg, ${roleColor}, ${roleColor}99)` }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={ns.userName}>{profile?.full_name || 'Utilisateur'}</div>
            <div style={{ ...ns.userRole, color: roleColor }}>
              {ROLE_LABEL[role] || 'Membre'}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={ns.nav}>
        {(!collapsed || isMobile) && (
          <div style={ns.navSection}>Navigation</div>
        )}
        {visibleNav.map(item => <NavItem key={item.key} item={item} />)}
      </nav>

      {/* Logout */}
      <div style={ns.footer}>
        {(!collapsed || isMobile) && (
          <div style={ns.footerInfo}>
            <span style={ns.dot} />
            <span style={ns.footerText}>En ligne</span>
          </div>
        )}
        <button
          onClick={onLogout}
          style={{ ...ns.logoutBtn, justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start' }}
          title={(collapsed && !isMobile) ? 'Déconnexion' : ''}
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          {(!collapsed || isMobile) && <span style={ns.logoutText}>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile top bar */}
        <div style={ns.topbar}>
          <button onClick={() => setMobileOpen(true)} style={ns.menuBtn}>☰</button>
          <div style={ns.topbarLogo}>PAIDE</div>
          <div style={{ width: 40 }} />
        </div>

        {/* Overlay */}
        {mobileOpen && (
          <div style={ns.overlay} onClick={() => setMobileOpen(false)} />
        )}

        {/* Drawer */}
        <div style={{
          ...ns.drawer,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}>
          <SidebarContent />
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ width: sidebarW, flexShrink: 0, transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)' }} />
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: sidebarW, zIndex: 100, transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden' }}>
        <SidebarContent />
      </div>
    </>
  );
}

const ns = {
  sidebar: {
    height: '100%',
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '2px 0 20px rgba(0,0,0,0.15)',
    fontFamily: "'Inter', sans-serif",
    transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 },
  logoBox: {
    width: '40px', height: '40px', flexShrink: 0,
    borderRadius: '11px',
    background: 'linear-gradient(135deg, #3b82f6, #f97316)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
  },
  logoLetter: { fontSize: '22px', fontWeight: '900', color: '#fff' },
  logoName: { fontSize: '17px', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 },
  logoSub:  { fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase' },
  collapseBtn: {
    width: '28px', height: '28px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  userBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 14px',
    background: 'rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  avatar: {
    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '700', color: '#fff',
  },
  userName: { fontSize: '13px', fontWeight: '600', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { fontSize: '11px', fontWeight: '600', marginTop: '2px' },

  nav: { flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' },
  navSection: {
    fontSize: '10px', fontWeight: '700',
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '1.2px', textTransform: 'uppercase',
    padding: '8px 10px 6px',
  },
  item: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 11px',
    borderRadius: '10px',
    background: 'none', border: 'none',
    borderLeft: '3px solid transparent',
    cursor: 'pointer',
    width: '100%', textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  label: { flex: 1, fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden' },
  activePill: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },

  footer: {
    padding: '10px 10px 16px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  footerInfo: { display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px 8px' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 },
  footerText: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%', padding: '10px 11px',
    borderRadius: '10px',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.15)',
  },
  logoutText: { fontSize: '13px', fontWeight: '600', color: '#f87171' },

  /* Mobile */
  topbar: {
    position: 'fixed', top: 0, left: 0, right: 0,
    height: '56px',
    background: '#0f172a',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 200,
    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
  },
  topbarLogo: { fontSize: '18px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' },
  menuBtn: { fontSize: '20px', color: '#fff', background: 'none', border: 'none', padding: '4px 8px' },

  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(2px)',
    zIndex: 150,
  },
  drawer: {
    position: 'fixed', top: 0, left: 0, bottom: 0,
    width: '280px',
    zIndex: 200,
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
  },
};
