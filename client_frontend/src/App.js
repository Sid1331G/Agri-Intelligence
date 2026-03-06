import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

// Component Imports
import Home from './components/Home';
// import Insight from './components/Insight';
import Prediction from './components/Prediction';
import Login from './components/Login';
import DiseaseDetection from './components/DiseaseDetection';
import ChatAssistant from './components/ChatAssistant';

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

function App() {
  const [user, setUser] = useState(localStorage.getItem('user') || null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleLoginSuccess = (username) => {
    setUser(username);
    localStorage.setItem('user', username);
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/api/logout');
    } catch (error) {
      console.error("Logout warning:", error);
    }
    setUser(null);
    localStorage.removeItem('user');
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

            {/* Protected routes — show inline message instead of redirecting */}
            {/*<Route path="/insight" element={user ? <Insight /> : <LoginRequired pageName="Insights" />} />*/}
            <Route path="/prediction" element={user ? <Prediction /> : <LoginRequired pageName="Prediction" />} />
            <Route path="/disease-detection" element={user ? <DiseaseDetection /> : <LoginRequired pageName="Disease Detection" />} />
            <Route path="/chat" element={user ? <ChatAssistant /> : <LoginRequired pageName="Chat Assistant" />} />

            {/* Login route — redirect to home if already logged in */}
            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <Login setUser={handleLoginSuccess} />}
            />
          </Routes>
        </main>
        {/* Floating AI Assistant - visible globally when logged in */}
        {user && <ChatAssistant />}
      </div>
    </Router>
  );
}

export default App;