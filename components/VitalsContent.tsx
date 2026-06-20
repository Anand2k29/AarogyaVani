import React, { useState, useEffect } from 'react';
import { getDataNamespace } from '../services/authService';

interface VitalsContentProps {
    s: any;
    onVitalsSaved?: (vitals: VitalReading) => void;
}

export interface VitalReading {
    id: string;
    timestamp: number;
    bpSystolic: number | null;
    bpDiastolic: number | null;
    bloodSugar: number | null; // mg/dL
    heartRate: number | null;
    note: string;
}

const STATUS = {
    bp_low: { label: 'Low BP', color: '#42a5f5', bg: 'rgba(66,165,245,0.1)' },
    bp_ok: { label: 'Normal', color: '#E8547A', bg: 'rgba(232,84,122,0.1)' },
    bp_high: { label: 'High BP', color: '#ef5350', bg: 'rgba(229,57,53,0.1)' },
    bs_low: { label: 'Low Sugar', color: '#ffca28', bg: 'rgba(255,202,40,0.1)' },
    bs_ok: { label: 'Normal', color: '#E8547A', bg: 'rgba(232,84,122,0.1)' },
    bs_high: { label: 'High Sugar', color: '#ef5350', bg: 'rgba(229,57,53,0.1)' },
};

function bpStatus(sys: number | null, dia: number | null) {
    if (!sys || !dia) return null;
    if (sys < 90 || dia < 60) return STATUS.bp_low;
    if (sys > 140 || dia > 90) return STATUS.bp_high;
    return STATUS.bp_ok;
}
function bsStatus(bs: number | null) {
    if (!bs) return null;
    if (bs < 70) return STATUS.bs_low;
    if (bs > 180) return STATUS.bs_high;
    return STATUS.bs_ok;
}

