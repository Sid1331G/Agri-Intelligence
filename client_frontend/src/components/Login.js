import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/* ── Inject mobile styles once ── */
const injectStyles = () => {
    const id = 'login-mobile-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-input:focus {
            border-color: rgba(52,211,153,0.5) !important;
            box-shadow: 0 0 0 3px rgba(52,211,153,0.08) !important;
        }

        /* ── Tablet ≤ 768px ── */
        @media (max-width: 768px) {
            .login-page {
                padding: 24px 16px !important;
                min-height: 100dvh !important;
                align-items: center !important;
            }
            .login-card {
                padding: 32px 28px !important;
                max-width: 400px !important;
                border-radius: 20px !important;
            }
        }

        /* ── Phone ≤ 480px ── */
        @media (max-width: 480px) {
            .login-page {
                padding: 16px 12px !important;
                align-items: flex-start !important;
                padding-top: calc(16px + env(safe-area-inset-top)) !important;
                padding-bottom: calc(16px + env(safe-area-inset-bottom)) !important;
            }
            .login-card {
                padding: 26px 20px !important;
                border-radius: 18px !important;
                max-width: 100% !important;
            }
            .login-brand {
                gap: 11px !important;
                margin-bottom: 24px !important;
            }
            .login-brand-icon {
                width: 44px !important;
                height: 44px !important;
                border-radius: 12px !important;
                font-size: 20px !important;
            }
            .login-brand-title {
                font-size: 16px !important;
                letter-spacing: 0.8px !important;
            }
            .login-brand-sub {
                font-size: 10px !important;
            }
            .login-toggle-row {
                margin-bottom: 22px !important;
            }
            .login-toggle-btn {
                padding: 9px 8px !important;
                font-size: 13px !important;
            }
            .login-input-group input {
                padding: 12px 12px 12px 38px !important;
                font-size: 14px !important;
                border-radius: 10px !important;
            }
            .login-input-icon {
                left: 12px !important;
                font-size: 13px !important;
            }
            .login-submit-btn {
                padding: 13px !important;
                font-size: 14px !important;
                border-radius: 10px !important;
                /* Prevent iOS zoom on tap */
                touch-action: manipulation !important;
            }
            .login-switch-text {
                font-size: 12px !important;
                margin-top: 18px !important;
            }
        }

        /* ── Very small ≤ 360px ── */
        @media (max-width: 360px) {
            .login-card {
                padding: 22px 16px !important;
            }
            .login-brand-title {
                font-size: 15px !important;
            }
        }
    `;
    document.head.appendChild(el);
};

const Login = ({ setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { injectStyles(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMsg({ text: '', type: '' });
        const endpoint = isLogin ? '/login' : '/signup';
        try {
            await axios.post(`http://127.0.0.1:5000${endpoint}`, {
                username,
                password,
                ...(!isLogin && { email })
            }, { withCredentials: true });

            if (isLogin) {
                await setUser(username);
                navigate('/');
            } else {
                await axios.post('http://127.0.0.1:5000/login', { username, password }, { withCredentials: true });
                localStorage.setItem('user', username);
                localStorage.setItem('profileComplete', 'false');
                window.location.href = '/profile-setup';
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
        setUsername(''); setPassword(''); setEmail('');
    };

    return (
        <div className="login-page" style={s.page}>
            <div className="login-card" style={s.card}>

                {/* Brand */}
                <div className="login-brand" style={s.brand}>
                    <div className="login-brand-icon" style={s.brandIconWrap}>
                        <img src="/static/content/ai_logo.jpg" alt="logo" style={s.brandIcon}
                            onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '🌱'; }} />
                    </div>
                    <div>
                        <h1 className="login-brand-title" style={s.brandTitle}>PANDAM VILAI</h1>
                        <p className="login-brand-sub" style={s.brandSub}>Agricultural Price Intelligence</p>
                    </div>
                </div>

                {/* Toggle */}
                <div className="login-toggle-row" style={s.toggleRow}>
                    <button type="button" onClick={() => switchMode(true)} className="login-toggle-btn"
                        style={{ ...s.toggleBtn, ...(isLogin ? s.toggleActive : {}) }}>
                        Login
                    </button>
                    <button type="button" onClick={() => switchMode(false)} className="login-toggle-btn"
                        style={{ ...s.toggleBtn, ...(!isLogin ? s.toggleActive : {}) }}>
                        Sign Up
                    </button>
                </div>

                {/* Status */}
                {statusMsg.text && (
                    <div style={{
                        ...s.statusBanner,
                        background: statusMsg.type === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
                        borderLeft: `3px solid ${statusMsg.type === 'success' ? '#34d399' : '#ef4444'}`,
                        color: statusMsg.type === 'success' ? '#34d399' : '#f87171',
                    }}>
                        <i className={`fas ${statusMsg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}
                            style={{ marginRight: '8px' }} />
                        {statusMsg.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={s.form}>
                    <div className="login-input-group" style={s.inputGroup}>
                        <span className="login-input-icon" style={s.inputIcon}><i className="fas fa-user" /></span>
                        <input type="text" placeholder="Username" value={username}
                            onChange={e => setUsername(e.target.value)} required
                            style={s.input} className="login-input" autoComplete="username" />
                    </div>

                    {!isLogin && (
                        <div className="login-input-group" style={s.inputGroup}>
                            <span className="login-input-icon" style={s.inputIcon}><i className="fas fa-envelope" /></span>
                            <input type="email" placeholder="Email Address" value={email}
                                onChange={e => setEmail(e.target.value)} required
                                style={s.input} className="login-input" autoComplete="email" />
                        </div>
                    )}

                    <div className="login-input-group" style={s.inputGroup}>
                        <span className="login-input-icon" style={s.inputIcon}><i className="fas fa-lock" /></span>
                        <input type="password" placeholder="Password" value={password}
                            onChange={e => setPassword(e.target.value)} required
                            style={s.input} className="login-input" autoComplete={isLogin ? 'current-password' : 'new-password'} />
                    </div>

                    <button type="submit" className="login-submit-btn" style={s.submitBtn} disabled={loading}>
                        {loading
                            ? <span><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />Please wait...</span>
                            : <span>{isLogin ? 'Login to Dashboard' : 'Create Account'}</span>
                        }
                    </button>
                </form>

                <p className="login-switch-text" style={s.switchText}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => switchMode(!isLogin)} style={s.switchLink}>
                        {isLogin ? 'Sign up free' : 'Login here'}
                    </span>
                </p>
            </div>
        </div>
    );
};

const s = {
    page: {
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'linear-gradient(160deg, #061510 0%, #081c14 100%)',
        boxSizing: 'border-box',
    },
    card: {
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '420px',
        background: '#0a1f18',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '24px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        padding: '40px 36px',
        boxSizing: 'border-box',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '32px',
    },
    brandIconWrap: {
        width: '52px', height: '52px',
        borderRadius: '14px',
        background: 'rgba(52,211,153,0.1)',
        border: '1px solid rgba(52,211,153,0.25)',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px',
    },
    brandIcon: {
        width: '100%', height: '100%', objectFit: 'cover',
    },
    brandTitle: {
        margin: 0, fontSize: '19px', fontWeight: '800',
        letterSpacing: '1.2px',
        fontFamily: "'Syne', sans-serif",
        color: '#e8f5f0',
    },
    brandSub: {
        margin: '3px 0 0', fontSize: '11px',
        color: '#4d7a65', letterSpacing: '0.3px',
    },
    toggleRow: {
        display: 'flex',
        gap: '6px',
        background: '#061510',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        padding: '5px',
        marginBottom: '28px',
    },
    toggleBtn: {
        flex: 1, padding: '10px',
        border: 'none', borderRadius: '8px',
        cursor: 'pointer', fontSize: '14px', fontWeight: '600',
        background: 'transparent', color: '#4d7a65',
        transition: 'all 0.22s ease',
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.3px',
        touchAction: 'manipulation',
    },
    toggleActive: {
        background: '#1db87a',
        color: '#fff',
        boxShadow: '0 4px 14px rgba(29,184,122,0.3)',
    },
    statusBanner: {
        padding: '11px 14px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '500',
        marginBottom: '20px',
        display: 'flex', alignItems: 'center',
    },
    form: {
        display: 'flex', flexDirection: 'column', gap: '14px',
    },
    inputGroup: {
        position: 'relative', display: 'flex', alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute', left: '14px',
        color: '#4d7a65', fontSize: '14px',
        pointerEvents: 'none', zIndex: 1,
    },
    input: {
        width: '100%', padding: '13px 14px 13px 42px',
        background: '#061510',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px', fontSize: '16px', /* 16px prevents iOS auto-zoom */
        color: '#e8f5f0', outline: 'none',
        boxSizing: 'border-box',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'border-color 0.2s, box-shadow 0.2s',
        margin: 0,
        WebkitAppearance: 'none',
    },
    submitBtn: {
        marginTop: '4px', padding: '14px',
        background: '#1db87a',
        color: 'white', border: 'none',
        borderRadius: '10px', fontSize: '14px', fontWeight: '700',
        cursor: 'pointer', letterSpacing: '0.4px',
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: '0 6px 20px rgba(29,184,122,0.3)',
        transition: 'all 0.22s ease',
        touchAction: 'manipulation',
        width: '100%',
    },
    switchText: {
        marginTop: '22px', textAlign: 'center',
        fontSize: '13px', color: '#4d7a65',
    },
    switchLink: {
        color: '#34d399', fontWeight: '600',
        cursor: 'pointer', textDecoration: 'underline',
        textUnderlineOffset: '3px',
    },
};

export default Login;