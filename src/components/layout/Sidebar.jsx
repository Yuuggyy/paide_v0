import { useState } from 'react';

const MENU_ITEMS = [
  { key: 'centres',          label: 'Centres',            icon: '🏛️', color: '#2563eb' },
  { key: 'coordination',     label: 'Coordinations',      icon: '🗂️', color: '#f97316' },
  { key: 'sous_coordination',label: 'Sous-Coordinations', icon: '📌', color: '#22c55e' },
  { key: 'agents',           label: 'Agents',             icon: '👥', color: '#2563eb' },
  { key: 'filieres',         label: 'Filières',           icon: '📚', color: '#f97316' },
  { key: 'calendrier',       label: 'Calendrier',         icon: '📅', color: '#22c55e' },
  { key: 'rapports',         label: 'Renseignements',     icon: '📋', color: '#2563eb' },
  { key: 'parametres',       label: 'Paramètres',         icon: '⚙️', color: '#6b7280' },
];

export default function Sidebar({ currentPage, onNavigate, user, profile, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  const roleLabel = {
    national:         '🌍 Direction Nationale',
    coordination:     '🗂️ Coordination Provinciale',
    sous_coordination:'📌 Sous-Coordination',
    centre:           '🏛️ Admin Centre',
  }[profile?.role] || 'Utilisateur';

  const visibleItems = MENU_ITEMS.filter(item => {
    if (profile?.role === 'centre')
      return ['agents', 'filieres', 'calendrier', 'rapports', 'parametres'].includes(item.key);
    if (profile?.role === 'coordination' || profile?.role === 'sous_coordination')
      return ['centres', 'agents', 'rapports', 'parametres'].includes(item.key);
    return true;
  });

  return (
    <div style={{ ...styles.sidebar, width: collapsed ? '72px' : '250px' }}>

      {/* Logo */}
      <div style={styles.header}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>P</div>
          {!collapsed && (
            <div>
              <div style={styles.logoText}>PAIDE</div>
              <div style={styles.logoSub}>Manager</div>
            </div>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} style={styles.collapseBtn}>
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={styles.userBox}>
          <div style={styles.avatar}>
            {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={styles.userName}>{profile?.full_name || 'Admin'}</div>
            <div style={styles.userRole}>{roleLabel}</div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={styles.nav}>
        {!collapsed && <div style={styles.navSection}>NAVIGATION</div>}
        {visibleItems.map(item => {
          const active = currentPage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : ''}
              style={{
                ...styles.navItem,
                ...(active ? { ...styles.navActive, borderLeft: `3px solid ${item.color}` } : {}),
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <span style={{ ...styles.navLabel, color: active ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                  {item.label}
                </span>
              )}
              {!collapsed && active && <span style={styles.activeDot}></span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={styles.footer}>
        <button onClick={onLogout} style={{ ...styles.logoutBtn, justifyContent: collapsed ? 'center' : 'flex-start' }} title={collapsed ? 'Déconnexion' : ''}>
          <span style={{ fontSize: '18px' }}>🚪</span>
          {!collapsed && <span style={{ fontSize: '13px', fontWeight: '500' }}>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    height: '100vh',
    background: 'linear-gradient(180deg, #0f2a4a 0%, #1a3a5c 60%, #1e4976 100%)',
    display: 'flex', flexDirection: 'column',
    transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
    overflow: 'hidden',
    position: 'fixed', left: 0, top: 0,
    zIndex: 100,
    fontFamily: "'Inter', sans-serif",
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: {
    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
    background: 'linear-gradient(135deg, #2563eb, #f97316)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: '800', color: '#fff',
    boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
  },
  logoText: { fontSize: '18px', fontWeight: '800', color: '#fff', lineHeight: 1.1 },
  logoSub:  { fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', textTransform: 'uppercase' },
  collapseBtn: {
    background: 'rgba(255,255,255,0.08)', border: 'none',
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
    width: '28px', height: '28px', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px',
  },
  userBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '15px', fontWeight: '700', color: '#fff',
  },
  userName: { fontSize: '13px', fontWeight: '600', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' },
  nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' },
  navSection: { fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.2px', padding: '8px 10px 4px', textTransform: 'uppercase' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '10px',
    background: 'none', border: 'none', borderLeft: '3px solid transparent',
    color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
    fontSize: '13px', textAlign: 'left', width: '100%',
    transition: 'all 0.15s ease',
  },
  navActive: {
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
  },
  navLabel: { flex: 1, fontWeight: '500' },
  activeDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#f97316', flexShrink: 0 },
  footer: { padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    background: 'none', border: 'none',
    color: '#f87171', cursor: 'pointer',
  },
};
