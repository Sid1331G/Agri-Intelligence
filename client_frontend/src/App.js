import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Component Imports
import Home from './components/Home';
import Prediction from './components/Prediction';
import Login from './components/Login';
import DiseaseDetection from './components/DiseaseDetection';
import ChatAssistant from './components/ChatAssistant';
import AIAssistant from './components/AIAssistant';
import RoleSelection from './components/RoleSelection';
import ProfileSetup from './components/ProfileSetup';

// Inline message shown when unauthenticated user visits a protected page
const LoginRequired = ({ pageName }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '70vh', textAlign: 'center', padding: '40px 20px',
    /* background: 'linear-gradient(160deg, #061510, #081c14)', */
  }}>
    <div style={{
      background: '#0a1f18',
      border: '1px solid rgba(52,211,153,0.18)',
      borderRadius: '20px',
      padding: '48px 40px',
      maxWidth: '420px', width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: '66px', height: '66px',
        background: 'rgba(52,211,153,0.1)',
        border: '1px solid rgba(52,211,153,0.3)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
        boxShadow: '0 0 20px rgba(52,211,153,0.15)',
      }}>
        <i className="fas fa-lock" style={{ fontSize: '26px', color: '#34d399' }} />
      </div>

      <h2 style={{ margin: '0 0 10px', color: '#e8f5f0', fontSize: '22px', fontWeight: '800', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.3px' }}>
        Login Required
      </h2>
      <p style={{ margin: '0 0 28px', color: '#7aab93', fontSize: '14px', lineHeight: '1.7' }}>
        You need to be logged in to access{' '}
        <strong style={{ color: '#34d399' }}>{pageName}</strong>.
        Please login to continue.
      </p>

      <Link
        to="/login"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '13px 32px',
          background: '#1db87a',
          color: 'white', fontWeight: '700',
          borderRadius: '10px', textDecoration: 'none',
          fontSize: '14px', letterSpacing: '0.3px',
          boxShadow: '0 6px 20px rgba(29,184,122,0.35)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <i className="fas fa-sign-in-alt" />
        Login Now
      </Link>
    </div>
  </div>
);

// Onboarding page: wraps RoleSelection (step 1) + ProfileSetup (step 2)
const OnboardingPage = ({ username, onComplete }) => {
  const [role, setRole] = useState(null);
  if (!role) return <RoleSelection onRoleSelect={setRole} />;
  return <ProfileSetup role={role} username={username} onComplete={onComplete} />;
};

// Edit Profile page: pre-populates existing profile
const EditProfilePage = ({ username, onComplete }) => {
  return <ProfileSetup role={null} username={username} onComplete={onComplete} isEditMode={true} />;
};

function App() {
  const [user, setUser] = useState(localStorage.getItem('user') || null);
  const [profileComplete, setProfileComplete] = useState(localStorage.getItem('profileComplete') === 'true');
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const checkProfile = async (username) => {
    if (!username) return;
    try {
      const res = await axios.get(`http://127.0.0.1:5000/profile/get?username=${encodeURIComponent(username)}`, { withCredentials: true });
      const complete = res.data.profile_complete === true;
      setProfileComplete(complete);
      localStorage.setItem('profileComplete', complete ? 'true' : 'false');
    } catch (err) {
      console.error("Profile check failed:", err);
      // If we get a 401/404, we assume not complete or not logged in properly
      setProfileComplete(false);
      localStorage.setItem('profileComplete', 'false');
    }
  };

  useEffect(() => {
    if (user) {
      checkProfile(user);
    }
  }, [user]);

  const handleLoginSuccess = async (username) => {
    setUser(username);
    localStorage.setItem('user', username);
    // State updates are async, so use the username directly
    await checkProfile(username);
  };

  const handleProfileComplete = () => {
    setProfileComplete(true);
    localStorage.setItem('profileComplete', 'true');
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/api/logout');
    } catch (error) {
      console.error("Logout warning:", error);
    }
    setUser(null);
    setProfileComplete(false);
    localStorage.removeItem('user');
    localStorage.removeItem('profileComplete');
    setShowAccountMenu(false);
  };

  return (
    <Router>
      <div className="App">
        {/* HEADER / NAVIGATION */}
        <header className="header">
          <NavLink to="/" className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}>
            <i className="fas fa-home"></i> Home
          </NavLink>
          {/*<NavLink to="/insight" className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}>
            <i className="fas fa-chart-line"></i> Insights
          </NavLink>*/}
          <NavLink to="/prediction" className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}>
            <i className="fas fa-chart-line"></i> Prediction
          </NavLink>
          <NavLink to="/disease-detection" className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}>
            <i className="fas fa-leaf"></i> Disease Detection
          </NavLink>
          <NavLink to="/assistant" className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}>
            <i className="fas fa-robot"></i> AI Assistant
          </NavLink>

          {/*<h2 style={{ margin: 0, textAlign: 'center', flexGrow: 1, color: 'white' }}>Agri Intelligence</h2>*/}

          {/* ACCOUNT MENU */}
          <div className="account-menu" style={{ marginLeft: 'auto', position: 'relative' }}>

            {/* Avatar button */}
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              style={{
                width: '38px', height: '38px',
                borderRadius: '50%',
                background: showAccountMenu
                  ? 'rgba(52,211,153,0.2)'
                  : 'rgba(52,211,153,0.1)',
                border: `2px solid ${showAccountMenu ? '#41d195' : 'rgba(52,211,153,0.35)'}`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
                padding: 0,
                boxShadow: showAccountMenu ? '0 0 12px rgba(52,211,153,0.3)' : 'none',
              }}
            >
              <i className="fas fa-user" style={{ fontSize: '15px', color: '#f8fffd' }} />
            </button>

            {/* Dropdown */}
            {showAccountMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                background: '#0a1f18',
                border: '1px solid rgba(52,211,153,0.18)',
                borderRadius: '14px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
                minWidth: '188px',
                zIndex: 1000,
                overflow: 'hidden',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {user ? (
                  <>
                    {/* Username row */}
                    <div style={{
                      padding: '13px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <div style={{
                        width: '30px', height: '30px',
                        borderRadius: '50%',
                        background: 'rgba(52,211,153,0.12)',
                        border: '1px solid rgba(52,211,153,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <i className="fas fa-user" style={{ fontSize: '12px', color: '#ffffff' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#e8f5f0', letterSpacing: '0.2px' }}>
                          {user}
                        </div>
                        <div style={{ fontSize: '10px', color: '#01ff95', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                          Logged in
                        </div>
                      </div>
                    </div>

                    {/* Edit Profile */}
                    <Link
                      to="/edit-profile"
                      onClick={() => setShowAccountMenu(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '11px 16px',
                        textDecoration: 'none',
                        color: '#f4f7f6',
                        fontSize: '13px', fontWeight: '600',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(52, 211, 153, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '26px', height: '26px',
                        borderRadius: '7px',
                        background: 'rgba(52,211,153,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <i className="fas fa-user-edit" style={{ fontSize: '11px', color: '#ffffff' }} />
                      </div>
                      Edit Profile
                    </Link>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '11px 16px',
                        background: 'none', border: 'none',
                        cursor: 'pointer',
                        color: '#f87171',
                        fontSize: '13px', fontWeight: '600',
                        textAlign: 'left',
                        fontFamily: "'DM Sans', sans-serif",
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 9, 9, 0.94)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{
                        width: '26px', height: '26px',
                        borderRadius: '7px',
                        background: 'rgba(239,68,68,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <i className="fas fa-sign-out-alt" style={{ fontSize: '11px', color: '#f87171' }} />
                      </div>
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setShowAccountMenu(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: '#ffffff',
                      fontSize: '13px', fontWeight: '600',
                    }}
                  >
                    <i className="fas fa-sign-in-alt" style={{ fontSize: '13px', color: '#ffffff' }} />
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Onboarding route — mandatory after signup */}
            <Route
              path="/profile-setup"
              element={
                user
                  ? (profileComplete
                    ? <Navigate to="/" />
                    : <OnboardingPage username={user} onComplete={handleProfileComplete} />)
                  : <Navigate to="/login" />
              }
            />

            {/* Edit Profile route — available any time after login */}
            <Route
              path="/edit-profile"
              element={
                user
                  ? <EditProfilePage username={user} onComplete={() => { window.history.back(); }} />
                  : <Navigate to="/login" />
              }
            />

            {/* Protected routes */}
            <Route path="/prediction" element={
              !user ? <LoginRequired pageName="Prediction" /> :
                !profileComplete ? <Navigate to="/profile-setup" /> :
                  <Prediction />
            } />
            <Route path="/disease-detection" element={
              !user ? <LoginRequired pageName="Disease Detection" /> :
                !profileComplete ? <Navigate to="/profile-setup" /> :
                  <DiseaseDetection />
            } />
            <Route path="/assistant" element={
              !user ? <LoginRequired pageName="AI Assistant" /> :
                !profileComplete ? <Navigate to="/profile-setup" /> :
                  <AIAssistant />
            } />

            {/* Login route — redirect to home if already logged in */}
            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <Login setUser={handleLoginSuccess} />}
            />
          </Routes>
        </main>

        {/* Floating chatbot — hidden on AI Assistant page */}
        <FloatingChat />
      </div>
    </Router>
  );
}

/* Wrapper using useLocation — must be inside Router */
const FloatingChat = () => {
  const location = useLocation();
  if (location.pathname === '/assistant') return null;
  return <ChatAssistant />;
};

export default App;

/*tooo*??*/