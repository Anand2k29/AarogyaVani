import React from 'react';
import { UserProfile } from '../services/authService';

interface AIReportsProps {
    user: UserProfile;
    s: Record<string, string>;
}

export const AIReports: React.FC<AIReportsProps> = ({ user, s }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease-out' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(229,57,53,0.4); } 50% { box-shadow: 0 0 0 8px rgba(229,57,53,0); } }
            `}</style>

            <div>
                <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', color: s.txtPri }}>
                    AI Health Reports
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: s.txtSec, lineHeight: 1.5 }}>
                    Proactive insights and predictive alerts powered by <strong style={{ color: s.accent }}>Gemini AI</strong> for {user.linkedPatientName || 'your family member'}.
                </p>
            </div>

            {/* AI Predictive Alert (Mocked for Demo) */}
            <div style={{ background: 'linear-gradient(145deg, rgba(229,57,53,0.15), rgba(0,0,0,0))', border: `1px solid rgba(229,57,53,0.3)`, borderRadius: 24, padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: s.red }}></div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ width: 48, height: 48, background: 'rgba(229,57,53,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, animation: 'pulseGlow 2s infinite' }}>
                        🧠
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: s.red, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Predictive Risk Warning</h3>
                        <p style={{ margin: '0 0 16px', fontSize: 14, color: s.txtPri, lineHeight: 1.6, fontWeight: 500 }}>
                            Based on the past 3 days of adherence data, <strong style={{ color: s.accent }}>Metformin (500mg)</strong> has been missed repeatedly during morning hours.
                            <br /><br />
                            <span style={{ color: s.txtSec }}>AI Prediction: High risk of elevated blood sugar levels by tomorrow afternoon.</span>
                        </p>
                        <button style={{ background: s.accent, color: '#fff', border: 'none', borderRadius: 50, padding: '10px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            📞 Call {user.linkedPatientName?.split(' ')[0] || 'Patient'} Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Refill Tracker */}
            <div>
                <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: s.txtPri }}>Medication Refill Tracker</h2>
                <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Item 1 */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: s.txtPri }}>Aspirin (75mg)</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#ffb300' }}>4 Pills Left</span>
                        </div>
                        <div style={{ height: 8, background: s.subtle, borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ width: '15%', height: '100%', background: '#ffb300', borderRadius: 10 }}></div>
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={{ background: 'transparent', color: s.accent, border: `1px solid ${s.accent}`, borderRadius: 50, padding: '6px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                                🔄 Reorder from Apollo Pharmacy
                            </button>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: 1, background: s.border }}></div>

                    {/* Item 2 */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: s.txtPri }}>Atorvastatin (20mg)</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: s.accent }}>24 Pills Left</span>
                        </div>
                        <div style={{ height: 8, background: s.subtle, borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ width: '80%', height: '100%', background: s.accent, borderRadius: 10 }}></div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Health Trend Summary */}
            <div style={{ background: 'rgba(232,84,122,0.05)', border: `1px solid ${s.border}`, borderRadius: 20, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, background: s.accent, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>
                        ✓
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: s.txtPri }}>AI Weekly Summary</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: s.txtSec, lineHeight: 1.6 }}>
                    Overall medication adherence is strong for night-time dosages (95%), but morning routines show a 40% drop-off. <strong style={{ color: s.accent }}>Recommendation:</strong> Shift complex dosages to lunch or evening if medically viable, or add a louder morning audio reminder.
                </p>
            </div>

        </div>
    );
};
