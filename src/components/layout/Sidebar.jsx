import { useState } from 'react';

const MENU_ITEMS = [
  { key: 'centres', label: 'Centres', icon: '🏛️' },
  { key: 'coordination', label: 'Coordinations', icon: '🗂️' },
  { key: 'sous_coordination', label: 'Sous-Coordinations', icon: '📌' },
  { key: 'agents', label: 'Agents', icon: '👥' },
  { key: 'filieres', label: 'Filières', icon: '📚' },
  { key: 'calendrier', label: 'Calendrier', icon: '📅' },
  { key: 'rapports', label: 'Renseignements', icon: '📋' },
  { key: 'parametres', label: 'Paramètres', icon: '⚙️' },
];

export default function Sidebar({ currentPage, onNavigate, user, profile, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  const roleLabel = {
    national: 'Direction Nationale',
    coordination: 'Coordination Provinciale',
    sous_coordination: 'Sous-Coordination',
    centre: 'Admin Centre',
  }[profile?.role] || 'Utilisateur';

  // Filtrer le menu selon le rôle
  const visibleItems = MENU_ITEMS.filter(item => {
    if (profile?.role === 'centre') {
      return ['agents', 'filieres', 'calendrier', 'rapports', 'parametres'].includes(item.key);
    }
    if (profile?.role === 'coordination' || profile?.role === 'sous_coordination') {
      return ['centres', 'agents', 'rapports', 'parametres'].includes(item.key);
    }
    return true; // national voit tout
  });

  return (
    <div style={{ ...styles.sidebar, width: collapsed ? '70px' : '240px' }}>
      <div style={styles.header}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>P</div>
          {!collapsed && <span style={styles.logoText}>PAIDE</span>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} style={styles.collapseBtn}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {!collapsed && (
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>{user?.email?.[0]?.toUpperCase()}</div>
          <div>
            <div style={styles.userName}>{profile?.full_name || 'Admin'}</div>
            <div style={styles.userRole}>{roleLabel}</div>
          </div>
        </div>
      )}

      <nav style={styles.nav}>
        {visibleItems.map(item => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            style={{
              ...styles.navItem,
              ...(currentPage === item.key ? styles.navItemActive : {}),
            }}
            title={collapsed ? item.label : ''}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
          </button>
        ))}
      </nav>

      <button onClick={onLogout} style={styles.logoutBtn} title={collapsed ? 'Déconnexion' : ''}>
        <span>🚪</span>
        {!collapsed && <span>Déconnexion</span>}
      </button>
    </div>
  );
}

const styles = {
  sidebar: { height: '100vh', background: '#1a3a5c', color: '#fff', display: 'flex', flexDirection: 'column', transition: 'width 0.3s', overflow: 'hidden', position: 'fixed', left: 0, top: 0, zIndex: 100, fontFamily: "'Segoe UI', sans-serif" },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { width: '36px', height: '36px', borderRadius: '8px', background: '#0d6efd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', flexShrink: 0 },
  logoText: { fontSize: '20px', fontWeight: '700', color: '#fff' },
  collapseBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', padding: '4px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: 'rgba(255,255,255,0.05)' },
  userAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#0d6efd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  userName: { fontSize: '13px', fontWeight: '600', color: '#f1f5f9' },
  userRole: { fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
  nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textAlign: 'left', width: '100%', transition: 'all 0.2s' },
  navItemActive: { background: '#0d6efd', color: '#fff' },
  navIcon: { fontSize: '18px', flexShrink: 0 },
  navLabel: { fontWeight: '500' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px', fontWeight: '500', width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)' },
};
