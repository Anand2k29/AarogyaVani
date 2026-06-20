import React, { useState, useEffect, useRef } from 'react';
import { signUp, logIn, loginAnchor, signUpAnchor, UserProfile } from '../services/authService';
import { DocsModal } from './DocsModal';

interface AuthPageProps {
    onAuth: (user: UserProfile) => void;
    isDark?: boolean;
}

type AuthMode = 'login' | 'signup' | 'anchor';
type AnchorMode = 'login' | 'signup';

// ── Color Palette ─────────────────────────────────────────────────────────────
const P = {
    pink:        '#E8547A',
    pinkHover:   '#D43369',
    pinkGlow:    'rgba(232,84,122,0.22)',
    pinkSoft:    'rgba(232,84,122,0.09)',
    pinkBorder:  'rgba(232,84,122,0.18)',
    bg:          '#FFF0F5',
    bgOff:       '#FFF8FB',
    surface:     '#FFFFFF',
    charcoal:    '#1A1A2E',
    textSec:     '#4A3550',
    textMuted:   '#9B7A87',
    red:         '#e53935',
    blue:        '#3b82f6',
    green:       '#16a34a',
};

// ── Icon SVGs ─────────────────────────────────────────────────────────────────
const IconMic = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);
const IconShield = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IconPen = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);
const IconAnchorSm = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IconLock = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);
const IconClose = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

// ── Healthcare SVG Illustration (right side of hero) ──────────────────────────
const HealthcareIllustration = () => (
    <svg viewBox="0 0 440 380" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 440, height: 'auto' }}>
        {/* Background circle */}
        <circle cx="220" cy="190" r="170" fill="#FFF0F5" />
        <circle cx="220" cy="190" r="140" fill="rgba(232,84,122,0.06)" />
        {/* Phone/Tablet UI */}
        <rect x="120" y="60" width="200" height="280" rx="24" fill="white" stroke="rgba(232,84,122,0.25)" strokeWidth="2" />
        <rect x="130" y="75" width="180" height="255" rx="16" fill="#FFF8FB" />
        {/* Header bar */}
        <rect x="130" y="75" width="180" height="40" rx="16" fill="#E8547A" />
        <circle cx="160" cy="95" r="10" fill="rgba(255,255,255,0.3)" />
        <rect x="178" y="88" width="80" height="8" rx="4" fill="rgba(255,255,255,0.8)" />
        <rect x="178" y="100" width="52" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
        {/* Stats */}
        <rect x="138" y="125" width="78" height="55" rx="12" fill="white" />
        <rect x="138" y="125" width="78" height="55" rx="12" stroke="rgba(232,84,122,0.18)" strokeWidth="1.5" />
        <text x="177" y="150" textAnchor="middle" fill="#E8547A" fontSize="18" fontWeight="800" fontFamily="Inter">98°</text>
        <text x="177" y="166" textAnchor="middle" fill="#9B7A87" fontSize="9" fontFamily="Inter">Body Temp</text>
        <rect x="224" y="125" width="78" height="55" rx="12" fill="white" />
        <rect x="224" y="125" width="78" height="55" rx="12" stroke="rgba(232,84,122,0.18)" strokeWidth="1.5" />
        <text x="263" y="150" textAnchor="middle" fill="#16a34a" fontSize="18" fontWeight="800" fontFamily="Inter">120</text>
        <text x="263" y="166" textAnchor="middle" fill="#9B7A87" fontSize="9" fontFamily="Inter">BP (mmHg)</text>
        {/* Vitals chart area */}
        <rect x="138" y="190" width="164" height="80" rx="12" fill="white" />
        <rect x="138" y="190" width="164" height="80" rx="12" stroke="rgba(232,84,122,0.18)" strokeWidth="1.5" />
        <text x="152" y="208" fill="#1A1A2E" fontSize="9" fontWeight="700" fontFamily="Inter">Heart Rate Trends</text>
        {/* Sparkline */}
        <polyline points="152,255 168,240 184,248 200,232 216,244 232,228 248,238 264,230 280,236 292,225" stroke="#E8547A" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="292" cy="225" r="4" fill="#E8547A" />
        {/* Medicine reminder card */}
        <rect x="138" y="280" width="164" height="38" rx="12" fill="rgba(232,84,122,0.07)" />
        <rect x="138" y="280" width="164" height="38" rx="12" stroke="rgba(232,84,122,0.18)" strokeWidth="1.5" />
        <circle cx="156" cy="299" r="8" fill="#E8547A" />
        <text x="156" y="303" textAnchor="middle" fill="white" fontSize="9" fontFamily="Inter">💊</text>
        <text x="172" y="296" fill="#1A1A2E" fontSize="9" fontWeight="700" fontFamily="Inter">10:00 AM — Metformin</text>
        <text x="172" y="309" fill="#9B7A87" fontSize="8" fontFamily="Inter">After breakfast · Hindi</text>
        {/* Floating badges */}
        <rect x="30" y="110" width="80" height="30" rx="15" fill="white" />
        <rect x="30" y="110" width="80" height="30" rx="15" stroke="rgba(232,84,122,0.22)" strokeWidth="1.5" />
        <text x="70" y="130" textAnchor="middle" fill="#E8547A" fontSize="10" fontWeight="700" fontFamily="Inter">🛡️ PHI Vault</text>
        <rect x="330" y="90" width="90" height="30" rx="15" fill="white" />
        <rect x="330" y="90" width="90" height="30" rx="15" stroke="rgba(232,84,122,0.22)" strokeWidth="1.5" />
        <text x="375" y="110" textAnchor="middle" fill="#16a34a" fontSize="10" fontWeight="700" fontFamily="Inter">✓ AI Powered</text>
        <rect x="340" y="240" width="88" height="30" rx="15" fill="white" />
        <rect x="340" y="240" width="88" height="30" rx="15" stroke="rgba(232,84,122,0.22)" strokeWidth="1.5" />
        <text x="384" y="258" textAnchor="middle" fill="#9B7A87" fontSize="9.5" fontWeight="600" fontFamily="Inter">🔔 Reminder On</text>
        <rect x="22" y="220" width="88" height="30" rx="15" fill="white" />
        <rect x="22" y="220" width="88" height="30" rx="15" stroke="rgba(232,84,122,0.22)" strokeWidth="1.5" />
        <text x="66" y="238" textAnchor="middle" fill="#E8547A" fontSize="9.5" fontWeight="600" fontFamily="Inter">3 Languages 🌐</text>
    </svg>
);

// ── Data ──────────────────────────────────────────────────────────────────────
const FEATURES = [
    { icon: '📄', title: 'AI Prescription Scanner', desc: "Reads doctor's handwriting & explains medicines in plain language" },
    { icon: '🔔', title: 'Smart Reminders', desc: 'Never miss a dose — alerts in Hindi, Kannada or English' },
    { icon: '🛡️', title: 'Care Anchor', desc: 'Family monitors remotely & gets instant SOS alerts' },
    { icon: '📈', title: 'Vitals Tracker', desc: 'Log BP, blood sugar & SpO₂, visualise trends over time' },
    { icon: '🧘', title: 'Yoga & Wellness', desc: 'Guided exercises and breathing routines for elderly care' },
    { icon: '🔒', title: 'PHI Vault', desc: 'Store health records on-device — zero cloud upload, ever' },
];

const VISION_CARDS = [
    {
        icon: '⚠️',
        title: 'The Problem',
        color: '#f59e0b',
        colorSoft: 'rgba(245,158,11,0.08)',
        colorBorder: 'rgba(245,158,11,0.18)',
        body: "Doctors' handwriting is often undecipherable, causing dose errors and anxiety. Language barriers alienate rural patients from understanding their own treatment.",
    },
    {
        icon: '💡',
        title: 'The Solution',
        color: P.pink,
        colorSoft: P.pinkSoft,
        colorBorder: P.pinkBorder,
        body: "Leverages Gemini's vision-multimodal intelligence to decode intent, providing real-time vernacular translation and voice output in Hindi, Kannada, or English.",
    },
    {
        icon: '🔐',
        title: 'Why Us?',
        color: '#8b5cf6',
        colorSoft: 'rgba(139,92,246,0.08)',
        colorBorder: 'rgba(139,92,246,0.18)',
        body: 'True end-to-end privacy. Unlike cloud-first apps, our PHI Vault processing is on-device. No data ever leaves the user\'s phone — not even to our servers.',
    },
];

const STATS = [
    { value: '3', label: 'Languages' },
    { value: '6', label: 'Core Features' },
    { value: 'AI', label: 'Powered' },
    { value: '100%', label: 'Private' },
];

const AUTH_TABS: { id: AuthMode; label: string; Icon: React.FC }[] = [
    { id: 'login',  label: 'Sign In',       Icon: IconUser },
    { id: 'signup', label: 'Create Account', Icon: IconPen },
    { id: 'anchor', label: 'Care Anchor',    Icon: IconAnchorSm },
];

