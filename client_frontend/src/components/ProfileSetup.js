import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FARMING_TYPES = ['Organic', 'Conventional', 'Mixed'];
const IRRIGATION_TYPES = ['Rain-fed', 'Borewell', 'Canal', 'Drip'];
const BUSINESS_TYPES = ['Wholesale', 'Retail', 'Broker'];
const TRADING_VOLUMES = ['Small', 'Medium', 'Large'];

const ProfileSetup = ({ role, username, onComplete, isEditMode = false }) => {
    const [meta, setMeta] = useState({ districts: [], markets: [], commodities: [] });
    const [loading, setLoading] = useState(true); // start true so spinner shows immediately
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [currentRole, setCurrentRole] = useState(role);

    // Farmer fields
    const [district, setDistrict] = useState('');
    const [landSize, setLandSize] = useState('');
    const [selectedCrops, setSelectedCrops] = useState([]);
    const [farmingType, setFarmingType] = useState('');
    const [irrigation, setIrrigation] = useState('');

    // Dealer fields
    const [businessType, setBusinessType] = useState('');
    const [marketLocation, setMarketLocation] = useState('');
    const [selectedCommodities, setSelectedCommodities] = useState([]);
    const [tradingVolume, setTradingVolume] = useState('');

    useEffect(() => {
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
                    const profileData = profileRes.data;

                    setCurrentRole(profileData.role);
                    setDistrict(profileData.profile.district || '');

                    if (profileData.role === 'farmer') {
                        setLandSize(profileData.profile.land_size_acres || '');
                        setSelectedCrops(profileData.profile.crops || []);
                        setFarmingType(profileData.profile.farming_type || '');
                        setIrrigation(profileData.profile.irrigation || '');
                    } else if (profileData.role === 'dealer') {
                        setBusinessType(profileData.profile.business_type || '');
                        setMarketLocation(profileData.profile.market_location || '');
                        setSelectedCommodities(profileData.profile.commodities || []);
                        setTradingVolume(profileData.profile.trading_volume || '');
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

    const toggleItem = (item, list, setList) => {
        setList(prev => prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const activeRole = isEditMode ? currentRole : role;

        if (!district) { setError('Please select your district.'); return; }

        if (activeRole === 'farmer') {
            if (selectedCrops.length === 0) { setError('Please select at least one crop.'); return; }
            if (!farmingType) { setError('Please select your farming type.'); return; }
            if (!irrigation) { setError('Please select your irrigation source.'); return; }
        } else {
            if (!businessType) { setError('Please select your business type.'); return; }
            if (!marketLocation) { setError('Please select your market location.'); return; }
            if (selectedCommodities.length === 0) { setError('Please select at least one commodity.'); return; }
            if (!tradingVolume) { setError('Please select your trading volume.'); return; }
        }

        setSaving(true);
        try {
            const profileData = activeRole === 'farmer'
                ? { district, land_size_acres: landSize || null, crops: selectedCrops, farming_type: farmingType, irrigation }
                : { district, business_type: businessType, market_location: marketLocation, commodities: selectedCommodities, trading_volume: tradingVolume };

            await axios.post('http://127.0.0.1:5000/profile/setup', {
                username,
                role: activeRole,
                profile: profileData
            }, { withCredentials: true });

            onComplete();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={styles.page}>
            <div style={styles.loadingBox}>
                <div style={styles.spinner} />
                <p style={{ color: '#6b7280', marginTop: '12px' }}>Loading form...</p>
            </div>
        </div>
    );

    const activeRole = isEditMode ? currentRole : role;
    const activeColor = activeRole === 'farmer' ? '#059669' : '#0369a1';
    const activeGradient = activeRole === 'farmer'
        ? 'linear-gradient(135deg, #059669, #10b981)'
        : 'linear-gradient(135deg, #0369a1, #0ea5e9)';
    const activeBg = activeRole === 'farmer' ? '#d1fae5' : '#dbeafe';

    const isSelected = (item, list) => list.includes(item);

    return (
        <div style={styles.page}>
            <form onSubmit={handleSubmit} style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={{ ...styles.stepBadge, color: activeColor, background: `${activeBg}`, border: `1px solid ${activeColor}40` }}>
                        {isEditMode
                            ? `✏️ Edit ${activeRole === 'farmer' ? '🌾 Farmer' : '🏪 Dealer'} Profile`
                            : `Step 2 of 2 — ${activeRole === 'farmer' ? '🌾 Farmer' : '🏪 Dealer'} Profile`}
                    </div>
                    <h1 style={{ ...styles.title, color: activeRole === 'farmer' ? '#064e3b' : '#0c4a6e' }}>
                        {isEditMode ? 'Update your profile' : `Tell us about your ${activeRole === 'farmer' ? 'farm' : 'business'}`}
                    </h1>
                    <p style={styles.subtitle}>
                        This helps our AI Assistant give you personalized advice and predictions.
                    </p>
                </div>

                <div style={styles.card}>
                    {/* Error Banner */}
                    {error && (
                        <div style={styles.errorBanner}>
                            <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }} />
                            {error}
                        </div>
                    )}

                    {/* District — common for both */}
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>
                            <i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: activeColor }} />
                            District <span style={styles.required}>*</span>
                        </label>
                        <select value={district} onChange={e => setDistrict(e.target.value)} style={{ ...styles.select, borderColor: district ? activeColor : '#d1d5db' }} required>
                            <option value="">-- Select your district --</option>
                            {meta.districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* FARMER FIELDS */}
                    {activeRole === 'farmer' && (
                        <>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>
                                    <i className="fas fa-ruler-combined" style={{ marginRight: '8px', color: activeColor }} />
                                    Land Size (optional)
                                </label>
                                <div style={styles.inputRow}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        placeholder="e.g. 3.5"
                                        value={landSize}
                                        onChange={e => setLandSize(e.target.value)}
                                        style={styles.input}
                                    />
                                    <span style={styles.inputUnit}>Acres</span>
                                </div>
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>
                                    <i className="fas fa-seedling" style={{ marginRight: '8px', color: activeColor }} />
                                    Crops Grown <span style={styles.required}>*</span>
                                    <span style={styles.labelNote}> ({selectedCrops.length} selected)</span>
                                </label>
                                <div style={styles.chipGrid}>
                                    {meta.commodities.map(crop => (
                                        <button key={crop} type="button"
                                            onClick={() => toggleItem(crop, selectedCrops, setSelectedCrops)}
                                            style={{
                                                ...styles.chip,
                                                background: isSelected(crop, selectedCrops) ? activeGradient : 'white',
                                                color: isSelected(crop, selectedCrops) ? 'white' : '#374151',
                                                border: `1.5px solid ${isSelected(crop, selectedCrops) ? activeColor : '#d1d5db'}`,
                                                boxShadow: isSelected(crop, selectedCrops) ? `0 2px 8px ${activeColor}40` : 'none',
                                            }}>
                                            {crop}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.fieldRow}>
                                <div style={{ ...styles.fieldGroup, flex: 1 }}>
                                    <label style={styles.label}>
                                        <i className="fas fa-leaf" style={{ marginRight: '8px', color: activeColor }} />
                                        Farming Type <span style={styles.required}>*</span>
                                    </label>
                                    <div style={styles.radioGroup}>
                                        {FARMING_TYPES.map(f => (
                                            <label key={f} style={{ ...styles.radioLabel, borderColor: farmingType === f ? activeColor : '#d1d5db', background: farmingType === f ? activeBg : 'white' }}>
                                                <input type="radio" name="farmingType" value={f} checked={farmingType === f} onChange={() => setFarmingType(f)} style={{ display: 'none' }} />
                                                <span style={{ ...styles.radioIndicator, background: farmingType === f ? activeGradient : 'white', borderColor: farmingType === f ? activeColor : '#d1d5db' }} />
                                                {f}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ ...styles.fieldGroup, flex: 1 }}>
                                    <label style={styles.label}>
                                        <i className="fas fa-tint" style={{ marginRight: '8px', color: activeColor }} />
                                        Irrigation Source <span style={styles.required}>*</span>
                                    </label>
                                    <div style={styles.radioGroup}>
                                        {IRRIGATION_TYPES.map(ir => (
                                            <label key={ir} style={{ ...styles.radioLabel, borderColor: irrigation === ir ? activeColor : '#d1d5db', background: irrigation === ir ? activeBg : 'white' }}>
                                                <input type="radio" name="irrigation" value={ir} checked={irrigation === ir} onChange={() => setIrrigation(ir)} style={{ display: 'none' }} />
                                                <span style={{ ...styles.radioIndicator, background: irrigation === ir ? activeGradient : 'white', borderColor: irrigation === ir ? activeColor : '#d1d5db' }} />
                                                {ir}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* DEALER FIELDS */}
                    {activeRole === 'dealer' && (
                        <>
                            <div style={styles.fieldRow}>
                                <div style={{ ...styles.fieldGroup, flex: 1 }}>
                                    <label style={styles.label}>
                                        <i className="fas fa-store" style={{ marginRight: '8px', color: activeColor }} />
                                        Business Type <span style={styles.required}>*</span>
                                    </label>
                                    <div style={styles.radioGroup}>
                                        {BUSINESS_TYPES.map(b => (
                                            <label key={b} style={{ ...styles.radioLabel, borderColor: businessType === b ? activeColor : '#d1d5db', background: businessType === b ? activeBg : 'white' }}>
                                                <input type="radio" name="businessType" value={b} checked={businessType === b} onChange={() => setBusinessType(b)} style={{ display: 'none' }} />
                                                <span style={{ ...styles.radioIndicator, background: businessType === b ? activeGradient : 'white', borderColor: businessType === b ? activeColor : '#d1d5db' }} />
                                                {b}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ ...styles.fieldGroup, flex: 1 }}>
                                    <label style={styles.label}>
                                        <i className="fas fa-chart-bar" style={{ marginRight: '8px', color: activeColor }} />
                                        Trading Volume <span style={styles.required}>*</span>
                                    </label>
                                    <div style={styles.radioGroup}>
                                        {TRADING_VOLUMES.map(v => (
                                            <label key={v} style={{ ...styles.radioLabel, borderColor: tradingVolume === v ? activeColor : '#d1d5db', background: tradingVolume === v ? activeBg : 'white' }}>
                                                <input type="radio" name="tradingVolume" value={v} checked={tradingVolume === v} onChange={() => setTradingVolume(v)} style={{ display: 'none' }} />
                                                <span style={{ ...styles.radioIndicator, background: tradingVolume === v ? activeGradient : 'white', borderColor: tradingVolume === v ? activeColor : '#d1d5db' }} />
                                                {v}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>
                                    <i className="fas fa-warehouse" style={{ marginRight: '8px', color: activeColor }} />
                                    Market Location <span style={styles.required}>*</span>
                                </label>
                                <select value={marketLocation} onChange={e => setMarketLocation(e.target.value)} style={{ ...styles.select, borderColor: marketLocation ? activeColor : '#d1d5db' }} required>
                                    <option value="">-- Select your market --</option>
                                    {meta.markets.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>
                                    <i className="fas fa-boxes" style={{ marginRight: '8px', color: activeColor }} />
                                    Commodities Traded <span style={styles.required}>*</span>
                                    <span style={styles.labelNote}> ({selectedCommodities.length} selected)</span>
                                </label>
                                <div style={styles.chipGrid}>
                                    {meta.commodities.map(c => (
                                        <button key={c} type="button"
                                            onClick={() => toggleItem(c, selectedCommodities, setSelectedCommodities)}
                                            style={{
                                                ...styles.chip,
                                                background: isSelected(c, selectedCommodities) ? activeGradient : 'white',
                                                color: isSelected(c, selectedCommodities) ? 'white' : '#374151',
                                                border: `1.5px solid ${isSelected(c, selectedCommodities) ? activeColor : '#d1d5db'}`,
                                                boxShadow: isSelected(c, selectedCommodities) ? `0 2px 8px ${activeColor}40` : 'none',
                                            }}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Submit */}
                    <button type="submit" disabled={saving} style={{ ...styles.submitBtn, background: activeGradient, boxShadow: `0 8px 25px ${activeColor}40` }}>
                        {saving ? (
                            <span><span style={styles.spinnerInline} /> Saving...</span>
                        ) : (
                            <span>{isEditMode ? '✅ Update Profile' : 'Complete Setup & Go to Dashboard →'}</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '32px 16px 60px',
    },
    container: {
        width: '100%',
        maxWidth: '800px',
    },
    loadingBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #e5e7eb',
        borderTop: '3px solid #059669',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    header: {
        textAlign: 'center',
        marginBottom: '28px',
    },
    stepBadge: {
        display: 'inline-block',
        fontWeight: '700',
        fontSize: '13px',
        padding: '5px 16px',
        borderRadius: '20px',
        marginBottom: '14px',
        letterSpacing: '0.5px',
    },
    title: {
        fontSize: '30px',
        fontWeight: '800',
        margin: '0 0 10px',
    },
    subtitle: {
        fontSize: '15px',
        color: '#6b7280',
        margin: 0,
    },
    card: {
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    errorBanner: {
        background: '#fee2e2',
        color: '#991b1b',
        borderLeft: '4px solid #ef4444',
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    fieldRow: {
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
    },
    label: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#111827',
        display: 'flex',
        alignItems: 'center',
    },
    required: {
        color: '#ef4444',
        marginLeft: '4px',
    },
    labelNote: {
        fontWeight: '500',
        color: '#9ca3af',
        fontSize: '12px',
        marginLeft: '6px',
    },
    select: {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '10px',
        border: '2px solid #d1d5db',
        fontSize: '14px',
        color: '#111827',
        background: 'white',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    },
    inputRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    input: {
        flex: 1,
        padding: '12px 14px',
        borderRadius: '10px',
        border: '2px solid #d1d5db',
        fontSize: '14px',
        color: '#111827',
        background: 'white',
        outline: 'none',
        boxSizing: 'border-box',
    },
    inputUnit: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#6b7280',
        whiteSpace: 'nowrap',
    },
    chipGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    chip: {
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        letterSpacing: '0.2px',
    },
    radioGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '2px solid #d1d5db',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        transition: 'all 0.18s',
    },
    radioIndicator: {
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        border: '2px solid #d1d5db',
        flexShrink: 0,
        transition: 'all 0.18s',
    },
    submitBtn: {
        width: '100%',
        padding: '16px',
        border: 'none',
        borderRadius: '14px',
        color: 'white',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        letterSpacing: '0.4px',
        marginTop: '8px',
        transition: 'all 0.25s ease',
    },
    spinnerInline: {
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255,255,255,0.4)',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginRight: '8px',
        verticalAlign: 'middle',
    },
};

export default ProfileSetup;
