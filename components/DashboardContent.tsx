import React from 'react';
import { UserProfile } from '../services/authService';

interface DashboardContentProps {
  user: UserProfile;
  s: any; // Theme object
  navigateTo: (tab: any) => void;
  setHealthSubTab: (tab: any) => void;
  showAnchorQR: boolean;
  setShowAnchorQR: (val: boolean) => void;
  isAnchor: boolean;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  user,
  s,
  navigateTo,
  setHealthSubTab,
  showAnchorQR,
  setShowAnchorQR,
  isAnchor,
}) => {
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  const Icon = ({ d }: { d: string | string[] }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
  
  const CamIcon = () => <Icon d={['M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z', 'M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z']} />;
  const ChevIcon = () => <Icon d="M6 9l6 6 6-6" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40, animation: 'fadeUp 0.3s ease' }}>
      {/* Welcome Banner */}
      <div style={{ background: '#FFFFFF', border: `1px solid ${s.border}`, borderRadius: 24, padding: '36px', boxShadow: '0 4px 24px rgba(232,84,122,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: s.txtPri, letterSpacing: '-0.02em', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
            Good morning, {firstName}! 👋
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 16, color: s.txtSec, fontWeight: 500 }}>
            Your health is looking great today.
          </p>
        </div>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: s.subtle, border: `1.5px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: s.accent, fontWeight: 800 }}>
          {firstName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Care Anchor Connection */}
      <div style={{ background: '#FFFFFF', border: `1px solid ${s.border}`, borderRadius: 24, padding: '24px 32px', boxShadow: '0 4px 20px rgba(232,84,122,0.05)', display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: 24 }}>
              🛡️
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: s.txtPri, fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>Care Anchor Connection</h3>
              <p style={{ margin: 0, fontSize: 14, color: s.txtSec, fontWeight: 500 }}>
                {user?.allowedAnchors && user.allowedAnchors.length > 0 
                  ? `Connected with: ${user.allowedAnchors[0].name}`
                  : 'Share your code with a family member'}
              </p>
            </div>
          </div>
          
          {!isAnchor && user?.careAnchorCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: s.txtMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Anchor Code</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.accent, letterSpacing: '0.1em' }}>{user.careAnchorCode}</div>
              </div>
              <button 
                onClick={() => setShowAnchorQR(!showAnchorQR)}
                style={{ background: s.subtle, border: `1px solid ${s.border}`, borderRadius: 12, padding: '10px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: s.txtSec, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
              >
                {showAnchorQR ? '✕' : 'QR Code'}
              </button>
            </div>
          )}
        </div>
        
        {showAnchorQR && !isAnchor && user?.careAnchorCode && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', background: s.subtle, borderRadius: 20, animation: 'fadeUp 0.3s ease', border: `1px dashed ${s.border}` }}>
            <div style={{ background: '#fff', padding: 12, borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${user.careAnchorCode}`} 
                alt="Care Anchor QR Code" 
                style={{ width: 160, height: 160, display: 'block' }}
              />
            </div>
            <p style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: s.txtSec, textAlign: 'center' }}>
              Your family member can scan this<br />to link their account instantly.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions Top Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <button onClick={() => navigateTo('scanner')} style={{ background: s.accent, color: '#fff', border: 'none', borderRadius: 20, padding: '24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', boxShadow: '0 8px 32px rgba(232,84,122,0.25)', transition: 'transform 0.2s, filter 0.2s', textAlign: 'left' }} onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.05)';}} onMouseLeave={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)';}}>
          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.22)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 24, height: 24 }}><CamIcon /></div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>+ Scan Prescription</div>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginTop: 4 }}>AI explains your medicines</div>
          </div>
        </button>
        
        <button onClick={() => navigateTo('reminders')} style={{ background: '#FFFFFF', border: `1.5px solid ${s.border}`, color: s.txtPri, borderRadius: 20, padding: '24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'transform 0.2s', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ width: 48, height: 48, background: s.subtle, border: `1px solid ${s.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
            💊
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>My Reminders</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: s.txtMuted, marginTop: 4 }}>Track daily medicine doses</div>
          </div>
        </button>
      </div>

      {/* Second Row: Calendar & Vitals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <button onClick={() => navigateTo('calendar')} style={{ background: '#FFFFFF', border: `1.5px solid ${s.border}`, color: s.txtPri, borderRadius: 20, padding: '24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'transform 0.2s', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ width: 48, height: 48, background: 'rgba(59,130,246,0.08)', border: `1px solid rgba(59,130,246,0.15)`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
            📅
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>Calendar</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: s.txtMuted, marginTop: 4 }}>Doctor appointments</div>
          </div>
        </button>

        <button onClick={() => { navigateTo('health'); setHealthSubTab('vitals'); }} style={{ background: '#FFFFFF', border: `1.5px solid ${s.border}`, color: s.txtPri, borderRadius: 20, padding: '24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'transform 0.2s', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ width: 48, height: 48, background: s.subtle, border: `1px solid ${s.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
            💓
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>+ Log Vitals</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: s.txtMuted, marginTop: 4 }}>Record your BP & Sugar</div>
          </div>
        </button>
      </div>

      {/* Middle Row: Reminders & Vitals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* Upcoming Reminders */}
        <div style={{ background: '#FFFFFF', border: `1px solid ${s.border}`, borderRadius: 24, padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: s.txtPri, margin: 0, fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.02em' }}>Upcoming Reminders</h2>
            <button style={{ width: 32, height: 32, background: 'none', border: 'none', color: s.txtMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: 16, height: 16, transform: 'rotate(-90deg)' }}><ChevIcon /></div>
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px', borderRadius: 16, background: s.subtle, border: `1px solid ${s.border}` }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: s.accent }}>10:00</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.txtMuted, textTransform: 'uppercase' }}>AM</span>
              </div>
              <div style={{ width: 2, height: 40, background: s.border, borderRadius: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.txtPri }}>Take Metformin</div>
                <div style={{ fontSize: 13, color: s.txtSec, fontWeight: 500, marginTop: 2 }}>After breakfast · Hindi</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px', borderRadius: 16, background: '#FFFFFF', border: `1px solid ${s.border}` }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60, opacity: 0.6 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: s.txtPri }}>02:00</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.txtMuted, textTransform: 'uppercase' }}>PM</span>
              </div>
              <div style={{ width: 2, height: 40, background: s.border, borderRadius: 2 }} />
              <div style={{ flex: 1, opacity: 0.6 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.txtPri }}>Aspirin</div>
                <div style={{ fontSize: 13, color: s.txtSec, fontWeight: 500, marginTop: 2 }}>After lunch</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vitals Overview */}
        <div style={{ background: '#FFFFFF', border: `1px solid ${s.border}`, borderRadius: 24, padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: s.txtPri, margin: '0 0 6px', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.02em' }}>Vitals Overview</h2>
              <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(59,130,246,0.12)', color: '#3b82f6', borderRadius: 8, fontSize: 10, fontWeight: 800, letterSpacing: '0.05em' }}>NORMAL RANGE</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: s.txtPri, letterSpacing: '-0.02em', textAlign: 'right' }}>
              120<span style={{ fontSize: 16, color: s.txtMuted, fontWeight: 600 }}>/80</span>
              <div style={{ fontSize: 11, color: s.txtMuted, fontWeight: 500, marginTop: -2 }}>mmHg</div>
            </div>
          </div>
          {/* Simple Line Graph */}
          <div style={{ height: 100, position: 'relative', marginTop: 10 }}>
            <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path d="M0 20 h200 M0 50 h200 M0 80 h200" stroke={s.border} strokeWidth="1" strokeDasharray="4 4" />
              <path d="M0 60 Q 30 70, 50 40 T 100 50 T 150 20 T 200 30" fill="none" stroke={s.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M0 80 L 0 60 Q 30 70, 50 40 T 100 50 T 150 20 T 200 30 L 200 80 Z" fill="url(#pinkGrad2)" />
              <circle cx="200" cy="30" r="4" fill={s.accent} />
              <defs>
                <linearGradient id="pinkGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.accent} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={s.accent} stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
