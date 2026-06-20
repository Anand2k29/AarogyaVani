import React, { useState, useEffect } from 'react';
import { getCurrentUser, getDataNamespace } from '../services/authService';
import { useLanguage } from '../src/context/LanguageContext';

interface Colors {
    card: string; subtle: string; border: string;
    txtPri: string; txtSec: string; txtMuted: string;
    accent: string; red: string;
}
interface SOSProps { s: Colors; isAnchor: boolean; }

const getLS = () => ({
    contacts: `${getDataNamespace()}_sos_contacts`,
    prefs: `${getDataNamespace()}_sos_prefs`,
    alert: `${getDataNamespace()}_sos_alert`,
    checkin: `${getDataNamespace()}_anchor_checkin`
});

type Contact = { id: string; name: string; phone: string };

/* ────────────────────────────────────────────────────────
   PATIENT VIEW
──────────────────────────────────────────────────────── */
const PatientSOS: React.FC<{ s: Colors }> = ({ s }) => {
    const LS = getLS();
    const { t } = useLanguage();
    const [contacts, setContacts] = useState<Contact[]>(
        () => { try { return JSON.parse(localStorage.getItem(LS.contacts) || '[]'); } catch { return []; } }
    );
    const [prefs, setPrefs] = useState<{ whatsapp: boolean; anchorAlert: boolean }>(
        () => { try { return JSON.parse(localStorage.getItem(LS.prefs) || '{"whatsapp":true,"anchorAlert":true}'); } catch { return { whatsapp: true, anchorAlert: true }; } }
    );
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [sosSent, setSosSent] = useState(false);
    const [checkIn, setCheckIn] = useState<string | null>(
        () => { try { return localStorage.getItem(LS.checkin); } catch { return null; } }
    );

    const user = getCurrentUser();

    const saveContacts = (c: Contact[]) => { setContacts(c); localStorage.setItem(LS.contacts, JSON.stringify(c)); };
    const savePrefs = (p: typeof prefs) => { setPrefs(p); localStorage.setItem(LS.prefs, JSON.stringify(p)); };

    const addContact = () => {
        if (!newName.trim() || !newPhone.trim()) return;
        saveContacts([...contacts, { id: Date.now().toString(36), name: newName.trim(), phone: newPhone.trim() }]);
        setNewName(''); setNewPhone(''); setShowAddForm(false);
    };

    const notifyContacts = () => {
        const userName = user?.name || 'Someone';
        setSosSent(true);
        if (prefs.anchorAlert) {
            localStorage.setItem(LS.alert, JSON.stringify({ from: userName, at: Date.now() }));
            // Clear sent flag after 5s
            setTimeout(() => setSosSent(false), 5000);
        }
        if (prefs.whatsapp && contacts.length > 0) {
            const msg = encodeURIComponent(`🆘 EMERGENCY: ${userName} needs immediate help! Please call them now.`);
            // Open WhatsApp for each contact
            contacts.forEach((c, i) => {
                setTimeout(() => {
                    window.open(`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
                }, i * 600);
            });
        } else if (prefs.whatsapp) {
            const msg = encodeURIComponent(`🆘 EMERGENCY: ${user?.name || 'Someone'} needs immediate help!`);
            window.open(`https://wa.me/?text=${msg}`, '_blank');
        }
        if (!prefs.whatsapp && !prefs.anchorAlert) {
            alert('Please enable at least one alert method in the settings below.');
            setSosSent(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', background: s.subtle, border: `1px solid ${s.border}`,
        borderRadius: 12, padding: '12px 14px', fontSize: 15, fontWeight: 500,
        color: s.txtPri, outline: 'none', fontFamily: 'Inter, system-ui, sans-serif',
        boxSizing: 'border-box',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', color: s.txtPri }}>
                    SOS & <span style={{ color: s.red }}>Emergency</span>
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: s.txtMuted }}>Alert your family instantly in a medical emergency</p>
            </div>

            {/* Check-in banner from anchor */}
            {checkIn && (
                <div style={{ background: 'rgba(29,185,84,0.1)', border: '1px solid rgba(29,185,84,0.3)', borderRadius: 16, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span style={{ fontSize: 28 }}>💚</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: s.accent }}>Your Care Anchor checked in!</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: s.txtMuted }}>"{checkIn}"</p>
                    </div>
                    <button onClick={() => { localStorage.removeItem(LS.checkin); setCheckIn(null); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: s.txtMuted }}>✕</button>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                BIG EMERGENCY BUTTON — unmistakably clear & pressable
            ───────────────────────────────────────────────────────── */}
            <div style={{ position: 'relative' }}>
                {/* Animated pulsing ring behind the button */}
                {!sosSent && (
                    <>
                        <div style={{
                            position: 'absolute', inset: -6, borderRadius: 28,
                            border: '2px solid rgba(229,57,53,0.5)',
                            animation: 'sosRing1 2s ease-out infinite',
                            pointerEvents: 'none',
                        }} />
                        <div style={{
                            position: 'absolute', inset: -14, borderRadius: 34,
                            border: '2px solid rgba(229,57,53,0.25)',
                            animation: 'sosRing2 2s ease-out infinite 0.5s',
                            pointerEvents: 'none',
                        }} />
                    </>
                )}
                <button onClick={notifyContacts}
                    style={{
                        background: sosSent
                            ? 'linear-gradient(135deg, #1b5e20, #2e7d32)'
                            : 'linear-gradient(135deg, #c62828, #e53935, #ef5350)',
                        color: '#fff', border: 'none',
                        borderRadius: 22, padding: '32px 24px 28px',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 18, width: '100%', cursor: 'pointer',
                        boxShadow: sosSent
                            ? '0 6px 24px rgba(46,125,50,0.5)'
                            : '0 10px 40px rgba(229,57,53,0.55)',
                        transition: 'all 0.4s', position: 'relative', overflow: 'hidden',
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                    onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {/* Shimmer stripe */}
                    {!sosSent && (
                        <div style={{
                            position: 'absolute', top: 0, left: '-60%', width: '40%', height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                            animation: 'shimmer 2.5s ease-in-out infinite',
                            pointerEvents: 'none',
                        }} />
                    )}

                    {/* Icon circle */}
                    <div style={{
                        width: 88, height: 88,
                        background: 'rgba(255,255,255,0.18)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 48, border: '3px solid rgba(255,255,255,0.3)',
                    }}>
                        {sosSent ? '✅' : '🆘'}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                            {sosSent ? 'Alert Sent! ✓' : '👆 TAP TO ALERT FAMILY'}
                        </div>
                        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 8, lineHeight: 1.5, maxWidth: 320 }}>
                            {sosSent
                                ? 'Your family has been notified. Help is on the way.'
                                : contacts.length > 0
                                    ? `Will send emergency WhatsApp to ${contacts.map(c => c.name).join(' & ')}`
                                    : 'Add a family contact below, then press this button in an emergency'}
                        </div>
                    </div>
                </button>
            </div>

            {/* CSS keyframes injected once */}
            <style>{`
                @keyframes sosRing1 { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:0;transform:scale(1.06)} }
                @keyframes sosRing2 { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:0;transform:scale(1.1)} }
                @keyframes shimmer { 0%{left:-60%} 100%{left:130%} }
            `}</style>

            {/* Alert Toggles */}
            <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20 }}>
                <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.txtMuted }}>Alert Settings</p>
                {[
                    { key: 'whatsapp' as const, icon: '📱', label: 'WhatsApp All Contacts', sub: 'Sends emergency text to all saved contacts' },
                    { key: 'anchorAlert' as const, icon: '🛡️', label: 'Alert Care Anchor on App', sub: "Shows a red SOS banner on the anchor's dashboard" },
                ].map((item, idx) => (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: idx === 0 ? `1px solid ${s.border}` : 'none' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <span style={{ fontSize: 22 }}>{item.icon}</span>
                            <div>
                                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: s.txtPri }}>{item.label}</p>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: s.txtMuted }}>{item.sub}</p>
                            </div>
                        </div>
                        <button onClick={() => savePrefs({ ...prefs, [item.key]: !prefs[item.key] })}
                            style={{ width: 48, height: 28, borderRadius: 50, border: 'none', cursor: 'pointer', transition: 'background 0.25s', background: prefs[item.key] ? s.accent : s.subtle, position: 'relative', flexShrink: 0 }}
                        >
                            <span style={{ position: 'absolute', top: 4, left: prefs[item.key] ? 24 : 4, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transition: 'left 0.25s' }} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Emergency Contacts */}
            <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.txtMuted }}>Emergency Contacts ({contacts.length})</p>
                    <button onClick={() => setShowAddForm(f => !f)}
                        style={{ background: showAddForm ? s.subtle : s.accent, color: showAddForm ? s.txtSec : '#000', border: 'none', borderRadius: 50, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}
                    >{showAddForm ? '✕ Close' : '+ Add Contact'}</button>
                </div>

                {showAddForm && (
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                        <input style={{ ...inputStyle, flex: '1 1 140px' }} type="text" placeholder="Name (e.g. Arjun)" value={newName} onChange={e => setNewName(e.target.value)} />
                        <input style={{ ...inputStyle, flex: '1 1 140px' }} type="tel" placeholder="+91 98765 43210" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                        <button onClick={addContact} style={{ background: s.accent, color: '#000', border: 'none', borderRadius: 10, padding: '12px 18px', cursor: 'pointer', fontWeight: 900, fontSize: 14 }}>Save</button>
                    </div>
                )}

                {contacts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <p style={{ fontSize: 32, margin: '0 0 10px' }}>👥</p>
                        <p style={{ fontSize: 14, color: s.txtMuted, margin: 0 }}>No contacts yet. Add your family member's number so they receive alerts when you need help.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {contacts.map((c, i) => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: i === 0 ? 'rgba(229,57,53,0.08)' : s.subtle, borderRadius: 14, border: i === 0 ? '1px solid rgba(229,57,53,0.2)' : 'none' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: i === 0 ? s.red : '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 17, flexShrink: 0 }}>
                                    {c.name[0].toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: s.txtPri }}>
                                        {c.name}
                                        {i === 0 && <span style={{ fontSize: 10, background: s.red, color: '#fff', borderRadius: 50, padding: '2px 6px', fontWeight: 700, marginLeft: 8 }}>PRIMARY</span>}
                                    </p>
                                    <a href={`tel:${c.phone}`} style={{ fontSize: 13, color: s.accent, fontWeight: 600, textDecoration: 'none' }}>{c.phone}</a>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <a href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                                        style={{ background: '#25d366', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>💬</a>
                                    <button onClick={() => saveContacts(contacts.filter(x => x.id !== c.id))}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: s.txtMuted, padding: 4 }}>🗑</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick actions row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={() => navigator.geolocation?.getCurrentPosition(pos => {
                    const { latitude: lat, longitude: lon } = pos.coords;
                    window.open(`https://wa.me/?text=${encodeURIComponent(`📍 I need help! My location: https://maps.google.com/?q=${lat},${lon}`)}`, '_blank');
                })}
                    style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 16, padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'center' }}
                >
                    <span style={{ fontSize: 28 }}>📍</span>
                    <div style={{ fontSize: 13, fontWeight: 800, color: s.txtPri }}>Share Location</div>
                    <div style={{ fontSize: 11, color: s.txtMuted }}>via WhatsApp</div>
                </button>
                <button onClick={() => window.open('tel:108')}
                    style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 16, padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'center' }}
                >
                    <span style={{ fontSize: 28 }}>🚑</span>
                    <div style={{ fontSize: 13, fontWeight: 800, color: s.txtPri }}>Call Ambulance</div>
                    <div style={{ fontSize: 11, color: s.txtMuted }}>108 (India)</div>
                </button>
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────────────────
   ANCHOR VIEW — completely different
