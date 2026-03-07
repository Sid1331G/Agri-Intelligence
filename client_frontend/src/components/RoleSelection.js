import React, { useState, useEffect } from 'react';

/* ── Inject mobile styles once ── */
const injectStyles = () => {
    const id = 'role-mobile-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
        /* ── Tablet ≤ 768px ── */
        @media (max-width: 768px) {
            .role-page {
                padding: 24px 16px !important;
                min-height: 100dvh !important;
            }
            .role-header {
                margin-bottom: 28px !important;
            }
            .role-title {
                font-size: 28px !important;
            }
            .role-cards-row {
                gap: 14px !important;
            }
            .role-card {
                min-width: 240px !important;
                padding: 26px 20px !important;
            }
        }

        /* ── Phone ≤ 480px ── */
        @media (max-width: 480px) {
            .role-page {
                padding: 16px 12px calc(16px + env(safe-area-inset-bottom)) !important;
                align-items: flex-start !important;
                padding-top: calc(20px + env(safe-area-inset-top)) !important;
            }
            .role-header {
                margin-bottom: 22px !important;
            }
            .role-step-badge {
                font-size: 10px !important;
                padding: 4px 12px !important;
                margin-bottom: 12px !important;
            }
            .role-title {
                font-size: 24px !important;
                letter-spacing: -0.3px !important;
            }
            .role-subtitle {
                font-size: 13px !important;
            }
            /* Cards stack full-width on phone */
            .role-cards-row {
                flex-direction: column !important;
                gap: 12px !important;
                margin-bottom: 24px !important;
            }
            .role-card {
                min-width: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
                padding: 22px 18px !important;
                border-radius: 16px !important;
                /* Compact: hide description text, keep features */
            }
            .role-card-icon-circle {
                width: 58px !important;
                height: 58px !important;
                margin-bottom: 12px !important;
            }
            .role-card-icon-circle span {
                font-size: 30px !important;
            }
            .role-card-title {
                font-size: 18px !important;
            }
            .role-card-subtitle {
                font-size: 12px !important;
                margin-bottom: 10px !important;
            }
            .role-card-desc {
                font-size: 12px !important;
                margin-bottom: 14px !important;
            }
            .role-feature-item {
                font-size: 12px !important;
            }
            .role-select-indicator {
                padding: 8px !important;
                font-size: 12px !important;
            }
            .role-continue-btn {
                padding: 13px 28px !important;
                font-size: 14px !important;
                border-radius: 11px !important;
                width: 100% !important;
                touch-action: manipulation !important;
            }
            .role-footer-note {
                font-size: 11px !important;
            }
        }

        /* ── Very small ≤ 360px ── */
        @media (max-width: 360px) {
            .role-card {
                padding: 18px 14px !important;
            }
            .role-title {
                font-size: 21px !important;
            }
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
            description: 'Get market intelligence, price trend analysis, and strategic advice to make the best buying and selling decisions.',
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
                        Select your role so we can personalize your PANDAM VILAI experience.
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

                                <ul style={s.featureList}>
                                    {role.features.map((f, i) => (
                                        <li key={i} className="role-feature-item" style={s.featureItem}>
                                            <span style={{ ...s.featureDot, background: role.accent }} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

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
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        background: 'linear-gradient(160deg, #061510 0%, #081c14 100%)',
        boxSizing: 'border-box',
    },
    container: {
        width: '100%',
        maxWidth: '860px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
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
        padding: '5px 14px',
        borderRadius: '20px',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        marginBottom: '16px',
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
        margin: '0 0 10px',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        fontSize: '15px',
        color: '#7aab93',
        margin: 0,
        lineHeight: '1.6',
    },
    cardsRow: {
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '36px',
    },
    card: {
        flex: '1',
        minWidth: '280px',
        maxWidth: '390px',
        borderRadius: '20px',
        padding: '32px 26px',
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
        width: '72px', height: '72px',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '18px',
    },
    roleTitle: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '22px',
        fontWeight: '800',
        margin: '0 0 5px',
    },
    roleSubtitle: {
        fontSize: '13px',
        color: '#4d7a65',
        margin: '0 0 14px',
        fontWeight: '500',
    },
    roleDesc: {
        fontSize: '13px',
        color: '#7aab93',
        lineHeight: '1.65',
        margin: '0 0 18px',
    },
    featureList: {
        listStyle: 'none',
        padding: 0,
        margin: '0 0 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    featureItem: {
        fontSize: '13px',
        color: '#8fbfaa',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '500',
    },
    featureDot: {
        width: '5px', height: '5px',
        borderRadius: '50%',
        flexShrink: 0,
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
        marginBottom: '12px',
        display: 'inline-block',
    },
    footerNote: {
        fontSize: '12px',
        color: '#2d5c47',
        margin: 0,
        letterSpacing: '0.2px',
    },
};

export default RoleSelection;