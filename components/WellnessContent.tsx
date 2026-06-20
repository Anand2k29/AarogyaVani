import React, { useState } from 'react';
import { useLanguage } from '../src/context/LanguageContext';
import { getDataNamespace } from '../services/authService';
import type { VitalReading } from './VitalsContent';

interface WellnessContentProps { s: any }

/* ──────────────────────────────────────────────────────────────
   EXERCISE / YOGA DATA
────────────────────────────────────────────────────────────── */
const EXERCISES: Record<string, { emoji: string; name: string; sanskrit?: string; duration: string; benefit: string; steps: string[]; color: string; video?: Record<string, string> }[]> = {
    low_bp: [
        { emoji: '🧘', name: 'Mountain Pose', sanskrit: 'Tadasana', duration: '5 min', color: '#42a5f5', benefit: 'Improves circulation & posture', steps: ['Stand tall, feet together', 'Breathe deeply — in 4 sec, out 6 sec', 'Hold arms slightly away from body', 'Repeat 10 cycles'] },
        { emoji: '🦵', name: 'Leg Raises', duration: '3 min', color: '#42a5f5', benefit: 'Pushes blood from legs back to heart', steps: ['Lie flat on back', 'Slowly raise legs to 90°', 'Hold 3 seconds, lower slowly', 'Repeat 10 times'] },
        { emoji: '🤸', name: 'Cat-Cow Stretch', sanskrit: 'Marjaryasana', duration: '5 min', color: '#42a5f5', benefit: 'Gently stimulates the adrenal glands', steps: ['On all fours, neutral spine', 'Inhale: drop belly, lift head (Cow)', 'Exhale: round spine, tuck chin (Cat)', 'Repeat 10 slow cycles'] },
        { emoji: '🚶', name: 'Brisk Walking', duration: '15 min', color: '#29b6f6', benefit: 'Natural blood pressure booster', steps: ['Start slow for 3 minutes', 'Pick up pace for 10 minutes', 'Cool down for 2 minutes', 'Drink water after'] },
    ],
    high_bp: [
        { emoji: '🌬️', name: 'Alternate Nostril Breathing', sanskrit: 'Nadi Shodhana', duration: '10 min', color: '#ab47bc', benefit: 'Calms the nervous system', steps: ['Close right nostril, inhale left 4 sec', 'Close both nostrils, hold 4 sec', 'Open right nostril, exhale 8 sec', 'Repeat on opposite side — 10 cycles'] },
        { emoji: '🧘', name: 'Child\'s Pose', sanskrit: 'Balasana', duration: '5 min', color: '#ab47bc', benefit: 'Releases tension — lowers BP naturally', steps: ['Kneel, big toes touching', 'Fold forward, arms stretched ahead', 'Rest forehead on the mat', 'Breathe deeply, hold 2-5 min'] },
        { emoji: '🏊', name: 'Slow Stretches', duration: '10 min', color: '#8e24aa', benefit: 'Reduces arterial stiffness', steps: ['Gentle neck rolls — 5 each direction', 'Shoulder circles — 10 each arm', 'Side bends with arms raised', 'Slow forward folds'] },
        { emoji: '🛌', name: 'Savasana (Rest Pose)', sanskrit: 'Savasana', duration: '10 min', color: '#ab47bc', benefit: 'Activates the parasympathetic nervous system', steps: ['Lie flat, arms slightly out', 'Close eyes, relax every muscle', 'Focus only on your breathing', 'Stay still for full 10 minutes'] },
    ],
    diabetes: [
        { emoji: '🏃', name: 'Post-Meal Walk', duration: '15-30 min', color: '#ff7043', benefit: 'Reduces post-meal glucose spike by ~30%', steps: ['Begin 15 min after eating', 'Walk at a moderate comfortable pace', 'Avoid stopping — keep moving', 'End with gentle stretching'] },
        { emoji: '🏹', name: 'Bow Pose', sanskrit: 'Dhanurasana', duration: '3 min', color: '#ff7043', benefit: 'Stimulates pancreas — improves insulin response', steps: ['Lie on stomach', 'Bend knees, hold ankles with hands', 'Inhale: lift chest and legs together', 'Hold 15-20 sec, exhale down. Repeat 5x'] },
        { emoji: '🦷', name: 'Plank', duration: '3 min', color: '#ef5350', benefit: 'Builds lean muscle — lowers insulin resistance', steps: ['Start in push-up position', 'Keep hips level — straight body line', 'Hold for 20-30 seconds', 'Rest 10 sec, do 5 rounds'] },
        { emoji: '💪', name: 'Chair Squats', duration: '5 min', color: '#ff7043', benefit: 'Uses large leg muscles — burns glucose fast', steps: ['Stand in front of a chair', 'Lower yourself slowly as if sitting', 'Just touch the chair, then stand', 'Repeat 15 times, 3 sets'] },
    ],
    low_sugar: [
        { emoji: '🍌', name: 'Rest + Refuel', duration: 'Immediate', color: '#ffca28', benefit: 'Hypoglycemia requires fast-acting carbs first', steps: ['Sit or lie down immediately', 'Take 15g fast sugar (glucose tabs, juice)', 'Wait 15 minutes, recheck', 'Do NOT exercise until sugar > 100 mg/dL'] },
        { emoji: '🧘', name: 'Gentle Breathing', duration: '5 min', color: '#ffca28', benefit: 'Calms stress hormones during low sugar episode', steps: ['Sit comfortably, close eyes', 'Breathe in for 4 counts', 'Hold for 2 counts', 'Breathe out for 6 counts'] },
    ],
    general: [
        { emoji: '🌅', name: 'Morning Sun Salutation', sanskrit: 'Surya Namaskar', duration: '10 min', color: '#E8547A', benefit: 'Full body activation — boosts immunity', steps: ['Begin standing, hands at chest', '12-step flow: stretch, fold, lunge, plank, cobra, downdog', 'Move slowly in sync with breath', 'Do 5 complete rounds'], video: { en: '_2GgRQJ9IbU', hi: 'QFhgghL3vGM' } },
        { emoji: '🧘', name: 'Seated Forward Bend', sanskrit: 'Paschimottanasana', duration: '3 min', color: '#E8547A', benefit: 'Calms the nervous system and mind', steps: ['Sit with legs stretched ahead', 'Inhale, raise arms overhead', 'Exhale: hinge at hips, reach for feet', 'Hold 30 sec, breathe deeply'], video: { en: 'E5FtZEVC424', hi: 'pbKHJ3lvovI' } },
        { emoji: '💧', name: 'Hydration Walk', duration: '10 min', color: '#26a69a', benefit: 'Maintains metabolism and joint health', steps: ['Drink one glass of water first', 'Walk at easy pace for 10 minutes', 'Focus on posture — shoulders back', 'Finish with gentle ankle rotations'] },
    ],
};

