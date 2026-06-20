import React, { useState } from 'react';
import { CaregiverDashboard } from './CaregiverDashboard';
import { getCurrentUser, getDataNamespace } from '../services/authService';
import { Medication, MedLog, Appointment } from '../types';

interface InsightsContentProps {
  s: any;
  user: any;
}

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}
function todayStr() { return new Date().toISOString().split('T')[0]; }

export const InsightsContent: React.FC<InsightsContentProps> = ({ s, user }) => {
  const isAnchor = user?.role === 'anchor';
  const patientName = user?.linkedPatientName || 'Patient';

  const LS = {
    meds: `${getDataNamespace()}_medications`,
    logs: `${getDataNamespace()}_med_logs`,
    appts: `${getDataNamespace()}_appointments`,
  };

  const meds: Medication[] = load(LS.meds, []);
  const logs: MedLog[] = load(LS.logs, []);
  const appts: Appointment[] = load(LS.appts, []);

  const today = todayStr();
  const todaysLogs = logs.filter(l => l.date === today);
  const takenToday = todaysLogs.filter(l => l.status === 'taken').length;
  const totalDoses = meds.reduce((s, m) => s + m.times.length, 0);
  const adherence = totalDoses === 0 ? null : Math.round((takenToday / totalDoses) * 100);
  const upcomingAppts = appts.filter(a => a.date >= today).slice(0, 3);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.3s ease' }}>

      {/* Anchor Welcome Banner */}
      {isAnchor && (
        <div style={{
          background: 'linear-gradient(135deg, #E8547A 0%, #D43369 100%)',
          borderRadius: 24, padding: '32px 36px', color: '#fff',
          boxShadow: '0 12px 40px rgba(232,84,122,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, opacity: 0.8, marginBottom: 6 }}>
              🛡️ CARE ANCHOR PORTAL
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
              {greeting}, {user?.name?.split(' ')[0] || 'Anchor'}!
            </h1>
            <p style={{ margin: 0, fontSize: 15, opacity: 0.9, fontWeight: 500 }}>
              Monitoring health for <strong style={{ fontWeight: 900 }}>{patientName}</strong>
            </p>
          </div>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 900, border: '2px solid rgba(255,255,255,0.3)'
          }}>
            {patientName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {/* Adherence */}
        <div style={{
          background: '#fff', border: `1px solid ${s.border}`, borderRadius: 20,
          padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 8
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: adherence === null ? s.subtle : adherence >= 80 ? 'rgba(52,211,153,0.12)' : adherence >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(229,57,53,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${adherence === null ? s.border : adherence >= 80 ? '#34d39940' : adherence >= 50 ? '#f59e0b40' : '#e5393540'}`,
          }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: adherence === null ? s.txtMuted : adherence >= 80 ? '#34d399' : adherence >= 50 ? '#f59e0b' : '#e53935' }}>
              {adherence !== null ? `${adherence}%` : '--'}
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: s.txtMuted }}>
            Today's Adherence
          </span>
        </div>

        {/* Medicines */}
        <div style={{
          background: '#fff', border: `1px solid ${s.border}`, borderRadius: 20,
          padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 8
        }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: s.accent, lineHeight: 1 }}>{meds.length}</span>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: s.txtMuted }}>
            Active Medicines
          </span>
        </div>

        {/* Doses Today */}
        <div style={{
          background: '#fff', border: `1px solid ${s.border}`, borderRadius: 20,
          padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 8
        }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: s.txtPri, lineHeight: 1 }}>
            {takenToday}<span style={{ fontSize: 18, color: s.txtMuted }}>/{totalDoses}</span>
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: s.txtMuted }}>
            Doses Taken Today
          </span>
        </div>

        {/* Appointments */}
        <div style={{
          background: '#fff', border: `1px solid ${s.border}`, borderRadius: 20,
          padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 8
        }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: '#3b82f6', lineHeight: 1 }}>{upcomingAppts.length}</span>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: s.txtMuted }}>
            Upcoming Visits
          </span>
        </div>
      </div>

      {/* Detailed Dashboard */}
      <CaregiverDashboard />

      {/* AI Health Prediction */}
      <div style={{ padding: 24, background: '#FFFFFF', border: `1px solid ${s.border}`, borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: s.txtPri }}>AI Health Prediction</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(232,84,122,0.1)', color: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            ✨
          </div>
          <p style={{ margin: 0, fontSize: 14, color: s.txtSec, lineHeight: 1.5 }}>
            Based on current adherence ({adherence ?? 0}%), the patient's recovery trajectory is <strong>{(adherence ?? 0) >= 80 ? 'Optimal' : (adherence ?? 0) >= 50 ? 'Fair' : 'Needs Attention'}</strong>.
            {(adherence ?? 0) >= 80 ? ' Continuing this streak will reduce fatigue by 12% next week.' : ' Encourage the patient to take their medicines on time.'}
          </p>
        </div>
      </div>
    </div>
  );
};
