import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const DiseaseDetection = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!selectedFile) return alert("Please select an image");
        const formData = new FormData();
        formData.append('file', selectedFile);
        setLoading(true);
        setResult(null);
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/detect_disease', formData);
            setResult(response.data);
        } catch (error) {
            console.error("Detection Error:", error);
            alert("Error analyzing image.");
        } finally {
            setLoading(false);
        }
    };

    const parseExplanation = (text) => {
        if (!text) return [];
        const sections = text.split(/##\s+/);
        return sections.filter(s => s.trim()).map(s => {
            const lines = s.split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            let icon = "fa-info-circle";
            if (title.includes("Symptoms")) icon = "fa-eye";
            if (title.includes("Causes"))   icon = "fa-question-circle";
            if (title.includes("Treatment")) icon = "fa-flask";
            if (title.includes("Overview")) icon = "fa-book-open";
            return { title, content, icon };
        });
    };

    return (
        <div style={{
            minHeight: '89vh', width: '100%', margin: 0,
            padding: '40px 24px', display: 'flex',
            flexDirection: 'column', alignItems: 'center',
        }}>
            <div style={{ width: '100%', maxWidth: '860px' }}>

                {/* Upload card */}
                <div style={{
                    background: '#193d3093',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '20px',
                    padding: '36px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    marginBottom: '28px',
                }}>
                    {/* Title */}
                    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                        <span style={{
                            display: 'inline-block', fontSize: '10px', fontWeight: '700',
                            letterSpacing: '1.6px', textTransform: 'uppercase',
                            color: '#34d399', marginBottom: '10px',
                        }}>
                            Deep Learning
                        </span>
                        <h1 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: 'clamp(20px, 3vw, 28px)',
                            fontWeight: '800', color: '#e8f5f0',
                            margin: 0, letterSpacing: '-0.3px',
                        }}>
                            <i className="fas fa-leaf" style={{ color: '#34d399', marginRight: '10px' }} />
                            Plant Disease Detection
                        </h1>
                    </div>

                    {/* File input */}
                    <label style={{
                        display: 'block',
                        border: '1px dashed rgba(52,211,153,0.25)',
                        borderRadius: '12px',
                        padding: '28px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'rgba(52,211,153,0.03)',
                        marginBottom: '20px',
                        transition: 'border-color 0.2s',
                    }}>
                        <i className="fas fa-cloud-upload-alt" style={{
                            fontSize: '28px', color: '#34d399', display: 'block', marginBottom: '10px',
                        }} />
                        <p style={{ margin: '0 0 6px', color: '#e8f5f0', fontWeight: '600', fontSize: '14px' }}>
                            {selectedFile ? selectedFile.name : 'Click to upload plant image'}
                        </p>
                        <p style={{ margin: 0, color: '#4d7a65', fontSize: '12px' }}>
                            JPG, PNG, WEBP accepted
                        </p>
                        <input type="file" accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            style={{ display: 'none' }} />
                    </label>

                    {/* Image preview */}
                    {selectedFile && (
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{
                                display: 'inline-block',
                                border: '1px solid rgba(52,211,153,0.2)',
                                borderRadius: '12px',
                                padding: '8px',
                                background: 'rgba(52,211,153,0.04)',
                            }}>
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Selected Plant"
                                    style={{
                                        maxWidth: '100%', maxHeight: '260px',
                                        borderRadius: '8px', display: 'block',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                    }}
                                />
                                <span style={{
                                    display: 'inline-block', marginTop: '8px',
                                    background: 'rgba(52,211,153,0.12)',
                                    border: '1px solid rgba(52,211,153,0.2)',
                                    color: '#6ee7b7', fontSize: '11px',
                                    fontWeight: '700', padding: '3px 10px',
                                    borderRadius: '6px', letterSpacing: '0.5px',
                                }}>
                                    Preview
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Analyze button */}
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px',
                            background: loading ? '#1a2e26' : '#1db87a',
                            color: 'white', border: 'none',
                            borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '700', fontSize: '14px',
                            fontFamily: "'DM Sans', sans-serif",
                            letterSpacing: '0.3px',
                            boxShadow: loading ? 'none' : '0 6px 20px rgba(29,184,122,0.3)',
                            opacity: loading ? 0.6 : 1,
                            transition: 'all 0.22s',
                        }}
                    >
                        {loading
                            ? <span><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />Analyzing...</span>
                            : <span><i className="fas fa-microscope" style={{ marginRight: '8px' }} />Analyze Plant Health</span>
                        }
                    </button>
                </div>

                {/* Results */}
                {result && result.status === "success" && (
                    <div style={{ animation: 'fadeUp 0.4s ease' }}>

                        {/* Diagnosis header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #0d2820, #061510)',
                            border: '1px solid rgba(52,211,153,0.2)',
                            borderBottom: 'none',
                            padding: '22px 28px',
                            borderRadius: '16px 16px 0 0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div>
                                <small style={{
                                    fontSize: '10px', fontWeight: '700',
                                    letterSpacing: '1.4px', textTransform: 'uppercase',
                                    color: '#4d7a65',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                }}>
                                    <i className="fas fa-robot" style={{ color: '#34d399' }} />
                                    AI Diagnosis
                                </small>
                                <h2 style={{
                                    fontFamily: "'Syne', sans-serif",
                                    margin: '6px 0 0',
                                    fontWeight: '800',
                                    textTransform: 'capitalize',
                                    fontSize: '22px',
                                    color: '#e8f5f0',
                                    letterSpacing: '-0.2px',
                                }}>
                                    {result.disease}
                                </h2>
                            </div>
                            <span style={{
                                background: 'rgba(52,211,153,0.12)',
                                border: '1px solid rgba(52,211,153,0.25)',
                                color: '#34d399',
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '700',
                                letterSpacing: '0.3px',
                                flexShrink: 0,
                            }}>
                                {result.confidence} Confidence
                            </span>
                        </div>

                        {/* Explanation sections */}
                        <div style={{
                            background: '#0a1f18',
                            border: '1px solid rgba(52,211,153,0.15)',
                            borderTop: 'none',
                            borderRadius: '0 0 16px 16px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
                        }}>
                            {parseExplanation(result.ai_explanation).map((section, idx, arr) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    padding: '18px 24px',
                                    borderBottom: idx < arr.length - 1
                                        ? '1px solid rgba(255,255,255,0.05)'
                                        : 'none',
                                    gap: '16px',
                                }}>
                                    {/* Icon + label */}
                                    <div style={{
                                        width: '150px', flexShrink: 0,
                                        display: 'flex', alignItems: 'center',
                                        gap: '10px', paddingTop: '2px',
                                    }}>
                                        <div style={{
                                            width: '32px', height: '32px',
                                            borderRadius: '8px',
                                            background: 'rgba(52,211,153,0.1)',
                                            border: '1px solid rgba(52,211,153,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#34d399', flexShrink: 0,
                                        }}>
                                            <i className={`fas ${section.icon}`} style={{ fontSize: '13px' }} />
                                        </div>
                                        <span style={{
                                            fontWeight: '700', fontSize: '12px',
                                            color: '#6ee7b7', lineHeight: '1.2',
                                            fontFamily: "'DM Sans', sans-serif",
                                        }}>
                                            {section.title}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div style={{
                                        flex: 1, color: '#8fbfaa',
                                        fontSize: '13.5px', lineHeight: '1.65',
                                    }}>
                                        <ReactMarkdown components={{
                                            ul: ({ node, ...props }) => <ul style={{ margin: '4px 0', paddingLeft: '18px' }} {...props} />,
                                            li: ({ node, ...props }) => <li style={{ marginBottom: '4px', color: '#8fbfaa' }} {...props} />,
                                            p: ({ node, ...props }) => <p style={{ margin: 0, color: '#8fbfaa' }} {...props} />,
                                            strong: ({ node, ...props }) => <strong style={{ color: '#e8f5f0' }} {...props} />,
                                        }}>{section.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseDetection;