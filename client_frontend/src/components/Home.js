import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div id="about" className="tab-content active" style={{ display: 'block', padding: '20px' }}>
            {/* Hero Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1><i className="fas fa-seedling"></i> Welcome to PANDAM VILAI</h1>
                <p style={{ fontSize: 'x-large', color: '#275045ff' }}>Empowering Agriculture with Predictive Market Intelligence</p>
            </div>

            {/* About Section - Expanded Content */}
            <div className="sub-tab-content1 active">
                <h1><i className="fas fa-info-circle"></i> About PANDAM VILAI</h1>
                <p style={{ fontSize: 'large', color: '#223b34ff', textIndent: '30px', textAlign: 'justify' }}>
                    PANDAM VILAI is a cutting-edge agricultural market intelligence platform that delivers accurate price predictions for agri-horticultural commodities, empowering farmers, traders, policymakers, and consumers with the tools needed for smarter, data-driven decisions.
                    By forecasting prices up to 5 weeks in advance, our platform transforms agricultural commerce through predictive analytics and intuitive design. Our process integrates historical market trends with sophisticated machine learning to ensure stakeholders have access to real-time crop images to identify diseases using our deep learning model and receive immediate chemical or organic treatment plans and intelligent conversational support at every stage of the cultivation cycle.
                </p>
            </div>

            {/* Features Section - What We Offer */}
            <div className="sub-tab-content1 active">
                <h1><i className="fas fa-gifts"></i> What We Offer</h1>

                {/* 1. Price Prediction */}
                <div className="feature-card">
                    <img src="/static/content/a_prediction_resized.jpg" alt="Prediction Image" style={{ width: '40%', borderRadius: '10px' }} />
                    <div className="feature-icon"><i className="fas fa-chart-line"></i></div>
                    <div className="feature-content">
                        <h3>Advanced Price Predictions</h3>
                        <p>Leverages machine learning models to analyze historical data and forecast commodity prices up to 10 weeks ahead.</p>
                        <Link to="/prediction" className="tab-button blue" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                            Try Prediction <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>

                {/* 2. Market Insights 
                <div className="feature-card">
                    <img src="/static/content/insight.jpg" alt="Insight Image" style={{ width: '40%', borderRadius: '10px' }} />
                    <div className="feature-icon"><i className="fas fa-lightbulb"></i></div>
                    <div className="feature-content">
                        <h3>Comprehensive Market Insights</h3>
                        <p>Provides detailed information on various pulses and vegetables, including their varieties, scientific names, and growing seasons.</p>
                        <Link to="/insight" className="tab-button blue" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                            Explore Insights <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>*/}

                {/* 3. Plant Disease Detection (New Process) */}
                <div className="feature-card">
                    <img src="/static/content/disease_detection.jpg" alt="Disease Detection Image" style={{ width: '40%', borderRadius: '10px' }} />
                    <div className="feature-icon"><i className="fas fa-microscope"></i></div>
                    <div className="feature-content">
                        <h3>Plant Disease Identification</h3>
                        <p>Upload crop images to identify diseases using our deep learning model and receive immediate chemical or organic treatment plans.</p>
                        <Link to="/disease-detection" className="tab-button blue" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                            Detect Disease <i className="fas fa-search"></i>
                        </Link>
                    </div>
                </div>

                {/* 4. AI Agri-Assistant (New Process) */}
                <div className="feature-card">
                    <img src="/static/content/Ai_Assistance.jpg" alt="AI Assistant Image" style={{ width: '40%', borderRadius: '10px' }} />
                    <div className="feature-icon"><i className="fas fa-robot"></i></div>
                    <div className="feature-content">
                        <h3>Smart AI Agri-Assistant</h3>
                        <p>Get instant agricultural advice on fertilizer use, irrigation, and farming best practices from our Gemini-powered AI assistant.</p>
                        <Link to="/assistant" className="tab-button blue" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                            Ask Assistant <i className="fas fa-comments"></i>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;