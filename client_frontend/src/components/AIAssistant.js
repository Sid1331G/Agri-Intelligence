import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

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

const AIAssistant = () => {
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState('');

    const [messages, setMessages] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [isListening, setIsListening] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
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
                    ? `👋 Hello **${res.data.username}**! I'm your personal farming assistant.\n\nI know you're a **${res.data.role === 'farmer' ? 'Farmer' : 'Dealer'}** in **${p.district}** who grows **${(p.crops || []).join(', ') || 'various crops'}**.\n\nAsk me anything about your crops, prices, pest control, irrigation or farming tips!`
                    : `👋 Hello **${res.data.username}**! I'm your personal market advisor.\n\nI know you're a **${p.business_type || 'Dealer'}** in **${p.district}** operating at **${p.market_location || 'your market'}**, trading **${(p.commodities || []).join(', ') || 'various commodities'}**.\n\nAsk me about price trends, market strategy, or the best time to buy and sell!`;
                setMessages([{ sender: 'bot', text: greeting }]);
            } catch (e) {
                setProfileError('Could not load your profile. Please make sure you are logged in and your profile is complete.');
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            const langMap = {
                'English': 'en-US',
                'Tamil': 'ta-IN'
            };
            recognitionRef.current.lang = langMap[selectedLanguage] || 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech error:", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [selectedLanguage]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if (recognitionRef.current) {
                recognitionRef.current.start();
                setIsListening(true);
            } else {
                alert("Speech recognition is not supported in this browser.");
            }
        }
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
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const role = profile?.role || 'farmer';
    const activeColor = role === 'farmer' ? '#059669' : '#0369a1';
    const activeGradient = role === 'farmer'
        ? 'linear-gradient(135deg, #059669, #10b981)'
        : 'linear-gradient(135deg, #0369a1, #0ea5e9)';
    const suggestions = role === 'farmer' ? FARMER_SUGGESTIONS : DEALER_SUGGESTIONS;

    if (loadingProfile) {
        return (
            <div style={styles.loadingPage}>
                <div style={styles.spinner} />
                <p style={{ color: '#6b7280', marginTop: '14px', fontSize: '15px' }}>Loading your personalized assistant...</p>
            </div>
        );
    }

    if (profileError) {
        return (
            <div style={styles.loadingPage}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <p style={{ color: '#991b1b', fontWeight: '600', fontSize: '16px', textAlign: 'center', maxWidth: '360px' }}>{profileError}</p>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Left sidebar — profile card */}
            <aside style={styles.sidebar}>
                <div style={{ ...styles.profileCard, borderTop: `4px solid ${activeColor}` }}>
                    <div style={{ ...styles.roleAvatar, background: activeGradient }}>
                        <span style={{ fontSize: '28px' }}>{role === 'farmer' ? '🌾' : '🏪'}</span>
                    </div>
                    <h3 style={{ ...styles.profileName, color: activeColor }}>{profile?.username}</h3>
                    <span style={{ ...styles.roleBadge, background: `${activeColor}18`, color: activeColor, border: `1px solid ${activeColor}30` }}>
                        {role === 'farmer' ? '🌾 Farmer' : '🏪 Dealer'}
                    </span>

                    <div style={styles.profileDetails}>
                        {role === 'farmer' && profile?.profile && (
                            <>
                                <Detail icon="📍" label="District" value={profile.profile.district} />
                                <Detail icon="📐" label="Land" value={profile.profile.land_size_acres ? `${profile.profile.land_size_acres} Acres` : 'Not set'} />
                                <Detail icon="🌱" label="Farming" value={profile.profile.farming_type} />
                                <Detail icon="💧" label="Irrigation" value={profile.profile.irrigation} />
                                <div style={styles.detailItem}>
                                    <span style={styles.detailIcon}>🌾</span>
                                    <div>
                                        <div style={styles.detailLabel}>Crops</div>
                                        <div style={styles.cropTags}>
                                            {(profile.profile.crops || []).map(c => (
                                                <span key={c} style={{ ...styles.cropTag, background: `${activeColor}15`, color: activeColor }}>{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        {role === 'dealer' && profile?.profile && (
                            <>
                                <Detail icon="📍" label="District" value={profile.profile.district} />
                                <Detail icon="🏢" label="Business" value={profile.profile.business_type} />
                                <Detail icon="🏬" label="Market" value={profile.profile.market_location} />
                                <Detail icon="📦" label="Volume" value={profile.profile.trading_volume} />
                                <div style={styles.detailItem}>
                                    <span style={styles.detailIcon}>📦</span>
                                    <div>
                                        <div style={styles.detailLabel}>Commodities</div>
                                        <div style={styles.cropTags}>
                                            {(profile.profile.commodities || []).map(c => (
                                                <span key={c} style={{ ...styles.cropTag, background: `${activeColor}15`, color: activeColor }}>{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Language selector */}
                <div style={styles.langCard}>
                    <label style={styles.langLabel}>🌐 Response Language</label>
                    <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} style={styles.langSelect}>
                        <option value="English">English</option>
                        <option value="Tamil">Tamil</option>
                    </select>
                </div>
            </aside>

            {/* Main chat area */}
            <main style={styles.chatArea}>
                {/* Header */}
                <div style={{ ...styles.chatHeader, background: activeGradient }}>
                    <div style={styles.chatHeaderLeft}>
                        <div style={styles.chatHeaderIcon}>🤖</div>
                        <div>
                            <h2 style={styles.chatHeaderTitle}>AI Assistant</h2>
                            <p style={styles.chatHeaderSub}>Personalized for your {role === 'farmer' ? 'farm' : 'business'}</p>
                        </div>
                    </div>
                    <div style={styles.onlineIndicator}>
                        <span style={styles.onlineDot} />
                        Online
                    </div>
                </div>

                {/* Messages */}
                <div style={styles.messages}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: '14px' }}>
                            {msg.sender === 'bot' && (
                                <div style={{ ...styles.avatar, background: activeGradient }}>🤖</div>
                            )}
                            <div style={{
                                ...styles.bubble,
                                background: msg.sender === 'user' ? activeGradient : 'white',
                                color: msg.sender === 'user' ? 'white' : '#111827',
                                borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                marginLeft: msg.sender === 'bot' ? '10px' : 0,
                                marginRight: msg.sender === 'user' ? 0 : 'auto',
                                boxShadow: msg.sender === 'user' ? `0 4px 15px ${activeColor}30` : '0 2px 10px rgba(0,0,0,0.08)',
                            }}>
                                {msg.sender === 'bot' ? (
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    ))}
                    {sending && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                            <div style={{ ...styles.avatar, background: activeGradient }}>🤖</div>
                            <div style={{ ...styles.bubble, background: 'white' }}>
                                <TypingDots />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestion chips (shown when no messages from user yet) */}
                {messages.length <= 1 && (
                    <div style={styles.suggestionsArea}>
                        <p style={styles.suggestionsLabel}>💡 Quick questions for you:</p>
                        <div style={styles.suggestionsRow}>
                            {suggestions.map((s, i) => (
                                <button key={i} onClick={() => handleSend(s)} style={{ ...styles.suggestionChip, borderColor: activeColor, color: activeColor }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input area */}
                <div style={styles.inputArea}>
                    <button
                        onClick={toggleListening}
                        style={{
                            ...styles.micBtn,
                            background: isListening ? '#ef4444' : activeColor,
                        }}
                    >
                        {isListening ? '⏹️' : '🎙️'}
                    </button>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask about your ${role === 'farmer' ? 'crops, prices, or farming tips' : 'commodities, prices, or market strategy'}...`}
                        disabled={sending}
                        rows={1}
                        style={styles.input}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={sending || !input.trim()}
                        style={{ ...styles.sendBtn, background: activeGradient, opacity: sending || !input.trim() ? 0.6 : 1 }}
                    >
                        ➤
                    </button>
                </div>
            </main>
        </div>
    );
};

const Detail = ({ icon, label, value }) => (
    <div style={styles.detailItem}>
        <span style={styles.detailIcon}>{icon}</span>
        <div>
            <div style={styles.detailLabel}>{label}</div>
            <div style={styles.detailValue}>{value || 'Not set'}</div>
        </div>
    </div>
);

const TypingDots = () => (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
        {[0, 1, 2].map(i => (
            <div key={i} style={{
                width: '8px', height: '8px', borderRadius: '50%', background: '#9ca3af',
                animation: `typing 1.2s ${i * 0.2}s ease-in-out infinite`,
            }} />
        ))}
    </div>
);

const styles = {
    page: {
        display: 'flex',
        gap: '20px',
        height: 'calc(100vh - 70px)',
        padding: '20px',
        boxSizing: 'border-box',
        maxWidth: '1300px',
        margin: '0 auto',
    },
    loadingPage: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
    },
    spinner: {
        width: '44px',
        height: '44px',
        border: '3px solid #e5e7eb',
        borderTop: '3px solid #059669',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    sidebar: {
        width: '260px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    profileCard: {
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '24px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 220px)',
    },
    roleAvatar: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '4px',
    },
    profileName: {
        fontSize: '18px',
        fontWeight: '800',
        margin: 0,
    },
    roleBadge: {
        fontSize: '12px',
        fontWeight: '700',
        padding: '4px 12px',
        borderRadius: '12px',
        letterSpacing: '0.3px',
    },
    profileDetails: {
        width: '100%',
        marginTop: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    detailItem: {
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
    },
    detailIcon: {
        fontSize: '16px',
        marginTop: '2px',
    },
    detailLabel: {
        fontSize: '11px',
        color: '#9ca3af',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    detailValue: {
        fontSize: '13px',
        color: '#111827',
        fontWeight: '600',
    },
    cropTags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        marginTop: '4px',
    },
    cropTag: {
        fontSize: '11px',
        fontWeight: '600',
        padding: '2px 8px',
        borderRadius: '10px',
    },
    langCard: {
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    langLabel: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#374151',
    },
    langSelect: {
        width: '100%',
        padding: '8px 10px',
        borderRadius: '8px',
        border: '1.5px solid #d1d5db',
        fontSize: '13px',
        color: '#111827',
        background: 'white',
        outline: 'none',
    },
    chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        minWidth: 0,
    },
    chatHeader: {
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
    },
    chatHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
    },
    chatHeaderIcon: {
        fontSize: '28px',
    },
    chatHeaderTitle: {
        margin: 0,
        color: 'white',
        fontSize: '18px',
        fontWeight: '800',
    },
    chatHeaderSub: {
        margin: 0,
        color: 'rgba(255,255,255,0.8)',
        fontSize: '12px',
    },
    onlineIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '12px',
        fontWeight: '600',
    },
    onlineDot: {
        width: '8px',
        height: '8px',
        background: '#4ade80',
        borderRadius: '50%',
        boxShadow: '0 0 6px #4ade80',
    },
    messages: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px 10px',
        display: 'flex',
        flexDirection: 'column',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        flexShrink: 0,
        alignSelf: 'flex-end',
    },
    bubble: {
        padding: '12px 16px',
        maxWidth: '70%',
        fontSize: '14px',
        lineHeight: '1.6',
        wordBreak: 'break-word',
        border: '1px solid #f3f4f6',
    },
    suggestionsArea: {
        padding: '10px 24px',
        borderTop: '1px solid #f3f4f6',
        flexShrink: 0,
    },
    suggestionsLabel: {
        fontSize: '12px',
        color: '#9ca3af',
        fontWeight: '600',
        margin: '0 0 8px',
    },
    suggestionsRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    suggestionChip: {
        padding: '6px 14px',
        borderRadius: '20px',
        border: '1.5px solid',
        background: 'white',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.18s',
    },
    inputArea: {
        padding: '14px 20px',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
        flexShrink: 0,
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        border: '2px solid #e5e7eb',
        borderRadius: '14px',
        fontSize: '14px',
        color: '#111827',
        resize: 'none',
        outline: 'none',
        lineHeight: '1.5',
        fontFamily: 'inherit',
        background: '#f9fafb',
        transition: 'border-color 0.2s',
    },
    sendBtn: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        border: 'none',
        color: 'white',
        fontSize: '18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'opacity 0.2s',
    },
    micBtn: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        border: 'none',
        color: 'white',
        fontSize: '18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
};

export default AIAssistant;
