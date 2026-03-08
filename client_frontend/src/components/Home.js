import React from 'react';
import { Link } from 'react-router-dom';


const Home = () => {
    return (
        <div id="about" className="tab-content active" style={{ display: 'block', padding: '0' }}>

            {/* ══ HERO — two-column layout ══ */}
            <section className="home-hero-section" style={s.heroSection}>

                {/* LEFT PANEL */}
                <div className="home-hero-left" style={s.heroLeft}>
                    <span style={s.heroBadge}>
                        <span style={s.heroBadgeDot} />
                        AI-Powered Agri Intelligence
                    </span>

                    <h1 style={s.heroHeading}>
                        Predict.<br />
                        Detect.<br />
                        <span style={s.heroAccent}>Grow Smarter.</span>
                    </h1>

                    <p style={s.heroSubtext}>
                        AI-powered price forecasting and crop disease detection —
                        giving every farmer a real competitive edge.
                    </p>

                    <div className="home-ctas" style={s.heroCTAs}>
                        <Link to="/prediction" style={s.ctaPrimary}>
                            Start Predicting →
                        </Link>
                        <Link to="/disease-detection" style={s.ctaSecondary}>
                            Detect Disease
                        </Link>
                    </div>

                    <div className="home-stats-row" style={s.statsRow}>
                        {[
                            { num: '7 Days', label: 'Forecast Range' },
                            { num: 'AI',   label: 'Disease Model' },
                            { num: '24/7', label: 'Support' },
                        ].map((st, i) => (
                            <div key={i} style={s.statBlock}>
                                <span style={s.statNum}>{st.num}</span>
                                <span style={s.statLabel}>{st.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT PANEL — Video */}
                <div className="home-hero-right" style={s.heroRight}>
                    <div style={s.videoCard}>
                        {/* Eyebrow */}
                        <div style={s.videoEyebrow}>
                            <span style={s.videoLiveDot} />
                            Agricultural Intelligence
                        </div>

                        {/* Video wrapper */}
                        <div style={s.videoWrap}>
                            <video
                                style={s.video}
                                autoPlay
                                muted
                                loop
                                playsInline
                                poster="/static/content/video_poster.jpg"
                            >
                                <source src="/static/content/agri_intro.mp4" type="video/mp4" />
                            </video>

                            {/* Overlay gradient at bottom */}
                            <div style={s.videoOverlay} />

                            {/* Bottom caption */}
                            <div style={s.videoCaption}>
                                <i className="fas fa-seedling" style={{ color: '#34d399', marginRight: '7px' }} />
                                Empowering farmers with AI-driven insights
                            </div>
                        </div>

                        {/* Stats strip below video */}
                        <div className="home-video-stats" style={s.videoStats}>
                            {[
                                { icon: 'fa-chart-line', label: 'Price Forecasting',    val: '7 Days' },
                                { icon: 'fa-leaf',       label: 'Disease Detection',    val: 'AI Model' },
                                { icon: 'fa-robot',      label: 'Agri Assistant',       val: '24 / 7'   },
                            ].map((st, i) => (
                                <div key={i} style={s.videoStat}>
                                    <div style={s.videoStatIcon}>
                                        <i className={`fas ${st.icon}`} style={{ fontSize: '12px', color: '#34d399' }} />
                                    </div>
                                    <div>
                                        <div style={s.videoStatVal}>{st.val}</div>
                                        <div style={s.videoStatLabel}>{st.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* ══ PLATFORM FEATURES COVER SECTION ══ */}
            <section className="home-feature-section" style={s.featureSection}>
                <div style={s.featureSectionInner}>

                    {/* Section header */}
                    <div style={s.sectionHeader}>
                        <span style={s.sectionEyebrow}>What We Offer</span>
                        <h2 style={s.sectionTitle}>Platform Features</h2>
                    </div>

                    {/* Cards grid */}
                    <div className="home-feature-grid" style={s.featureGrid}>
                        {[
                            {
                                img:   '/static/content/a_prediction_resized.jpg',
                                alt:   'Prediction',
                                tag:   'FORECASTING',
                                icon:  'fa-chart-line',
                                title: 'Advanced Price Predictions',
                                desc:  'Leverages machine learning models to analyze historical data and forecast commodity prices up to  7 Days.',
                                link:  '/prediction',
                                cta:   'Try Prediction',
                            },
                            {
                                img:   '/static/content/disease_detection.jpg',
                                alt:   'Disease Detection',
                                tag:   'DEEP LEARNING',
                                icon:  'fa-microscope',
                                title: 'Plant Disease Identification',
                                desc:  'Upload crop images to identify diseases using our deep learning model and receive immediate chemical or organic treatment plans.',
                                link:  '/disease-detection',
                                cta:   'Detect Disease',
                            },
                            {
                                img:   '/static/content/Ai_Assistance.jpg',
                                alt:   'AI Assistant',
                                tag:   'AI ASSISTANT',
                                icon:  'fa-robot',
                                title: 'Smart AI Agri-Assistant',
                                desc:  'Get instant agricultural advice on fertilizer use, irrigation, and farming best practices from our Gemini-powered AI assistant.',
                                link:  '/assistant',
                                cta:   'Ask Assistant',
                            },
                        ].map((card, idx) => (
                            <div key={idx} style={s.featureCard}>
                                {/* Image */}
                                <div style={s.featureImgWrap}>
                                    <img src={card.img} alt={card.alt} style={s.featureImg} />
                                    <span style={s.featureTag}>{card.tag}</span>
                                </div>
                                {/* Body */}
                                <div style={s.featureBody}>
                                    <div style={s.featureCardHeader}>
                                        <div style={s.featureIcon}>
                                            <i className={`fas ${card.icon}`} style={{ fontSize: '14px', color: '#34d399' }} />
                                        </div>
                                        <h3 style={s.featureTitle}>{card.title}</h3>
                                    </div>
                                    <p style={s.featureDesc}>{card.desc}</p>
                                    <Link to={card.link} style={s.featureLink}>{card.cta} →</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

/* ── Inline styles ─────────────────────────────────── */
const s = {
    heroSection: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100vh',
        paddingTop: '-25px',          /* offset for fixed navbar */
        background: 'linear-gradient(160deg, #06151052 0%, #2024236e 100%)',
        borderRadius: '20px',
    },

    /* Left */
    heroLeft: {
        padding: '0px 20px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRight: '1px solid #2024236e 80%',
    },
    heroBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        background: 'rgba(52,211,153,0.1)',
        border: '1px solid rgba(52,211,153,0.25)',
        color: '#6ee7b7',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '1.4px',
        textTransform: 'uppercase',
        padding: '5px 12px',
        borderRadius: '20px',
        marginBottom: '28px',
        width: 'fit-content',
    },
    heroBadgeDot: {
        width: '6px', height: '6px',
        borderRadius: '50%',
        background: '#34d399',
        flexShrink: 0,
        boxShadow: '0 0 8px #34d399',
    },
    heroHeading: {
        fontFamily: "'Syne', sans-serif",
        fontSize: 'clamp(34px, 4vw, 50px)',
        fontWeight: '800',
        lineHeight: '1.08',
        color: '#e8f5f0',
        margin: '0 0 22px',
        letterSpacing: '-1px',
    },
    heroAccent: { color: '#34d399' },
    heroSubtext: {
        fontSize: '14px',
        color: '#7aab93',
        lineHeight: '1.7',
        maxWidth: '400px',
        margin: '0 0 34px',
    },
    heroCTAs: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '48px',
    },
    ctaPrimary: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '13px 26px',
        background: '#1db87a',
        color: '#fff',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: '700',
        fontSize: '14px',
        borderRadius: '8px',
        textDecoration: 'none',
        boxShadow: '0 6px 20px rgba(29,184,122,0.35)',
        transition: 'all 0.22s ease',
        letterSpacing: '0.2px',
    },
    ctaSecondary: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '13px 26px',
        background: 'rgba(255,255,255,0.06)',
        color: '#c8e6d8',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: '600',
        fontSize: '14px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        textDecoration: 'none',
        transition: 'all 0.22s ease',
    },
    statsRow: {
        display: 'flex',
        gap: '0',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingTop: '28px',
    },
    statBlock: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        paddingRight: '20px',
    },
    statNum: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '26px',
        fontWeight: '800',
        color: '#12d865',
        lineHeight: 1,
        marginBottom: '5px',
    },
    statLabel: {
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '1.1px',
        textTransform: 'uppercase',
        color: '#0bd878',
    },

    /* Right — video panel */
    heroRight: {
        padding: '36px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: '#11131200 50%',
        borderRadius: '20px',
    },
    videoCard: {
        background: '#0a1f18',
        border: '1px solid rgba(52,211,153,0.15)',
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    },
    videoEyebrow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '13px 18px',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '1.6px',
        textTransform: 'uppercase',
        color: '#34d399',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        fontFamily: "'DM Sans', sans-serif",
    },
    videoLiveDot: {
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: '#34d399',
        boxShadow: '0 0 8px #34d399',
        flexShrink: 0,
    },
    videoWrap: {
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        background: '#061510',
        overflow: 'hidden',
    },
    video: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    videoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'linear-gradient(to top, rgba(10,31,24,0.95), transparent)',
        pointerEvents: 'none',
    },
    videoCaption: {
        position: 'absolute',
        bottom: '10px',
        left: '14px',
        fontSize: '11px',
        fontWeight: '600',
        color: '#6ee7b7',
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.3px',
    },
    videoStats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
    },
    videoStat: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 14px',
        borderRight: '1px solid rgba(255,255,255,0.06)',
    },
    videoStatIcon: {
        width: '30px',
        height: '30px',
        borderRadius: '8px',
        background: 'rgba(52,211,153,0.1)',
        border: '1px solid rgba(52,211,153,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    videoStatVal: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '13px',
        fontWeight: '800',
        color: '#e8f5f0',
        lineHeight: 1,
        marginBottom: '3px',
    },
    videoStatLabel: {
        fontSize: '9px',
        fontWeight: '700',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        color: '#4d7a65',
    },

    /* Feature cover section */
    featureSection: {
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #06151052 0%, #2024236e 100%)',
        padding: '80px 32px 100px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '20px',
    },
    featureSectionInner: {
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
    },
    sectionHeader: {
        marginBottom: '48px',
    },
    sectionEyebrow: {
        display: 'block',
        fontFamily: "'Syne', sans-serif",
        fontSize: '20px',
        fontWeight: '700',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: '#05eb96ff',
        marginBottom: '10px',
    },
    sectionTitle: {
        fontFamily: "'Syne', sans-serif",
        fontSize: 'clamp(28px, 4vw, 46px)',
        fontWeight: '800',
        color: '#e8f5f0',
        margin: 0,
        letterSpacing: '-0.8px',
        lineHeight: 1.1,
    },
    featureGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
    },
    featureCard: {
        background: '#0a1f18',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.25s ease',
    },
    featureImgWrap: {
        position: 'relative',
        width: '100%',
        height: '220px',
        overflow: 'hidden',
        flexShrink: 0,
    },
    featureImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    featureTag: {
        position: 'absolute',
        top: '14px',
        left: '14px',
        background: 'rgba(6,21,16,0.82)',
        border: '1px solid rgba(52,211,153,0.3)',
        color: '#34d399',
        fontSize: '9px',
        fontWeight: '800',
        letterSpacing: '1.4px',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: '20px',
        backdropFilter: 'blur(6px)',
    },
    featureBody: {
        padding: '22px 22px 24px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    featureCardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '14px',
    },
    featureIcon: {
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: 'rgba(52,211,153,0.1)',
        border: '1px solid rgba(52,211,153,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    featureTitle: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '16px',
        fontWeight: '800',
        color: '#e8f5f0',
        margin: 0,
        lineHeight: '1.25',
        letterSpacing: '-0.2px',
    },
    featureDesc: {
        fontSize: '13px',
        color: '#7aab93',
        lineHeight: '1.7',
        margin: '0 0 20px',
        flex: 1,
    },
    featureLink: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#34d399',
        textDecoration: 'none',
        letterSpacing: '0.3px',
        marginTop: 'auto',
        transition: 'color 0.2s',
    },
};

export default Home;