import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { MapPin, Maximize, Sprout, Droplets, Building2, Store, Package } from 'lucide-react';

const FARMER_SUGGESTIONS = [
    'What are the price trends for my crops this week?',
    'How do I control pests on my crops?',
    'Best fertilizer for my district?',
    'When is the best time to sell my produce?',
    'Tips for drip irrigation?',
    'What crops are in season now?',
];

const DEALER_SUGGESTIONS = [
    'Which commodity should I buy this week?',
    'What are the price trends for my commodities?',
    'Best time to sell Tomato in my market?',
    'Market strategy for large-scale trading?',
    'Price forecast for Onion next 7 days?',
    'Demand trends for pulses in Tamil Nadu?',
];

/* ── Inject global styles once ───────────────────────── */
const injectStyles = () => {
    const id = 'ai-assistant-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes typingDot { 0%,80%,100%{transform:scale(0.7);opacity:0.4} 40%{transform:scale(1);opacity:1} }

        .ai-md p               { margin:0 0 5px; color:#8fbfaa; font-size:14px; line-height:1.65; }
        .ai-md p:last-child    { margin-bottom:0; }
        .ai-md ul, .ai-md ol  { margin:4px 0 6px; padding-left:18px; }
        .ai-md li              { margin-bottom:3px; color:#8fbfaa; font-size:14px; }
        .ai-md h1,.ai-md h2,.ai-md h3 { margin:6px 0 3px; color:#e8f5f0; font-size:14px; font-weight:700; font-family:'Syne',sans-serif; }
        .ai-md strong          { font-weight:700; color:#e8f5f0; }
        .ai-md em              { color:#6ee7b7; }
        .ai-md code            { background:rgba(52,211,153,0.1); color:#34d399; padding:1px 6px; border-radius:4px; font-size:12px; }
        .ai-md pre             { background:rgba(52,211,153,0.06); border:1px solid rgba(52,211,153,0.15); border-radius:8px; padding:10px; overflow-x:auto; }
        .ai-md a               { color:#34d399; }

        .ai-messages::-webkit-scrollbar       { width:4px; }
        .ai-messages::-webkit-scrollbar-track { background:transparent; }
        .ai-messages::-webkit-scrollbar-thumb { background:rgba(52,211,153,0.2); border-radius:4px; }

        .ai-sidebar::-webkit-scrollbar       { width:3px; }
        .ai-sidebar::-webkit-scrollbar-track { background:transparent; }
        .ai-sidebar::-webkit-scrollbar-thumb { background:rgba(52,211,153,0.15); border-radius:3px; }

        /* ─────────────────────────────────────
           TABLET  ≤ 768px
        ───────────────────────────────────── */
        @media (max-width: 768px) {
            .ai-page {
                flex-direction: column !important;
                height: 100dvh !important;
                padding: 10px 10px 0 !important;
                gap: 8px !important;
                overflow: hidden !important;
            }
            .ai-sidebar {
                width: 100% !important;
                max-height: none !important;
                flex-direction: row !important;
                overflow-x: auto !important;
                overflow-y: visible !important;
                flex-wrap: nowrap !important;
                gap: 8px !important;
                padding-bottom: 4px !important;
                scrollbar-width: none !important;
                flex-shrink: 0 !important;
            }
            .ai-sidebar::-webkit-scrollbar { display:none !important; }
            .ai-sidebar .profile-card {
                min-width: 230px !important;
                flex-shrink: 0 !important;
            }
            .ai-sidebar .lang-card {
                min-width: 155px !important;
                flex-shrink: 0 !important;
                align-self: flex-start !important;
            }
            .ai-chat-area {
                flex: 1 !important;
                min-height: 0 !important;
                height: auto !important;
                border-radius: 16px 16px 0 0 !important;
            }
            .ai-bubble { max-width: 84% !important; }
        }

        /* ─────────────────────────────────────
           PHONE  ≤ 480px
           Sidebar → ultra-compact top bar
           Chat   → fills remaining screen
        ───────────────────────────────────── */
        @media (max-width: 480px) {
            .ai-page {
                padding: 0 !important;
                gap: 0 !important;
                background: #061510 !important;
            }

            /* compact sidebar strip */
            .ai-sidebar {
                padding: 8px 10px 6px !important;
                gap: 8px !important;
                background: #0a1f18 !important;
                border-bottom: 1px solid rgba(52,211,153,0.1) !important;
            }

            /* profile card → horizontal pill */
            .ai-sidebar .profile-card {
                min-width: 0 !important;
                width: auto !important;
                flex-direction: row !important;
                align-items: center !important;
                padding: 8px 12px !important;
                gap: 10px !important;
                border-radius: 12px !important;
                flex-shrink: 0 !important;
            }
            /* hide detail rows on phone — only avatar + name + badge visible */
            .ai-sidebar .profile-card .profile-divider,
            .ai-sidebar .profile-card .profile-details-block {
                display: none !important;
            }
            .ai-sidebar .profile-card .profile-avatar {
                width: 34px !important;
                height: 34px !important;
                font-size: 18px !important;
                margin-bottom: 0 !important;
                flex-shrink: 0 !important;
            }
            .ai-sidebar .profile-card .profile-name {
                font-size: 13px !important;
                margin: 0 !important;
            }
            .ai-sidebar .profile-card .profile-badge {
                font-size: 10px !important;
                padding: 2px 8px !important;
            }

            /* lang card → horizontal pill */
            .ai-sidebar .lang-card {
                min-width: 0 !important;
                width: auto !important;
                flex-direction: row !important;
                align-items: center !important;
                padding: 8px 12px !important;
                gap: 8px !important;
                border-radius: 12px !important;
                flex-shrink: 0 !important;
            }
            .ai-sidebar .lang-card label {
                white-space: nowrap !important;
                font-size: 11px !important;
            }
            .ai-sidebar .lang-card select {
                width: auto !important;
                min-width: 88px !important;
                font-size: 12px !important;
                padding: 5px 24px 5px 8px !important;
            }

            /* chat fills the rest */
            .ai-chat-area {
                border-radius: 0 !important;
                border-left: none !important;
                border-right: none !important;
                border-bottom: none !important;
            }
            .ai-chat-header  { padding: 10px 13px !important; }
            .ai-messages     { padding: 10px 11px 6px !important; }

            /* suggestion chips → single scroll row */
            .ai-suggestions-area  { padding: 7px 11px 9px !important; }
            .ai-suggestions-row {
                flex-wrap: nowrap !important;
                overflow-x: auto !important;
                padding-bottom: 3px !important;
                gap: 6px !important;
                scrollbar-width: none !important;
            }
            .ai-suggestions-row::-webkit-scrollbar { display:none !important; }
            .ai-suggestion-chip {
                font-size: 11px !important;
                padding: 5px 11px !important;
                white-space: nowrap !important;
                flex-shrink: 0 !important;
            }

            /* input row */
            .ai-input-row {
                padding: 8px 10px calc(8px + env(safe-area-inset-bottom)) !important;
                gap: 6px !important;
            }
            .ai-textarea {
                font-size: 14px !important;
                padding: 9px 12px !important;
                border-radius: 13px !important;
            }
            .ai-icon-btn {
                width: 40px !important;
                height: 40px !important;
                font-size: 15px !important;
                border-radius: 11px !important;
            }

            /* bubbles */
            .ai-bubble {
                max-width: 87% !important;
                font-size: 13.5px !important;
                padding: 9px 12px !important;
            }
            .ai-md p, .ai-md li { font-size: 13px !important; }
        }

        /* ─────────────────────────────────────
           TINY  ≤ 360px
        ───────────────────────────────────── */
        @media (max-width: 360px) {
            .ai-bubble { max-width: 91% !important; }
            .ai-chat-header { padding: 9px 11px !important; }
            .ai-sidebar .profile-card .profile-avatar {
                width: 30px !important;
                height: 30px !important;
                font-size: 16px !important;
            }
        }
    `;
    document.head.appendChild(el);
};

/* ── Detail row ── */
const Detail = ({ icon, label, value }) => (
    <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
        <span style={{ fontSize:'15px', marginTop:'1px', flexShrink:0 }}>{icon}</span>
        <div>
            <div style={{
                fontSize:'10px', color:'#2d5c47', fontWeight:'700',
                textTransform:'uppercase', letterSpacing:'0.8px',
                fontFamily:"'DM Sans',sans-serif", marginBottom:'2px',
            }}>{label}</div>
            <div style={{
                fontSize:'13px', color:'#8fbfaa', fontWeight:'600',
                fontFamily:"'DM Sans',sans-serif",
            }}>{value || 'Not set'}</div>
        </div>
    </div>
);

/* ── Typing dots ── */
const TypingDots = () => (
    <div style={{ display:'flex', gap:'5px', alignItems:'center', padding:'4px 2px' }}>
        {[0,1,2].map(i => (
            <div key={i} style={{
                width:'7px', height:'7px', borderRadius:'50%', background:'#34d399',
                animation:`typingDot 1.2s ${i*0.2}s ease-in-out infinite`,
            }} />
        ))}
    </div>
);

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
const AIAssistant = () => {
    const [profile, setProfile]               = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError]     = useState('');
    const [messages, setMessages]             = useState([]);
    const [chatHistory, setChatHistory]       = useState([]);
    const [input, setInput]                   = useState('');
    const [sending, setSending]               = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [isListening, setIsListening]       = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef       = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        injectStyles();
        const fetchProfile = async () => {
            try {
                const storedUsername = localStorage.getItem('user') || '';
                const res = await axios.get(
                    `http://127.0.0.1:5000/profile/get?username=${encodeURIComponent(storedUsername)}`,
                    { withCredentials: true }
                );
                setProfile(res.data);
                const p = res.data.profile || {};
                const greeting = res.data.role === 'farmer'
                    ? `👋 Hello **${res.data.username}**! I'm your personal farming assistant.\n\nI know you're a **Farmer** in **${p.district}** who grows **${(p.crops || []).join(', ') || 'various crops'}**.\n\nAsk me anything about your crops, prices, pest control, irrigation or farming tips!`
                    : `👋 Hello **${res.data.username}**! I'm your personal market advisor.\n\nI know you're a **${p.business_type || 'Dealer'}** in **${p.district}** operating at **${p.market_location || 'your market'}**, trading **${(p.commodities || []).join(', ') || 'various commodities'}**.\n\nAsk me about price trends, market strategy, or the best time to buy and sell!`;
                setMessages([{ sender: 'bot', text: greeting }]);
            } catch {
                setProfileError('Could not load your profile. Please make sure you are logged in and your profile is complete.');
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        recognitionRef.current = new SR();
        recognitionRef.current.continuous     = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = ({ English:'en-US', Tamil:'ta-IN' })[selectedLanguage] || 'en-US';
        recognitionRef.current.onresult = e => { setInput(e.results[0][0].transcript); setIsListening(false); };
        recognitionRef.current.onerror  = () => setIsListening(false);
        recognitionRef.current.onend    = () => setIsListening(false);
    }, [selectedLanguage]);

    const toggleListening = () => {
        if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
        else if (recognitionRef.current) { recognitionRef.current.start(); setIsListening(true); }
        else alert('Speech recognition is not supported in this browser.');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending]);

    const handleSend = async (messageText) => {
        const text = (messageText || input).trim();
        if (!text) return;
        const langgedText = selectedLanguage !== 'English' ? `[Please respond in ${selectedLanguage}] ${text}` : text;
        setMessages(prev => [...prev, { sender: 'user', text }]);
        setInput('');
        setSending(true);
        try {
            const res = await axios.post('http://127.0.0.1:5000/api/assistant-chat', {
                message: langgedText,
                history: chatHistory,
                username: localStorage.getItem('user') || '',
            }, { withCredentials: true });
            setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
            setChatHistory(res.data.history);
        } catch (err) {
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: err.response?.data?.error || 'Sorry, I had trouble connecting. Please try again.',
            }]);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const role         = profile?.role || 'farmer';
    const isFarmer     = role === 'farmer';
    const accent       = isFarmer ? '#ceffebad' : '#ffffff';
    const accentSolid  = isFarmer ? '#1db87a' : '#0ea5e9';
    const accentDim    = isFarmer ? 'rgba(52,211,153,0.1)'  : 'rgba(56,189,248,0.1)';
    const accentBorder = isFarmer ? 'rgba(52,211,153,0.25)' : 'rgba(56,189,248,0.25)';
    const suggestions  = isFarmer ? FARMER_SUGGESTIONS : DEALER_SUGGESTIONS;

    if (loadingProfile) return (
        <div style={s.centerPage}>
            <div style={{ ...s.spinner, borderTopColor: accent }} />
            <p style={{ color:'#4d7a65', marginTop:'14px', fontSize:'14px', fontFamily:"'DM Sans',sans-serif" }}>
                Loading your personalized assistant...
            </p>
        </div>
    );

    if (profileError) return (
        <div style={s.centerPage}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>⚠️</div>
            <p style={{ color:'#f87171', fontWeight:'600', fontSize:'15px', textAlign:'center', maxWidth:'360px', fontFamily:"'DM Sans',sans-serif" }}>
                {profileError}
            </p>
        </div>
    );

    return (
        <div className="ai-page" style={s.page}>

            {/* ══ SIDEBAR ══ */}
            <aside className="ai-sidebar" style={s.sidebar}>

                {/* Profile card
                    Desktop : full vertical card with all detail rows
                    Phone   : compact horizontal pill — detail block hidden via CSS */}
                <div className="profile-card" style={{ ...s.profileCard, borderTop:`2px solid ${accent}` }}>

                    <div className="profile-avatar"
                         style={{ ...s.roleAvatar, background: accentDim, border:`1px solid ${accentBorder}` }}>
                        <span style={{ fontSize:'30px' }}>{isFarmer ? '🌾' : '🏪'}</span>
                    </div>

                    <h3 className="profile-name" style={{ ...s.profileName, color: accent }}>
                        {profile?.username}
                    </h3>

                    <span className="profile-badge"
                          style={{ ...s.roleBadge, background: accentDim, color: accent, border:`1px solid ${accentBorder}` }}>
                        {isFarmer ? '🌾 Farmer' : '🏪 Dealer'}
                    </span>

                    {/* Hidden on phone */}
                    <div className="profile-divider" style={s.divider} />

                    <div className="profile-details-block" style={s.profileDetails}>
                        {isFarmer && profile?.profile && (<>

                                   <Detail icon={<MapPin size={18} />} label={<span style={{color:"#fff"}}>District</span>} value={profile.profile.district} />
                                   <Detail icon={<Maximize size={18} />} label={<span style={{color:"#fff"}}>Land</span>}     value={profile.profile.land_size_acres ? `${profile.profile.land_size_acres} Acres` : null} />
                                   <Detail icon={<Sprout size={18} />}   label={<span style={{color:"#fff"}}>Farming</span>}  value={profile.profile.farming_type} />
                                   <Detail icon={<Droplets size={18} />} label={<span style={{color:"#fff"}}>Irrigation</span>} value={profile.profile.irrigation_method} />
                            <div>
                                <div style={s.tagLabel}>🌾 Crops</div>
                                <div style={s.tagGrid}>
                                    {(profile.profile.crops || []).map(c => (
                                        <span key={c} style={{ ...s.tag, background: accentDim, color: accent, border:`1px solid ${accentBorder}` }}>{c}</span>
                                    ))}
                                </div>
                            </div>
                        </>)}
                        {!isFarmer && profile?.profile && (<>
                             <Detail icon={<MapPin size={18} />}    label="District" value={profile.profile.district} />
                             <Detail icon={<Building2 size={18} />} label="Business" value={profile.profile.business_type} />
                             <Detail icon={<Store size={18} />}     label="Market"   value={profile.profile.market_location} />
                             <Detail icon={<Package size={18} />}   label="Volume"   value={profile.profile.trading_volume} />
                            <div>
                                <div style={s.tagLabel}>📦 Commodities</div>
                                <div style={s.tagGrid}>
                                    {(profile.profile.commodities || []).map(c => (
                                        <span key={c} style={{ ...s.tag, background: accentDim, color: accent, border:`1px solid ${accentBorder}` }}>{c}</span>
                                    ))}
                                </div>
                            </div>
                        </>)}
                    </div>
                </div>

                {/* Language selector */}
                <div className="lang-card" style={s.langCard}>
                    <label style={s.langLabel}>🌐 Response Language</label>
                    <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} style={s.langSelect}>
                        <option value="English" style={{ background:'#061510', color:'#e8f5f0' }}>English</option>
                        <option value="Tamil"   style={{ background:'#061510', color:'#e8f5f0' }}>Tamil</option>
                    </select>
                </div>
            </aside>

            {/* ══ CHAT AREA ══ */}
            <main className="ai-chat-area" style={s.chatArea}>

                <div className="ai-chat-header" style={{ ...s.chatHeader, borderBottom:`1px solid ${accentBorder}` }}>
                    <div style={s.chatHeaderLeft}>
                        <div style={{ ...s.chatHeaderIcon, background: accentDim, border:`1px solid ${accentBorder}` }}>🤖</div>
                        <div>
                            <h2 style={s.chatHeaderTitle}>AI Agri-Assistant</h2>
                            <p style={s.chatHeaderSub}>Personalized for your {isFarmer ? 'farm' : 'business'}</p>
                        </div>
                    </div>
                    <div style={s.onlineIndicator}>
                        <span style={{ ...s.onlineDot, background: accent, boxShadow:`0 0 6px ${accent}` }} />
                        Online
                    </div>
                </div>

                <div className="ai-messages" style={s.messages}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            display:'flex',
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom:'14px',
                            animation:'fadeUp 0.2s ease',
                        }}>
                            {msg.sender === 'bot' && (
                                <div style={{ ...s.botAvatar, background: accentDim, border:`1px solid ${accentBorder}` }}>🤖</div>
                            )}
                            <div className="ai-bubble" style={{
                                ...s.bubble,
                                background:   msg.sender === 'user' ? accentSolid : '#0d2820',
                                color:        msg.sender === 'user' ? '#fff' : '#8fbfaa',
                                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                marginLeft:   msg.sender === 'bot'  ? '10px' : 0,
                                marginRight:  msg.sender === 'user' ? 0 : 'auto',
                                border:       msg.sender === 'bot'  ? `1px solid ${accentBorder}` : 'none',
                                boxShadow:    msg.sender === 'user' ? `0 4px 14px ${accentSolid}40` : '0 2px 10px rgba(0,0,0,0.25)',
                            }}>
                                {msg.sender === 'bot'
                                    ? <div className="ai-md"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                                    : msg.text
                                }
                            </div>
                        </div>
                    ))}

                    {sending && (
                        <div style={{ display:'flex', alignItems:'flex-end', gap:'10px', marginBottom:'14px' }}>
                            <div style={{ ...s.botAvatar, background: accentDim, border:`1px solid ${accentBorder}` }}>🤖</div>
                            <div style={{ ...s.bubble, background:'#0d2820', border:`1px solid ${accentBorder}`, borderRadius:'16px 16px 16px 4px' }}>
                                <TypingDots />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {messages.length <= 1 && (
                    <div className="ai-suggestions-area" style={{ ...s.suggestionsArea, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                        <p style={s.suggestionsLabel}>💡 Quick questions for you</p>
                        <div className="ai-suggestions-row" style={s.suggestionsRow}>
                            {suggestions.map((sg, i) => (
                                <button key={i} onClick={() => handleSend(sg)} className="ai-suggestion-chip"
                                    style={{ ...s.chip, border:`1px solid ${accentBorder}`, color: accent, background: accentDim }}>
                                    {sg}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="ai-input-row" style={{ ...s.inputArea, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={toggleListening} className="ai-icon-btn" style={{
                        ...s.iconBtn,
                        background: isListening ? 'rgba(239,68,68,0.15)' : accentDim,
                        border: `1px solid ${isListening ? 'rgba(239,68,68,0.35)' : accentBorder}`,
                        color: isListening ? '#f87171' : accent,
                        boxShadow: isListening ? '0 0 10px rgba(239,68,68,0.2)' : 'none',
                    }}>
                        {isListening ? '⏹' : '🎙️'}
                    </button>

                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask about your ${isFarmer ? 'crops, prices, or farming tips' : 'commodities, prices, or market strategy'}...`}
                        disabled={sending}
                        rows={1}
                        className="ai-textarea"
                        style={s.textarea}
                    />

                    <button onClick={() => handleSend()} disabled={sending || !input.trim()} className="ai-icon-btn"
                        style={{
                            ...s.iconBtn,
                            background:   input.trim() ? accentSolid : accentDim,
                            border:       `1px solid ${input.trim() ? 'transparent' : accentBorder}`,
                            color:        input.trim() ? '#fff' : accent,
                            boxShadow:    input.trim() ? `0 4px 14px ${accentSolid}45` : 'none',
                            cursor:       input.trim() ? 'pointer' : 'default',
                            opacity:      sending ? 0.5 : 1,
                            borderRadius: '12px',
                            fontSize:     '16px',
                        }}>➤</button>
                </div>
            </main>
        </div>
    );
};

/* ── Static styles ── */
const s = {
    page: {
        position: 'fixed',
        top: 'var(--navbar-h, 58px)',
        left: 0, right: 0, bottom: 0,
        display: 'flex', gap: '16px',
        padding: '12px 16px 0',
        boxSizing: 'border-box',
        fontFamily: "'DM Sans', sans-serif",
        overflow: 'hidden',
    },
    centerPage: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '70vh',
    },
    spinner: {
        width: '40px', height: '40px',
        border: '3px solid rgba(52,211,153,0.15)',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
    },
    sidebar: {
        width: '252px', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        gap: '10px', overflowY: 'auto', maxHeight: '100%',
    },
    profileCard: {
        background: '#0a1f18',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '18px', padding: '22px 16px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '8px',
    },
    roleAvatar: {
        width: '60px', height: '60px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '4px',
    },
    profileName: {
        fontSize: '17px', fontWeight: '800',
        margin: 0, letterSpacing: '-0.2px',
    },
    roleBadge: {
        fontSize: '11px', fontWeight: '700',
        padding: '4px 12px', borderRadius: '12px', letterSpacing: '0.3px',
    },
    divider: {
        width: '100%', height: '1px',
        background: 'rgba(255,255,255,0.06)', margin: '4px 0',
    },
    profileDetails: {
        width: '100%', display: 'flex', flexDirection: 'column', gap: '12px',
    },
    tagLabel: {
        fontSize: '10px', color: '#c8d6cf', fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px',
    },
    tagGrid: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
    tag: {
        fontSize: '11px', fontWeight: '600',
        padding: '3px 9px', borderRadius: '10px', letterSpacing: '0.2px',
    },
    langCard: {
        background: '#0a1f18',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px', padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0,
    },
    langLabel: {
        fontSize: '12px', fontWeight: '700', color: '#c8d6cf', letterSpacing: '0.3px',
    },
    langSelect: {
        width: '100%', padding: '8px 10px', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.08)', fontSize: '13px',
        color: '#e8f5f0', background: '#061510', outline: 'none',
        fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
    },
    chatArea: {
        flex: 1, display: 'flex', flexDirection: 'column',
        background: '#0a1f18',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '18px 18px 0 0',
        overflow: 'hidden', minWidth: 0,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    },
    chatHeader: {
        padding: '14px 22px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        background: 'linear-gradient(135deg, #0d2820, #061510)',
    },
    chatHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    chatHeaderIcon: {
        width: '40px', height: '40px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', flexShrink: 0,
    },
    chatHeaderTitle: {
        fontFamily: "'Syne', sans-serif",
        margin: 0, color: '#e8f5f0', fontSize: '16px',
        fontWeight: '800', letterSpacing: '-0.2px',
    },
    chatHeaderSub: { margin: 0, color: '#4d7a65', fontSize: '11px', letterSpacing: '0.2px' },
    onlineIndicator: {
        display: 'flex', alignItems: 'center', gap: '6px',
        color: '#4d7a65', fontSize: '11px', fontWeight: '700',
        letterSpacing: '0.4px', textTransform: 'uppercase',
    },
    onlineDot: { width: '7px', height: '7px', borderRadius: '50%', animation: 'pulse 2s infinite' },
    messages: {
        flex: 1, overflowY: 'auto',
        padding: '18px 20px 10px',
        display: 'flex', flexDirection: 'column',
        background: '#061510',
    },
    botAvatar: {
        width: '30px', height: '30px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', flexShrink: 0,
        alignSelf: 'flex-end', marginBottom: '2px',
    },
    bubble: {
        padding: '11px 15px', maxWidth: '72%',
        fontSize: '14px', lineHeight: '1.6', wordBreak: 'break-word',
    },
    suggestionsArea: {
        padding: '10px 20px 12px', flexShrink: 0, background: '#061510',
    },
    suggestionsLabel: {
        fontSize: '11px', color: '#c8d6cf', fontWeight: '700',
        margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.8px',
    },
    suggestionsRow: { display: 'flex', flexWrap: 'wrap', gap: '7px' },
    chip: {
        padding: '6px 13px', borderRadius: '20px',
        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.2px',
        transition: 'all 0.18s',
    },
    inputArea: {
        padding: '12px 16px', display: 'flex',
        gap: '8px', alignItems: 'flex-end',
        flexShrink: 0, background: '#0a1f18',
    },
    iconBtn: {
        width: '42px', height: '42px', borderRadius: '12px',
        border: 'none', fontSize: '17px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all 0.2s',
    },
    textarea: {
        flex: 1, padding: '11px 15px',
        background: '#061510',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', fontSize: '14px', color: '#e8f5f0',
        resize: 'none', outline: 'none', lineHeight: '1.5',
        fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s',
    },
};

export default AIAssistant;