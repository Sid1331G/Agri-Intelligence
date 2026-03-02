import React, { useState } from 'react';
import axios from 'axios';

const DiseaseDetection = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Style for the full-page background
    const pageStyle = {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url('/static/content/background_image.jpg')`, // Replace with your actual image path
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh', // Ensures it covers the full viewport height
        width: '100%',
        margin: 0,
        padding: '50px 20px',
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
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="card p-5 shadow-lg border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: '15px' }}>
                    <h1 className="text-center mb-4" style={{ fontWeight: '700', color: '#1f2937' }}>
                        Plant Disease Detection
                    </h1>
                    
                    <div className="d-flex flex-column gap-3">
                        <input 
                            type="file" 
                            onChange={(e) => setSelectedFile(e.target.files[0])} 
                            className="form-control" 
                            accept="image/*"
                        />
                        <button 
                            onClick={handleUpload} 
                            className="btn btn-primary btn-lg w-100"
                            disabled={loading}
                            style={{ backgroundColor: '#2563eb', border: 'none' }}
                        >
                            {loading ? "Analyzing..." : "Analyze Plant Health"}
                        </button>
                    </div>
                </div>
                
                {result && result.status === "success" && (
                    <div className="mt-4 p-4 bg-white border-0 rounded shadow-lg">
                        <h3 className="text-capitalize">Diagnosis: {result.disease}</h3>
                        <p className="badge bg-success">Confidence: {result.confidence}</p>
                        <hr />
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                            {result.ai_explanation}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseDetection;