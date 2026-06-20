import React, { useState, useEffect, useRef } from 'react';
import { getDataNamespace } from '../services/authService';

interface PHIVaultContentProps { s: any }

interface PHIEntry {
    id: string;
    title: string;
    category: string;
    content: string;
    updatedAt: number;
}

const CATEGORIES = [
    { id: 'allergy', label: '⚠️ Allergies', color: '#ef5350' },
    { id: 'surgery', label: '🏥 Past Surgeries', color: '#ab47bc' },
    { id: 'condition', label: '💊 Conditions', color: '#ff7043' },
    { id: 'doctor', label: '🩺 Doctor Notes', color: '#42a5f5' },
    { id: 'insurance', label: '📋 Insurance', color: '#26a69a' },
    { id: 'other', label: '📁 Other', color: '#78909c' },
];

const PIN_KEY = () => `${getDataNamespace()}_phi_pin`;
const DATA_KEY = () => `${getDataNamespace()}_phi_entries`;

function loadPin(): string | null {
    return localStorage.getItem(PIN_KEY());
}
function checkPin(pin: string): boolean {
    return localStorage.getItem(PIN_KEY()) === pin;
}
function savePin(pin: string) {
    localStorage.setItem(PIN_KEY(), pin);
}
function loadEntries(): PHIEntry[] {
    try { return JSON.parse(localStorage.getItem(DATA_KEY()) || '[]'); } catch { return []; }
}
function persistEntries(entries: PHIEntry[]) {
    localStorage.setItem(DATA_KEY(), JSON.stringify(entries));
}

