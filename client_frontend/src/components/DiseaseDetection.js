import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const DiseaseDetection = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Style for the container
    const pageStyle = {
        minHeight: '89vh',
        width: '100%',
        margin: 0,
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    };

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

    // Helper to parse the markdown-like headers from Gemini
    const parseExplanation = (text) => {
        if (!text) return [];
        const sections = text.split(/##\s+/);
        return sections.filter(s => s.trim()).map(s => {
            const lines = s.split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();

            // Map icons based on title keywords
            let icon = "fa-info-circle";
            if (title.includes("Symptoms")) icon = "fa-eye";
            if (title.includes("Causes")) icon = "fa-question-circle";
            if (title.includes("Treatment")) icon = "fa-flask";

            if (title.includes("Overview")) icon = "fa-book-open";

            return { title, content, icon };
        });
    };

    return (
        <div style={pageStyle}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ padding: '20px' }}>
                    <h1 className="text-center mb-4" style={{ fontWeight: '800', color: '#1e40af' }}>
                        <i className="fas fa-leaf"></i> Plant Disease Detection
                    </h1>

                    <div className="d-flex flex-column gap-3">
                        <input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="form-control"
                            accept="image/*"
                        />

                        {selectedFile && (
                            <div className="mt-2 text-center">
                                <div style={{
                                    border: '2px dashed #9fabb9ff',
                                    borderRadius: '12px',
                                    padding: '10px',
                                    backgroundColor: '#f8fafc',
                                    display: 'inline-block',
                                    position: 'relative'
                                }}>
                                    <img
                                        src={URL.createObjectURL(selectedFile)}
                                        alt="Selected Plant"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '280px',
                                            borderRadius: '8px',
                                            display: 'block',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <span className="badge bg-dark mt-2" style={{ opacity: 0.8 }}>
                                        Selected Image
                                    </span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            className="btn btn-primary btn-lg w-100 mt-2"
                            disabled={loading}
                            style={{ backgroundColor: '#2563eb', border: 'none', fontWeight: '600' }}
                        >
                            {loading ? (
                                <span>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Analyzing...
                                </span>
                            ) : "Analyze Plant Health"}
                        </button>
                    </div>
                </div>

                {result && result.status === "success" && (
                    <div className="mt-4 animate__animated animate__fadeIn">

                        {/* Diagnosis Header Banner */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                            padding: '22px 30px',
                            borderRadius: '20px 20px 0 0',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div>
                                <small style={{ opacity: 0.75, textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.75rem' }}>
                                    <i className="fas fa-robot" style={{ marginRight: '6px' }}></i>AI Diagnosis
                                </small>
                                <h2 style={{ margin: '4px 0 0', fontWeight: '800', textTransform: 'capitalize', fontSize: '1.5rem' }}>
                                    {result.disease}
                                </h2>
                            </div>
                            <span style={{
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                padding: '6px 16px',
                                borderRadius: '30px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}>
                                {result.confidence} Confidence
                            </span>
                        </div>

                        {/* Single Unified Card Body */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '0 0 20px 20px',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                            overflow: 'hidden'
                        }}>
                            {parseExplanation(result.ai_explanation).map((section, idx, arr) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    padding: '18px 24px',
                                    borderBottom: idx < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    gap: '16px'
                                }}>
                                    {/* Icon + Title column */}
                                    <div style={{ width: '160px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '2px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            backgroundColor: '#eff6ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#2563eb',
                                            flexShrink: 0
                                        }}>
                                            <i className={`fas ${section.icon}`} style={{ fontSize: '0.85rem' }}></i>
                                        </div>
                                        <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1e40af', lineHeight: '1.2' }}>
                                            {section.title}
                                        </span>
                                    </div>

                                    {/* Content column */}
                                    <div style={{
                                        flex: 1,
                                        color: '#374151',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6'
                                    }}>
                                        <ReactMarkdown components={{
                                            ul: ({ node, ...props }) => <ul style={{ margin: '4px 0', paddingLeft: '18px' }} {...props} />,
                                            li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }} {...props} />,
                                            p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />,
                                            strong: ({ node, ...props }) => <strong style={{ color: '#111827' }} {...props} />
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