──────────────────────────────────────────────────────── */
const AnchorSOS: React.FC<{ s: Colors }> = ({ s }) => {
    const LS = getLS();
    const { t } = useLanguage();
    const [contacts, setContacts] = useState<Contact[]>(
        () => { try { return JSON.parse(localStorage.getItem(LS.contacts) || '[]'); } catch { return []; } }
    );
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [checkInMsg, setCheckInMsg] = useState('');
    const [checkInSent, setCheckInSent] = useState(false);
    const [sosAlert, setSosAlert] = useState<{ from: string; at: number } | null>(
        () => { try { const a = localStorage.getItem(LS.alert); return a ? JSON.parse(a) : null; } catch { return null; } }
    );
    const [calledAt, setCalledAt] = useState<string | null>(null);

    const user = getCurrentUser();

    useEffect(() => {
        // Poll for new SOS alerts every 5 seconds
        const interval = setInterval(() => {
            try {
                const a = localStorage.getItem(LS.alert);
                setSosAlert(a ? JSON.parse(a) : null);
            } catch { /* noop */ }
        }, 5000);
        return () => clearInterval(interval);
    }, [LS.alert]);

    const saveContacts = (c: Contact[]) => { setContacts(c); localStorage.setItem(LS.contacts, JSON.stringify(c)); };

    const addContact = () => {
        if (!newName.trim() || !newPhone.trim()) return;
        saveContacts([...contacts, { id: Date.now().toString(36), name: newName.trim(), phone: newPhone.trim() }]);
        setNewName(''); setNewPhone(''); setShowAddForm(false);
    };

    const dismissAlert = () => {
        localStorage.removeItem(LS.alert);
        setSosAlert(null);
    };

    const sendCheckIn = () => {
        const msg = checkInMsg.trim() || 'Checking in — how are you feeling today? 💚';
        localStorage.setItem(LS.checkin, msg);
        setCheckInSent(true);
        setCheckInMsg('');
        setTimeout(() => setCheckInSent(false), 3000);
    };

    const callPatient = (phone: string, name: string) => {
        setCalledAt(name);
        window.open(`tel:${phone}`);
        setTimeout(() => setCalledAt(null), 3000);
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', background: s.subtle, border: `1px solid ${s.border}`,
        borderRadius: 12, padding: '12px 14px', fontSize: 15, fontWeight: 500,
        color: s.txtPri, outline: 'none', fontFamily: 'Inter, system-ui, sans-serif',
        boxSizing: 'border-box',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', color: s.txtPri }}>
                    Patient <span style={{ color: '#64b5f6' }}>Safety</span>
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: s.txtMuted }}>
                    Managing emergency settings for <strong style={{ color: '#fff' }}>{user?.linkedPatientName}</strong>
                </p>
            </div>

            {/* SOS Alert — Live banner */}
            {sosAlert ? (
                <div style={{ background: 'rgba(229,57,53,0.18)', border: '2px solid rgba(229,57,53,0.5)', borderRadius: 20, padding: 20 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 44, lineHeight: 1 }}>🚨</span>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#ef5350' }}>SOS ALERT RECEIVED</p>
                            <p style={{ margin: '4px 0 12px', fontSize: 14, color: s.txtSec }}>
                                <strong>{sosAlert.from}</strong> pressed the emergency button at{' '}
                                <strong>{new Date(sosAlert.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>
                            </p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {contacts.length > 0 && (
                                    <button onClick={() => callPatient(contacts[0].phone, contacts[0].name)}
                                        style={{ background: s.red, color: '#fff', border: 'none', borderRadius: 50, padding: '10px 18px', cursor: 'pointer', fontWeight: 900, fontSize: 14 }}>
                                        📞 Call {contacts[0].name}
                                    </button>
                                )}
                                <button onClick={dismissAlert}
                                    style={{ background: s.subtle, color: s.txtSec, border: 'none', borderRadius: 50, padding: '10px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                                    ✅ Mark Safe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ background: 'rgba(29,185,84,0.08)', border: '1px solid rgba(29,185,84,0.2)', borderRadius: 16, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 24 }}>✅</span>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: s.accent }}>No active SOS alerts — everything looks safe</p>
                </div>
            )}

            {/* Check-in sender */}
            <div style={{ background: s.card, border: '1px solid rgba(21,101,192,0.25)', borderRadius: 20, padding: 20 }}>
                <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64b5f6' }}>💌 Send a Check-In Message</p>
                <p style={{ margin: '0 0 14px', fontSize: 14, color: s.txtMuted }}>Send a quick message to the patient — it pops up as a banner on their SOS screen.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input style={{ ...inputStyle, flex: 1 }} type="text" placeholder='e.g. "Did you take your morning medicine?"'
                        value={checkInMsg} onChange={e => setCheckInMsg(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendCheckIn()} />
                    <button onClick={sendCheckIn}
                        style={{ background: checkInSent ? s.accent : '#1565c0', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 18px', cursor: 'pointer', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                        {checkInSent ? '✓ Sent!' : 'Send'}
                    </button>
                </div>
            </div>

            {/* Emergency Contacts Management for the Patient */}
            <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.txtMuted }}>Patient Emergency Contacts</p>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: s.txtMuted }}>These contacts will receive the patient's SOS alerts</p>
                    </div>
                    <button onClick={() => setShowAddForm(f => !f)}
                        style={{ background: showAddForm ? s.subtle : '#1565c0', color: '#fff', border: 'none', borderRadius: 50, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}
                    >{showAddForm ? '✕' : '+ Add'}</button>
                </div>

                {showAddForm && (
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                        <input style={{ ...inputStyle, flex: '1 1 140px' }} type="text" placeholder="Contact Name" value={newName} onChange={e => setNewName(e.target.value)} />
                        <input style={{ ...inputStyle, flex: '1 1 140px' }} type="tel" placeholder="+91 98765 43210" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                        <button onClick={addContact} style={{ background: '#1565c0', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', cursor: 'pointer', fontWeight: 900, fontSize: 14 }}>Save</button>
                    </div>
                )}

                {contacts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <p style={{ fontSize: 32, margin: '0 0 10px' }}>👥</p>
                        <p style={{ fontSize: 14, color: s.txtMuted, margin: 0 }}>No emergency contacts yet. Add family members who should be alerted if the patient presses SOS.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {contacts.map((c, i) => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: i === 0 ? 'rgba(21,101,192,0.1)' : s.subtle, borderRadius: 14, border: i === 0 ? '1px solid rgba(21,101,192,0.25)' : 'none' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: i === 0 ? '#1565c0' : '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 17, flexShrink: 0 }}>
                                    {c.name[0].toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: s.txtPri }}>
                                        {c.name}
                                        {i === 0 && <span style={{ fontSize: 10, background: '#1565c0', color: '#fff', borderRadius: 50, padding: '2px 6px', fontWeight: 700, marginLeft: 8 }}>PRIMARY</span>}
                                    </p>
                                    <a href={`tel:${c.phone}`} style={{ fontSize: 13, color: '#64b5f6', fontWeight: 600, textDecoration: 'none' }}>{c.phone}</a>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => callPatient(c.phone, c.name)}
                                        style={{ background: calledAt === c.name ? s.accent : 'rgba(21,101,192,0.2)', color: calledAt === c.name ? '#000' : '#64b5f6', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                                        {calledAt === c.name ? 'Calling…' : '📞'}
                                    </button>
                                    <button onClick={() => saveContacts(contacts.filter(x => x.id !== c.id))}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: s.txtMuted, padding: 4 }}>🗑</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick action: WhatsApp patient's primary contact */}
            {contacts.length > 0 && (
                <button onClick={() => {
                    const msg = encodeURIComponent(`Hi ${contacts[0].name}, I'm checking in about your health. Please respond when you can.`);
                    window.open(`https://wa.me/${contacts[0].phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
                }}
                    style={{ background: s.card, border: '1px solid rgba(37,211,102,0.3)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, width: '100%', cursor: 'pointer', textAlign: 'left' }}
                >
                    <span style={{ fontSize: 28 }}>💬</span>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: s.txtPri }}>WhatsApp {contacts[0].name}</div>
                        <div style={{ fontSize: 13, color: s.txtMuted, fontWeight: 500 }}>Send a quick health check message</div>
                    </div>
                </button>
            )}
        </div>
    );
};

/* ────────────────────────────────────────────────────────
   ROUTER — picks patient or anchor view
──────────────────────────────────────────────────────── */
export const SOSContent: React.FC<SOSProps> = ({ s, isAnchor }) => {
    if (isAnchor) return <AnchorSOS s={s} />;
    return <PatientSOS s={s} />;
};
