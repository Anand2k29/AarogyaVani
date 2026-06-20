import React, { useState, useEffect, useCallback } from 'react';
import { Medication, MedLog } from '../types';
import { getCurrentUser, getDataNamespace } from '../services/authService';
import { useLanguage } from '../src/context/LanguageContext';

const getLsMeds = () => `${getDataNamespace()}_medications`;
const getLsLogs = () => `${getDataNamespace()}_med_logs`;

function load<T>(key: string, fallback: T): T {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch { return fallback; }
}
function save(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
}
function todayStr() { return new Date().toISOString().split('T')[0]; }
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function nowHHMM() {
    const n = new Date();
    return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
}

const FREQ_PRESETS = [
    { label: 'Once a day', times: ['08:00'] },
    { label: 'Twice a day', times: ['08:00', '20:00'] },
    { label: 'Three times a day', times: ['08:00', '14:00', '20:00'] },
    { label: 'Custom time', times: [] },
];

const LANGUAGES = [
    { code: 'en-US', name: 'English' },
    { code: 'hi-IN', name: 'Hindi (हिंदी)' },
    { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
    { code: 'te-IN', name: 'Telugu (తెలుగు)' },
    { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
    { code: 'mr-IN', name: 'Marathi (मराठी)' },
    { code: 'bn-IN', name: 'Bengali (বাংলা)' },
];

export const MedicationReminders: React.FC<{ onTakeSuccess?: () => void }> = ({ onTakeSuccess }) => {
    const [meds, setMeds] = useState<Medication[]>(() => load(getLsMeds(), []));
    const [logs, setLogs] = useState<MedLog[]>(() => load(getLsLogs(), []));
    const [showForm, setShowForm] = useState(false);
    const [isDark] = useState(false); // Forced Light Mode for AarogyaVani theme
    const [form, setForm] = useState({ name: '', dosage: '', preset: 0, customTime: '08:00', notes: '', lang: 'en-US' });

    // Detect anchors — they can add/edit medicines
    const user = getCurrentUser();
    const isAnchor = user?.role === 'anchor';
    const { t } = useLanguage();

    // Removed dark mode observer as we are forcing light mode for AarogyaVani theme.

    useEffect(() => { save(getLsMeds(), meds); }, [meds]);
    useEffect(() => { save(getLsLogs(), logs); }, [logs]);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Voice reminder
    const speakReminder = (medName: string, dosage: string, langCode: string) => {
        if (!('speechSynthesis' in window)) return;
        const u = new SpeechSynthesisUtterance();
        u.lang = langCode;
        u.text = langCode.startsWith('hi')
            ? `आपकी दवा लेने का समय हो गया है: ${medName}. खुराक: ${dosage}`
            : langCode.startsWith('kn')
                ? `ನಿಮ್ಮ ಔಷಧಿಯನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ: ${medName}. ಡೋಸೇಜ್: ${dosage}`
                : `Time to take your medicine: ${medName}. Dosage: ${dosage}`;
        window.speechSynthesis.speak(u);
    };

    // Fire reminders on the minute
    useEffect(() => {
        const fire = () => {
            const hhmm = nowHHMM();
            const today = todayStr();
            meds.forEach(m => {
                m.times.forEach(time => {
                    if (time === hhmm) {
                        const alreadyLogged = logs.some(l => l.medicationId === m.id && l.date === today && l.time === time);
                        if (!alreadyLogged) {
                            if ('Notification' in window && Notification.permission === 'granted') {
                                new Notification(`💊 Time to take ${m.name}`, { body: `Dosage: ${m.dosage}`, icon: '/icons/icon.svg' });
                            }
                            speakReminder(m.name, m.dosage, (m as any).lang || 'en-US');
                            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
                        }
                    }
                });
            });
        };
        const interval = setInterval(fire, 60000);
        return () => clearInterval(interval);
    }, [meds, logs]);

    const addMed = useCallback(() => {
        const preset = FREQ_PRESETS[form.preset];
        const times = form.preset === FREQ_PRESETS.length - 1 ? [form.customTime] : preset.times;
        if (!form.name.trim() || times.length === 0) return;
        const med: Medication = {
            id: uid(), name: form.name.trim(), dosage: form.dosage.trim() || '1 tablet',
            times, notes: form.notes.trim() || undefined, lang: form.lang,
        } as any;
        setMeds(p => [...p, med]);
        setForm({ name: '', dosage: '', preset: 0, customTime: '08:00', notes: '', lang: 'en-US' });
        setShowForm(false);
    }, [form]);

    const deleteMed = useCallback((id: string) => { setMeds(p => p.filter(m => m.id !== id)); }, []);

    const logDose = useCallback((med: Medication, time: string, status: 'taken' | 'skipped') => {
        const today = todayStr();
        const existing = logs.findIndex(l => l.medicationId === med.id && l.date === today && l.time === time);
        const entry: MedLog = { id: uid(), medicationId: med.id, medicationName: med.name, date: today, time, status, loggedAt: Date.now() };
        if (existing >= 0) setLogs(p => { const n = [...p]; n[existing] = entry; return n; });
        else setLogs(p => [...p, entry]);

        // Voice praise on taken
        if (status === 'taken') {
            onTakeSuccess?.();

            // Streak Tracking Logic
            const streaksKey = `${getDataNamespace()}_streaks`;
            const streaks = JSON.parse(localStorage.getItem(streaksKey) || '{}');
            const streakToday = todayStr();
            const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
            const yestStr = yesterday.toISOString().split('T')[0];

            let currentStreak = streaks[med.id] || 0;
            const lastTakenDate = streaks[`${med.id}_last`] || '';

            if (lastTakenDate === yestStr) {
                currentStreak += 1;
            } else if (lastTakenDate !== streakToday) {
                currentStreak = 1;
            }

            streaks[med.id] = currentStreak;
            streaks[`${med.id}_last`] = streakToday;
            localStorage.setItem(streaksKey, JSON.stringify(streaks));

            const praise = currentStreak >= 3
                ? `Incredible! A ${currentStreak} day streak for ${med.name}!`
                : 'Great job taking your medicine! Keep it up!';

            if ('speechSynthesis' in window) {
                const u = new SpeechSynthesisUtterance(praise);
                u.lang = (med as any).lang || 'en-US';
                window.speechSynthesis.speak(u);
            }
        }
    }, [logs, onTakeSuccess]);

    const getLog = (medId: string, time: string) =>
        logs.find(l => l.medicationId === medId && l.date === todayStr() && l.time === time);

    /** True if the dose time has already passed today but no action was taken */
    const isPastDue = (time: string, log: MedLog | undefined): boolean => {
        if (log) return false; // already actioned
        return nowHHMM() > time;
    };

    /** Build a WhatsApp pre-filled message for a missed dose */
    const notifyAnchor = (medName: string, time: string) => {
        const userName = user?.name || 'User';
        const message = encodeURIComponent(`⚠️ AarogyaVani Alert: ${userName} missed their ${time} dose of ${medName}. Please check in with them.`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    const recentLogs = [...logs].sort((a, b) => b.loggedAt - a.loggedAt).slice(0, 5);

    const s = {
        card: isDark ? '#1a1a1a' : '#fff',
        subtle: isDark ? '#282828' : '#f2f2f7',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        txtPri: isDark ? '#fff' : '#000',
        txtSec: isDark ? '#a7a7a7' : '#3c3c43',
        txtMuted: isDark ? '#6a6a6a' : '#8e8e93',
        accent: '#E8547A',
        red: '#e53935',
        input: isDark ? '#282828' : '#f2f2f7',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: s.txtMuted, marginBottom: 8,
    };
    const inputStyle: React.CSSProperties = {
        width: '100%', background: s.input, border: `1px solid ${s.border}`,
        borderRadius: 12, padding: '12px 14px', fontSize: 15, fontWeight: 500,
        color: s.txtPri, outline: 'none', fontFamily: 'Inter, system-ui, sans-serif',
        boxSizing: 'border-box',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Anchor banner */}
            {isAnchor && (
                <div style={{ background: 'rgba(21,101,192,0.12)', border: '1px solid rgba(21,101,192,0.3)', borderRadius: 16, padding: '14px 18px' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#64b5f6' }}>
                        🛡️ Managing appointments for <strong style={{ color: '#fff' }}>{user?.linkedPatientName || 'Patient'}</strong>
                    </p>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', color: s.txtPri }}>
                        My <span style={{ color: s.accent }}>Medicines</span>
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: s.txtSec }}>Track your daily doses</p>
                </div>
                <button onClick={() => setShowForm(f => !f)}
                    style={{ background: showForm ? s.subtle : s.accent, color: showForm ? s.txtSec : '#000', border: 'none', borderRadius: 50, padding: '11px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 800, transition: 'all 0.2s' }}
                >
                    {showForm ? '✕ Close' : '+ Add Medicine'}
                </button>
            </div>

            {/* Add Medicine Form */}
            {showForm && (
                <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: s.txtPri }}>Add New Medicine</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Medicine Name</label>
                            <input style={inputStyle} type="text" placeholder="e.g. Paracetamol" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                            <label style={labelStyle}>Dosage</label>
                            <input style={inputStyle} type="text" placeholder="e.g. 500mg" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Frequency</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {FREQ_PRESETS.map((p, i) => (
                                <button key={i} onClick={() => setForm(f => ({ ...f, preset: i }))}
                                    style={{ padding: '9px 16px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.2s', background: form.preset === i ? s.accent : s.subtle, color: form.preset === i ? '#000' : s.txtSec }}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        {form.preset === FREQ_PRESETS.length - 1 && (
                            <div style={{ marginTop: 12 }}>
                                <label style={labelStyle}>Time</label>
                                <input type="time" style={{ ...inputStyle, colorScheme: isDark ? 'dark' : 'light' } as any} value={form.customTime} onChange={e => setForm(f => ({ ...f, customTime: e.target.value }))} />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Voice Language</label>
                            <select style={{ ...inputStyle, colorScheme: isDark ? 'dark' : 'light' } as any} value={form.lang} onChange={e => setForm(f => ({ ...f, lang: e.target.value }))}>
                                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Notes</label>
                            <input style={inputStyle} type="text" placeholder="e.g. After meals" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                        </div>
                    </div>

                    <button onClick={addMed}
                        style={{ background: s.accent, color: '#000', border: 'none', borderRadius: 50, padding: '14px', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}
                    >
                        Save Medicine
                    </button>
                </div>
            )}

            {/* Empty state */}
            {meds.length === 0 && !showForm && (
                <div style={{ textAlign: 'center', background: s.card, border: `1px dashed ${s.border}`, borderRadius: 20, padding: '48px 24px' }}>
                    <p style={{ fontSize: 48, margin: '0 0 12px' }}>💊</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: s.txtMuted, margin: '0 0 6px' }}>No medicines added yet</p>
                    <p style={{ fontSize: 14, color: s.txtMuted, margin: 0 }}>{isAnchor ? `Add medicines for ${user?.linkedPatientName}` : 'Click "+ Add Medicine" to get started'}</p>
                </div>
            )}

            {/* Medicine Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {meds.map(med => (
                    <div key={med.id} style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: s.txtPri, letterSpacing: '-0.01em' }}>{med.name}</h2>
                                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 50, background: `${s.accent}20`, color: s.accent, fontWeight: 700 }}>💊 {med.dosage}</span>
                                    {med.notes && <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 50, background: s.subtle, color: s.txtSec, fontWeight: 600 }}>🍽 {med.notes}</span>}
                                </div>
                            </div>
                            <button onClick={() => deleteMed(med.id)}
                                style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: s.txtMuted, fontSize: 18, lineHeight: 1, transition: 'color 0.2s' }}
                                title="Remove medicine"
                            >🗑</button>
                        </div>

                        {/* Dose time chips */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {med.times.map(time => {
                                const log = getLog(med.id, time);
                                const pastDue = isPastDue(time, log);

                                return (
                                    <div key={time} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: pastDue && !log ? 'rgba(229,57,53,0.06)' : s.subtle, borderRadius: 14, border: pastDue && !log ? `1px solid rgba(229,57,53,0.15)` : 'none', flexWrap: 'wrap', gap: 10 }}>
                                        <div>
                                            <span style={{ fontSize: 20, fontWeight: 900, color: pastDue && !log ? s.red : s.txtPri }}>{time}</span>
                                            {pastDue && !log && <span style={{ fontSize: 11, fontWeight: 700, color: s.red, marginLeft: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚠ Overdue</span>}
                                            {!pastDue && !log && <span style={{ fontSize: 11, fontWeight: 600, color: s.txtMuted, marginLeft: 8 }}>Upcoming</span>}
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {log ? (
                                                <span style={{ fontSize: 13, padding: '6px 14px', borderRadius: 50, fontWeight: 700, background: log.status === 'taken' ? 'rgba(232,84,122,0.15)' : 'rgba(229,57,53,0.12)', color: log.status === 'taken' ? '#E8547A' : s.red }}>
                                                    {log.status === 'taken' ? '✓ Taken' : '✕ Skipped'}
                                                </span>
                                            ) : (
                                                <>
                                                    <button onClick={() => logDose(med, time, 'taken')}
                                                        style={{ background: s.accent, color: '#000', border: 'none', borderRadius: 50, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 800, transition: 'all 0.2s' }}
                                                    >
                                                        ✓ Taken
                                                    </button>
                                                    <button onClick={() => logDose(med, time, 'skipped')}
                                                        style={{ background: s.subtle, color: s.txtMuted, border: 'none', borderRadius: 50, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                                                    >
                                                        Skip
                                                    </button>
                                                    {pastDue && (
                                                        <button onClick={() => notifyAnchor(med.name, time)}
                                                            style={{ background: 'rgba(229,57,53,0.12)', color: s.red, border: `1px solid rgba(229,57,53,0.3)`, borderRadius: 50, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 800 }}
                                                            title="Send WhatsApp alert to your Care Anchor"
                                                        >
                                                            🛡 Notify Care Anchor
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            {recentLogs.length > 0 && (
                <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20 }}>
                    <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.txtMuted }}>Recent Activity</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {recentLogs.map(l => (
                            <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: s.subtle, borderRadius: 12 }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: s.txtPri }}>{l.medicationName}</p>
                                    <p style={{ margin: '2px 0 0', fontSize: 12, color: s.txtMuted }}>{l.date} at {l.time}</p>
                                </div>
                                <span style={{ fontSize: 12, padding: '5px 12px', borderRadius: 50, fontWeight: 700, background: l.status === 'taken' ? 'rgba(232,84,122,0.15)' : 'rgba(229,57,53,0.12)', color: l.status === 'taken' ? '#E8547A' : s.red }}>
                                    {l.status === 'taken' ? '✓ Taken' : '✕ Missed'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
