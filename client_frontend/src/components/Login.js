import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMsg({ text: '', type: '' });
        const endpoint = isLogin ? '/login' : '/signup';
        try {
            const res = await axios.post(`http://127.0.0.1:5000${endpoint}`, {
                username,
                password,
                ...(!isLogin && { email })
            }, { withCredentials: true });

            if (isLogin) {
                // Await so checkProfile() inside handleLoginSuccess finishes
                // before navigate, ensuring profileComplete is set correctly
                await setUser(username);
                navigate('/');
            } else {
                // Auto-login after signup — set localStorage directly before hard redirect
                // to avoid React state timing race on the route guard
                await axios.post('http://127.0.0.1:5000/login', {
                    username,
                    password,
                }, { withCredentials: true });
                localStorage.setItem('user', username);
                localStorage.setItem('profileComplete', 'false');
                window.location.href = '/profile-setup'; // hard redirect re-reads localStorage
            }
        } catch (err) {
            setStatusMsg({ text: err.response?.data?.error || 'An error occurred. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (mode) => {
        setIsLogin(mode);
        setStatusMsg({ text: '', type: '' });
        setUsername('');
        setPassword('');
        setEmail('');
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                {/* Logo / Brand */}
                <div style={styles.brand}>
                    <img
                        src="/static/content/ai_logo.jpg"
                        alt="Pandam Vilai Logo"
                        style={styles.brandLogo}
                    />
                    <div>
                        <h1 style={styles.brandTitle}>PANDAM VILAI</h1>
                        <p style={styles.brandSub}>Agricultural Price Intelligence</p>
                    </div>
                </div>

                {/* Tab Toggle */}
                <div style={styles.toggleRow}>
                    <button
                        type="button"
                        onClick={() => switchMode(true)}
                        style={{ ...styles.toggleBtn, ...(isLogin ? styles.toggleBtnActive : {}) }}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode(false)}
                        style={{ ...styles.toggleBtn, ...(!isLogin ? styles.toggleBtnActive : {}) }}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Status Banner */}
                {statusMsg.text && (
                    <div style={{
                        ...styles.statusBanner,
                        background: statusMsg.type === 'success'
                            ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                            : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                        color: statusMsg.type === 'success' ? '#065f46' : '#991b1b',
                        borderLeft: `4px solid ${statusMsg.type === 'success' ? '#10b981' : '#ef4444'}`,
                    }}>
                        <i className={`fas ${statusMsg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
                            style={{ marginRight: '8px' }} />
                        {statusMsg.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <span style={styles.inputIcon}><i className="fas fa-user" /></span>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            style={styles.input}
                            className="login-input"
                        />
                    </div>

                    {!isLogin && (
                        <div style={styles.inputGroup}>
                            <span style={styles.inputIcon}><i className="fas fa-envelope" /></span>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                style={styles.input}
                                className="login-input"
                            />
                        </div>
                    )}

                    <div style={styles.inputGroup}>
                        <span style={styles.inputIcon}><i className="fas fa-lock" /></span>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={styles.input}
                            className="login-input"
                        />
                    </div>

                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading ? (
                            <span><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />Please wait...</span>
                        ) : (
                            <span>{isLogin ? 'Login to Dashboard' : 'Create Account'}</span>
                        )}
                    </button>
                </form>

                {/* Footer switch */}
                <p style={styles.switchText}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        onClick={() => switchMode(!isLogin)}
                        style={styles.switchLink}
                    >
                        {isLogin ? 'Sign up free' : 'Login here'}
                    </span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '89vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        padding: '40px 36px',
        color: '#1a1a1a',
    },
    brand: {
        display: 'flex', alignItems: 'center', gap: '14px',
        marginBottom: '32px',
    },
    brandLogo: {
        width: '54px', height: '54px',
        borderRadius: '14px',
        objectFit: 'cover',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
        flexShrink: 0,
        border: '2px solid rgba(255,255,255,0.6)',
    },
    brandTitle: {
        margin: 0, fontSize: '20px', fontWeight: '800',
        letterSpacing: '1px', color: '#064e3b',
    },
    brandSub: {
        margin: '2px 0 0', fontSize: '12px',
        color: '#030303ff', letterSpacing: '0.3px',
    },
    toggleRow: {
        display: 'flex', gap: '6px',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '14px', padding: '5px',
        marginBottom: '28px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    },
    toggleBtn: {
        flex: 1, padding: '10px',
        border: 'none', borderRadius: '10px',
        cursor: 'pointer', fontSize: '14px', fontWeight: '600',
        background: 'transparent', color: '#374151',
        transition: 'all 0.25s ease',
        letterSpacing: '0.3px',
    },
    toggleBtnActive: {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        boxShadow: '0 4px 15px rgba(16,185,129,0.4)',
    },
    statusBanner: {
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '20px',
        display: 'flex', alignItems: 'center',
    },
    form: {
        display: 'flex', flexDirection: 'column', gap: '16px',
    },
    inputGroup: {
        position: 'relative', display: 'flex', alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute', left: '14px',
        color: '#8a92a0ff', fontSize: '15px',
        pointerEvents: 'none', zIndex: 1,
    },
    input: {
        width: '100%', padding: '14px 14px 14px 42px',
        background: 'rgba(255, 255, 255, 0.85)',
        border: '2px solid #d1d5db',
        borderRadius: '12px', fontSize: '15px',
        color: '#111827', outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        margin: 0,
    },
    submitBtn: {
        marginTop: '6px', padding: '15px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white', border: 'none',
        borderRadius: '12px', fontSize: '15px', fontWeight: '700',
        cursor: 'pointer', letterSpacing: '0.5px',
        boxShadow: '0 8px 25px rgba(16,185,129,0.45)',
        transition: 'all 0.3s ease',
    },
    switchText: {
        marginTop: '24px', textAlign: 'center',
        fontSize: '14px', color: '#303133ff',
    },
    switchLink: {
        color: '#059669', fontWeight: '600',
        cursor: 'pointer', textDecoration: 'underline',
        textUnderlineOffset: '3px',
        transition: 'color 0.2s',
    },
};

export default Login;