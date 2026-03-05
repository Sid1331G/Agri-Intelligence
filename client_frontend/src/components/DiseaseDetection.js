import React, { useState } from 'react';
import axios from 'axios';

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

    return (
        <div style={pageStyle}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <div style={{ padding: '20px' }}>
                    <h1 className="text-center mb-4" style={{ fontWeight: '800', color: '#1e40af' }}><i class="fas fa-leaf"></i> Plant Disease Detection
                    </h1>

                    <div className="d-flex flex-column gap-3">
                        <input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="form-control"
                            accept="image/*"
                        />

                        {/* --- PROFESSIONAL IMAGE PREVIEW SECTION --- */}
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
                        {/* ----------------------------------------- */}

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
                    <div className="mt-4 p-4 rounded shadow-lg animate__animated animate__fadeIn" style={{
                        backgroundColor: 'rgba(255, 254, 254, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        borderRadius: '20px'
                    }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="text-capitalize mb-0" style={{ color: '#1e293b', fontWeight: '800' }}>
                                Diagnosis: {result.disease}
                            </h3>
                            <span className="badge bg-success p-2" style={{ fontSize: '0.9rem' }}>
                                Confidence: {result.confidence}
                            </span>
                        </div>
                        <hr />
                        <div style={{ whiteSpace: 'pre-wrap', color: '#475569', lineHeight: '1.6' }}>
                            {result.ai_explanation}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseDetection;