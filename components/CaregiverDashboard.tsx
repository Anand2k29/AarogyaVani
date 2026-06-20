import React, { useState, useEffect } from 'react';
import { Medication, MedLog, Appointment, EmergencyContact } from '../types';
import { getCurrentUser, getDataNamespace } from '../services/authService';
import { useLanguage } from '../src/context/LanguageContext';


const getLS = () => ({
    meds: `${getDataNamespace()}_medications`,
    logs: `${getDataNamespace()}_med_logs`,
    appts: `${getDataNamespace()}_appointments`,
    contacts: `${getDataNamespace()}_emergency_contacts`,
});

function load<T>(key: string, fallback: T): T {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch { return fallback; }
}
function todayStr() { return new Date().toISOString().split('T')[0]; }

export const CaregiverDashboard: React.FC = () => {
    const user = getCurrentUser();
    const [isDark] = useState(false); // Forced Light Mode for AarogyaVani theme
    const [copied, setCopied] = useState(false);
    const { t } = useLanguage();

    // Removed dark mode observer as we are forcing light mode for AarogyaVani theme.

    const LS = getLS();
    const meds: Medication[] = load(LS.meds, []);
    const logs: MedLog[] = load(LS.logs, []);
    const appts: Appointment[] = load(LS.appts, []);
    const contacts: EmergencyContact[] = load(LS.contacts, []);

    const today = todayStr();
    const todaysLogs = logs.filter(l => l.date === today);
    const takenToday = todaysLogs.filter(l => l.status === 'taken').length;
    const skippedToday = todaysLogs.filter(l => l.status === 'skipped').length;
    const totalDoses = meds.reduce((s, m) => s + m.times.length, 0);
    const adherence = totalDoses === 0 ? null : Math.round((takenToday / totalDoses) * 100);
    const upcomingAppts = appts.filter(a => a.date >= today).slice(0, 5);
    const recentLogs = [...logs].sort((a, b) => b.loggedAt - a.loggedAt).slice(0, 7);

    const buildSummary = () => {
        const lines = [`📋 AarogyaVani Care Summary — ${today}`, ''];
        lines.push(`💊 Medications Today: ${takenToday} taken, ${skippedToday} skipped (of ${totalDoses} doses)`);
        if (meds.length > 0) {
            lines.push('  Medicines:');
            meds.forEach(m => lines.push(`  • ${m.name} ${m.dosage} at ${m.times.join(', ')}`));
        }
        lines.push('');
        if (upcomingAppts.length > 0) {
            lines.push('📅 Upcoming Appointments:');
            upcomingAppts.forEach(a => lines.push(`  • ${a.date} ${a.time} — ${a.title}${a.doctor ? ` (${a.doctor})` : ''}`));
        } else {
            lines.push('📅 No upcoming appointments.');
        }
        if (contacts.length > 0) {
            lines.push('', '🆘 Emergency Contacts:');
            contacts.forEach(c => lines.push(`  • ${c.name}${c.relation ? ` (${c.relation})` : ''}: ${c.phone}`));
        }
        return lines.join('\n');
    };

    const shareSummary = async () => {
        const text = buildSummary();
        if (navigator.share) {
            try { await navigator.share({ title: 'AarogyaVani Care Summary', text }); return; } catch { }
        }
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const s = {
        card: '#fff',
        subtle: '#f8f8fc',
        border: 'rgba(232,84,122,0.12)',
        txtPri: '#1A0A10',
        txtSec: '#5C3A4A',
        txtMuted: '#9B7A87',
        accent: '#E8547A',
        red: '#e53935',
    };

    const AdherencePct = adherence ?? 0;
    const AdherenceColor = adherence === null ? s.txtMuted : AdherencePct >= 80 ? '#34d399' : AdherencePct >= 50 ? '#f59e0b' : '#e53935';

    // ── Stat Card ──────────────────────────────────────────────────────────────
    const StatCard = ({ icon, label, value, accent }: { icon: string; label: string; value: string; accent?: string }) => (
        <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', textAlign: 'center' }}>
            <span style={{ fontSize: 32 }}>{icon}</span>
            <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', color: accent ?? s.txtPri, lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: s.txtMuted }}>{label}</span>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' as const }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em', color: s.txtPri }}>Family <span style={{ color: s.accent }}>Dashboard</span></h1>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: s.txtSec }}>Overview of today's health summary</p>
                </div>
                <button onClick={shareSummary}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: s.card, border: `1px solid ${s.border}`, color: s.txtPri, borderRadius: 50, padding: '12px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: 'all 0.2s', flexShrink: 0 }}
                >
                    📤 {copied ? 'Copied!' : 'Share Summary'}
                </button>
            </div>

            {/* 4 Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <StatCard icon="💊" label="Medicines" value={meds.length.toString()} accent={s.accent} />
                <StatCard icon="📊" label="Today's Adherence" value={adherence !== null ? `${adherence}%` : '--'} accent={AdherenceColor} />
                <StatCard icon="📅" label="Appointments" value={upcomingAppts.length.toString()} />
                <StatCard icon="🆘" label="Emergency Contacts" value={contacts.length.toString()} accent={contacts.length > 0 ? s.red : undefined} />
            </div>

            {/* Today's Medicine Status */}
            <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20 }}>
                <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: s.txtMuted }}>Today's Medicine Doses</p>
                {meds.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: s.txtMuted }}>
                        <p style={{ fontSize: 40, margin: '0 0 12px' }}>💊</p>
                        <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>No medicines added yet</p>
                        <p style={{ fontSize: 13, margin: '6px 0 0', color: s.txtMuted }}>Add medicines in the My Medicines tab</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {meds.map(m => {
                            const medLogs = todaysLogs.filter(l => l.medicationId === m.id);
                            return (
                                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', background: s.subtle, borderRadius: 14, flexWrap: 'wrap' as const }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: s.txtPri }}>{m.name}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: 13, color: s.txtMuted }}>{m.dosage}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                                        {m.times.map(t => {
                                            const log = medLogs.find(l => l.time === t);
                                            const bg = log?.status === 'taken' ? 'rgba(232,84,122,0.15)' : log?.status === 'skipped' ? 'rgba(229,57,53,0.12)' : s.subtle;
                                            const color = log?.status === 'taken' ? '#E8547A' : log?.status === 'skipped' ? '#e53935' : s.txtMuted;
                                            return (
                                                <span key={t} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 50, fontWeight: 700, background: bg, color }}>
                                                    {t} {log?.status === 'taken' ? '✓' : log?.status === 'skipped' ? '✕' : '·'}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Upcoming Appointments + Recent Activity - 2 col on desktop */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {/* Upcoming Appointments */}
                <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20 }}>
                    <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: s.txtMuted }}>Upcoming Appointments</p>
                    {upcomingAppts.length === 0 ? (
                        <p style={{ textAlign: 'center', fontSize: 14, color: s.txtMuted, padding: '24px 0', margin: 0 }}>No upcoming appointments</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {upcomingAppts.map(a => (
                                <div key={a.id} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: s.subtle, borderRadius: 14 }}>
                                    <span style={{ fontSize: 24 }}>{a.date === today ? '📌' : '📅'}</span>
                                    <div>
                                        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: s.txtPri }}>{a.title}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: 12, color: s.txtMuted }}>{a.date} at {a.time}{a.doctor ? ` · Dr. ${a.doctor}` : ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20 }}>
                    <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: s.txtMuted }}>Recent Activity</p>
                    {recentLogs.length === 0 ? (
                        <p style={{ textAlign: 'center', fontSize: 14, color: s.txtMuted, padding: '24px 0', margin: 0 }}>No activity recorded yet</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {recentLogs.map(l => (
                                <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: s.subtle, borderRadius: 12 }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: s.txtPri }}>{l.medicationName}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: 12, color: s.txtMuted }}>{l.date} at {l.time}</p>
                                    </div>
                                    <span style={{ fontSize: 12, padding: '5px 12px', borderRadius: 50, fontWeight: 700, background: l.status === 'taken' ? 'rgba(232,84,122,0.15)' : 'rgba(229,57,53,0.12)', color: l.status === 'taken' ? '#E8547A' : '#e53935' }}>
                                        {l.status === 'taken' ? '✓ Taken' : '✕ Missed'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>



            {/* Emergency Contacts */}
            {contacts.length > 0 && (
                <div style={{ background: s.card, border: `1px solid rgba(229,57,53,0.2)`, borderRadius: 20, padding: 20 }}>
                    <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: s.red }}>Emergency Contacts</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                        {contacts.map((c, i) => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: i === 0 ? 'rgba(229,57,53,0.08)' : s.subtle, borderRadius: 14, border: i === 0 ? `1px solid rgba(229,57,53,0.2)` : 'none' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: i === 0 ? s.red : s.subtle, color: i === 0 ? '#fff' : s.txtSec, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>
                                    {c.name[0].toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: s.txtPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}{c.relation ? ` (${c.relation})` : ''}</p>
                                    <a href={`tel:${c.phone}`} style={{ fontSize: 13, color: s.accent, fontWeight: 600, textDecoration: 'none' }}>{c.phone}</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
