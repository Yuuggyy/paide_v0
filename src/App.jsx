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
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState('centres');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await getUserProfile(userId);
    setProfile(data);
    // Rediriger selon le rôle
    if (data?.role === 'centre') setCurrentPage('agents');
    else if (data?.role === 'coordination' || data?.role === 'sous_coordination') setCurrentPage('centres');
    setLoading(false);
  };

  const handleLogin = async (loggedUser) => {
    setUser(loggedUser);
    await loadProfile(loggedUser.id);
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
    setCurrentPage('centres');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: '700', color: '#1a3a5c', marginBottom: '16px' }}>P</div>
          <p style={{ color: '#6c757d', fontSize: '16px' }}>Chargement de PAIDE...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const pages = {
    centres: <CentresPage profile={profile} />,
    coordination: <CoordinationPage profile={profile} />,
    sous_coordination: <SousCoordinationPage profile={profile} />,
    agents: <AgentsPage profile={profile} />,
    filieres: <FilieresPage profile={profile} />,
    calendrier: <CalendrierPage profile={profile} />,
    rapports: <RapportsPage profile={profile} />,
    parametres: <ParametresPage profile={profile} user={user} />,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        profile={profile}
        onLogout={handleLogout}
      />
      <main style={{ flex: 1, marginLeft: '240px', minHeight: '100vh', overflowY: 'auto' }}>
        {pages[currentPage] || pages.centres}
      </main>
    </div>
  );
}