// ── Component ─────────────────────────────────────────────────────────────────
export const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
    const [showModal, setShowModal]       = useState(false);
    const [mode, setMode]                 = useState<AuthMode>('login');
    const [anchorMode, setAnchorMode]     = useState<AnchorMode>('login');
    const [showAbout, setShowAbout]       = useState(false);
    const [showPrivacy, setShowPrivacy]   = useState(false);
    const [showTerms, setShowTerms]       = useState(false);
    const [mounted, setMounted]           = useState(false);

    const [name, setName]               = useState('');
    const [email, setEmail]             = useState('');
    const [password, setPassword]       = useState('');
    const [age, setAge]                 = useState('');
    const [code, setCode]               = useState('');
    const [anchorPhone, setAnchorPhone] = useState('');
    const [anchorName, setAnchorName]   = useState('');
    const [error, setError]             = useState('');
    const [loading, setLoading]         = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 60);
        return () => clearTimeout(t);
    }, []);

    // Lock body scroll when modal open
    useEffect(() => {
        document.body.style.overflow = showModal ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showModal]);

    const openLogin = (m: AuthMode = 'login') => {
        setMode(m); setError(''); setShowModal(true);
    };
    const closeModal = () => setShowModal(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        await new Promise(r => setTimeout(r, 350));
        let result: { success: boolean; user?: UserProfile; error?: string } | undefined;
        if (mode === 'login') {
            result = logIn(email, password);
        } else if (mode === 'signup') {
            const firstAnchor = anchorName.trim() && anchorPhone.trim() ? { name: anchorName, phone: anchorPhone } : undefined;
            result = signUp(name, email, password, age ? parseInt(age) : undefined, firstAnchor);
        } else {
            if (anchorMode === 'login') result = loginAnchor(anchorPhone, password);
            else result = signUpAnchor(name, anchorPhone, password, code);
        }
        setLoading(false);
        if (result?.success && result.user) onAuth(result.user);
        else setError(result?.error || 'Something went wrong.');
    };

    const inp: React.CSSProperties = {
        width: '100%', background: '#FFF8FB',
        border: `1.5px solid ${P.pinkBorder}`,
        borderRadius: 12, padding: '13px 15px',
        fontSize: 14, fontWeight: 500, color: P.charcoal,
        outline: 'none', fontFamily: 'Inter, system-ui, sans-serif',
        boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
    };
    const lbl: React.CSSProperties = {
        display: 'block', fontSize: 10, fontWeight: 800,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: P.textMuted, marginBottom: 5,
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.94) translateY(20px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes float {
                    0%,100% { transform: translateY(0); }
                    50%     { transform: translateY(-14px); }
                }
                @keyframes pulse2 {
                    0%,100% { box-shadow: 0 0 0 0 rgba(232,84,122,0.35); }
                    50%     { box-shadow: 0 0 0 10px rgba(232,84,122,0); }
                }
                @keyframes tabIn {
                    from { opacity: 0; transform: translateX(6px); }
                    to   { opacity: 1; transform: translateX(0); }
                }

                .av-input:focus {
                    border-color: ${P.pink} !important;
                    box-shadow: 0 0 0 3.5px rgba(232,84,122,0.13) !important;
                }
                .av-nav-link {
                    background: none; border: none; cursor: pointer;
                    font-family: Inter, system-ui, sans-serif;
                    font-weight: 700; font-size: 14px; color: ${P.textSec};
                    text-decoration: none; transition: color 0.18s; padding: 4px 0;
                }
                .av-nav-link:hover { color: ${P.pink}; }
                .av-feature-card {
                    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease !important;
                }
                .av-feature-card:hover {
                    transform: translateY(-5px) scale(1.02) !important;
                    box-shadow: 0 16px 40px rgba(232,84,122,0.13) !important;
                }
                .av-submit-btn:hover:not(:disabled) {
                    filter: brightness(1.08);
                    box-shadow: 0 14px 32px rgba(232,84,122,0.40) !important;
                    transform: translateY(-2px);
                }
                .av-submit-btn:active:not(:disabled) { transform: scale(0.97); }
                .av-submit-btn { transition: all 0.18s ease !important; }
                .av-tab-btn { transition: all 0.18s ease !important; }
                .av-tab-btn:hover { background: rgba(232,84,122,0.07) !important; }
                .av-login-btn:hover { background: ${P.pink} !important; color: #fff !important; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(232,84,122,0.30) !important; }
                .av-login-btn { transition: all 0.2s ease !important; }
                .av-vision-card { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important; position: relative; overflow: hidden; }
                .av-vision-card:hover { transform: translateY(-8px) scale(1.01) !important; box-shadow: 0 32px 64px rgba(232,84,122,0.12) !important; border-color: ${P.pinkBorder} !important; }
                .av-vision-card::after { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: ${P.pink}; transform: scaleX(0); transition: transform 0.3s ease; transform-origin: left; }
                .av-vision-card:hover::after { transform: scaleX(1); }
                .av-feature-card { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important; cursor: default; position: relative; }
                .av-feature-card:hover { transform: translateY(-10px) !important; box-shadow: 0 24px 50px rgba(232,84,122,0.22) !important; border-color: ${P.pink} !important; background: #fff !important; }
                .av-feature-card svg, .av-feature-card span { transition: transform 0.3s ease; }
                .av-feature-card:hover span { transform: scale(1.15) rotate(5deg); }
            `}</style>

            <div style={{ minHeight: '100vh', background: P.bg, fontFamily: 'Inter, system-ui, sans-serif', color: P.charcoal }}>

                {/* ══════════════════════════════════════
                    STICKY HEADER / NAVBAR
                ════════════════════════════════════ */}
                <header style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
                    height: 68, background: `linear-gradient(90deg, rgba(255,248,251,0.96) 0%, rgba(255,232,240,0.96) 100%)`,
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: `1.5px solid rgba(232,84,122,0.25)`,
                    boxShadow: '0 8px 32px rgba(232,84,122,0.06)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '0 48px',
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36,
                            background: `linear-gradient(135deg, ${P.pink} 0%, ${P.pinkHover} 100%)`,
                            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 4px 14px ${P.pinkSoft}`,
                            animation: 'pulse2 2.8s infinite',
                            color: '#fff', flexShrink: 0, padding: 8,
                        }}>
                            <IconMic />
                        </div>
                        <span style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', fontWeight: 800, fontSize: 24, letterSpacing: '-0.05em', color: P.charcoal }}>
                            Aarogya<span style={{ color: P.pink }}>Vani</span>
                        </span>
                    </div>

                    {/* Nav links + CTA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <a href="#features" className="av-nav-link" style={{ textDecoration: 'none', color: P.charcoal, fontWeight: 800, fontSize: 14, padding: '8px 18px', borderRadius: 50, transition: 'all 0.2s', border: `1.5px solid transparent` }} onMouseEnter={e => {e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = P.pinkBorder;}} onMouseLeave={e => {e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent';}}>Features</a>
                        <a href="#vision" className="av-nav-link" style={{ textDecoration: 'none', color: P.charcoal, fontWeight: 800, fontSize: 14, padding: '8px 18px', borderRadius: 50, transition: 'all 0.2s', border: `1.5px solid transparent` }} onMouseEnter={e => {e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = P.pinkBorder;}} onMouseLeave={e => {e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent';}}>Our Vision</a>
                        <div style={{ width: 1, height: 24, background: P.pinkBorder, margin: '0 8px' }} />
                        <button
                            onClick={() => openLogin('login')}
                            style={{
                                background: P.charcoal, color: '#fff',
                                border: 'none', borderRadius: 50,
                                padding: '11px 26px', fontSize: 14, fontWeight: 800,
                                cursor: 'pointer', letterSpacing: '0.01em',
                                display: 'flex', alignItems: 'center', gap: 8,
                                boxShadow: '0 4px 14px rgba(26,26,46,0.35)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(26,26,46,0.45)';}}
                            onMouseLeave={e => {e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,26,46,0.35)';}}
                        >
                            <IconUser />
                            Login
                        </button>
                    </div>
                </header>

                {/* ══════════════════════════════════════
                    HERO SECTION (50/50 split)
                ════════════════════════════════════ */}
                <section style={{
                    padding: '95px 0 50px',
                    background: `linear-gradient(135deg, ${P.bg} 0%, #FFE8F0 50%, ${P.bg} 100%)`,
                    display: 'flex', alignItems: 'center',
                }}>
                    <div style={{
                        maxWidth: 1240, margin: '0 auto', padding: '0 48px',
                        display: 'grid', gridTemplateColumns: '1.05fr 0.95fr',
                        gap: 60, alignItems: 'center', width: '100%',
                    }}>
                        {/* Left */}
                        <div style={{ animation: mounted ? 'fadeUp 0.6s ease both' : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '6px 14px', borderRadius: 50, marginBottom: 20,
                                background: P.pinkSoft, border: `1px solid ${P.pinkBorder}`,
                                fontSize: 10, fontWeight: 900, letterSpacing: '0.15em',
                                textTransform: 'uppercase', color: P.pink,
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.pink, display: 'inline-block', animation: 'pulse2 2s infinite' }} />
                                India's AI Health Companion
                            </div>

                            <h1 style={{
                                fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                                fontSize: 'clamp(38px, 4vw, 62px)', fontWeight: 900,
                                lineHeight: 1.08, letterSpacing: '-0.035em', color: P.charcoal,
                                marginBottom: 22,
                            }}>
                                Smart Healthcare<br />
                                <span style={{ color: P.pink }}>for Every Indian</span><br />
                                Family.
                            </h1>

                            <p style={{ fontSize: 16, color: P.textSec, lineHeight: 1.6, marginBottom: 32, maxWidth: 480, fontWeight: 500 }}>
                                AI-powered medicine assistant that reads prescriptions, sets reminders,
                                and keeps your family connected — in{' '}
                                <strong style={{ color: P.charcoal }}>Hindi, Kannada, or English.</strong>
                            </p>

                            {/* Pill tags */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
                                {STATS.map((s, i) => (
                                    <div key={i} style={{
                                        padding: '10px 20px', borderRadius: 50,
                                        background: P.surface, border: `1.5px solid ${P.pinkBorder}`,
                                        boxShadow: '0 2px 12px rgba(232,84,122,0.07)',
                                        display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                        <span style={{ fontSize: 18, fontWeight: 900, color: P.pink, letterSpacing: '-0.03em' }}>{s.value}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: P.textMuted }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 10 }}>
                                <button
                                    onClick={() => openLogin('login')}
                                    className="av-login-btn"
                                    style={{
                                        background: P.pink, color: '#fff',
                                        border: 'none', borderRadius: 50,
                                        padding: '16px 36px', fontSize: 16, fontWeight: 800,
                                        cursor: 'pointer', boxShadow: '0 6px 22px rgba(232,84,122,0.30)',
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    Get Started Free &rarr;
                                </button>
                                <a
                                    href="#features"
                                    style={{
                                        background: P.surface, color: P.charcoal,
                                        border: `1.5px solid ${P.pinkBorder}`, borderRadius: 50,
                                        padding: '16px 32px', fontSize: 15, fontWeight: 800, textDecoration: 'none',
                                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => {e.currentTarget.style.background = '#FFF8FB'; e.currentTarget.style.transform = 'translateY(-1px)';}}
                                    onMouseLeave={e => {e.currentTarget.style.background = P.surface; e.currentTarget.style.transform = 'none';}}
                                >
                                    Discover More <span style={{ fontSize: 18 }}>&darr;</span>
                                </a>
                            </div>
                        </div>

                        {/* Right — illustration image */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            animation: mounted ? 'float 6s ease-in-out infinite' : 'none',
                            position: 'relative',
                        }}>
                            <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle, rgba(232,84,122,0.15) 0%, transparent 70%)', zIndex: 0 }} />
                            <img src="/family_care.png" alt="Doctor providing care to seniors" style={{ width: '100%', maxWidth: 540, height: 'auto', borderRadius: 32, boxShadow: '0 24px 64px rgba(232,84,122,0.2)', objectFit: 'cover', zIndex: 1, border: `4px solid ${P.surface}` }} />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════
                    CAPABILITIES GRID — "What We Built"
                ════════════════════════════════════ */}
                <section id="features" style={{
                    background: '#FFF2F6', padding: '100px 48px', borderTop: `1px solid ${P.pinkSoft}`
                }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 64 }}>
                            <span style={{
                                display: 'inline-block', fontSize: 11, fontWeight: 800,
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                color: P.pink, marginBottom: 14,
                            }}>CAPABILITIES</span>
                            <h2 style={{
                                fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                                fontSize: 42, fontWeight: 900, letterSpacing: '-0.03em',
                                color: P.charcoal, marginBottom: 16,
                            }}>What We Built</h2>
                            <p style={{ fontSize: 17, color: P.textMuted, maxWidth: 520, margin: '0 auto', fontWeight: 500, lineHeight: 1.65 }}>
                                Six precision‑crafted tools to make healthcare truly accessible for every Indian family.
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 24,
                        }}>
                            {FEATURES.map((f, i) => (
                                <div key={i} className="av-feature-card" style={{
                                    background: P.surface,
                                    border: `1.5px solid ${P.pinkBorder}`,
                                    borderRadius: 24, padding: '28px 26px',
                                    boxShadow: '0 4px 20px rgba(232,84,122,0.06)',
                                    display: 'flex', flexDirection: 'column', gap: 14,
                                }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: 18,
                                        background: P.pinkSoft, border: `1.5px solid ${P.pinkBorder}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 26,
                                    }}>{f.icon}</div>
                                    <div>
                                        <div style={{
                                            fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                                            fontWeight: 800, fontSize: 16, color: P.charcoal,
                                            marginBottom: 6, letterSpacing: '-0.01em',
                                        }}>{f.title}</div>
                                        <div style={{ fontSize: 14, color: P.textMuted, lineHeight: 1.6, fontWeight: 500 }}>{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════
                    VISION SECTION
                ════════════════════════════════════ */}
                <section id="vision" style={{ background: '#FFF8FB', padding: '100px 48px' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 64 }}>
                            <span style={{
                                display: 'inline-block', fontSize: 11, fontWeight: 800,
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                color: P.pink, marginBottom: 14,
                            }}>MISSION & ARCHITECTURE</span>
                            <h2 style={{
                                fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                                fontSize: 42, fontWeight: 900, letterSpacing: '-0.03em',
                                color: P.charcoal, marginBottom: 16,
                            }}>Project Architecture & Vision</h2>
                            <p style={{ fontSize: 17, color: P.textMuted, maxWidth: 500, margin: '0 auto', fontWeight: 500, lineHeight: 1.65 }}>
                                Purpose‑built to solve the real, systemic challenges in Indian rural healthcare.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
                            {VISION_CARDS.map((c, i) => (
                                <div key={i} className="av-vision-card" style={{
                                    background: P.surface,
                                    border: `1.5px solid ${c.colorBorder}`,
                                    borderRadius: 28, padding: '36px 30px',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                                }}>
                                    <div style={{
                                        width: 60, height: 60, borderRadius: 20,
                                        background: c.colorSoft, border: `1.5px solid ${c.colorBorder}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 28, marginBottom: 22,
                                    }}>{c.icon}</div>
                                    <h3 style={{
                                        fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                                        fontSize: 22, fontWeight: 900, color: P.charcoal,
                                        letterSpacing: '-0.02em', marginBottom: 14,
                                    }}>{c.title}</h3>
                                    <p style={{ fontSize: 15, color: P.textSec, lineHeight: 1.7, fontWeight: 500 }}>{c.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════
                    FOOTER CTA BAND
                ════════════════════════════════════ */}
                <section style={{
                    background: `linear-gradient(135deg, ${P.pink} 0%, ${P.pinkHover} 100%)`,
                    padding: '70px 48px', textAlign: 'center',
                }}>
                    <h2 style={{
                        fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                        fontSize: 36, fontWeight: 900, color: '#fff',
                        letterSpacing: '-0.03em', marginBottom: 14,
                    }}>Ready to take control of your health?</h2>
                    <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.80)', marginBottom: 36, fontWeight: 500 }}>
                        Join thousands of Indian families using AarogyaVani today.
                    </p>
                    <button
                        onClick={() => openLogin('signup')}
                        style={{
                            background: '#fff', color: P.pink,
                            border: 'none', borderRadius: 50,
                            padding: '16px 40px', fontSize: 16, fontWeight: 900,
                            cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,0,0,0.15)',
                        }}
                    >
                        Create Free Account →
                    </button>
                </section>

                {/* ══════════════════════════════════════
                    FUTURE SCOPE SECTION
                ════════════════════════════════════ */}
                <section style={{ background: P.surface, padding: '100px 48px', borderTop: `1px solid ${P.pinkBorder}` }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
                        <div>
                            <span style={{
                                display: 'inline-block', fontSize: 11, fontWeight: 800,
                                letterSpacing: '0.14em', textTransform: 'uppercase',
                                color: P.pink, marginBottom: 14,
                            }}>ROADMAP & FUTURE SCOPE</span>
                            <h2 style={{
                                fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                                fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em',
                                color: P.charcoal, marginBottom: 20, lineHeight: 1.15
                            }}>Telemedicine & Deep IoT Integration</h2>
                            <p style={{ fontSize: 17, color: P.textMuted, maxWidth: 500, fontWeight: 500, lineHeight: 1.65, marginBottom: 24 }}>
                                We are actively expanding AarogyaVani to support seamless video consultations with verified doctors in vernacular languages directly from the dashboard.
                            </p>
                            <p style={{ fontSize: 17, color: P.textMuted, maxWidth: 500, fontWeight: 500, lineHeight: 1.65 }}>
                                Our upcoming sync engine will connect with low-cost smartwatches and BP monitors to automate vitals logging, making preventative care completely friction-free for the elderly.
                            </p>
                        </div>
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', inset: -15, background: 'radial-gradient(circle, rgba(232,84,122,0.12) 0%, transparent 70%)', zIndex: 0 }} />
                            <img src="/doctor_tablet.png" alt="Doctor showing health metrics on a tablet" style={{ width: '100%', maxWidth: 460, height: 'auto', borderRadius: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', objectFit: 'cover', zIndex: 1, position: 'relative', border: `4px solid ${P.surface}` }} />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════
                    FOOTER
                ════════════════════════════════════ */}
                <footer style={{ background: P.charcoal, color: '#fff', padding: '80px 48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.9 }}>
                        <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${P.pink} 0%, ${P.pinkHover} 100%)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: 6 }}><IconMic /></div>
                        <span style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '-0.05em' }}>
                            Aarogya<span style={{ color: P.pink }}>Vani</span>
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 36, fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <a href="#features" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Features</a>
                        <a href="#vision" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Our Vision</a>
                        <button onClick={() => setShowPrivacy(true)} style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Privacy Policy</button>
                        <button onClick={() => setShowTerms(true)} style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Terms of Service</button>
                    </div>

                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>© 2026 AarogyaVani Healthcare System. All rights reserved.</div>
                </footer>

                {/* ══════════════════════════════════════
                    LOGIN MODAL OVERLAY (View 2)
                ════════════════════════════════════ */}
                {showModal && (
                    <div
                        onClick={closeModal}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(10,4,8,0.55)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: 24,
                            animation: 'fadeIn 0.2s ease both',
                        }}
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: P.surface,
                                borderRadius: 32, padding: '40px 38px 36px',
                                width: '100%', maxWidth: 448,
                                boxShadow: '0 32px 80px rgba(20,4,12,0.22), 0 4px 20px rgba(232,84,122,0.10)',
                                border: `1px solid ${P.pinkBorder}`,
                                animation: 'scaleIn 0.28s cubic-bezier(0.16,1,0.3,1) both',
                                position: 'relative',
                            }}
                        >
                            {/* Close button */}
                            <button
                                onClick={closeModal}
                                style={{
                                    position: 'absolute', top: 18, right: 18,
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: P.pinkSoft, border: `1px solid ${P.pinkBorder}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: P.textMuted,
                                }}
                            >
                                <IconClose />
                            </button>

                            {/* Header */}
                            <div style={{ marginBottom: 26 }}>
                                <h2 style={{
                                    fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                                    fontWeight: 900, fontSize: 26, color: P.charcoal,
                                    letterSpacing: '-0.02em', marginBottom: 6,
                                }}>
                                    {mode === 'login'  ? 'Welcome back 👋'
                                    : mode === 'signup' ? 'Create account ✨'
                                    :                    '🛡️ Care Anchor'}
                                </h2>
                                <p style={{ fontSize: 14, color: P.textMuted, fontWeight: 500 }}>
                                    {mode === 'login'  ? 'Sign in to your AarogyaVani account'
                                    : mode === 'signup' ? 'Join AarogyaVani — it\'s free'
                                    :                    'Monitor a patient\'s health & receive SOS alerts'}
                                </p>
                            </div>

                            {/* Tab switcher */}
                            <div style={{
                                display: 'flex', background: P.bg,
                                borderRadius: 14, padding: 4, gap: 3, marginBottom: 24,
                                border: `1px solid ${P.pinkBorder}`,
                            }}>
                                {AUTH_TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        className="av-tab-btn"
                                        onClick={() => { setMode(tab.id); setError(''); }}
                                        style={{
                                            flex: 1, padding: '10px 4px', border: 'none',
                                            borderRadius: 10, cursor: 'pointer',
                                            fontFamily: 'Inter, system-ui, sans-serif',
                                            fontWeight: 700, fontSize: 11.5, letterSpacing: '0.01em',
                                            background: mode === tab.id ? P.surface : 'transparent',
                                            color: mode === tab.id ? P.pink : P.textMuted,
                                            outline: mode === tab.id ? `1.5px solid ${P.pinkBorder}` : 'none',
                                            boxShadow: mode === tab.id ? '0 2px 8px rgba(232,84,122,0.10)' : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                        }}
                                    >
                                        <tab.Icon />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13, animation: 'tabIn 0.18s ease' }}>

                                {/* PATIENT SIGNUP */}
                                {mode === 'signup' && (<>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div>
                                            <label style={lbl}>Your Name</label>
                                            <input className="av-input" style={inp} type="text" placeholder="e.g. Rahul Sharma" value={name} onChange={e => setName(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label style={lbl}>Age <span style={{ opacity: 0.5 }}>(Opt.)</span></label>
                                            <input className="av-input" style={inp} type="number" placeholder="72" min={1} max={120} value={age} onChange={e => setAge(e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={lbl}>Email Address</label>
                                        <input className="av-input" style={inp} type="email" placeholder="rahul@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label style={lbl}>Password</label>
                                        <input className="av-input" style={inp} type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                                    </div>
                                    <div style={{ padding: '14px', background: P.pinkSoft, border: `1px solid ${P.pinkBorder}`, borderRadius: 14 }}>
                                        <label style={{ ...lbl, color: P.pink, marginBottom: 10 }}>Invite a Care Anchor <span style={{ opacity: 0.6 }}>(Optional)</span></label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <div>
                                                <label style={{ ...lbl, fontSize: 9 }}>Their Name</label>
                                                <input className="av-input" style={inp} type="text" placeholder="Care Provider" value={anchorName} onChange={e => setAnchorName(e.target.value)} />
                                            </div>
                                            <div>
                                                <label style={{ ...lbl, fontSize: 9 }}>Their Phone</label>
                                                <input className="av-input" style={inp} type="tel" placeholder="+91..." value={anchorPhone} onChange={e => setAnchorPhone(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </>)}

                                {/* PATIENT LOGIN */}
                                {mode === 'login' && (<>
                                    <div>
                                        <label style={lbl}>Email Address</label>
                                        <input className="av-input" style={inp} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label style={lbl}>Password</label>
                                        <input className="av-input" style={inp} type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
                                    </div>
                                </>)}

                                {/* CARE ANCHOR */}
                                {mode === 'anchor' && (<>
                                    <div style={{ display: 'flex', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.22)', borderRadius: 12, padding: 4, gap: 3 }}>
                                        <button type="button" onClick={() => setAnchorMode('login')} style={{ flex: 1, padding: '9px', border: 'none', background: anchorMode === 'login' ? '#3b82f6' : 'transparent', color: anchorMode === 'login' ? '#fff' : '#60a5fa', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>Log In</button>
                                        <button type="button" onClick={() => setAnchorMode('signup')} style={{ flex: 1, padding: '9px', border: 'none', background: anchorMode === 'signup' ? '#3b82f6' : 'transparent', color: anchorMode === 'signup' ? '#fff' : '#60a5fa', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>Link New Anchor</button>
                                    </div>
                                    {anchorMode === 'login' && (<>
                                        <div>
                                            <label style={lbl}>Phone Number</label>
                                            <input className="av-input" style={inp} type="tel" placeholder="+91 98765 43210" value={anchorPhone} onChange={e => setAnchorPhone(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label style={lbl}>Anchor Password</label>
                                            <input className="av-input" style={inp} type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
                                        </div>
                                    </>)}
                                    {anchorMode === 'signup' && (<>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                                            <div>
                                                <label style={lbl}>Your Name</label>
                                                <input className="av-input" style={inp} type="text" placeholder="e.g. Suresh Kumar" value={name} onChange={e => setName(e.target.value)} required />
                                            </div>
                                            <div>
                                                <label style={lbl}>Your Phone</label>
                                                <input className="av-input" style={inp} type="tel" placeholder="+91..." value={anchorPhone} onChange={e => setAnchorPhone(e.target.value)} required />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <div>
                                                <label style={lbl}>Password</label>
                                                <input className="av-input" style={inp} type="password" placeholder="Min. 6 chars" value={password} onChange={e => setPassword(e.target.value)} required />
                                            </div>
                                            <div>
                                                <label style={lbl}>Anchor Code</label>
                                                <input className="av-input" style={{ ...inp, textTransform: 'uppercase', fontSize: 18, fontWeight: 900, letterSpacing: '0.1em', textAlign: 'center' }} type="text" placeholder="G7B2..." maxLength={6} value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} required />
                                            </div>
                                        </div>
                                    </>)}
                                </>)}

                                {/* Error */}
                                {error && (
                                    <div style={{ background: 'rgba(229,57,53,0.07)', border: '1px solid rgba(229,57,53,0.20)', borderRadius: 10, padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#c62828' }}>
                                        {error}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="av-submit-btn"
                                    disabled={loading}
                                    style={{
                                        marginTop: 4,
                                        background: mode === 'anchor'
                                            ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                                            : `linear-gradient(135deg, ${P.pink}, ${P.pinkHover})`,
                                        color: '#fff', border: 'none', borderRadius: 50,
                                        padding: '16px', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                                        fontWeight: 900, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1, letterSpacing: '-0.01em',
                                        boxShadow: mode === 'anchor'
                                            ? '0 8px 24px rgba(59,130,246,0.28)'
                                            : `0 8px 24px ${P.pinkGlow}`,
                                    }}
                                >
                                    {loading ? '⏳ Please wait...'
                                    : mode === 'login'   ? 'Sign In Securely →'
                                    : mode === 'signup'  ? 'Create Account →'
                                    : anchorMode === 'login' ? '🛡️ Log In as Anchor'
                                    :                          '🤝 Link New Anchor'}
                                </button>
                            </form>

                            {/* Footer privacy note */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                marginTop: 20, color: P.textMuted,
                            }}>
                                <IconLock />
                                <span style={{ fontSize: 12, fontWeight: 600 }}>
                                    Data stays strictly on your device. Zero cloud upload.
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showAbout && <DocsModal onClose={() => setShowAbout(false)} autoScrollToVideo={false} />}
        </>
    );
};
