import React, { useState, useEffect } from 'react';

/* ── Inject mobile styles once ── */
const injectStyles = () => {
    const id = 'role-mobile-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
        html, body {
            overflow: hidden !important;
            height: 100% !important;
        }

        /* ── Tablet ≤ 768px ── */
        @media (max-width: 768px) {
            .role-page {
                padding-top: 0 !important;
                padding-left: 16px !important;
                padding-right: 16px !important;
            }
            .role-title { font-size: 26px !important; }
            .role-cards-row { gap: 12px !important; }
            .role-card {
                flex: 0 0 270px !important;
                width: 270px !important;
                padding: 22px 18px 20px !important;
            }
        }

        /* ── Phone ≤ 580px — stack vertically ── */
        @media (max-width: 580px) {
            .role-page {
                padding-top: 0 !important;
            }
            .role-cards-row {
                flex-direction: column !important;
                align-items: center !important;
                gap: 10px !important;
            }
            .role-card {
                flex: unset !important;
                width: 100% !important;
                max-width: 380px !important;
                padding: 18px 16px 16px !important;
                border-radius: 14px !important;
            }
            .role-continue-btn {
                width: 100% !important;
                max-width: 380px !important;
            }
        }

        /* ── Phone ≤ 480px ── */
        @media (max-width: 480px) {
            .role-page {
                padding-top: 0 !important;
                padding-left: 14px !important;
                padding-right: 14px !important;
                padding-bottom: 0 !important;
            }
            .role-header { margin-bottom: 16px !important; }
            .role-step-badge  { font-size: 10px !important; padding: 4px 12px !important; margin-bottom: 8px !important; }
            .role-title       { font-size: 22px !important; }
            .role-subtitle    { font-size: 13px !important; }
            .role-card-icon-circle { width: 44px !important; height: 44px !important; margin-bottom: 8px !important; }
            .role-card-icon-circle span { font-size: 22px !important; }
            .role-card-title  { font-size: 17px !important; }
            .role-card-subtitle { font-size: 11px !important; }
            .role-card-desc   { font-size: 12px !important; margin-bottom: 12px !important; }
            .role-select-indicator { padding: 8px !important; font-size: 12px !important; }
            .role-continue-btn { padding: 12px 24px !important; font-size: 14px !important; touch-action: manipulation !important; margin-bottom: 8px !important; }
            .role-footer-note { font-size: 11px !important; }
            .role-cards-row   { margin-bottom: 20px !important; }
        }

        /* ── Very small ≤ 360px ── */
        @media (max-width: 360px) {
            .role-title { font-size: 20px !important; }
            .role-card  { padding: 14px 12px 12px !important; }
        }
    `;
    document.head.appendChild(el);
};

const RoleSelection = ({ onRoleSelect }) => {
    const [selected, setSelected] = useState(null);

    useEffect(() => { injectStyles(); }, []);

    const roles = [
        {
            id: 'farmer',
            icon: '🌾',
            title: 'Farmer',
            subtitle: 'I grow crops on agricultural land',
            description: 'Get personalized price predictions for your crops, disease detection support, and farming advice tailored to your land and district.',
            features: ['Crop price predictions', 'Disease detection help', 'Irrigation & fertilizer tips', 'Seasonal recommendations'],
            accent: '#34d399',
            accentDim: 'rgba(52,211,153,0.12)',
            accentBorder: 'rgba(52,211,153,0.3)',
        },
        {
            id: 'dealer',
            icon: '🏪',
            title: 'Dealer',
            subtitle: 'I buy and sell agricultural commodities',
            description: 'Get market intelligence, price trend analysis, and strategic advice to make the best buying and selling decisions on your district.',
            features: ['Commodity price trends', 'Market strategy advice', 'Best buy/sell timing', 'Demand forecasting'],
            accent: '#38bdf8',
            accentDim: 'rgba(56,189,248,0.1)',
            accentBorder: 'rgba(56,189,248,0.3)',
        },
    ];

    return (
        <div className="role-page" style={s.page}>
            <div style={s.container}>

                {/* Header */}
                <div className="role-header" style={s.header}>
                    <span className="role-step-badge" style={s.stepBadge}>
                        <span style={s.stepDot} /> Step 1 of 2
                    </span> 
                    <h1 className="role-title" style={s.title}>Who are you?</h1>
                    <p className="role-subtitle" style={s.subtitle}>
                        Select your role so we can personalize your experience.
                    </p>
                </div>

                {/* Role Cards */}
                <div className="role-cards-row" style={s.cardsRow}>
                    {roles.map((role) => {
                        const isSel = selected === role.id;
                        return (
                            <div
                                key={role.id}
                                className="role-card"
                                onClick={() => setSelected(role.id)}
                                style={{
                                    ...s.card,
                                    border: isSel
                                        ? `1px solid ${role.accentBorder}`
                                        : '1px solid rgba(255,255,255,0.07)',
                                    background: isSel ? role.accentDim : '#0a1f18',
                                    boxShadow: isSel
                                        ? `0 0 0 1px ${role.accentBorder}, 0 12px 40px rgba(0,0,0,0.4)`
                                        : '0 4px 20px rgba(0,0,0,0.3)',
                                }}
                            >
                                {isSel && (
                                    <div style={{ ...s.checkmark, background: role.accent }}>✓</div>
                                )}

                                <div className="role-card-icon-circle" style={{
                                    ...s.iconCircle,
                                    background: isSel ? role.accentDim : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${isSel ? role.accentBorder : 'rgba(255,255,255,0.07)'}`,
                                }}>
                                    <span style={{ fontSize: '38px' }}>{role.icon}</span>
                                </div>

                                <h2 className="role-card-title" style={{ ...s.roleTitle, color: isSel ? role.accent : '#e8f5f0' }}>
                                    {role.title}
                                </h2>
                                <p className="role-card-subtitle" style={s.roleSubtitle}>{role.subtitle}</p>
                                <p className="role-card-desc" style={s.roleDesc}>{role.description}</p>

                                <div className="role-select-indicator" style={{
                                    ...s.selectIndicator,
                                    background: isSel ? role.accent : 'transparent',
                                    border: `1px solid ${isSel ? role.accent : 'rgba(255,255,255,0.12)'}`,
                                    color: isSel ? '#061510' : '#7aab93',
                                }}>
                                    {isSel ? '✓ Selected' : 'Select Role'}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Continue */}
                <div style={s.footer}>
                    <button
                        className="role-continue-btn"
                        onClick={() => selected && onRoleSelect(selected)}
                        disabled={!selected}
                        style={{
                            ...s.continueBtn,
                            opacity: selected ? 1 : 0.4,
                            cursor: selected ? 'pointer' : 'not-allowed',
                            background: selected ? '#1db87a' : '#1a2e26',
                            boxShadow: selected ? '0 8px 24px rgba(29,184,122,0.3)' : 'none',
                        }}
                    >
                        Continue as {selected ? (selected === 'farmer' ? '🌾 Farmer' : '🏪 Dealer') : '...'} →
                    </button>
                    <p className="role-footer-note" style={s.footerNote}>
                        You can always ask our AI assistant for help later.
                    </p>
                </div>
            </div>
        </div>
    );
};

