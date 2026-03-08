import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FARMING_TYPES    = ['Organic', 'Conventional', 'Mixed'];
const IRRIGATION_TYPES = ['Rain-fed', 'Borewell', 'Canal', 'Drip'];
const BUSINESS_TYPES   = ['Wholesale', 'Retail', 'Broker'];
const TRADING_VOLUMES  = ['Small', 'Medium', 'Large'];

/* ── Inject mobile styles once ── */
const injectStyles = () => {
    const id = 'profile-mobile-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Re-enable scrolling for this page ── */
        html, body {
            overflow: auto !important;
            height: auto !important;
        }

        /* Focus states */
        .ps-select:focus, .ps-input:focus {
            border-color: rgba(52,211,153,0.5) !important;
            box-shadow: 0 0 0 3px rgba(52,211,153,0.08) !important;
        }

        /* ── Tablet ≤ 768px ── */
        @media (max-width: 768px) {
            .ps-page {
                top: 58px !important;
            }
            .ps-card {
                padding: 26px 22px !important;
                border-radius: 18px !important;
            }
            .ps-title {
                font-size: 20px !important;
            }
        }

        /* ── Phone ≤ 480px ── */
        @media (max-width: 480px) {
            .ps-page {
                top: 58px !important;
            }
            .ps-header {
                padding: 14px 14px 12px !important;
            }
            .ps-step-badge {
                font-size: 10px !important;
                padding: 4px 11px !important;
                margin-bottom: 10px !important;
            }
            .ps-title {
                font-size: 20px !important;
            }
            .ps-subtitle {
                font-size: 12px !important;
            }
            .ps-card {
                border-radius: 16px !important;
                gap: 20px !important;
            }
            /* Make two-column fieldRow stack vertically on phone */
            .ps-field-row {
                flex-direction: column !important;
                gap: 20px !important;
            }
            .ps-select, .ps-input {
                font-size: 16px !important; /* prevents iOS zoom */
                padding: 11px 12px !important;
                border-radius: 9px !important;
            }
            .ps-label {
                font-size: 12px !important;
            }
            .ps-chip {
                font-size: 11px !important;
                padding: 6px 12px !important;
            }
            .ps-radio-label {
                padding: 9px 12px !important;
                font-size: 12px !important;
                border-radius: 9px !important;
            }
            .ps-submit-btn {
                padding: 13px !important;
                font-size: 14px !important;
                border-radius: 11px !important;
                touch-action: manipulation !important;
            }
            .ps-input-unit {
                font-size: 11px !important;
            }
        }

        /* ── Very small ≤ 360px ── */
        @media (max-width: 360px) {
            .ps-card {
                padding: 16px 12px !important;
            }
            .ps-title {
                font-size: 15px !important;
            }
            .ps-chip {
                font-size: 10px !important;
                padding: 5px 10px !important;
            }
        }
    `;
    document.head.appendChild(el);
};

const ProfileSetup = ({ role, username, onComplete, isEditMode = false }) => {
    const [meta, setMeta]               = useState({ districts: [], markets: [], commodities: [] });
    const [loading, setLoading]         = useState(true);
    const [saving, setSaving]           = useState(false);
    const [error, setError]             = useState('');
    const [currentRole, setCurrentRole] = useState(role);

    // Farmer
    const [district, setDistrict]           = useState('');
    const [landSize, setLandSize]           = useState('');
    const [selectedCrops, setSelectedCrops] = useState([]);
    const [farmingType, setFarmingType]     = useState('');
    const [irrigation, setIrrigation]       = useState('');

    // Dealer
    const [businessType, setBusinessType]               = useState('');
    const [marketLocation, setMarketLocation]           = useState('');
    const [selectedCommodities, setSelectedCommodities] = useState([]);
    const [tradingVolume, setTradingVolume]             = useState('');

    useEffect(() => {
        injectStyles();
        const fetchMetaAndProfile = async () => {
            setLoading(true);
            try {
                const metaRes = await axios.get('http://127.0.0.1:5000/profile/meta', { withCredentials: true });
                setMeta(metaRes.data);

                if (isEditMode) {
                    const uname = username || localStorage.getItem('user') || '';
                    const profileRes = await axios.get(
                        `http://127.0.0.1:5000/profile/get?username=${encodeURIComponent(uname)}`,
                        { withCredentials: true }
                    );
                    const d = profileRes.data;
                    setCurrentRole(d.role);
                    setDistrict(d.profile.district || '');
                    if (d.role === 'farmer') {
                        setLandSize(d.profile.land_size_acres || '');
                        setSelectedCrops(d.profile.crops || []);
                        setFarmingType(d.profile.farming_type || '');
                        setIrrigation(d.profile.irrigation || '');
                    } else {
                        setBusinessType(d.profile.business_type || '');
                        setMarketLocation(d.profile.market_location || '');
                        setSelectedCommodities(d.profile.commodities || []);
                        setTradingVolume(d.profile.trading_volume || '');
                    }
                }
            } catch (e) {
                setError('Could not load form options or profile data. Please refresh.');
            } finally {
                setLoading(false);
            }
        };
        fetchMetaAndProfile();
    }, [isEditMode]);

    const toggleItem = (item, list, setList) =>
        setList(prev => prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const activeRole = isEditMode ? currentRole : role;
        if (!district) { setError('Please select your district.'); return; }
        if (activeRole === 'farmer') {
            if (!selectedCrops.length)  { setError('Please select at least one crop.'); return; }
            if (!farmingType)           { setError('Please select your farming type.'); return; }
            if (!irrigation)            { setError('Please select your irrigation source.'); return; }
        } else {
            if (!businessType)               { setError('Please select your business type.'); return; }
            if (!marketLocation)             { setError('Please select your market location.'); return; }
            if (!selectedCommodities.length) { setError('Please select at least one commodity.'); return; }
            if (!tradingVolume)              { setError('Please select your trading volume.'); return; }
        }

        setSaving(true);
        try {
            const profileData = activeRole === 'farmer'
                ? { district, land_size_acres: landSize || null, crops: selectedCrops, farming_type: farmingType, irrigation }
                : { district, business_type: businessType, market_location: marketLocation, commodities: selectedCommodities, trading_volume: tradingVolume };

            await axios.post('http://127.0.0.1:5000/profile/setup',
                { username, role: activeRole, profile: profileData },
                { withCredentials: true }
            );
            onComplete();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    /* ── Loading screen ── */
    if (loading) return (
        <div style={s.page} className="ps-page">
            <div style={s.loadingBox}>
                <div style={s.spinner} />
                <p style={{ color: '#4d7a65', marginTop: '14px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
                    Loading form...
                </p>
            </div>
        </div>
    );

    const activeRole   = isEditMode ? currentRole : role;
    const isFarmer     = activeRole === 'farmer';
    const accent       = isFarmer ? '#34d399' : '#38bdf8';
    const accentDim    = isFarmer ? 'rgba(52,211,153,0.12)' : 'rgba(56,189,248,0.1)';
    const accentBorder = isFarmer ? 'rgba(52,211,153,0.3)'  : 'rgba(56,189,248,0.3)';
    const accentSolid  = isFarmer ? '#1db87a'               : '#0ea5e9';
    const isSel        = (item, list) => list.includes(item);

    /* ── Shared element styles ── */
    const selectSt = {
        width: '100%', padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: '16px', /* 16px prevents iOS auto-zoom */
        color: '#e8f5f0',
        background: '#061510', outline: 'none',
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
        cursor: 'pointer',
        WebkitAppearance: 'none',
        appearance: 'none',
    };

    const chipSt = (selected) => ({
        padding: '7px 14px',
        borderRadius: '20px',
        fontSize: '12px', fontWeight: '600',
        cursor: 'pointer',
        letterSpacing: '0.2px',
        fontFamily: "'DM Sans', sans-serif",
        border: `1px solid ${selected ? accent : 'rgba(255,255,255,0.1)'}`,
        background: selected ? accentDim : 'rgba(255,255,255,0.03)',
        color: selected ? accent : '#7aab93',
        transition: 'all 0.18s ease',
        boxShadow: selected ? `0 0 0 1px ${accentBorder}` : 'none',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
    });

    const radioSt = (selected) => ({
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
        fontSize: '13px', fontWeight: '500',
        fontFamily: "'DM Sans', sans-serif",
        color: selected ? accent : '#7aab93',
        border: `1px solid ${selected ? accentBorder : 'rgba(255,255,255,0.07)'}`,
        background: selected ? accentDim : 'rgba(255,255,255,0.02)',
        transition: 'all 0.18s',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
    });

    const dotSt = (selected) => ({
        width: '14px', height: '14px',
        borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${selected ? accent : 'rgba(255,255,255,0.2)'}`,
        background: selected ? accent : 'transparent',
        transition: 'all 0.18s',
    });

    return (
        <div className="ps-page" style={s.page}>
            <div style={s.container}>

                {/* Fixed Header — title + subtitle stay put */}
                <div className="ps-header" style={s.header}>
                    <span className="ps-step-badge" style={{ ...s.stepBadge, color: accent, borderColor: accentBorder, background: accentDim }}>
                        <span style={{ ...s.stepDot, background: accent, boxShadow: `0 0 6px ${accent}` }} />
                        {isEditMode
                            ? `✏️ Edit ${isFarmer ? '🌾 Farmer' : '🏪 Dealer'} Profile`
                            : `Step 2 of 2 — ${isFarmer ? '🌾 Farmer' : '🏪 Dealer'} Profile`}
                    </span>
                    <h1 className="ps-title" style={s.title}>
                        {isEditMode ? 'Update your profile' : `Tell us about your ${isFarmer ? 'farm' : 'business'}`}
                    </h1>
                    <p className="ps-subtitle" style={s.subtitle}>
                        This helps our AI Assistant give you personalized advice and predictions.
                    </p>
                </div>

                {/* Scrollable form body */}
                <div style={s.scrollBody}>
                <form onSubmit={handleSubmit} style={{ width: '100%', paddingTop: '24px' }}>
                <div className="ps-card" style={s.card}>

                    {error && (
                        <div style={s.errorBanner}>
                            <i className="fas fa-exclamation-circle" style={{ marginRight: '8px', color: '#f87171' }} />
                            {error}
                        </div>
                    )}

                    {/* District */}
                    <div style={s.fieldGroup}>
                        <label className="ps-label" style={s.label}>
                            <i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: accent }} />
                            District <span style={s.required}>*</span>
                        </label>
                        <select
                            className="ps-select"
                            value={district}
                            onChange={e => setDistrict(e.target.value)}
                            style={{ ...selectSt, borderColor: district ? accentBorder : 'rgba(255,255,255,0.08)' }}
                            required
                        >
                            <option value="">-- Select your district --</option>
                            {meta.districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* ── FARMER FIELDS ── */}
                    {isFarmer && (<>
                        <div style={s.fieldGroup}>
                            <label className="ps-label" style={s.label}>
                                <i className="fas fa-ruler-combined" style={{ marginRight: '8px', color: accent }} />
                                Land Size <span style={s.labelNote}>(optional)</span>
                            </label>
                            <div style={s.inputRow}>
                                <input
                                    className="ps-input"
                                    type="number" min="0" step="0.1"
                                    placeholder="e.g. 3.5"
                                    value={landSize}
                                    onChange={e => setLandSize(e.target.value)}
                                    style={s.input}
                                />
                                <span className="ps-input-unit" style={s.inputUnit}>Acres</span>
                            </div>
                        </div>

                        <div style={s.fieldGroup}>
                            <label className="ps-label" style={s.label}>
                                <i className="fas fa-seedling" style={{ marginRight: '8px', color: accent }} />
                                Crops Grown <span style={s.required}>*</span>
                                <span style={s.labelNote}> ({selectedCrops.length} selected)</span>
                            </label>
                            <div style={s.chipGrid}>
                                {meta.commodities.map(crop => (
                                    <button key={crop} type="button" className="ps-chip"
                                        onClick={() => toggleItem(crop, selectedCrops, setSelectedCrops)}
                                        style={chipSt(isSel(crop, selectedCrops))}>
                                        {crop}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Two-column row — stacks on phone via .ps-field-row CSS */}
                        <div className="ps-field-row" style={s.fieldRow}>
                            <div style={{ ...s.fieldGroup, flex: 1 }}>
                                <label className="ps-label" style={s.label}>
                                    <i className="fas fa-leaf" style={{ marginRight: '8px', color: accent }} />
                                    Farming Type <span style={s.required}>*</span>
                                </label>
                                <div style={s.radioGroup}>
                                    {FARMING_TYPES.map(f => (
                                        <label key={f} className="ps-radio-label" style={radioSt(farmingType === f)}>
                                            <input type="radio" name="farmingType" value={f}
                                                checked={farmingType === f} onChange={() => setFarmingType(f)}
                                                style={{ display: 'none' }} />
                                            <span style={dotSt(farmingType === f)} />
                                            {f}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ ...s.fieldGroup, flex: 1 }}>
                                <label className="ps-label" style={s.label}>
                                    <i className="fas fa-tint" style={{ marginRight: '8px', color: accent }} />
                                    Irrigation Source <span style={s.required}>*</span>
                                </label>
                                <div style={s.radioGroup}>
                                    {IRRIGATION_TYPES.map(ir => (
                                        <label key={ir} className="ps-radio-label" style={radioSt(irrigation === ir)}>
                                            <input type="radio" name="irrigation" value={ir}
                                                checked={irrigation === ir} onChange={() => setIrrigation(ir)}
                                                style={{ display: 'none' }} />
                                            <span style={dotSt(irrigation === ir)} />
                                            {ir}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>)}

                    {/* ── DEALER FIELDS ── */}
                    {!isFarmer && activeRole === 'dealer' && (<>
                        {/* Two-column row — stacks on phone */}
                        <div className="ps-field-row" style={s.fieldRow}>
                            <div style={{ ...s.fieldGroup, flex: 1 }}>
                                <label className="ps-label" style={s.label}>
                                    <i className="fas fa-store" style={{ marginRight: '8px', color: accent }} />
                                    Business Type <span style={s.required}>*</span>
                                </label>
                                <div style={s.radioGroup}>
                                    {BUSINESS_TYPES.map(b => (
                                        <label key={b} className="ps-radio-label" style={radioSt(businessType === b)}>
                                            <input type="radio" name="businessType" value={b}
                                                checked={businessType === b} onChange={() => setBusinessType(b)}
                                                style={{ display: 'none' }} />
                                            <span style={dotSt(businessType === b)} />
                                            {b}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ ...s.fieldGroup, flex: 1 }}>
                                <label className="ps-label" style={s.label}>
                                    <i className="fas fa-chart-bar" style={{ marginRight: '8px', color: accent }} />
                                    Trading Volume <span style={s.required}>*</span>
                                </label>
                                <div style={s.radioGroup}>
                                    {TRADING_VOLUMES.map(v => (
                                        <label key={v} className="ps-radio-label" style={radioSt(tradingVolume === v)}>
                                            <input type="radio" name="tradingVolume" value={v}
                                                checked={tradingVolume === v} onChange={() => setTradingVolume(v)}
                                                style={{ display: 'none' }} />
                                            <span style={dotSt(tradingVolume === v)} />
                                            {v}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={s.fieldGroup}>
                            <label className="ps-label" style={s.label}>
                                <i className="fas fa-warehouse" style={{ marginRight: '8px', color: accent }} />
                                Market Location <span style={s.required}>*</span>
                            </label>
                            <select
                                className="ps-select"
                                value={marketLocation}
                                onChange={e => setMarketLocation(e.target.value)}
                                style={{ ...selectSt, borderColor: marketLocation ? accentBorder : 'rgba(255,255,255,0.08)' }}
                                required
                            >
                                <option value="">-- Select your market --</option>
                                {meta.markets.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        <div style={s.fieldGroup}>
                            <label className="ps-label" style={s.label}>
                                <i className="fas fa-boxes" style={{ marginRight: '8px', color: accent }} />
                                Commodities Traded <span style={s.required}>*</span>
                                <span style={s.labelNote}> ({selectedCommodities.length} selected)</span>
                            </label>
                            <div style={s.chipGrid}>
                                {meta.commodities.map(c => (
                                    <button key={c} type="button" className="ps-chip"
                                        onClick={() => toggleItem(c, selectedCommodities, setSelectedCommodities)}
                                        style={chipSt(isSel(c, selectedCommodities))}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>)}

                    {/* Submit */}
                    <button type="submit" className="ps-submit-btn" disabled={saving} style={{
                        ...s.submitBtn,
                        background: saving ? '#1a2e26' : accentSolid,
                        boxShadow: saving ? 'none' : `0 6px 20px ${accentSolid}55`,
                        opacity: saving ? 0.7 : 1,
                        cursor: saving ? 'not-allowed' : 'pointer',
                    }}>
                        {saving ? (
                            <span><span style={s.spinnerInline} /> Saving...</span>
                        ) : (
                            <span>{isEditMode ? '✅ Update Profile' : 'Complete Setup & Go to Dashboard →'}</span>
                        )}
                    </button>
                </div>{/* ps-card */}
            </form>
            </div>{/* scrollBody */}
            </div>{/* container */}
        </div>
    );
};

/* ── Static styles ── */
const s = {
    page: {
        position: 'fixed',
        top: '115px',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(160deg, #061510 0%, #081c14 100%)',
        boxSizing: 'border-box',
        overflow: 'hidden',
    },
    container: {
        width: '100%',
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
    },
    scrollBody: {
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '0 16px calc(48px + env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
    },
    loadingBox: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '50vh',
    },
    spinner: {
        width: '38px', height: '38px',
        border: '3px solid rgba(52,211,153,0.15)',
        borderTop: '3px solid #34d399',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    header: {
        textAlign: 'center',
        padding: '40px 16px 16px',
        flexShrink: 0,
        background: 'linear-gradient(160deg, #061510 0%, #081c14 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        width: '100%',
        boxSizing: 'border-box',
    },
    stepBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        fontWeight: '700',
        fontSize: '11px',
        padding: '5px 14px',
        borderRadius: '20px',
        marginBottom: '14px',
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        border: '1px solid',
    },
    stepDot: {
        width: '6px', height: '6px',
        borderRadius: '50%', flexShrink: 0,
    },
    title: {
        fontFamily: "'Syne', sans-serif",
        fontSize: 'clamp(18px, 2.2vw, 24px)',
        fontWeight: '600',
        color: '#e8f5f0',
        margin: '0 0 6px',
        letterSpacing: '-0.2px',
    },
    subtitle: {
        fontSize: '14px', color: '#4d7a65',
        margin: 0, lineHeight: '1.6',
    },
    card: {
        background: '#0a1f18',
        border: '30px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        padding: '30px 28px',
        display: 'flex', flexDirection: 'column',
        gap: '24px',
        boxSizing: 'border-box',
    },
    errorBanner: {
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.25)',
        color: '#f87171',
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '13px', fontWeight: '500',
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex', alignItems: 'center',
    },
    fieldGroup: {
        display: 'flex', flexDirection: 'column', gap: '10px',
    },
    fieldRow: {
        display: 'flex', gap: '20px', flexWrap: 'wrap',
    },
    label: {
        fontSize: '13px', fontWeight: '700', color: '#8fbfaa',
        display: 'flex', alignItems: 'center',
        fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.3px',
    },
    required: { color: '#f87171', marginLeft: '4px' },
    labelNote: {
        fontWeight: '500', color: '#2d5c47',
        fontSize: '12px', marginLeft: '6px',
        fontFamily: "'DM Sans', sans-serif",
    },
    inputRow: {
        display: 'flex', alignItems: 'center', gap: '10px',
    },
    input: {
        flex: 1, padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: '16px', /* 16px prevents iOS zoom */
        color: '#e8f5f0', background: '#061510',
        outline: 'none',
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
        WebkitAppearance: 'none',
    },
    inputUnit: {
        fontSize: '12px', fontWeight: '700', color: '#4d7a65',
        whiteSpace: 'nowrap',
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.4px', textTransform: 'uppercase',
    },
    chipGrid: {
        display: 'flex', flexWrap: 'wrap', gap: '8px',
    },
    radioGroup: {
        display: 'flex', flexDirection: 'column', gap: '8px',
    },
    submitBtn: {
        width: '100%', padding: '15px',
        border: 'none', borderRadius: '12px',
        color: 'white', fontSize: '15px', fontWeight: '700',
        letterSpacing: '0.3px', marginTop: '4px',
        transition: 'all 0.22s ease',
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: 'border-box',
    },
    spinnerInline: {
        display: 'inline-block',
        width: '14px', height: '14px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginRight: '8px',
        verticalAlign: 'middle',
    },
};

export default ProfileSetup;