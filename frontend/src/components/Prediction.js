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
                // Accesses the 'weekly_predictions' array from your Flask response
                setPredictions(data.weekly_predictions);
            } else {
                setError(data.error || "Failed to fetch data");
            }
        } catch (err) {
            setError("Server connection failed. Check if app.py is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="prediction-container" style={{ padding: '200px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', color: '#ffffff' }}>Commodity Price Forecast</h2>
            
            <form onSubmit={getPrediction} style={{ 
                display: 'flex', 
                gap: '15px', 
                justifyContent: 'center', 
                marginBottom: '50px',
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
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
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
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value="">Select a Variety</option>
                    {category && varieties[category].map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#27ae60', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? "Predicting..." : "Get 5-Week Forecast"}
                </button>
            </form>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            {/* Prediction Cards Grid */}
            <div className="prediction-results" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                gap: '20px' 
            }}>
                {predictions.map((item, index) => (
                    <div key={index} className="prediction-card" style={{
                        border: '1px solid #ddd',
                        padding: '20px',
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#27ae60' }}>Week {index + 1}</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}><strong>Date:</strong> {item.Date}</p>
                        <p style={{ fontSize: '1.1rem', margin: '10px 0' }}>
                            <strong>Estimated:</strong> ₹{item.Price_Per_kg}/kg
                        </p>
                        <p style={{ fontSize: '0.85rem' }}>
                            <strong>Modal Price:</strong> ₹{item.Predicted_Modal_Price}/quintal
                        </p>
                        <hr style={{ border: '0', borderTop: '1px solid #eee' }} />
                        <small style={{ color: '#888' }}>
                            Market Range: ₹{item.Min_Price} - ₹{item.Max_Price}
                        </small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PredictionComponent;