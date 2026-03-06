import React, { useState } from 'react';

const PredictionComponent = () => {
    const [category, setCategory] = useState('');
    const [variety, setVariety] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // EXACT KEYS matching your backend/app.py COMMODITY_PRICE_RANGES
    const varieties = {
        pulses: [
            "Arhar (Tur/Red Gram)(Whole)",
            "Bengal Gram (Gram)(Whole)",
            "Bengal Gram Dal (Chana Dal)",
            "Black Gram (Urd Beans)(Whole)",
            "Black Gram Dal (Urd Dal)",
            "Green Gram (Moong)(Whole)",
            "Green Gram Dal (Moong Dal)",
            "Kabuli Chana (Chickpeas-White)",
            "Kulthi (Horse Gram)",
            "Moath Dal"
        ],
        vegetables: [
            "Ashgourd",
            "Broad Beans",
            "Bitter Gourd",
            "Bottle Gourd",
            "Brinjal",
            "Cabbage",
            "Carrot",
            "Capsicum",
            "Cluster Beans",
            "Coriander (Leaves)",
            "Cauliflower",
            "Drumstick",
            "Green Chilli",
            "Onion",
            "Potato",
            "Pumpkin",
            "Raddish",
            "Snakeguard",
            "Sweet Potato",
            "Tomato"
        ]
    };

    const getPrediction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Updated URL to match your app.py @app.route('/predict')
            const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category: category,
                    variety: variety
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Accesses the 'daily_predictions' array from your Flask response
                setPredictions(data.daily_predictions || []);
            } else {
                setError(data.error || "Failed to fetch data");
                setPredictions([]);
            }
        } catch (err) {
            setError("Server connection failed. Check if app.py is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="prediction-container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                marginBottom: '40px'
            }}>
                <h1 style={{
                    textAlign: 'center', color: '#1e40af', marginBottom: '30px',
                    fontWeight: '800', maxWidth: '900px'
                }}><i className="fas fa-chart-line"></i> Commodity Price Forecast</h1>

                <form onSubmit={getPrediction} style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    {/* Category Selection */}
                    <select
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setVariety(''); // Reset variety when category changes
                        }}
                        required
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', minWidth: '200px' }}
                    >
                        <option value="">Select Category</option>
                        <option value="pulses">Pulses</option>
                        <option value="vegetables">Vegetables</option>
                    </select>

                    {/* Dynamic Variety Selection based on Category */}
                    <select
                        value={variety}
                        onChange={(e) => setVariety(e.target.value)}
                        disabled={!category}
                        required
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', minWidth: '200px' }}
                    >
                        <option value="">Select a Variety</option>
                        {category && varieties[category].map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                        className="tab-button"
                        style={{
                            padding: '12px 30px',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)'
                        }}
                    >
                        {loading ? "Predicting..." : "Get 7-Day Forecast"}
                    </button>
                </form>
            </div>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            {/* Prediction Cards Grid */}
            <div className="prediction-results" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '20px'
            }}>
                {predictions.map((item, index) => (
                    <div key={index} className="prediction-card" style={{
                        border: item.Type === 'Today Price' ? '2px solid #27ae60' : '1px solid #ddd',
                        padding: '20px',
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        position: 'relative'
                    }}>
                        {item.Type === 'Today Price' && (
                            <span style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '10px',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                padding: '2px 10px',
                                borderRadius: '10px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                            }}>LIVE</span>
                        )}
                        <h3 style={{ marginTop: 0, color: item.Type === 'Today Price' ? '#27ae60' : '#1e40af' }}>{item.Day}</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}><strong>Date:</strong> {item.Date}</p>
                        <p style={{ fontSize: '1.2rem', margin: '15px 0', color: '#2c3e50' }}>
                            <strong>Price:</strong> ₹{item.Predicted_Price_Per_kg}/kg
                        </p>
                        <hr style={{ border: '0', borderTop: '1px solid #eee' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <small style={{ color: '#888' }}>{item.Predicted_Modal_Price_Quintal} / quintal</small>
                            <small style={{
                                color: item.Type === 'Today Price' ? '#27ae60' : '#f39c12',
                                fontWeight: '600'
                            }}>{item.Type}</small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PredictionComponent;