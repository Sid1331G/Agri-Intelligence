import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // FIXED: Matched the endpoints defined in app.py (removed /api prefix)
        const endpoint = isLogin ? '/login' : '/signup';
        
        try {
            const res = await axios.post(`http://127.0.0.1:5000${endpoint}`, {
                username, 
                password, 
                // Only send email during signup
                ...( !isLogin && { email } )
            }, {
                // Good practice to ensure cookies/sessions work if needed later
                withCredentials: true 
            });
            
            if (isLogin) {
                // res.data.message comes from your Flask jsonify
                alert(res.data.message); 
                setUser(username);
                navigate('/');
            } else {
                alert('Signup successful! Please login.');
                setIsLogin(true);
                // Clear fields for login
                setPassword('');
            }
        } catch (err) {
            // Displays the error message returned by your Flask backend
            alert(err.response?.data?.error || 'An error occurred. Please try again.');
        }
    };

    return (
        <div id="login" className="tab-content active" style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="container">
                <div className="form-box">
                    <h2 id="form-title" style={{ marginBottom: '20px', textAlign: 'center' }}>
                        {isLogin ? 'Login' : 'Sign Up'}
                    </h2>
                    <form id="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input 
                            type="text" 
                            id="username" 
                            placeholder="Username" 
                            className="form-input"
                            value={username}
                            onChange={e => setUsername(e.target.value)} 
                            required 
                        />
                        
                        {!isLogin && (
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="Email" 
                                className="form-input"
                                value={email}
                                onChange={e => setEmail(e.target.value)} 
                                required 
                            />
                        )}
                        
                        <input 
                            type="password" 
                            id="password" 
                            placeholder="Password" 
                            className="form-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                        
                        <button type="submit" id="submit-btn" className="btn-primary">
                            {isLogin ? 'Login' : 'Sign Up'}
                        </button>
                        
                        <h3 id="toggle-form" style={{ marginTop: '15px', fontSize: '14px', textAlign: 'center' }}>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span 
                                onClick={() => setIsLogin(!isLogin)} 
                                style={{ color: '#059669', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                            >
                                {isLogin ? 'Sign up' : 'Login'}
                            </span>
                        </h3>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;