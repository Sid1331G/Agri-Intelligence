import React, { useState } from 'react';
import API_BASE_URL from '../apiConfig';

const PredictionComponent = () => {
    const [category, setCategory] = useState('');
    const [variety, setVariety] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const varieties = {
        pulses: [
            "Arhar (Tur/Red Gram)(Whole)", "Bengal Gram (Gram)(Whole)",
            "Bengal Gram Dal (Chana Dal)", "Black Gram (Urd Beans)(Whole)",
            "Black Gram Dal (Urd Dal)", "Green Gram (Moong)(Whole)",
            "Green Gram Dal (Moong Dal)", "Kabuli Chana (Chickpeas-White)",
            "Kulthi (Horse Gram)", "Moath Dal"
        ],
        vegetables: [
            "Ashgourd", "Broad Beans", "Bitter Gourd", "Bottle Gourd", "Brinjal",
            "Cabbage", "Carrot", "Capsicum", "Cluster Beans", "Coriander (Leaves)",
            "Cauliflower", "Drumstick", "Green Chilli", "Onion", "Potato",
            "Pumpkin", "Raddish", "Snakeguard", "Sweet Potato", "Tomato"
        ]
    };

    const getPrediction = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, variety }),
            });
            const data = await response.json();
            if (response.ok) {
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

    const selectStyle = {
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#061510',
        color: '#e8f5f0',
        fontSize: '14px',
        fontFamily: "'DM Sans', sans-serif",
        minWidth: '200px',
        outline: 'none',
        cursor: 'pointer',
    };

    return (
        <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Form card */}
            <div style={{
                background: '#0a1f18',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px',
                padding: '40px',
                marginBottom: '36px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <span style={{
                        display: 'inline-block',
                        fontSize: '10px', fontWeight: '700',
                        letterSpacing: '1.6px', textTransform: 'uppercase',
                        color: '#34d399', marginBottom: '10px',
                    }}>
                        Price Forecasting
                    </span>
                    <h1 style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 'clamp(22px, 3vw, 32px)',
                        fontWeight: '800',
                        color: '#e8f5f0',
                        margin: 0,
                        letterSpacing: '-0.4px',
                    }}>
                        <i className="fas fa-chart-line" style={{ color: '#34d399', marginRight: '10px' }} />
                        Commodity Price Forecast
                    </h1>
                </div>

                <form onSubmit={getPrediction} style={{
                    display: 'flex', gap: '12px',
                    justifyContent: 'center', flexWrap: 'wrap',
                }}>
                    <select value={category}
                        onChange={(e) => { setCategory(e.target.value); setVariety(''); }}
                        required style={selectStyle}>
                        <option value="">Select Category</option>
                        <option value="pulses">Pulses</option>
                        <option value="vegetables">Vegetables</option>
                    </select>

                    <select value={variety} onChange={(e) => setVariety(e.target.value)}
                        disabled={!category} required style={{
                            ...selectStyle,
                            opacity: !category ? 0.4 : 1,
                            cursor: !category ? 'not-allowed' : 'pointer',
                        }}>
                        <option value="">Select a Variety</option>
                        {category && varieties[category].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>

                    <button type="submit" disabled={loading} style={{
                        padding: '12px 28px',
                        background: loading ? '#1a2e26' : '#1db87a',
                        color: 'white', border: 'none',
                        borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: '700', fontSize: '14px',
                        fontFamily: "'DM Sans', sans-serif",
                        boxShadow: loading ? 'none' : '0 4px 14px rgba(29,184,122,0.3)',
                        letterSpacing: '0.3px',
                        opacity: loading ? 0.6 : 1,
                        transition: 'all 0.22s ease',
                    }}>
                        {loading
                            ? <span><i className="fas fa-spinner fa-spin" style={{ marginRight: '7px' }} />Predicting...</span>
                            : 'Get 7-Day Forecast'
                        }
                    </button>
                </form>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '10px',
                    padding: '12px 18px',
                    color: '#f87171',
                    fontSize: '14px',
                    marginBottom: '24px',
                    textAlign: 'center',
                }}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }} />
                    {error}
                </div>
            )}

            {/* Prediction Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
            }}>
                {predictions.map((item, index) => {
                    const isToday = item.Type === 'Today Price';
                    return (
                        <div key={index} style={{
                            background: isToday ? 'rgba(29,184,122,0.08)' : '#0a1f18',
                            border: isToday
                                ? '1px solid rgba(52,211,153,0.35)'
                                : '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '14px',
                            padding: '20px',
                            position: 'relative',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                        }}>
                            {isToday && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-10px', right: '14px',
                                    background: '#1db87a',
                                    color: '#fff',
                                    padding: '2px 10px',
                                    borderRadius: '10px',
                                    fontSize: '10px',
                                    fontWeight: '800',
                                    letterSpacing: '0.8px',
                                }}>LIVE</span>
                            )}

                            <h3 style={{
                                fontFamily: "'Syne', sans-serif",
                                marginTop: 0, marginBottom: '6px',
                                fontSize: '16px', fontWeight: '800',
                                color: isToday ? '#deece7' : '#e8f5f0',
                            }}>{item.Day}</h3>

                            <p style={{ fontSize: '12px', color: '#f0f0f0', margin: '0 0 14px' }}>
                                {item.Date}
                            </p>

                            <p style={{
                                fontSize: '22px', fontWeight: '800',
                                fontFamily: "'Syne', sans-serif",
                                color: '#e8f5f0', margin: '0 0 4px',
                            }}>
                                ₹{item.Predicted_Price_Per_kg}
                                <span style={{ fontSize: '12px', color: '#edf0ee', fontWeight: '500' }}>/kg</span>
                            </p>

                            <div style={{
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                marginTop: '14px', paddingTop: '12px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <small style={{ color: '#e3ebe7', fontSize: '11px' }}>
                                    {item.Predicted_Modal_Price_Quintal}/q
                                </small>
                                <small style={{
                                    color: isToday ? '#b6c0bc' : '#6ee7b7',
                                    fontWeight: '700', fontSize: '11px',
                                    background: isToday ? 'rgba(20, 82, 63, 0.97)' : 'rgba(52,211,153,0.06)',
                                    padding: '2px 8px', borderRadius: '6px',
                                }}>{item.Type}</small>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PredictionComponent;