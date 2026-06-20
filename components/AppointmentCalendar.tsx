import React, { useState, useEffect, useCallback } from 'react';
import { Appointment } from '../types';
import { getCurrentUser, getDataNamespace } from '../services/authService';
import { useLanguage } from '../src/context/LanguageContext';

const getLsAppts = () => `${getDataNamespace()}_appointments`;

function load<T>(key: string, fallback: T): T {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch { return fallback; }
}
function save(key: string, v: unknown) { localStorage.setItem(key, JSON.stringify(v)); }
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function todayStr() { return new Date().toISOString().split('T')[0]; }

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const APPT_COLORS = [
    { bg: 'rgba(232,84,122,0.08)', border: 'rgba(232,84,122,0.2)', text: '#E8547A', dot: '#E8547A' },
    { bg: 'rgba(100,149,237,0.10)', border: 'rgba(100,149,237,0.2)', text: '#42a5f5', dot: '#6495ed' },
    { bg: 'rgba(255,167,38,0.10)', border: 'rgba(255,167,38,0.2)', text: '#f57c00', dot: '#ffa726' },
    { bg: 'rgba(171,71,188,0.10)', border: 'rgba(171,71,188,0.2)', text: '#9c27b0', dot: '#ab47bc' },
    { bg: 'rgba(38,166,154,0.10)', border: 'rgba(38,166,154,0.2)', text: '#00796b', dot: '#26a69a' },
];