export const VitalsContent: React.FC<VitalsContentProps> = ({ s, onVitalsSaved }) => {
    const nsKey = () => `${getDataNamespace()}_vitals`;

    const [readings, setReadings] = useState<VitalReading[]>(() => {
        try { return JSON.parse(localStorage.getItem(nsKey()) || '[]'); } catch { return []; }
    });

    const [form, setForm] = useState({ bpSys: '', bpDia: '', sugar: '', hr: '', note: '' });
    const [saved, setSaved] = useState(false);

    const save = () => {
        const reading: VitalReading = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            bpSystolic: form.bpSys ? parseInt(form.bpSys) : null,
            bpDiastolic: form.bpDia ? parseInt(form.bpDia) : null,
            bloodSugar: form.sugar ? parseInt(form.sugar) : null,
            heartRate: form.hr ? parseInt(form.hr) : null,
            note: form.note,
        };
        const updated = [reading, ...readings].slice(0, 30);
        setReadings(updated);
        localStorage.setItem(nsKey(), JSON.stringify(updated));
        setForm({ bpSys: '', bpDia: '', sugar: '', hr: '', note: '' });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onVitalsSaved?.(reading);
    };

    const latest = readings[0] || null;
    const bpSt = bpStatus(latest?.bpSystolic ?? null, latest?.bpDiastolic ?? null);
    const bsSt = bsStatus(latest?.bloodSugar ?? null);

    const inputStyle: React.CSSProperties = {
        background: s.subtle, border: `1px solid ${s.border}`, borderRadius: 14,
        padding: '13px 16px', fontSize: 15, fontWeight: 600, color: s.txtPri,
        outline: 'none', fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
        boxSizing: 'border-box', width: '100%',
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: s.txtMuted, marginBottom: 6,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div>
                <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: s.txtPri, letterSpacing: '-0.03em' }}>
                    💓 Vitals Tracker
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: s.txtMuted }}>
                    Log your daily health readings for personalised wellness tips.
                </p>
            </div>

            {/* Latest Status Badges */}
            {latest && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {bpSt && (
                        <div style={{ flex: 1, minWidth: 130, background: bpSt.bg, border: `1px solid ${bpSt.color}40`, borderRadius: 16, padding: '14px 16px' }}>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: bpSt.color }}>Blood Pressure</p>
                            <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 900, color: s.txtPri }}>{latest.bpSystolic}/{latest.bpDiastolic}</p>
                            <span style={{ fontSize: 11, fontWeight: 700, color: bpSt.color, background: `${bpSt.color}20`, padding: '2px 10px', borderRadius: 50 }}>{bpSt.label}</span>
                        </div>
                    )}
                    {bsSt && (
                        <div style={{ flex: 1, minWidth: 130, background: bsSt.bg, border: `1px solid ${bsSt.color}40`, borderRadius: 16, padding: '14px 16px' }}>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: bsSt.color }}>Blood Sugar</p>
                            <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 900, color: s.txtPri }}>{latest.bloodSugar} <span style={{ fontSize: 14, fontWeight: 600, color: s.txtMuted }}>mg/dL</span></p>
                            <span style={{ fontSize: 11, fontWeight: 700, color: bsSt.color, background: `${bsSt.color}20`, padding: '2px 10px', borderRadius: 50 }}>{bsSt.label}</span>
                        </div>
                    )}
                    {latest.heartRate && (
                        <div style={{ flex: 1, minWidth: 130, background: 'rgba(232,84,122,0.08)', border: '1px solid rgba(232,84,122,0.2)', borderRadius: 16, padding: '14px 16px' }}>
                            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.accent }}>Heart Rate</p>
                            <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 900, color: s.txtPri }}>{latest.heartRate} <span style={{ fontSize: 14, fontWeight: 600, color: s.txtMuted }}>BPM</span></p>
                        </div>
                    )}
                </div>
            )}

            {/* Log Reading Form */}
            <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 24 }}>
                <p style={{ margin: '0 0 18px', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.accent }}>📋 Log a Reading</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                        <label style={labelStyle}>BP Systolic (mmHg)</label>
                        <input style={inputStyle} type="number" placeholder="e.g. 120" value={form.bpSys}
                            onChange={e => setForm(f => ({ ...f, bpSys: e.target.value }))} min={60} max={250} />
                    </div>
                    <div>
                        <label style={labelStyle}>BP Diastolic (mmHg)</label>
                        <input style={inputStyle} type="number" placeholder="e.g. 80" value={form.bpDia}
                            onChange={e => setForm(f => ({ ...f, bpDia: e.target.value }))} min={40} max={160} />
                    </div>
                    <div>
                        <label style={labelStyle}>Blood Sugar (mg/dL)</label>
                        <input style={inputStyle} type="number" placeholder="e.g. 110" value={form.sugar}
                            onChange={e => setForm(f => ({ ...f, sugar: e.target.value }))} min={30} max={600} />
                    </div>
                    <div>
                        <label style={labelStyle}>Heart Rate (BPM)</label>
                        <input style={inputStyle} type="number" placeholder="e.g. 72" value={form.hr}
                            onChange={e => setForm(f => ({ ...f, hr: e.target.value }))} min={30} max={220} />
                    </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Note (optional)</label>
                    <input style={inputStyle} type="text" placeholder="e.g. After lunch, felt dizzy" value={form.note}
                        onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
                </div>
                <button onClick={save} disabled={!form.bpSys && !form.sugar && !form.hr}
                    style={{ background: saved ? '#D43369' : 'linear-gradient(135deg,#E8547A,#D43369)', color: '#fff', border: 'none', borderRadius: 50, padding: '14px 28px', fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif', fontWeight: 900, fontSize: 15, cursor: 'pointer', width: '100%', transition: 'all 0.2s' }}
                >
                    {saved ? '✅ Saved!' : '💾 Save Reading'}
                </button>
            </div>

            {/* History */}
            {readings.length > 0 && (
                <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20 }}>
                    <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.txtMuted }}>Past Readings</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {readings.slice(0, 8).map(r => {
                            const bpS = bpStatus(r.bpSystolic, r.bpDiastolic);
                            const bsS = bsStatus(r.bloodSugar);
                            const critical = bpS?.label?.includes('High') || bsS?.label?.includes('High') || bpS?.label?.includes('Low') || bsS?.label?.includes('Low');
                            return (
                                <div key={r.id} style={{ background: critical ? 'rgba(229,57,53,0.05)' : s.subtle, border: `1px solid ${critical ? 'rgba(229,57,53,0.2)' : s.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: 12, color: s.txtMuted }}>{new Date(r.timestamp).toLocaleString()}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: s.txtPri }}>
                                            {r.bpSystolic ? `BP ${r.bpSystolic}/${r.bpDiastolic}` : ''}
                                            {r.bpSystolic && r.bloodSugar ? ' · ' : ''}
                                            {r.bloodSugar ? `Sugar ${r.bloodSugar}mg/dL` : ''}
                                            {r.heartRate ? ` · ♥ ${r.heartRate}bpm` : ''}
                                        </p>
                                        {r.note && <p style={{ margin: '2px 0 0', fontSize: 12, color: s.txtMuted, fontStyle: 'italic' }}>{r.note}</p>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'flex-end' }}>
                                        {bpS && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 50, background: bpS.bg, color: bpS.color, fontWeight: 700 }}>{bpS.label}</span>}
                                        {bsS && bsS.label !== 'Normal' && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 50, background: bsS.bg, color: bsS.color, fontWeight: 700 }}>{bsS.label}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
