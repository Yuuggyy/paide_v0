import { useState, useEffect } from 'react';
import { supabase, signOut, getUserProfile } from './lib/supabaseClient';
import LoginPage from './components/auth/LoginPage';
import Sidebar from './components/layout/Sidebar';
import CentresPage from './pages/CentresPage';
import AgentsPage from './pages/AgentsPage';
import FilieresPage from './pages/FilieresPage';
import CalendrierPage from './pages/CalendrierPage';
import RapportsPage from './pages/RapportsPage';
import ParametresPage from './pages/ParametresPage';
import CoordinationPage from './pages/CoordinationPage';
import SousCoordinationPage from './pages/SousCoordinationPage';

export default function App() {
  const [user, setUser]               = useState(null);
  const [profile, setProfile]         = useState(null);
  const [currentPage, setCurrentPage] = useState('centres');
  const [loading, setLoading]         = useState(true);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); }
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); }
      else { setUser(null); setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await getUserProfile(userId);
    setProfile(data);
    if (data?.role === 'centre') setCurrentPage('agents');
    else if (data?.role === 'coordination' || data?.role === 'sous_coordination') setCurrentPage('centres');
    setLoading(false);
  };

  const handleLogin  = async (u) => { setUser(u); await loadProfile(u.id); };
  const handleLogout = async () => {
    await signOut();
    setUser(null); setProfile(null); setCurrentPage('centres');
  };

  if (loading) return (
    <div style={ls.splash}>
      <div style={ls.splashLogo}>P</div>
      <div style={ls.splashBar}>
        <div style={ls.splashFill} />
      </div>
      <p style={ls.splashText}>Chargement de PAIDE…</p>
    </div>
  );

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const pages = {
    centres:           <CentresPage profile={profile} />,
    coordination:      <CoordinationPage profile={profile} />,
    sous_coordination: <SousCoordinationPage profile={profile} />,
    agents:            <AgentsPage profile={profile} />,
    filieres:          <FilieresPage profile={profile} />,
    calendrier:        <CalendrierPage profile={profile} />,
    rapports:          <RapportsPage profile={profile} />,
    parametres:        <ParametresPage profile={profile} user={user} />,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#eef2ff' }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        profile={profile}
        onLogout={handleLogout}
      />
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : undefined,
        marginTop: isMobile ? '56px' : 0,
        minHeight: '100vh',
        overflowY: 'auto',
        fontFamily: "'Inter', sans-serif",
      }}>
        {pages[currentPage] || pages.centres}
      </main>
    </div>
  );
}

const ls = {
  splash: {
    minHeight: '100vh',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
    gap: '24px',
    fontFamily: "'Inter', sans-serif",
  },
  splashLogo: {
    fontSize: '64px', fontWeight: '900', color: '#fff',
    width: '96px', height: '96px',
    background: 'rgba(255,255,255,0.12)',
    borderRadius: '24px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    lineHeight: 1,
  },
  splashBar: {
    width: '120px', height: '3px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '2px', overflow: 'hidden',
  },
  splashFill: {
    height: '100%', width: '60%',
    background: 'linear-gradient(90deg, #f97316, #fb923c)',
    borderRadius: '2px',
    animation: 'pulse 1.2s ease-in-out infinite',
  },
  splashText: { color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: '500' },
};