const s = {
    page: {
        height: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '0',
        paddingBottom: '0',
        paddingLeft: '20px',
        paddingRight: '20px',
        boxSizing: 'border-box',
    },
    container: {
        width: '100%',
        maxWidth: '660px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    header: {
        textAlign: 'center',
        marginBottom: '28px',
        width: '100%',
    },
    stepBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        background: 'rgba(52,211,153,0.1)',
        border: '1px solid rgba(52,211,153,0.25)',
        color: '#6ee7b7',
        fontWeight: '700',
        fontSize: '11px',
        padding: '2px 14px',
        borderRadius: '20px',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        marginTop: '85px',
    },
    stepDot: {
        width: '6px', height: '6px',
        borderRadius: '50%',
        background: '#34d399',
        boxShadow: '0 0 6px #34d399',
        flexShrink: 0,
    },
    title: {
        fontFamily: "'Syne', sans-serif",
        fontSize: 'clamp(24px, 4vw, 42px)',
        fontWeight: '800',
        color: '#e8f5f0',
        letterSpacing: '-0.5px',
        margin: '8px 0 8px',
    },
    subtitle: {
        fontSize: '15px',
        color: '#cae4d7',
        margin: '0 0 0',
        lineHeight: '1.6',
    },
    cardsRow: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        marginBottom: '28px',
        width: '100%',
    },
    card: {
        flex: '0 0 300px',
        width: '300px',
        borderRadius: '18px',
        padding: '22px 22px 20px',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        position: 'relative',
        boxSizing: 'border-box',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
    },
    checkmark: {
        position: 'absolute',
        top: '14px', right: '14px',
        width: '26px', height: '26px',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#061510',
        fontSize: '13px', fontWeight: '800',
    },
    iconCircle: {
        width: '56px', height: '56px',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '12px',
    },
    roleTitle: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '20px',
        fontWeight: '800',
        margin: '0 0 4px',
    },
    roleSubtitle: {
        fontSize: '12px',
        color: '#e9e9e9',
        margin: '0 0 8px',
        fontWeight: '500',
    },
    roleDesc: {
        fontSize: '12.5px',
        color: '#bcc0be',
        lineHeight: '1.6',
        margin: '0 0 16px',
    },
    selectIndicator: {
        textAlign: 'center',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '700',
        transition: 'all 0.22s',
        letterSpacing: '0.3px',
        fontFamily: "'DM Sans', sans-serif",
    },
    footer: {
        textAlign: 'center',
        width: '100%',
    },
    continueBtn: {
        padding: '14px 44px',
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        fontSize: '15px',
        fontWeight: '700',
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.3px',
        transition: 'all 0.22s ease',
        marginBottom: '10px',
        display: 'inline-block',
    },
    footerNote: {
        fontSize: '12px',
        color: '#cae4d7',
        margin: 0,
        letterSpacing: '0.2px',
    },
};

export default RoleSelection;