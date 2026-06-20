import React, { useEffect, useState, useRef } from 'react';

const ACCENT = '#1db954';

const features = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="m9 15 2 2 4-4" />
            </svg>
        ),
        color: ACCENT,
        title: 'AI Prescription Scan',
        tag: 'Gemini Vision',
        desc: "Point your camera at any handwritten prescription. Gemini AI reads the doctor's handwriting, explains each medicine in plain language, and speaks it aloud in Kannada, Hindi, or English.",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
        ),
        color: '#ab47bc',
        title: 'Smart Reminders',
        tag: 'Always On-Time',
        desc: 'Add a medicine and the app schedules dose alerts throughout the day. Works offline — no internet needed once set up. Your medication schedule stays on your device.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        color: '#42a5f5',
        title: 'Care Anchor',
        tag: 'Family Safety Net',
        desc: 'A family member or caretaker links to a patient profile using a unique 6-character code. They get a live dashboard showing medicine adherence and health updates.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        ),
        color: '#ff7043',
        title: 'PHI Vault',
        tag: '100% Private',
        desc: 'A PIN-protected vault for storing allergies, surgeries, doctor notes, and insurance info. Zero cloud — all data lives on your device only. Never uploaded.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        color: '#26c6da',
        title: 'Vitals Tracker',
        tag: 'Health History',
        desc: 'Log Blood Pressure, Blood Sugar and Heart Rate daily. The app flags Low/Normal/High levels and uses your history to personalise Yoga recommendations automatically.',
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
        ),
        color: '#ffb74d',
        title: '3 Languages',
        tag: 'EN · ಕನ · हि',
        desc: 'Fully multi-lingual. Switch between English, Kannada, and Hindi for both the app UI and AI output. Perfect for rural patients who read in regional scripts.',
    },
];

const Logo = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        {/* Advanced AI Health Logo - Shield + Mic + Cross */}
        <div style={{ position: 'relative', width: 90, height: 90 }}>
            {/* Outer Glow Ring */}
            <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', background: ACCENT, filter: 'blur(30px)', opacity: 0.15, animation: 'pulseGlow 3s infinite' }} />

            {/* Shield Base */}
            <svg viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))' }}>
                <defs>
                    <linearGradient id="logo-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1db954" />
                        <stop offset="100%" stopColor="#0a4d22" />
                    </linearGradient>
                </defs>
                <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="url(#logo-shield-grad)" />
            </svg>

            {/* Inner Medical Cross & Mic Motif */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 44, height: 44, opacity: 0.9 }}>
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" strokeWidth={3} />
                    <line x1="8" y1="23" x2="16" y2="23" strokeWidth={2} />
                </svg>
            </div>
        </div>
        <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 34, fontWeight: 950, color: '#fff', letterSpacing: '-0.04em', margin: 0 }}>
                Aarogya<span style={{ color: ACCENT }}>Vani</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 4 }}>
                <div style={{ width: 12, height: 1, background: ACCENT }} />
                <span style={{ fontSize: 11, fontWeight: 900, color: ACCENT, letterSpacing: '0.3em', textTransform: 'uppercase' }}>AI Health Companion</span>
                <div style={{ width: 12, height: 1, background: ACCENT }} />
            </div>
        </div>
    </div>
);

const MIBAudioPlayer = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        // Auto-play logic on mount
        const timer = setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play().catch(err => {
                    console.log("Auto-play blocked by browser. User must interact first.", err);
                });
                setIsPlaying(true);
            }
        }, 500); // Small delay to ensure modal transition is smooth
        return () => clearTimeout(timer);
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const stopAudio = () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    return (
        <div style={{
            marginTop: 40, padding: 20, borderRadius: 24,
            background: 'rgba(29, 185, 84, 0.05)',
            border: '1px solid rgba(29, 185, 84, 0.15)',
            display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center'
        }}>
            <audio ref={audioRef} src="/audio/mib-theme.mp3.mp3" loop />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: ACCENT, letterSpacing: '0.15em', textTransform: 'uppercase' }}>MIB Theme</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Now Playing</span>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={togglePlay} style={{
                    width: 44, height: 44, borderRadius: '50%', background: isPlaying ? '#ff5252' : ACCENT,
                    border: 'none', color: '#000', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                    boxShadow: `0 8px 20px ${isPlaying ? '#ff525233' : '#1db95433'}`
                }}>
                    {isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={stopAudio} style={{
                    width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}>⏹</button>
                <button onClick={toggleMute} style={{
                    width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}>
                    {isMuted ? '🔇' : '🔊'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 10, opacity: 0.3 }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                        width: 3, height: isPlaying ? 15 + Math.random() * 20 : 5,
                        background: ACCENT, borderRadius: 2,
                        transition: 'height 0.2s ease-in-out',
                        animation: isPlaying ? `badgeBounce ${0.5 + Math.random()}s infinite` : 'none'
                    }} />
                ))}
            </div>
        </div>
    );
};

