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
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg, #005f7a 0%, #008fb5 100%)',
      gap:24, fontFamily:"'Inter',sans-serif",
    }}>
      <div style={{ width:80, height:80, background:'#fff', borderRadius:20, padding:8, boxShadow:'0 8px 32px rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <img src="/logo_paide.jpg" alt="PAIDE" style={{ width:'100%', objectFit:'contain' }} />
      </div>
      <div className="spinner" style={{ width:32, height:32 }} />
      <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:500 }}>Chargement de PAIDE…</p>
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
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        profile={profile}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {pages[currentPage] || pages.centres}
      </main>
    </div>
  );
}
