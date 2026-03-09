import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import ReactMarkdown from 'react-markdown';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [showChips, setShowChips] = useState(true);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: '👋 Hi! I am your **Agri-Intelligence** guide.\n\nI can help you learn about this website and navigate its features. Ask me anything!' }
    ]);
    const [chatHistory, setChatHistory] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [winW, setWinW] = useState(window.innerWidth);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const QUICK_CHIPS = [
        '🌐 What can this website do?',
        '📈 How do I predict prices?',
        '🌿 How does disease detection work?',
    ];

    const isMobile = winW <= 480;
    const isTablet = winW <= 768;

    /* ── Track window width ── */
    useEffect(() => {
        const onResize = () => setWinW(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    /* ── Inject styles ── */
    useEffect(() => {
        const styleId = 'chat-md-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .chat-md p { margin: 0 0 4px; color: #8fbfaa; }
                .chat-md p:last-child { margin-bottom: 0; }
                .chat-md ul, .chat-md ol { margin: 2px 0 4px; padding-left: 16px; }
                .chat-md li { margin-bottom: 2px; color: #8fbfaa; }
                .chat-md h1,.chat-md h2,.chat-md h3 { margin: 4px 0 2px; font-size: 13px; color: #e8f5f0; }
                .chat-md strong { font-weight: 700; color: #e8f5f0; }
                .chat-md code { background: rgba(52,211,153,0.1); color: #34d399; padding: 1px 5px; border-radius: 4px; font-size: 11px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes chatFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                @keyframes chatSlideUp { from { opacity:0; transform:translateY(16px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
                .chat-messages::-webkit-scrollbar { width: 3px; }
                .chat-messages::-webkit-scrollbar-track { background: transparent; }
                .chat-messages::-webkit-scrollbar-thumb { background: rgba(52,211,153,0.2); border-radius: 3px; }
            `;
            document.head.appendChild(style);
        }
    }, []);

    /* ── Speech recognition ── */
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = ({ English: 'en-US', Tamil: 'ta-IN' })[selectedLanguage] || 'en-US';
        recognitionRef.current.onresult = e => { setInput(e.results[0][0].transcript); setIsListening(false); };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
    }, [selectedLanguage]);

    const toggleListening = () => {
        if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
        else if (recognitionRef.current) { recognitionRef.current.start(); setIsListening(true); }
        else alert('Speech recognition is not supported in this browser.');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async (chipText) => {
        const msg = chipText || input;
        if (!msg.trim()) return;
        const messageWithLanguage = `[Language: ${selectedLanguage}] ${msg}`;
        setMessages(prev => [...prev, { sender: 'user', text: msg }]);
        setInput('');
        setLoading(true);
        setShowChips(false);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/chat`, {
                message: messageWithLanguage,
                history: chatHistory
            });
            if (res.data?.reply) {
                setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
                setChatHistory(res.data.history);
            }
        } catch {
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: "Sorry, I'm having trouble connecting to the server. Please ensure the backend is running."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSend(); };
    const handleOpen = () => {
        setIsOpen(prev => { if (!prev) setShowChips(true); return !prev; });
    };

    /* ── Responsive values ── */
    const fabSize = isMobile ? '46px' : '54px';
    const fabBottom = isMobile ? '14px' : '20px';
    const fabRight = isMobile ? '14px' : '20px';

    /* Chat window sizing */
    const chatStyle = isMobile ? {
        // Full-width panel anchored just above the FAB
        position: 'fixed',
        left: '8px',
        right: '8px',
        bottom: `${parseInt(fabSize) + parseInt(fabBottom) + 10}px`,
        width: 'auto',
        height: `${Math.min(window.innerHeight * 0.78, 520)}px`,
    } : isTablet ? {
        position: 'relative',
        width: '360px',
        height: '500px',
        marginBottom: '14px',
    } : {
        position: 'relative',
        width: '330px',
        height: '480px',
        marginBottom: '14px',
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: fabBottom,
            right: fabRight,
            zIndex: 1000,
            fontFamily: "'DM Sans', sans-serif",
        }}>

            {/* ══ Chat Window ══ */}
            {isOpen && (
                <div style={{
                    ...chatStyle,
                    background: '#0a1f18',
                    border: '1px solid rgba(52,211,153,0.18)',
                    borderRadius: isMobile ? '16px' : '18px',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'chatSlideUp 0.25s ease',
                    zIndex: 1001,
                }}>

                    {/* ── Header ── */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0d2820, #061510)',
                        borderBottom: '1px solid rgba(52,211,153,0.12)',
                        padding: isMobile ? '11px 13px' : '13px 15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                            {/* Avatar */}
                            <div style={{
                                width: isMobile ? '30px' : '32px',
                                height: isMobile ? '30px' : '32px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                background: 'rgba(52,211,153,0.12)',
                                border: '1px solid rgba(52,211,153,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, fontSize: '13px',
                            }}>
                                <img
                                    src="/static/logo.jpeg"
                                    alt="AI"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '🌱'; }}
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: isMobile ? '12px' : '13px',
                                        fontWeight: '700',
                                        color: '#e8f5f0',
                                        fontFamily: "'Syne', sans-serif",
                                        letterSpacing: '0.2px',
                                    }}>
                                        Agri-Intelligence Guide
                                    </h4>
                                    <span style={{
                                        width: '6px', height: '6px',
                                        borderRadius: '50%',
                                        background: '#34d399',
                                        boxShadow: '0 0 5px #34d399',
                                        display: 'inline-block',
                                        animation: 'pulse 2s infinite',
                                        flexShrink: 0,
                                    }} />
                                </div>
                                <select
                                    value={selectedLanguage}
                                    onChange={e => setSelectedLanguage(e.target.value)}
                                    style={{
                                        background: 'transparent', color: '#4d7a65',
                                        border: 'none', fontSize: '10px',
                                        cursor: 'pointer', outline: 'none',
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}
                                >
                                    <option value="English" style={{ background: '#0a1f18', color: '#e8f5f0' }}>English</option>
                                    <option value="Tamil" style={{ background: '#0a1f18', color: '#e8f5f0' }}>Tamil</option>
                                </select>
                            </div>
                        </div>

                        {/* Close */}
                        <button onClick={() => setIsOpen(false)} style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#ffffff', cursor: 'pointer',
                            width: '28px', height: '28px',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', lineHeight: 1, flexShrink: 0,
                        }}>x</button>
                    </div>

                    {/* ── Messages ── */}
                    <div className="chat-messages" style={{
                        flex: 1,
                        padding: isMobile ? '12px 10px' : '14px 12px',
                        overflowY: 'auto',
                        background: '#061510',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        WebkitOverflowScrolling: 'touch', // smooth iOS scroll
                    }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                animation: 'chatFadeIn 0.2s ease',
                            }}>
                                <div style={{
                                    padding: isMobile ? '9px 12px' : '9px 13px',
                                    borderRadius: msg.sender === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                    background: msg.sender === 'user' ? 'rgba(29,184,122,0.85)' : '#0d2820',
                                    color: msg.sender === 'user' ? '#fff' : '#8fbfaa',
                                    border: msg.sender === 'bot' ? '1px solid rgba(52,211,153,0.1)' : 'none',
                                    maxWidth: isMobile ? '88%' : '85%',
                                    fontSize: '13px',
                                    lineHeight: '1.55',
                                    wordBreak: 'break-word',
                                    boxShadow: msg.sender === 'user'
                                        ? '0 2px 10px rgba(29,184,122,0.25)'
                                        : '0 2px 8px rgba(0,0,0,0.2)',
                                }}>
                                    {msg.sender === 'bot'
                                        ? <div className="chat-md"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                                        : msg.text
                                    }
                                </div>
                            </div>
                        ))}

                        {/* Thinking dots */}
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: '14px 14px 14px 4px',
                                    background: '#0d2820',
                                    border: '1px solid rgba(52,211,153,0.1)',
                                    display: 'flex', gap: '4px', alignItems: 'center',
                                }}>
                                    {[0, 1, 2].map(i => (
                                        <span key={i} style={{
                                            width: '6px', height: '6px',
                                            borderRadius: '50%',
                                            background: '#34d399',
                                            display: 'inline-block',
                                            animation: `pulse 1.2s ${i * 0.2}s infinite`,
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick chips */}
                        {showChips && messages.length === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                                <p style={{
                                    fontSize: '10px', color: '#2d5c47',
                                    margin: '0 0 2px', fontWeight: '700',
                                    letterSpacing: '0.8px', textTransform: 'uppercase',
                                }}>Quick questions</p>
                                {QUICK_CHIPS.map((chip, i) => (
                                    <button key={i} onClick={() => handleSend(chip)} style={{
                                        background: 'rgba(52,211,153,0.05)',
                                        border: '1px solid rgba(52,211,153,0.2)',
                                        color: '#6ee7b7',
                                        borderRadius: '10px',
                                        padding: '8px 12px',
                                        fontSize: '12px', fontWeight: '600',
                                        cursor: 'pointer', textAlign: 'left',
                                        fontFamily: "'DM Sans', sans-serif",
                                        letterSpacing: '0.2px',
                                        width: '100%',
                                    }}>
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── Input row ── */}
                    <div style={{
                        padding: isMobile ? '10px 10px' : '10px 12px',
                        background: '#0a1f18',
                        borderTop: '1px solid rgba(52,211,153,0.08)',
                        display: 'flex',
                        gap: '7px',
                        alignItems: 'center',
                        flexShrink: 0,
                    }}>
                        {/* Mic */}
                        <button onClick={toggleListening} style={{
                            background: isListening ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.08)',
                            border: `1px solid ${isListening ? 'rgba(239,68,68,0.35)' : 'rgba(52,211,153,0.2)'}`,
                            color: isListening ? '#f87171' : '#34d399',
                            borderRadius: '50%',
                            width: isMobile ? '36px' : '32px',
                            height: isMobile ? '36px' : '32px',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', flexShrink: 0,
                        }}>
                            {isListening ? '⏹' : '🎙️'}
                        </button>

                        {/* Input */}
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            disabled={loading}
                            style={{
                                flex: 1,
                                background: '#061510',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '20px',
                                padding: isMobile ? '10px 13px' : '7px 13px',
                                outline: 'none',
                                /* 16px prevents iOS auto-zoom on focus */
                                fontSize: isMobile ? '16px' : '13px',
                                color: '#e8f5f0',
                                fontFamily: "'DM Sans', sans-serif",
                                minWidth: 0,
                                WebkitTextSizeAdjust: '100%',
                            }}
                        />

                        {/* Send */}
                        <button
                            onClick={() => handleSend()}
                            disabled={loading || !input.trim()}
                            style={{
                                background: input.trim() ? '#1db87a' : 'rgba(52,211,153,0.06)',
                                border: `1px solid ${input.trim() ? 'transparent' : 'rgba(52,211,153,0.15)'}`,
                                color: input.trim() ? '#fff' : '#2d5c47',
                                borderRadius: '50%',
                                width: isMobile ? '36px' : '32px',
                                height: isMobile ? '36px' : '32px',
                                cursor: input.trim() ? 'pointer' : 'default',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '13px', flexShrink: 0,
                                boxShadow: input.trim() ? '0 2px 8px rgba(29,184,122,0.3)' : 'none',
                            }}
                        >➤</button>
                    </div>
                </div>
            )}

            {/* ══ FAB Toggle Button ══ */}
            <button
                onClick={handleOpen}
                style={{
                    width: fabSize, height: fabSize,
                    borderRadius: '50%',
                    background: isOpen ? '#061510' : '#1db87a',
                    border: isOpen ? '1px solid rgba(52,211,153,0.25)' : 'none',
                    boxShadow: isOpen
                        ? '0 4px 16px rgba(0,0,0,0.4)'
                        : '0 4px 20px rgba(29,184,122,0.45)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', padding: 0,
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    zIndex: 1002,
                }}
            >
                {isOpen ? (
                    <span style={{ color: '#ffffff', fontSize: '22px', lineHeight: 1 }}>×</span>
                ) : (
                    <img
                        src="/static/logo.jpeg"
                        alt="AI"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="font-size:20px">💬</span>'; }}
                    />
                )}
            </button>
        </div>
    );
};

export default ChatAssistant;