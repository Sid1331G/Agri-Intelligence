import React, { useState } from 'react';

const RoleSelection = ({ onRoleSelect }) => {
    const [selected, setSelected] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);

    const roles = [
        {
            id: 'farmer',
            icon: '🌾',
            title: 'Farmer',
            subtitle: 'I grow crops on agricultural land',
            description: 'Get personalized price predictions for your crops, disease detection support, and farming advice tailored to your land and district.',
            features: ['Crop price predictions', 'Disease detection help', 'Irrigation & fertilizer tips', 'Seasonal recommendations'],
            color: '#059669',
            lightColor: '#d1fae5',
            gradient: 'linear-gradient(135deg, #059669, #10b981)',
        },
        {
            id: 'dealer',
            icon: '🏪',
            title: 'Dealer',
            subtitle: 'I buy and sell agricultural commodities',
            description: 'Get market intelligence, price trend analysis, and strategic advice to make the best buying and selling decisions.',
            features: ['Commodity price trends', 'Market strategy advice', 'Best buy/sell timing', 'Demand forecasting'],
            color: '#0369a1',
            lightColor: '#dbeafe',
            gradient: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
        },
    ];

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.stepBadge}>Step 1 of 2</div>
                    <h1 style={styles.title}>Who are you?</h1>
                    <p style={styles.subtitle}>
                        Select your role so we can personalize your PANDAM VILAI experience.
                    </p>
                </div>

                {/* Role Cards */}
                <div style={styles.cardsRow}>
                    {roles.map((role) => {
                        const isSelected = selected === role.id;
                        const isHovered = hoveredCard === role.id;
                        return (
                            <div
                                key={role.id}
                                onClick={() => setSelected(role.id)}
                                onMouseEnter={() => setHoveredCard(role.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{
                                    ...styles.card,
                                    border: isSelected
                                        ? `2px solid ${role.color}`
                                        : isHovered
                                            ? `2px solid ${role.color}80`
                                            : '2px solid rgba(255,255,255,0.6)',
                                    boxShadow: isSelected
                                        ? `0 12px 40px ${role.color}40`
                                        : isHovered
                                            ? `0 8px 30px ${role.color}25`
                                            : '0 4px 20px rgba(0,0,0,0.1)',
                                    transform: isSelected ? 'translateY(-6px) scale(1.02)' : isHovered ? 'translateY(-3px)' : 'none',
                                    background: isSelected ? `${role.lightColor}` : 'rgba(255,255,255,0.85)',
                                }}
                            >
                                {/* Top checkmark */}
                                {isSelected && (
                                    <div style={{ ...styles.checkmark, background: role.gradient }}>✓</div>
                                )}

                                {/* Icon */}
                                <div style={{ ...styles.iconCircle, background: isSelected ? role.gradient : '#f3f4f6' }}>
                                    <span style={{ fontSize: '42px' }}>{role.icon}</span>
                                </div>

                                <h2 style={{ ...styles.roleTitle, color: isSelected ? role.color : '#111827' }}>
                                    {role.title}
                                </h2>
                                <p style={styles.roleSubtitle}>{role.subtitle}</p>

                                <p style={styles.roleDesc}>{role.description}</p>

                                <ul style={styles.featureList}>
                                    {role.features.map((f, i) => (
                                        <li key={i} style={styles.featureItem}>
                                            <span style={{ ...styles.featureDot, background: role.color }} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {/* Select indicator */}
                                <div style={{
                                    ...styles.selectIndicator,
                                    background: isSelected ? role.gradient : 'transparent',
                                    border: `2px solid ${role.color}`,
                                    color: isSelected ? 'white' : role.color,
                                }}>
                                    {isSelected ? '✓ Selected' : 'Select'}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Continue Button */}
                <div style={styles.footer}>
                    <button
                        onClick={() => selected && onRoleSelect(selected)}
                        disabled={!selected}
                        style={{
                            ...styles.continueBtn,
                            opacity: selected ? 1 : 0.5,
                            cursor: selected ? 'pointer' : 'not-allowed',
                            background: selected
                                ? (selected === 'farmer'
                                    ? 'linear-gradient(135deg, #059669, #10b981)'
                                    : 'linear-gradient(135deg, #0369a1, #0ea5e9)')
                                : '#9ca3af',
                        }}
                    >
                        Continue as {selected ? (selected === 'farmer' ? '🌾 Farmer' : '🏪 Dealer') : '...'}
                        <span style={{ marginLeft: '8px' }}>→</span>
                    </button>
                    <p style={styles.footerNote}>You can always ask our AI assistant for help later.</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
    },
    container: {
        width: '100%',
        maxWidth: '900px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    stepBadge: {
        display: 'inline-block',
        background: 'rgba(16,185,129,0.15)',
        color: '#059669',
        fontWeight: '700',
        fontSize: '13px',
        padding: '5px 16px',
        borderRadius: '20px',
        border: '1px solid rgba(16,185,129,0.3)',
        marginBottom: '14px',
        letterSpacing: '0.5px',
    },
    title: {
        fontSize: '36px',
        fontWeight: '800',
        color: '#064e3b',
        margin: '0 0 10px',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        fontSize: '17px',
        color: '#374151',
        margin: 0,
        lineHeight: '1.6',
    },
    cardsRow: {
        display: 'flex',
        gap: '24px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '36px',
    },
    card: {
        flex: '1',
        minWidth: '280px',
        maxWidth: '380px',
        borderRadius: '24px',
        padding: '36px 28px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        position: 'relative',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxSizing: 'border-box',
    },
    checkmark: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px',
        fontWeight: '700',
    },
    iconCircle: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        transition: 'background 0.25s',
    },
    roleTitle: {
        fontSize: '26px',
        fontWeight: '800',
        margin: '0 0 6px',
        transition: 'color 0.25s',
    },
    roleSubtitle: {
        fontSize: '14px',
        color: '#6b7280',
        margin: '0 0 16px',
        fontWeight: '500',
    },
    roleDesc: {
        fontSize: '14px',
        color: '#374151',
        lineHeight: '1.6',
        margin: '0 0 20px',
    },
    featureList: {
        listStyle: 'none',
        padding: 0,
        margin: '0 0 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    featureItem: {
        fontSize: '13px',
        color: '#374151',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '500',
    },
    featureDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    selectIndicator: {
        textAlign: 'center',
        padding: '10px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '700',
        transition: 'all 0.25s',
        letterSpacing: '0.3px',
    },
    footer: {
        textAlign: 'center',
    },
    continueBtn: {
        padding: '16px 48px',
        border: 'none',
        borderRadius: '14px',
        color: 'white',
        fontSize: '16px',
        fontWeight: '700',
        letterSpacing: '0.4px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        transition: 'all 0.25s ease',
        marginBottom: '12px',
    },
    footerNote: {
        fontSize: '13px',
        color: '#9ca3af',
        margin: 0,
    },
};

export default RoleSelection;