const contextSections = [
    {
        title: "The Problem",
        desc: "Doctors' handwriting is often undecipherable, causing dose errors and anxiety for families. Language barriers further alienate rural patients from understanding their own treatment plans.",
        icon: "📝",
        color: "#ff5252"
    },
    {
        title: "The Solution",
        desc: "AarogyaVani leverages Gemini's vision-multimodal intelligence to decode intent, not just text. We bridge the gap with real-time vernacular translation and voice output.",
        icon: "✨",
        color: ACCENT
    },
    {
        title: "Why Us?",
        desc: "True end-to-end privacy. Unlike cloud-first apps, our PHI Vault and processing is on-device. No extra hardware, just a smartphone turned health-companion.",
        icon: "🛡️",
        color: "#448aff"
    }
];

const futureScopeItems = [
    { title: "ABDM 2.0", desc: "Full synergy with Ayushman Bharat health accounts." },
    { title: "ASHA Portal", desc: "Live monitoring tools for community health workers." },
    { title: "Vital AI", desc: "Predictive alerts for hypotension & cardiac trends." },
    { title: "Offline Voice", desc: "Complete UI navigation via locally-run voice models." }
];

interface DocsModalProps {
    onClose: () => void;
    autoScrollToVideo?: boolean;
}

export const DocsModal: React.FC<DocsModalProps> = ({ onClose, autoScrollToVideo }) => {
    const [showVideos, setShowVideos] = React.useState(false);
    const videoSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);

        if (autoScrollToVideo) {
            setShowVideos(true);
            setTimeout(() => {
                videoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 800);
        }

        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, autoScrollToVideo]);

    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.82)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 24,
            }}
        >
            <style>{`
                @keyframes fadeInModal {
                    from { opacity: 0; transform: scale(0.96) translateY(30px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes badgeBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes shinePulse {
                    0% { box-shadow: 0 0 0 0 rgba(29,185,84,0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(29,185,84,0); }
                    100% { box-shadow: 0 0 0 0 rgba(29,185,84,0); }
                }
                @keyframes sweep {
                    0% { left: -100%; }
                    50% { left: 100%; }
                    100% { left: 100%; }
                }
                .docs-modal-container::-webkit-scrollbar { width: 6px; }
                .docs-modal-container::-webkit-scrollbar-track { background: transparent; }
                .docs-modal-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .feature-un-card:hover .icon-glow { opacity: 0.15 !important; filter: blur(25px) !important; }
            `}</style>

            <div className="docs-modal-container" style={{
                background: 'linear-gradient(165deg, #0a120b 0%, #050805 100%)',
                borderRadius: 40,
                width: '100%', maxWidth: 1200,
                height: '92vh', overflow: 'hidden',
                boxShadow: '0 50px 150px rgba(0,0,0,0.9), 0 0 60px rgba(29,185,84,0.05)',
                position: 'relative',
                animation: 'fadeInModal 0.4s cubic-bezier(0.16,1,0.3,1)',
                fontFamily: 'Inter, system-ui, sans-serif',
                display: 'flex',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {/* ── LEFT SIDEBAR (20%) ── */}
                <div style={{
                    width: '22%', background: 'rgba(255,255,255,0.02)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    padding: '40px 24px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <span style={{ fontSize: 40 }}>🕶️</span>
                        </div>

                        <MIBAudioPlayer />

                        {/* Decorative Sidebar Icons */}
                        <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center', opacity: 0.15 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={1} style={{ width: 40, height: 40 }}>
                                <path d="M2 12h3M9 12h6M19 12h3" />
                                <circle cx="7" cy="12" r="2" />
                                <circle cx="17" cy="12" r="2" />
                            </svg>
                            <span style={{ fontSize: 32 }}>🧬</span>
                            <span style={{ fontSize: 32 }}>🛰️</span>
                            <span style={{ fontSize: 32 }}>🩺</span>
                        </div>
                    </div>

                    {/* Background Sidebar Elements */}
                    <div style={{ position: 'absolute', bottom: -50, left: -50, fontSize: 200, opacity: 0.03, pointerEvents: 'none' }}>🕶️</div>
                </div>

                {/* ── MAIN CONTENT AREA (80%) ── */}
                <div style={{
                    flex: 1, padding: '50px 60px', overflowY: 'auto',
                    position: 'relative'
                }} className="docs-modal-scroll">
                    <style>{`
                        .docs-modal-scroll::-webkit-scrollbar { width: 6px; }
                        .docs-modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                    `}</style>

                    {/* Close button */}
                    <button onClick={onClose} style={{
                        position: 'absolute', top: 30, right: 30,
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)', border: 'none',
                        color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s', zIndex: 10
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                    >✕</button>

                    <div style={{ position: 'relative' }}>
                        <Logo />
                    </div>

                    {/* Context Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 80 }}>
                        {contextSections.map(s => (
                            <div key={s.title} style={{
                                padding: 30, borderRadius: 32,
                                background: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ fontSize: 28, marginBottom: 16 }}>{s.icon}</div>
                                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 10 }}>{s.title}</h3>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Feature Ecosystem - Glassmorphism UI */}
                    <div style={{ textAlign: 'center', marginBottom: 50 }}>
                        <h2 style={{ fontSize: 36, fontWeight: 950, color: '#fff', letterSpacing: '-0.03em' }}>Production Ecosystem</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30, marginBottom: 80 }}>
                        {features.map((f, i) => (
                            <div key={i} style={{
                                padding: 32, borderRadius: 32,
                                background: 'rgba(255,255,255,0.02)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                position: 'relative', overflow: 'hidden'
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                                }}>
                                <div style={{
                                    width: 54, height: 54, borderRadius: 16, background: `${f.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: f.color, marginBottom: 24, position: 'relative', zIndex: 1
                                }}>{f.icon}</div>
                                <h4 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 8 }}>{f.title}</h4>
                                <span style={{ fontSize: 10, fontWeight: 900, color: f.color, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>{f.tag}</span>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>{f.desc}</p>

                                {/* Ambient Glow */}
                                <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, background: f.color, opacity: 0.05, filter: 'blur(30px)' }} />
                            </div>
                        ))}
                    </div>

                    {/* Media Gallery / Video Section */}
                    <div ref={videoSectionRef} id="video-section" style={{
                        margin: '60px 0', padding: 50, borderRadius: 40,
                        background: 'rgba(29, 185, 84, 0.03)',
                        border: '1px solid rgba(29, 185, 84, 0.1)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <h2 style={{ fontSize: 32, fontWeight: 950, color: '#fff', marginBottom: 30 }}>Experience the Vision</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, maxWidth: 800, margin: '0 auto' }}>
                            {[
                                { title: "Core Architecture Demo", url: "https://www.youtube.com/embed/jV1vkHv4zq8", desc: "Watch common medications get scanned in seconds." },
                            ].map((video, idx) => (
                                <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 28, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ borderRadius: 18, overflow: 'hidden', position: 'relative', paddingTop: '56.25%', background: '#000', marginBottom: 18 }}>
                                        <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} src={video.url} title={video.title} allowFullScreen />
                                    </div>
                                    <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '0 0 6px 0' }}>{video.title}</h3>
                                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{video.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Roadmap */}
                    <div style={{ marginTop: 60, paddingBottom: 40 }}>
                        <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <h2 style={{ fontSize: 24, fontWeight: 950, color: '#fff', letterSpacing: '-0.02em' }}>The Path Forward</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                            {futureScopeItems.map((item, idx) => (
                                <div key={idx} style={{ padding: 24, borderRadius: 24, background: 'rgba(29,185,84,0.04)', border: '1px solid rgba(29,185,84,0.1)' }}>
                                    <h4 style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginBottom: 8 }}>{item.title}</h4>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
