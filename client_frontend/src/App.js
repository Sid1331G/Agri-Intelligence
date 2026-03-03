import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

// Component Imports
import Home from './components/Home';
import Insight from './components/Insight';
import Prediction from './components/Prediction';
import Login from './components/Login';
import DiseaseDetection from './components/DiseaseDetection';
import ChatAssistant from './components/ChatAssistant';

function App() {
  // Check local storage for existing user on load
  const [user, setUser] = useState(localStorage.getItem('user') || null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Function to handle login success (passed to Login component)
  const handleLoginSuccess = (username) => {
      setUser(username);
      localStorage.setItem('user', username); // Persist login
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
        // Notify backend to clear session
        await axios.post('http://127.0.0.1:5000/api/logout'); 
    } catch (error) {
        console.error("Logout warning:", error);
    }
    // Clear frontend state regardless of backend response
    setUser(null);
    localStorage.removeItem('user'); 
    setShowAccountMenu(false);
    alert('Logged out successfully');
  };

  return (
    <Router>
      <div className="App">
        {/* HEADER / NAVIGATION */}
        <header className="header">
          <NavLink to="/" className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}>
            <i className="fas fa-home"></i> Home
          </NavLink>
          <NavLink to="/insight" className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}>
            <i className="fas fa-chart-line"></i> Insights
          </NavLink>
          <NavLink to="/prediction" className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}>
            <i className="fas fa-chart-bar"></i> Prediction
          </NavLink>
          {/* Updated NavLink to match the longer URL commonly used in your error log */}
          <NavLink to="/disease-detection" className={({ isActive }) => isActive ? "tab-button active" : "tab-button"}>
            <i className="fas fa-leaf"></i> Disease Detection
          </NavLink>

          <h2 style={{ margin: 0, textAlign: 'center', flexGrow: 1, color: 'white' }}>PANDAM VILAI</h2>

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
            
            {/* Protected Routes: If no user, redirect to login */}
            <Route path="/insight" element={user ? <Insight /> : <Navigate to="/login" />} />
            <Route path="/prediction" element={user ? <Prediction /> : <Navigate to="/login" />} />
            
            {/* Added both variations to ensure no 404s, both protected */}
            <Route path="/disease" element={user ? <DiseaseDetection /> : <Navigate to="/login" />} />
            <Route path="/disease-detection" element={user ? <DiseaseDetection /> : <Navigate to="/login" />} />
            
            {/* Added Chat route - protected */}
            <Route path="/chat" element={user ? <ChatAssistant /> : <Navigate to="/login" />} />
            
            {/* Login Route: Redirects to Home if already logged in */}
            <Route 
                path="/login" 
                element={user ? <Navigate to="/" /> : <Login setUser={handleLoginSuccess} />} 
            />
          </Routes>
        </main>
        
        {/* Keeping ChatAssistant visible globally as per your original design */}
        {/* Only visible if logged in */}
        {user && <ChatAssistant />}
      </div>
    </Router>
  );
}

export default App;