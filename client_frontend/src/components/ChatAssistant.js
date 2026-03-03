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
                    width: '320px', // Fixed small width
                    height: '450px', // Adjusted height
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    marginBottom: '15px',
                    border: '1px solid #e5e7eb',
                    transform: 'scale(0.95)', // Subtle professional scaling
                    transformOrigin: 'bottom right'
                }}>
                    <div style={{ background: '#059669', color: 'white', padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Agri-Assistant</h4>
                                <select 
                                    value={selectedLanguage} 
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    style={{ background: 'transparent', color: 'white', border: 'none', fontSize: '10px', cursor: 'pointer', outline: 'none', opacity: '0.9' }}
                                >
                                    <option value="English" style={{color: 'black'}}>English</option>
                                    <option value="Tamil" style={{color: 'black'}}>Tamil</option>
                                    <option value="Hindi" style={{color: 'black'}}>Hindi</option>
                                    <option value="Malayalam" style={{color: 'black'}}>Malayalam</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>×</button>
                    </div>

                    <div style={{ flex: 1, padding: '12px', overflowY: 'auto', background: '#f9fafb' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                                <div style={{
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    background: msg.sender === 'user' ? '#059669' : 'white',
                                    color: msg.sender === 'user' ? 'white' : '#374151',
                                    border: msg.sender === 'bot' ? '1px solid #e5e7eb' : 'none',
                                    maxWidth: '85%',
                                    fontSize: '13px',
                                    lineHeight: '1.4',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && <div style={{ marginLeft: '10px', fontSize: '11px', color: '#9ca3af' }}>Thinking...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: '12px', background: 'white', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                            onClick={toggleListening}
                            style={{ 
                                background: isListening ? '#ef4444' : '#f3f4f6', 
                                color: isListening ? 'white' : '#6b7280',
                                border: 'none', 
                                borderRadius: '50%', 
                                width: '32px', height: '32px', 
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px', transition: 'all 0.2s', flexShrink: 0
                            }}
                        >
                            {isListening ? '⏹️' :'🎙️'}
                        </button>

                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            disabled={loading}
                            style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '18px', padding: '6px 12px', outline: 'none', fontSize: '13px' }}
                        />

                        <button onClick={handleSend} disabled={loading} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>➤</button>
                    </div>
                </div>
            )}

            <button 
                onClick={() => setIsOpen(!isOpen)} 
                style={{
                    width: '56px', height: '56px',
                    borderRadius: '50%',
                    background: '#059669',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', padding: 0 
                }}
            >
                {isOpen ? (
                    <span style={{ color: 'white', fontSize: '24px' }}>×</span>
                ) : (
                    <img 
                        src="/static/content/ai_logo.jpg" 
                        alt="AI"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '💬';
                        }}
                    />
                )}
            </button>
        </div>
    );
};

export default ChatAssistant;