export const AppointmentCalendar: React.FC = () => {
    const [appts, setAppts] = useState<Appointment[]>(() => load(getLsAppts(), []));
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [isDark] = useState(false); // Forced Light Mode
    const [form, setForm] = useState({ title: '', doctor: '', location: '', date: todayStr(), time: '10:00', notes: '' });

    const user = getCurrentUser();
    const isAnchor = user?.role === 'anchor';
    const { t } = useLanguage();

    // Removed dark mode observer as we are forcing light mode for AarogyaVani theme.

    useEffect(() => { save(getLsAppts(), appts); }, [appts]);

    const addAppt = useCallback(() => {
        if (!form.title.trim() || !form.date || !form.time) return;
        const appt: Appointment = {
            id: uid(), title: form.title.trim(),
            doctor: form.doctor.trim() || undefined,
            location: form.location.trim() || undefined,
            date: form.date, time: form.time,
            notes: form.notes.trim() || undefined,
        };
        setAppts(p => [...p, appt].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)));
        setForm({ title: '', doctor: '', location: '', date: todayStr(), time: '10:00', notes: '' });
        setShowForm(false);
    }, [form]);

    const deleteAppt = useCallback((id: string) => setAppts(p => p.filter(a => a.id !== id)), []);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const today = todayStr();

    const apptDateSet = new Set(appts.map(a => a.date));
    const apptForSelected = appts.filter(a => a.date === selectedDate);
    const upcoming = appts.filter(a => a.date >= today).slice(0, 6);

    const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

    const s = {
        card: '#fff',
        subtle: '#fdf4f7', // Slightly pinker subtle
        border: 'rgba(232,84,122,0.12)',
        txtPri: '#1A0A10',
        txtSec: '#5C3A4A',
        txtMuted: '#9B7A87',
        accent: '#E8547A',
        accentSec: '#D43369',
        calBg: '#ffffff',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: s.accent, marginBottom: 8, opacity: 0.8
    };
    const inputStyle: React.CSSProperties = {
        width: '100%', background: '#fff', border: `1.5px solid ${s.border}`,
        borderRadius: 16, padding: '14px 16px', fontSize: 15, fontWeight: 500,
        color: s.txtPri, outline: 'none', fontFamily: 'Inter, system-ui, sans-serif',
        boxSizing: 'border-box', transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.6s ease' }}>
            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                @keyframes pulseAccent { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
                .calendar-day:hover { transform: translateY(-2px); background: rgba(232,84,122,0.08) !important; }
            `}</style>

            {/* Anchor banner */}
            {isAnchor && (
                <div style={{ background: `linear-gradient(135deg, ${s.accent}10, ${s.accentSec}10)`, border: `1px solid ${s.accent}20`, borderRadius: 20, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 15px rgba(232,84,122,0.05)' }}>
                    <span style={{ fontSize: 20 }}>🛡️</span>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: s.txtSec }}>
                        Managing appointments for <strong style={{ color: s.accent }}>{user?.linkedPatientName || 'Patient'}</strong>
                    </p>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', color: s.txtPri, fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                        Doctor <span style={{ color: s.accent }}>{t('appointments')}</span>
                    </h1>
                    <p style={{ margin: '6px 0 0', fontSize: 15, color: s.txtSec, fontWeight: 500 }}>{t('appt_subtitle')}</p>
                </div>
                <button onClick={() => setShowForm(f => !f)}
                    style={{ background: showForm ? s.subtle : `linear-gradient(135deg, ${s.accent}, ${s.accentSec})`, color: showForm ? s.txtPri : '#fff', border: 'none', borderRadius: 50, padding: '12px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 900, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: showForm ? 'none' : '0 8px 24px rgba(232,84,122,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    {showForm ? '✕ '+t('appt_close') : '＋ '+t('appt_add')}
                </button>
            </div>

            {/* Add Appointment Form */}
            {showForm && (
                <div style={{ background: '#fff', border: `1px solid ${s.border}`, borderRadius: 28, padding: 32, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.06)', animation: 'fadeUp 0.4s ease' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 900, color: s.txtPri }}>{t('appt_form_title')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>{t('appt_label_title')}</label>
                            <input style={inputStyle} type="text" placeholder="e.g. Cardiology Check-up" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div>
                            <label style={labelStyle}>{t('appt_label_doctor')}</label>
                            <input style={inputStyle} type="text" placeholder="e.g. Dr. Sharma" value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} />
                        </div>
                        <div>
                            <label style={labelStyle}>{t('appt_label_location')}</label>
                            <input style={inputStyle} type="text" placeholder="e.g. Apollo Hospital" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                        </div>
                        <div>
                            <label style={labelStyle}>{t('appt_label_date')}</label>
                            <input style={{ ...inputStyle, colorScheme: 'light' } as any} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                        </div>
                        <div>
                            <label style={labelStyle}>{t('appt_label_time')}</label>
                            <input style={{ ...inputStyle, colorScheme: 'light' } as any} type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                        </div>
                    </div>
                    <button onClick={addAppt}
                        style={{ background: `linear-gradient(100deg, ${s.accent}, ${s.accentSec})`, color: '#fff', border: 'none', borderRadius: 50, padding: '16px', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 900, fontSize: 16, cursor: 'pointer', transition: 'all 0.3s', marginTop: 12, boxShadow: '0 10px 30px rgba(232,84,122,0.2)' }}
                    >
                        {t('appt_save')}
                    </button>
                </div>
            )}

            {/* ── Main Grid Container ───────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Calendar Card */}
                    <div style={{ background: '#fff', border: `1px solid ${s.border}`, borderRadius: 28, padding: 32, boxShadow: '0 8px 40px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                            <button onClick={prevMonth} style={{ width: 44, height: 44, borderRadius: 16, border: `1px solid ${s.border}`, background: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: 20, color: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ fontWeight: 900, fontSize: 22, color: s.txtPri, display: 'block', lineHeight: 1 }}>{MONTH_NAMES[month]}</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: s.txtMuted, marginTop: 4, display: 'block' }}>{year}</span>
                            </div>
                            <button onClick={nextMonth} style={{ width: 44, height: 44, borderRadius: 16, border: `1px solid ${s.border}`, background: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: 20, color: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
                            {DAY_NAMES.map(d => (
                                <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 900, color: s.txtMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d}</div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                            {Array.from({ length: days }).map((_, i) => {
                                const dayNum = i + 1;
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                const isToday = dateStr === today;
                                const hasAppt = apptDateSet.has(dateStr);
                                const isSel = dateStr === selectedDate;
                                const dayAppts = appts.filter(a => a.date === dateStr);

                                return (
                                    <button key={dayNum} onClick={() => setSelectedDate(curr => curr === dateStr ? null : dateStr)}
                                        className="calendar-day"
                                        style={{
                                            position: 'relative', aspectRatio: '1', border: 'none', borderRadius: 18, cursor: 'pointer',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                                            fontSize: 16, fontWeight: isToday || isSel ? 900 : 700, transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                            background: isToday ? `linear-gradient(135deg, ${s.accent}, ${s.accentSec})` : isSel ? 'rgba(232,84,122,0.12)' : s.subtle,
                                            color: isToday ? '#fff' : isSel ? s.accent : s.txtPri,
                                            boxShadow: isToday ? '0 10px 20px rgba(232,84,122,0.3)' : 'none',
                                            zIndex: isSel ? 2 : 1,
                                            transform: isSel ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                    >
                                        {dayNum}
                                        {hasAppt && (
                                            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', width: '100%', position: 'absolute', bottom: 6 }}>
                                                {dayAppts.slice(0, 3).map((a, ci) => (
                                                    <span key={a.id} style={{ width: 6, height: 6, borderRadius: '50%', background: isToday ? '#fff' : APPT_COLORS[ci % APPT_COLORS.length].dot, border: isToday ? 'none' : '1px solid #fff' }} />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected details below calendar list */}
                    {selectedDate && (
                        <div style={{ background: '#fff', border: `1px solid ${s.border}`, borderRadius: 28, padding: 28, boxShadow: '0 10px 40px rgba(232,84,122,0.06)', animation: 'fadeUp 0.3s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: s.txtPri, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 20 }}>📅</span> {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                                <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', color: s.txtMuted, cursor: 'pointer', fontWeight: 700 }}>Close</button>
                            </div>
                            {apptForSelected.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px 0', border: `1px dashed ${s.border}`, borderRadius: 20 }}>
                                    <p style={{ fontSize: 40, margin: '0 0 10px' }}>🧘</p>
                                    <p style={{ fontSize: 16, fontWeight: 700, color: s.txtMuted, margin: 0 }}>{t('appt_none_day')}</p>
                                    <button onClick={() => { setForm(f => ({ ...f, date: selectedDate })); setShowForm(true); }}
                                        style={{ marginTop: 16, background: 'none', border: `1.5px solid ${s.accent}`, color: s.accent, borderRadius: 50, padding: '10px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 900, transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,84,122,0.05)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                                    >{t('appt_add_one')}</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {apptForSelected.map((a, idx) => <ApptCard key={a.id} appt={a} colorIdx={idx} isDark={isDark} onDelete={deleteAppt} />)}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Upcoming List */}
                    <div style={{ background: '#fff', border: `1px solid ${s.border}`, borderRadius: 28, padding: 28, boxShadow: '0 8px 40px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.accent, animation: 'pulseAccent 2s infinite' }} />
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.txtMuted }}>{t('appt_upcoming')}</p>
                        </div>
                        {upcoming.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <p style={{ fontSize: 44, margin: '0 0 12px', opacity: 0.5 }}>🗓</p>
                                <p style={{ fontSize: 16, fontWeight: 700, color: s.txtMuted, margin: 0 }}>{t('appt_no_upcoming')}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {upcoming.map((a, idx) => <ApptCard key={a.id} appt={a} colorIdx={idx} isDark={isDark} onDelete={deleteAppt} />)}
                            </div>
                        )}
                        {upcoming.length > 0 && (
                            <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, fontWeight: 600, color: s.txtMuted, opacity: 0.7 }}>Showing your next 6 visits</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ApptCard: React.FC<{ appt: Appointment; colorIdx: number; isDark: boolean; onDelete: (id: string) => void }> = ({ appt, colorIdx, isDark, onDelete }) => {
    const c = APPT_COLORS[colorIdx % APPT_COLORS.length];
    const txtMuted = '#9B7A87';
    const txtPri = '#1A0A10';
    const txtSec = '#5C3A4A';

    return (
        <div style={{ display: 'flex', gap: 16, padding: '20px', border: `1px solid ${c.border}`, background: c.bg, borderRadius: 22, alignItems: 'flex-start', position: 'relative', transition: 'all 0.2s cubic-bezier(0, 0, 0.2, 1)' }}
             onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.03)'; }}
             onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            
            {/* Left accent strip */}
            <div style={{ width: 6, borderRadius: 10, background: c.dot, alignSelf: 'stretch', flexShrink: 0, boxShadow: `0 0 12px ${c.dot}30` }} />

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: txtPri, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appt.title}</p>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(appt.id); }}
                        style={{ background: '#fff', border: '1px solid #fee', cursor: 'pointer', fontSize: 14, color: '#ef5350', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', marginLeft: 8 }}
                        title="Delete Visit"
                        onMouseEnter={e => { e.currentTarget.style.background = '#fee'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                    >🗑</button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, padding: '5px 12px', borderRadius: 50, background: '#fff', border: `1px solid ${c.border}`, color: txtPri, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>📅</span> {appt.date}
                    </div>
                    <div style={{ fontSize: 12, padding: '5px 12px', borderRadius: 50, background: '#fff', border: `1px solid ${c.border}`, color: txtPri, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>🕑</span> {appt.time}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {appt.doctor && (
                        <p style={{ margin: 0, fontSize: 14, color: txtSec, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ opacity: 0.8 }}>👨‍⚕️</span> {appt.doctor}
                        </p>
                    )}
                    {appt.location && (
                        <p style={{ margin: 0, fontSize: 14, color: txtMuted, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ opacity: 0.8 }}>🏥</span> {appt.location}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
