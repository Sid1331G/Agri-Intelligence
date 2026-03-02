import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! I am your AI-Assistant. How can I help you with PANDAM VILAI today?' }
    ]);
    const [chatHistory, setChatHistory] = useState([]); 
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false); 
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null); 

    // --- Speech to Text Logic ---
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            const langMap = {
                'English': 'en-US',
                'Tamil': 'ta-IN',
                'Hindi': 'hi-IN',
                'Malayalam': 'ml-IN'
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const messageWithLanguage = `[Language: ${selectedLanguage}] ${input}`;
        const userMsg = { sender: 'user', text: input };
        
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('http://127.0.0.1:5000/api/chat', { 
                message: messageWithLanguage, 
                history: chatHistory 
            });

            if (res.data && res.data.reply) {
                const botMsg = { sender: 'bot', text: res.data.reply };
                setMessages(prev => [...prev, botMsg]);
                setChatHistory(res.data.history); 
            }
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                sender: 'bot', 
                text: "Sorry, I'm having trouble connecting to the server. Please ensure the backend is running." 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, fontFamily: 'Arial, sans-serif' }}>
            
            {isOpen && (
                <div className="chat-window shadow" style={{
                    width: '350px',
                    height: '500px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    marginBottom: '15px',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ background: '#059669', color: 'white', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'white', border: '1px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img 
                                    src="/static/content/ai_logo.jpg" 
                                    alt="AI"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.style.display='none'; 
                                        e.target.parentNode.innerHTML = '🌱'; 
                                    }}
                                />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Agri-Assistant</h4>
                                <select 
                                    value={selectedLanguage} 
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    style={{ background: 'transparent', color: 'white', border: 'none', fontSize: '10px', cursor: 'pointer', outline: 'none' }}
                                >
                                    <option value="English" style={{color: 'black'}}>English</option>
                                    <option value="Tamil" style={{color: 'black'}}>Tamil (தமிழ்)</option>
                                    <option value="Hindi" style={{color: 'black'}}>Hindi (हिंदी)</option>
                                    <option value="Malayalam" style={{color: 'black'}}>Malayalam (മലയാളം)</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '24px', lineHeight: '1' }}>×</button>
                    </div>

                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#f9fafb' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    background: msg.sender === 'user' ? '#059669' : 'white',
                                    color: msg.sender === 'user' ? 'white' : '#1f2937',
                                    border: msg.sender === 'bot' ? '1px solid #e5e7eb' : 'none',
                                    maxWidth: '85%',
                                    fontSize: '14px',
                                    lineHeight: '1.4',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    whiteSpace: 'pre-wrap', 
                                    wordBreak: 'break-word'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && <div style={{ marginLeft: '10px', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>Assistant is typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* --- UPDATED INPUT AREA: MIC MOVED TO LEFT --- */}
                    <div style={{ padding: '15px', background: 'white', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        
                        {/* 1. Microphone Button (Now on the left) */}
                        <button 
                            onClick={toggleListening}
                            style={{ 
                                background: isListening ? '#1f8cf1' : '#f3f4f6', 
                                color: isListening ? 'white' : '#4b5563',
                                border: 'none', 
                                borderRadius: '50%', 
                                width: '35px', 
                                height: '35px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                transition: 'all 0.2s',
                                flexShrink: 0
                            }}
                            title="Speech to Text"
                        >
                            {isListening ? '🔴' :'🎙️'}
                        </button>

                        {/* 2. Text Input */}
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Ask in ${selectedLanguage}...`}
                            disabled={loading}
                            style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '20px', padding: '8px 15px', outline: 'none', fontSize: '14px' }}
                        />

                        {/* 3. Send Button */}
                        <button onClick={handleSend} disabled={loading} style={{ background: loading ? '#6ee7b7' : '#059669', color: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>➤</button>
                    </div>
                </div>
            )}

            <button 
                onClick={() => setIsOpen(!isOpen)} 
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#059669',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: 0 
                }}
            >
                {isOpen ? (
                    <span style={{ color: 'white', fontSize: '30px', lineHeight: '1' }}>×</span>
                ) : (
                    <img 
                        src="/static/content/ai_logo.jpg" 
                        alt="AI"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<span style="font-size: 28px; color: white;">💬</span>';
                        }}
                    />
                )}
            </button>
        </div>
    );
};

export default ChatAssistant;