/* ── PIN PAD ─────────────────────────────────────────────────────── */
const PinPad: React.FC<{
    mode: 'setup' | 'unlock';
    s: any;
    onSuccess: () => void;
}> = ({ mode, s, onSuccess }) => {
    const [pin, setPin] = useState('');
    const [confirm, setConfirm] = useState('');
    const [step, setStep] = useState<'enter' | 'confirm'>('enter');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 600);
    };

    const handleDigit = (d: string) => {
        if (mode === 'setup') {
            if (step === 'enter') {
                const next = pin + d;
                if (next.length <= 4) {
                    setPin(next);
                    if (next.length === 4) setStep('confirm');
                }
            } else {
                const next = confirm + d;
                if (next.length <= 4) {
                    setConfirm(next);
                    if (next.length === 4) {
                        if (next === pin) { savePin(next); onSuccess(); }
                        else { setError("PINs don't match. Try again."); setConfirm(''); setPin(''); setStep('enter'); triggerShake(); }
                    }
                }
            }
        } else {
            const next = pin + d;
            if (next.length <= 4) {
                setPin(next);
                if (next.length === 4) {
                    if (checkPin(next)) onSuccess();
                    else { setError('Incorrect PIN. Try again.'); setPin(''); triggerShake(); }
                }
            }
        }
    };

    const handleBack = () => {
        if (step === 'confirm') { if (confirm.length > 0) setConfirm(c => c.slice(0, -1)); }
        else setPin(p => p.slice(0, -1));
    };

    const currentPin = step === 'confirm' ? confirm : pin;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, maxWidth: 320, margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
                <h3 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: s.txtPri, fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif' }}>
                    {mode === 'setup' ? (step === 'enter' ? 'Create Vault PIN' : 'Confirm PIN') : 'Enter Vault PIN'}
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: s.txtMuted }}>
                    {mode === 'setup' ? 'This PIN protects your private health information.' : 'Enter your 4-digit PIN to continue.'}
                </p>
            </div>

            {/* PIN dots */}
            <div style={{ display: 'flex', gap: 20, animation: shake ? 'pinShake 0.5s ease' : 'none' }}>
                <style>{`@keyframes pinShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }`}</style>
                {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                        width: i < currentPin.length ? 24 : 18, height: i < currentPin.length ? 24 : 18, borderRadius: '50%',
                        background: i < currentPin.length ? s.accent : s.subtle,
                        border: i < currentPin.length ? 'none' : `2px solid ${s.border}`,
                        boxShadow: i < currentPin.length ? `0 0 16px rgba(232,84,122,0.4)` : 'none',
                        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        margin: i < currentPin.length ? 0 : 3
                    }} />
                ))}
            </div>

            {error && <p style={{ margin: 0, fontSize: 13, color: '#ef5350', fontWeight: 700 }}>{error}</p>}

            {/* Glassmorphic Keypad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, width: '100%', maxWidth: 280 }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d, i) => (
                    <button key={i} onClick={() => d === '⌫' ? handleBack() : d && handleDigit(d)}
                        disabled={d === ''}
                        style={{
                            aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: d === '⌫' ? 'none' : `1px solid ${d ? s.border : 'transparent'}`,
                            borderRadius: '50%', background: d && d !== '⌫' ? s.subtle : 'transparent',
                            color: d === '⌫' ? s.red : s.txtPri,
                            fontSize: 26, fontWeight: 700, cursor: d ? 'pointer' : 'default',
                            transition: 'all 0.2s', backdropFilter: d && d !== '⌫' ? 'blur(10px)' : 'none',
                            fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
                            opacity: d === '' ? 0 : 1, visibility: d === '' ? 'hidden' : 'visible'
                        }}
                        onMouseEnter={e => { if (d && d !== '⌫') { e.currentTarget.style.background = 'rgba(232,84,122,0.15)'; e.currentTarget.style.transform = 'scale(1.05)'; } else if (d === '⌫') { e.currentTarget.style.transform = 'scale(1.1)'; } }}
                        onMouseLeave={e => { if (d && d !== '-') { e.currentTarget.style.background = s.subtle; e.currentTarget.style.transform = 'scale(1)'; } else if (d === '⌫') { e.currentTarget.style.transform = 'scale(1)'; } }}
                        onMouseDown={e => { if (d) e.currentTarget.style.transform = 'scale(0.95)'; }}
                        onMouseUp={e => { if (d) e.currentTarget.style.transform = d !== '⌫' ? 'scale(1.05)' : 'scale(1.1)'; }}
                    >
                        {d}
                    </button>
                ))}
            </div>
        </div>
    );
};

/* ── MAIN VAULT ───────────────────────────────────────────────────── */
export const PHIVaultContent: React.FC<PHIVaultContentProps> = ({ s }) => {
    const [unlocked, setUnlocked] = useState(false);
    const [pinMode, setPinMode] = useState<'setup' | 'unlock'>(loadPin() ? 'unlock' : 'setup');
    const [entries, setEntries] = useState<PHIEntry[]>([]);
    const [addCat, setAddCat] = useState<string | null>(null);
    const [editEntry, setEditEntry] = useState<PHIEntry | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [filterCat, setFilterCat] = useState<string | null>(null);

    const lock = () => { setUnlocked(false); setPinMode('unlock'); };

    const onUnlock = () => {
        setEntries(loadEntries());
        setUnlocked(true);
    };

    const saveEntry = () => {
        if (!formTitle.trim() || !formContent.trim()) return;
        const category = addCat || editEntry?.category || 'other';
        if (editEntry) {
            const updated = entries.map(e => e.id === editEntry.id ? { ...e, title: formTitle, content: formContent, updatedAt: Date.now() } : e);
            setEntries(updated);
            persistEntries(updated);
        } else {
            const entry: PHIEntry = { id: Date.now().toString(), title: formTitle, category, content: formContent, updatedAt: Date.now() };
            const updated = [entry, ...entries];
            setEntries(updated);
            persistEntries(updated);
        }
        setAddCat(null); setEditEntry(null); setFormTitle(''); setFormContent('');
    };

    const deleteEntry = (id: string) => {
        const updated = entries.filter(e => e.id !== id);
        setEntries(updated);
        persistEntries(updated);
    };

    const inputStyle: React.CSSProperties = {
        background: s.subtle, border: `1px solid ${s.border}`, borderRadius: 14,
        padding: '13px 16px', fontSize: 15, fontWeight: 500, color: s.txtPri,
        outline: 'none', fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
        boxSizing: 'border-box', width: '100%',
    };

    if (!unlocked) {
        return (
            <div style={{
                background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
                border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 28,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '8px', background: 'linear-gradient(180deg, rgba(232,84,122,0.05) 0%, transparent 100%)' }}>
                    <PinPad mode={pinMode} s={s} onSuccess={onUnlock} />
                </div>
            </div>
        );
    }

    const filtered = filterCat ? entries.filter(e => e.category === filterCat) : entries;
    const catMeta = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

    /* Add / Edit form */
    if (addCat || editEntry) {
        const cat = catMeta[addCat || editEntry?.category || 'other'];
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => { setAddCat(null); setEditEntry(null); }} style={{ background: s.subtle, border: `1px solid ${s.border}`, color: s.txtPri, borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>← Back</button>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: s.txtPri, fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif' }}>{editEntry ? 'Edit' : 'Add'} {cat.label}</h3>
                </div>
                <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.txtMuted, marginBottom: 6 }}>Title</label>
                        <input style={inputStyle} placeholder={`e.g. Penicillin Allergy`} value={formTitle}
                            onChange={e => setFormTitle(e.target.value)}
                            defaultValue={editEntry?.title || ''}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.txtMuted, marginBottom: 6 }}>Details</label>
                        <textarea style={{ ...inputStyle, minHeight: 140, resize: 'vertical' } as any}
                            placeholder="Enter your private health notes here..."
                            value={formContent}
                            onChange={e => setFormContent(e.target.value)}
                            defaultValue={editEntry?.content || ''}
                        />
                    </div>
                    <button onClick={saveEntry}
                        style={{ background: 'linear-gradient(135deg,#E8547A,#D43369)', color: '#fff', border: 'none', borderRadius: 50, padding: '14px 28px', fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif', fontWeight: 900, fontSize: 15, cursor: 'pointer', width: '100%' }}
                    >
                        💾 Save to Vault
                    </button>
                    <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: s.txtMuted }}>🔐 Stored locally on your device only — never uploaded.</p>
                </div>
            </div>
        );
    }

    /* Vault main view */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: s.txtPri, letterSpacing: '-0.03em', fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif' }}>🔐 PHI Vault</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: s.txtMuted }}>Your private health data — stored only on this device.</p>
                </div>
                <button onClick={lock}
                    style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.2)', color: '#ef5350', borderRadius: 50, padding: '10px 20px', cursor: 'pointer', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,57,53,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(229,57,53,0.1)'}
                ><span>🔒</span> Lock Vault</button>
            </div>

            {/* Security banner */}
            <div style={{ background: 'rgba(232,84,122,0.07)', border: `1px solid ${s.border}`, borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>🛡️</span>
                <p style={{ margin: 0, fontSize: 13, color: s.txtMuted, lineHeight: 1.5 }}>All data is stored locally on your device using your private PIN. Nothing is sent to any server.</p>
            </div>

            {/* Category grid — Add buttons */}
            <div>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.txtMuted }}>Add Health Information</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {CATEGORIES.map(c => (
                        <button key={c.id} onClick={() => { setAddCat(c.id); setFormTitle(''); setFormContent(''); }}
                            style={{ padding: '12px 8px', background: `${c.color}0f`, border: `1px solid ${c.color}30`, borderRadius: 14, cursor: 'pointer', color: c.color, fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif', fontWeight: 700, fontSize: 12, textAlign: 'center', transition: 'all 0.2s' }}
                        >
                            {c.label}<br /><span style={{ fontSize: 10, color: s.txtMuted, fontWeight: 600 }}>+ Add</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter tabs */}
            {entries.length > 0 && (
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                    <button onClick={() => setFilterCat(null)}
                        style={{ padding: '6px 14px', borderRadius: 50, border: `1.5px solid ${!filterCat ? s.accent : s.border}`, background: !filterCat ? 'rgba(232,84,122,0.12)' : 'transparent', color: !filterCat ? s.accent : s.txtMuted, fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}
                    >All</button>
                    {CATEGORIES.filter(c => entries.some(e => e.category === c.id)).map(c => (
                        <button key={c.id} onClick={() => setFilterCat(filterCat === c.id ? null : c.id)}
                            style={{ padding: '6px 14px', borderRadius: 50, border: `1.5px solid ${filterCat === c.id ? c.color : s.border}`, background: filterCat === c.id ? `${c.color}18` : 'transparent', color: filterCat === c.id ? c.color : s.txtMuted, fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}
                        >{c.label}</button>
                    ))}
                </div>
            )}

            {/* Entries list */}
            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: s.txtMuted }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>No entries yet. Add your first health record above.</p>
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(entry => {
                    const cat = catMeta[entry.category];
                    return (
                        <div key={entry.id} style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 16, padding: '16px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, background: `${cat.color}18`, color: cat.color, padding: '3px 10px', borderRadius: 50, border: `1px solid ${cat.color}30` }}>{cat.label}</span>
                                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: s.txtPri, fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif' }}>{entry.title}</h4>
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                    <button onClick={() => { setEditEntry(entry); setFormTitle(entry.title); setFormContent(entry.content); }}
                                        style={{ background: s.subtle, border: `1px solid ${s.border}`, color: s.txtMuted, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Edit</button>
                                    <button onClick={() => deleteEntry(entry.id)}
                                        style={{ background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', color: '#ef5350', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Delete</button>
                                </div>
                            </div>
                            <p style={{ margin: 0, fontSize: 14, color: s.txtSec || '#a7a7a7', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{entry.content}</p>
                            <p style={{ margin: '8px 0 0', fontSize: 11, color: s.txtMuted }}>Updated {new Date(entry.updatedAt).toLocaleString()}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