function getBadgeColor(condition: string) {
    if (condition === 'low_bp') return '#42a5f5';
    if (condition === 'high_bp') return '#ab47bc';
    if (condition === 'diabetes') return '#ff7043';
    if (condition === 'low_sugar') return '#ffca28';
    return '#E8547A';
}

type ExerciseItem = typeof EXERCISES['general'][0];

const ExerciseCard: React.FC<{ ex: ExerciseItem; s: any; lang: string }> = ({ ex, s, lang }) => {
    const [open, setOpen] = useState(false);
    // Track which video is playing specifically by language code (e.g. 'en', 'hi')
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);

    // Check if we have videos
    const hasVideos = !!ex.video;

    return (
        <div style={{ background: s.card, border: `1px solid ${ex.color}30`, borderRadius: 20, overflow: 'hidden', transition: 'all 0.3s' }}>
            <button onClick={() => setOpen(!open)} style={{ width: '100%', background: 'none', border: 'none', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${ex.color}18`, border: `1px solid ${ex.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{ex.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: s.txtPri, fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif' }}>
                        {ex.name} {ex.sanskrit && <span style={{ fontSize: 12, fontWeight: 600, color: s.txtMuted, fontStyle: 'italic' }}>· {ex.sanskrit}</span>}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: s.txtMuted }}>{ex.benefit}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, background: `${ex.color}18`, color: ex.color, padding: '4px 10px', borderRadius: 50, border: `1px solid ${ex.color}30` }}>⏱ {ex.duration}</span>
                    <span style={{ fontSize: 16, color: s.txtMuted, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>›</span>
                </div>
            </button>
            {
                open && (
                    <div style={{ padding: '0 20px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {ex.steps.map((step, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <span style={{ width: 22, height: 22, borderRadius: '50%', background: `${ex.color}20`, color: ex.color, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                                <p style={{ margin: 0, fontSize: 14, color: s.txtSec || '#a7a7a7', lineHeight: 1.5 }}>{step}</p>
                            </div>
                        ))}
                        {hasVideos && (
                            <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap', paddingBottom: 8 }}>
                                {Object.entries(ex.video!).filter(([lang]) => lang === 'en' || lang === 'hi').map(([videoLang, videoId]) => (
                                    <div key={videoLang} style={{ flex: '1 1 300px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 18 }}>{videoLang === 'en' ? '🇺🇸' : '🇮🇳'}</span>
                                            <span style={{
                                                fontSize: 16, fontWeight: 900,
                                                background: videoLang === 'en' ? 'linear-gradient(90deg, #42a5f5, #E8547A)' : 'linear-gradient(90deg, #ff9933, #E8547A)',
                                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                                letterSpacing: '0.02em'
                                            }}>
                                                {videoLang === 'en' ? 'English' : 'Hindi'}
                                            </span>
                                        </div>
                                        <div style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.3)', border: `1px solid ${s.border}`, position: 'relative', width: '100%', aspectRatio: '16/9', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                                            {playingVideo !== videoLang ? (
                                                <div
                                                    onClick={() => setPlayingVideo(videoLang)}
                                                    style={{
                                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                        backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
                                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'transform 0.3s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <div style={{ width: 56, height: 56, background: 'rgba(255, 0, 0, 0.9)', backdropFilter: 'blur(4px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', transition: 'background 0.2s' }}>
                                                        <svg viewBox="0 0 24 24" width="28" height="28" fill="white" style={{ marginLeft: 4 }}><path d="M8 5v14l11-7z" /></svg>
                                                    </div>
                                                </div>
                                            ) : (
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                                    title={`Yoga Tutorial: ${ex.sanskrit || ex.name} (${videoLang})`}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    style={{ position: 'absolute', top: 0, left: 0 }}
                                                />
                                            )}
                                        </div>
                                        <p style={{ margin: '4px 0 0', fontSize: 13, color: s.txtMuted, fontStyle: 'italic', paddingLeft: 4 }}>
                                            {videoLang === 'en' ? 'Yoga guide in English' : 'योग गाइड हिंदी में'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
};

export const WellnessContent: React.FC<WellnessContentProps> = ({ s }) => {
    const { language } = useLanguage();
    const latest: VitalReading | null = (() => {
        try {
            const arr = JSON.parse(localStorage.getItem(`${getDataNamespace()}_vitals`) || '[]');
            return arr[0] || null;
        } catch { return null; }
    })();

    // Health conditions
    const conditions: Record<string, boolean> = {
        low_bp: !!(latest?.bpSystolic && latest.bpSystolic < 90),
        high_bp: !!(latest?.bpSystolic && latest.bpSystolic > 140),
        diabetes: !!(latest?.bloodSugar && latest.bloodSugar > 180),
        low_sugar: !!(latest?.bloodSugar && latest.bloodSugar < 70),
    };
    const hasCondition = Object.values(conditions).some(Boolean);

    const conditionMeta: Record<string, { label: string; emoji: string; advice: string }> = {
        low_bp: { label: 'Low Blood Pressure', emoji: '💙', advice: 'Focus on gentle circulation exercises. Avoid sudden position changes.' },
        high_bp: { label: 'High Blood Pressure', emoji: '🟣', advice: 'Prioritise calming breathwork and restorative poses. Avoid inversions.' },
        diabetes: { label: 'High Blood Sugar', emoji: '🟠', advice: 'Post-meal walks are your most powerful tool. Aim for 30 min daily.' },
        low_sugar: { label: 'Low Blood Sugar', emoji: '🟡', advice: 'Rest first, exercise later. Treat hypoglycemia before any activity.' },
    };

    const [activeSection, setActiveSection] = useState<string>(
        hasCondition ? Object.entries(conditions).find(([, v]) => v)?.[0] || 'general' : 'general'
    );

    const sections = [
        ...(hasCondition ? Object.entries(conditions).filter(([, v]) => v).map(([k]) => k) : []),
        'general',
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div>
                <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: s.txtPri, letterSpacing: '-0.03em', fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif' }}>
                    🧘 Wellness Guide
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: s.txtMuted }}>
                    Personalised yoga & exercises based on your latest vitals.
                </p>
            </div>

            {/* If no vitals logged */}
            {!hasCondition && !latest && (
                <div style={{ background: 'rgba(232,84,122,0.06)', border: '1px dashed rgba(232,84,122,0.3)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: s.txtMuted }}>💡 Log your vitals in the <strong style={{ color: s.accent }}>Vitals</strong> tab to unlock personalised recommendations!</p>
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: s.txtMuted }}>Showing general wellness exercises in the meantime.</p>
                </div>
            )}

            {/* Condition banners */}
            {hasCondition && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(conditions).filter(([, v]) => v).map(([key]) => {
                        const meta = conditionMeta[key];
                        return (
                            <div key={key} style={{ background: `${getBadgeColor(key)}12`, border: `1px solid ${getBadgeColor(key)}35`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <span style={{ fontSize: 22 }}>{meta.emoji}</span>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: s.txtPri }}>{meta.label} Detected</p>
                                    <p style={{ margin: '2px 0 0', fontSize: 13, color: s.txtMuted }}>{meta.advice}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Section Tabs */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {sections.map(sec => (
                    <button key={sec} onClick={() => setActiveSection(sec)}
                        style={{ padding: '8px 18px', borderRadius: 50, border: `1.5px solid ${activeSection === sec ? getBadgeColor(sec) : s.border}`, background: activeSection === sec ? `${getBadgeColor(sec)}18` : 'transparent', color: activeSection === sec ? getBadgeColor(sec) : s.txtMuted, fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif', fontWeight: 800, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s' }}
                    >
                        {sec === 'low_bp' ? '💙 Low BP' : sec === 'high_bp' ? '🟣 High BP' : sec === 'diabetes' ? '🟠 Diabetes' : sec === 'low_sugar' ? '🟡 Low Sugar' : '✨ General'}
                    </button>
                ))}
            </div>

            {/* Exercise Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(EXERCISES[activeSection] || EXERCISES.general).map((ex, i) => (
                    <ExerciseCard key={i} ex={ex} s={s} lang={language} />
                ))}
            </div>

            <p style={{ textAlign: 'center', fontSize: 12, color: s.txtMuted, lineHeight: 1.5 }}>
                ⚕️ These recommendations are general wellness guidelines. Always consult your doctor before starting a new exercise routine.
            </p>
        </div>
    );
};
