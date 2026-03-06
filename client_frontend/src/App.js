import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
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
  }}>
    <div style={{
      background: 'rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px',
      padding: '48px 40px',
      maxWidth: '420px', width: '100%',
      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
      border: '1px solid rgba(255,255,255,0.7)',
    }}>
      {/* Lock icon */}
      <div style={{
        width: '70px', height: '70px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
        boxShadow: '0 8px 20px rgba(16,185,129,0.35)',
      }}>
        <i className="fas fa-lock" style={{ fontSize: '28px', color: 'white' }} />
      </div>

      <h2 style={{ margin: '0 0 10px', color: '#064e3b', fontSize: '22px', fontWeight: '800' }}>
        Login Required
      </h2>
      <p style={{ margin: '0 0 28px', color: '#131416ff', fontSize: '15px', lineHeight: '1.6' }}>
        You need to be logged in to access <strong style={{ color: '#006149ff' }}>{pageName}</strong>.
        Please login to continue.
      </p>

      <Link
        to="/login"
        style={{
          display: 'inline-block',
          padding: '13px 36px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white', fontWeight: '700',
          borderRadius: '12px', textDecoration: 'none',
          fontSize: '15px', letterSpacing: '0.4px',
          boxShadow: '0 6px 20px rgba(16,185,129,0.4)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }} />
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

          {/*<h2 style={{ margin: 0, textAlign: 'center', flexGrow: 1, color: 'white' }}>PANDAM VILAI</h2>*/}

          {/* ACCOUNT MENU */}
          <div className="account-menu" style={{ marginLeft: 'auto', position: 'relative' }}>
            <img
              src="https://cdn-icons-png.flaticon.com/128/9069/9069049.png"
              alt="Account"
              style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', border: '2px solid white' }}
              onClick={() => setShowAccountMenu(!showAccountMenu)}
            />

            {showAccountMenu && (
              <div style={{ position: 'absolute', right: 0, top: '50px', background: 'white', color: 'black', borderRadius: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', minWidth: '150px', zIndex: 1000 }}>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {user ? (
                    <>
                      <li style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#059669' }}>
                        {user}
                      </li>
                      <li>
                        <Link
                          to="/edit-profile"
                          onClick={() => setShowAccountMenu(false)}
                          style={{ display: 'block', padding: '10px', textDecoration: 'none', color: '#374151', fontSize: '14px' }}
                        >
                          <i className="fas fa-user-edit" style={{ marginRight: '8px', color: '#059669' }}></i> Edit Profile
                        </Link>
                      </li>
                      <li>
                        <button onClick={handleLogout} style={{ width: '100%', padding: '10px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left', color: '#dc3545' }}>
                          <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <Link to="/login" onClick={() => setShowAccountMenu(false)} style={{ display: 'block', padding: '10px', textDecoration: 'none', color: 'black' }}>
                        <i className="fas fa-sign-in-alt"></i> Login
                      </Link>
                    </li>
                  )}
                </ul>
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

        {/* Floating chatbot — always visible, no login required, website guide only */}
        <ChatAssistant />
      </div>
    </Router>
  );
}

export default App;