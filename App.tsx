import React, { useState, useRef, useEffect, useCallback } from 'react';
import { decodePrescriptionText, DecodedPrescriptionResult } from './services/prescriptionDecoder';
import { TTSEngine } from './services/ttsEngine';
import { getCurrentUser, logOut, UserProfile, getDataNamespace } from './services/authService';
import { AuthPage } from './components/AuthPage';
import { ElderlyCompanion } from './components/ElderlyCompanion';
import { MedicationReminders } from './components/MedicationReminders';
import { AppointmentCalendar } from './components/AppointmentCalendar';
import { SOSContent } from './components/SOSContent';
import { AIReports } from './components/AIReports';
import { VitalsContent } from './components/VitalsContent';
import { WellnessContent } from './components/WellnessContent';
import { PHIVaultContent } from './components/PHIVaultContent';
import { useLanguage } from './src/context/LanguageContext';
import { DashboardContent } from './components/DashboardContent';
import { ScannerContent } from './components/ScannerContent';
import { InsightsContent } from './components/InsightsContent';

declare global {
  interface Window {
    confetti: any;
  }
}

type AppState = 'IDLE' | 'DETECTING' | 'SUCCESS' | 'ERROR';
type MainTab = 'dashboard' | 'scanner' | 'companion' | 'reminders' | 'calendar' | 'sos' | 'insights' | 'ai_reports' | 'health';
type HealthSubTab = 'vitals' | 'wellness' | 'vault';

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' }
];

/* ── Inline SVG Icons ──────────────────────────────────── */
const Icon = ({ d, filled = false }: { d: string | string[]; filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const ScanIcon = () => <Icon d={['M3 7V5a2 2 0 0 1 2-2h2', 'M17 3h2a2 2 0 0 1 2 2v2', 'M21 17v2a2 2 0 0 1-2 2h-2', 'M7 21H5a2 2 0 0 1-2-2v-2', 'M7 7h10v10H7z']} />;
const MicIcon = () => <Icon d={['M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z', 'M19 10v2a7 7 0 0 1-14 0v-2', 'M12 19v4', 'M8 23h8']} />;
const CamIcon = () => <Icon d={['M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z', 'M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z']} />;
const HomeIcon = () => <Icon d={['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10']} />;
const BellIcon = () => <Icon d={['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0']} />;
const SearchIcon = () => <Icon d={['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.35-4.35']} />;
const PillIcon = () => <Icon d={['M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2', 'M18 14v8', 'M14 18h8', 'M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0']} />;
const AlertIcon = () => <Icon d={['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01']} />;
const SunIcon = () => <Icon d={['M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z', 'M12 1v2', 'M12 21v2', 'M4.22 4.22l1.42 1.42', 'M18.36 18.36l1.42 1.42', 'M1 12h2', 'M21 12h2', 'M4.22 19.78l1.42-1.42', 'M18.36 5.64l1.42-1.42']} />;
const MoonIcon = () => <Icon d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />;
const StopIcon = () => <Icon d="M8 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" filled />;
const WarnIcon = () => <Icon d={['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01']} />;
const ChevIcon = () => <Icon d="M6 9l6 6 6-6" />;
const LogoutIcon = () => <Icon d={['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9']} />;
const UserIcon = () => <Icon d={['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z']} />;
const SettingsIcon = () => <Icon d={['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z']} />;

/* ── Spinner ──────────────────────────────────────────── */
const Spinner = () => (
  <div style={{ width: 48, height: 48, border: '4px solid rgba(232,84,122,0.2)', borderTopColor: '#E8547A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
);

/* ── Custom hook: detect if on desktop ───────────────── */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

/* ═══════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [mainTab, setMainTab] = useState<MainTab>(() => {
    // Read initial tab from URL hash if valid
    const hash = window.location.hash.replace('#', '') as MainTab;
    const validTabs: MainTab[] = ['dashboard', 'scanner', 'companion', 'reminders', 'calendar', 'sos', 'insights', 'ai_reports', 'health'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  });
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [result, setResult] = useState<DecodedPrescriptionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [manualApiKey, setManualApiKey] = useState(() => localStorage.getItem('av_gemini_api_key') || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [addConfirm, setAddConfirm] = useState<{ name: string; dosage: string; times: string[] } | null>(null);
  const [globalSOS, setGlobalSOS] = useState<{ from: string; at: number } | null>(null);
  // scanLang = language for prescription OUTPUT only (independent of global UI language)
  const [scanLang, setScanLang] = useState<string>('hi');
  const [healthSubTab, setHealthSubTab] = useState<HealthSubTab>('vitals');
  const [showAnchorQR, setShowAnchorQR] = useState(false);
  const { language: currentLang, setLanguage, t } = useLanguage();

  const triggerConfetti = () => {
    if (window.confetti) {
      window.confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E8547A', '#FFFFFF', '#FF8FB1']
      });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDesktop = useIsDesktop();
  const isDark = false; // Pink Light Mode
  const isAnchor = user?.role === 'anchor';

  // Poll for SOS updates if anchor
  useEffect(() => {
    if (!isAnchor) return;
    const interval = setInterval(() => {
      try {
        const a = localStorage.getItem(`${getDataNamespace()}_sos_alert`);
        if (a) setGlobalSOS(JSON.parse(a));
        else setGlobalSOS(null);
      } catch { }
    }, 2000);
    return () => clearInterval(interval);
  }, [isAnchor]);

  const dismissGlobalSOS = () => {
    localStorage.removeItem(`${getDataNamespace()}_sos_alert`);
    setGlobalSOS(null);
  };

  // Force pink light mode
  useEffect(() => {
    document.body.classList.remove('dark');
  }, []);

  // Sync tab to/from URL hash for browser back/forward support
  const navigateTo = useCallback((tab: MainTab) => {
    if (mainTab !== tab) {
      setMainTab(tab);
      window.history.pushState({ tab }, '', `#${tab}`);
    }
  }, [mainTab]);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      // Prioritize the hash in the URL when popping state to ensure correctness across sub-tabs
      const hashStr = window.location.hash.replace('#', '');
      const validTabs: MainTab[] = ['dashboard', 'scanner', 'companion', 'reminders', 'calendar', 'sos', 'insights', 'ai_reports', 'health'];

      // Attempt to extract base tab if it's a sub-route (e.g. #health/vitals -> health)
      const baseTab = hashStr.split('/')[0] as MainTab;

      const targetTab = validTabs.includes(baseTab) ? baseTab : (e.state?.tab as MainTab) || 'dashboard';

      if (mainTab !== targetTab) {
        setMainTab(targetTab);
      }
    };

    window.addEventListener('popstate', onPop);

    // Set initial hash if not set (replaceState so we don't build history for the initial load)
    if (!window.location.hash) {
      window.history.replaceState({ tab: mainTab }, '', `#${mainTab}`);
    } else {
      // Hydrate initial state from hash on load if it exists
      const initialTab = window.location.hash.replace('#', '').split('/')[0] as MainTab;
      const validTabs: MainTab[] = ['dashboard', 'scanner', 'companion', 'reminders', 'calendar', 'sos', 'insights', 'ai_reports', 'health'];
      if (validTabs.includes(initialTab) && initialTab !== mainTab) {
        setMainTab(initialTab);
      }
    }

    return () => window.removeEventListener('popstate', onPop);
  }, [mainTab]);

  useEffect(() => {
    if (isAnchor && mainTab === 'scanner') navigateTo('dashboard');
  }, [isAnchor, mainTab, navigateTo]);

  // ── Pink Light-Mode Palette ───────────────────────────
  const s = {
    bg:       '#FFF5F8',
    elevated: 'rgba(255, 255, 255, 0.92)',
    card:     '#FFFFFF',
    subtle:   'rgba(232, 84, 122, 0.07)',
    border:   'rgba(232, 84, 122, 0.15)',
    txtPri:   '#1A0A10',
    txtSec:   '#5C3A4A',
    txtMuted: '#9B7A87',
    accent:   '#E8547A',
    red:      '#e53935',
    sidebar:  'rgba(255, 255, 255, 0.88)',
  };

  // ── Handlers ─────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAppState('DETECTING');
    setErrorMsg(null);
    TTSEngine.stopSpeaking();
    setIsPlaying(false);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const data = await decodePrescriptionText(base64, manualApiKey, true, scanLang);
        setResult(data);
        setAppState('SUCCESS');
      } catch (err: any) {
        setAppState('ERROR');
        setErrorMsg(err?.message || 'Detection failed.');
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleAudio = useCallback(() => {
    if (isPlaying) {
      TTSEngine.stopSpeaking();
      setIsPlaying(false);
    } else if (result && result.ttsScript) {
      // Direct pass of single unified TTS string mapped to native script
      const langMapping: Record<string, string> = { hi: 'hindi', kn: 'kannada', en: 'hinglish' };
      const currentLanguageMapping = langMapping[scanLang] || 'hinglish';
      
      TTSEngine.speakInstruction(result.ttsScript, currentLanguageMapping as any);
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 20000);
    }
  }, [isPlaying, result, scanLang]);

  const reset = useCallback(() => {
    setAppState('IDLE');
    setResult(null);
    setPreviewUrl(null);
    setErrorMsg(null);
    TTSEngine.stopSpeaking();
    setIsPlaying(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleLogout = () => {
    logOut();
    setLanguage('en');
    setUser(null);
    reset();
  };

  // ── Auth gate ────────────────────────────────────────
  if (!user) {
    return <AuthPage isDark={isDark} onAuth={(u) => setUser(u)} />;
  }


  // ── Nav Tabs config ──────────────────────────────────
  const CalendarIcon = () => <Icon d={['M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z', 'M16 2v4', 'M8 2v4', 'M3 10h18']} />;
  const ClockIcon = () => <Icon d={['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2']} />;

  const PATIENT_TABS: { id: MainTab; label: string; IconComp: React.FC }[] = [
    { id: 'dashboard', label: 'Dashboard', IconComp: () => <div style={{ width: 22, height: 22 }}><HomeIcon /></div> },
    { id: 'scanner', label: t('scanner'), IconComp: () => <div style={{ width: 22, height: 22 }}><ScanIcon /></div> },
    { id: 'reminders', label: 'Reminders', IconComp: () => <div style={{ width: 22, height: 22 }}><ClockIcon /></div> },
    { id: 'calendar', label: 'Calendar', IconComp: () => <div style={{ width: 22, height: 22 }}><CalendarIcon /></div> },
    { id: 'health', label: 'My Health', IconComp: () => <div style={{ width: 22, height: 22 }}><Icon d={['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z']} /></div> },
    { id: 'sos', label: t('sos'), IconComp: () => <div style={{ width: 22, height: 22 }}><AlertIcon /></div> },
  ];
  const ANCHOR_TABS: { id: MainTab; label: string; IconComp: React.FC }[] = [
    { id: 'insights', label: 'Dashboard', IconComp: () => <div style={{ width: 22, height: 22 }}><HomeIcon /></div> },
    { id: 'reminders', label: 'Reminders', IconComp: () => <div style={{ width: 22, height: 22 }}><ClockIcon /></div> },
    { id: 'calendar', label: 'Calendar', IconComp: () => <div style={{ width: 22, height: 22 }}><CalendarIcon /></div> },
    { id: 'ai_reports', label: t('ai_reports') || 'AI Reports', IconComp: () => <div style={{ width: 22, height: 22 }}><SunIcon /></div> },
  ];
  const TABS = isAnchor ? ANCHOR_TABS : PATIENT_TABS;

  /** Map dosage frequency text → scheduled times */
  function guessTimes(dosage: string): string[] {
    const d = dosage.toLowerCase();
    if (d.includes('three') || d.includes('3 time') || d.includes('tid')) return ['08:00', '14:00', '20:00'];
    if (d.includes('twice') || d.includes('2 time') || d.includes('bid') || d.includes('morning') && d.includes('night')) return ['08:00', '20:00'];
    if (d.includes('morning')) return ['08:00'];
    if (d.includes('afternoon')) return ['14:00'];
    if (d.includes('night') || d.includes('bedtime')) return ['20:00'];
    if (d.includes('once') || d.includes('od') || d.includes('daily')) return ['08:00'];
    return ['08:00'];
  }

  function confirmAddMedicine(name: string, dosageFull: string) {
    setAddConfirm({ name, dosage: dosageFull, times: guessTimes(dosageFull) });
  }

  function saveMedicineToLS(name: string, dosage: string, times: string[]) {
    const medsKey = `${getDataNamespace()}_medications`;
    const meds = JSON.parse(localStorage.getItem(medsKey) || '[]');
    const med = { id: Math.random().toString(36).slice(2) + Date.now().toString(36), name, dosage, times };
    localStorage.setItem(medsKey, JSON.stringify([...meds, med]));

    setAddConfirm(null);
  }

  const PatientHealthTab = () => {
    const subTabs: { id: HealthSubTab; label: string; icon: string; color: string }[] = [
      { id: 'vitals', label: 'Vitals Tracker', icon: '💓', color: '#26c6da' },
      { id: 'wellness', label: 'Yoga & Wellness', icon: '🧘', color: '#3b82f6' },
      { id: 'vault', label: 'PHI Vault', icon: '🔐', color: '#ab47bc' },
    ];
    return (
      <div style={{ padding: '8px 0' }}>
        {/* Sub-tab switcher */}
        <div style={{ display: 'flex', gap: 8, padding: '0 4px 20px', borderBottom: `1px solid ${s.border}`, marginBottom: 20 }}>
          {subTabs.map(tab => (
            <button key={tab.id} onClick={() => setHealthSubTab(tab.id)}
              style={{
                flex: 1, padding: '12px 8px', borderRadius: 14,
                outline: healthSubTab === tab.id ? `1.5px solid ${tab.color}40` : '1.5px solid transparent',
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
                fontWeight: 700, fontSize: 13, transition: 'all 0.18s',
                background: healthSubTab === tab.id ? `${tab.color}18` : s.subtle,
                border: 'none',
                color: healthSubTab === tab.id ? tab.color : s.txtMuted,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span style={{ fontSize: 11, letterSpacing: '-0.01em' }}>{tab.label}</span>
            </button>
          ))}
        </div>
        {/* Sub-tab content */}
        {healthSubTab === 'vitals' && <VitalsContent s={s} />}
        {healthSubTab === 'wellness' && <WellnessContent s={s} />}
        {healthSubTab === 'vault' && <PHIVaultContent s={s} />}
      </div>
    );
  };

  const mainContent = () => {
    if (mainTab === 'dashboard') return <DashboardContent user={user!} s={s} navigateTo={navigateTo} setHealthSubTab={setHealthSubTab} showAnchorQR={showAnchorQR} setShowAnchorQR={setShowAnchorQR} isAnchor={isAnchor} />;
    if (mainTab === 'scanner') return <ScannerContent appState={appState} previewUrl={previewUrl} s={s} t={t} scanLang={scanLang} setScanLang={setScanLang} isLangOpen={isLangOpen} setIsLangOpen={setIsLangOpen} fileInputRef={fileInputRef} handleFileSelect={handleFileSelect} result={result} isPlaying={isPlaying} toggleAudio={toggleAudio} reset={reset} confirmAddMedicine={confirmAddMedicine} errorMsg={errorMsg} isDesktop={isDesktop} isDark={isDark} isAnchor={isAnchor} />;
    if (mainTab === 'companion') return <ElderlyCompanion onTakeSuccess={triggerConfetti} />;
    if (mainTab === 'reminders') return <MedicationReminders onTakeSuccess={triggerConfetti} />;
    if (mainTab === 'calendar') return <AppointmentCalendar />;
    if (mainTab === 'sos') return <SOSContent s={s} isAnchor={isAnchor} />;
    if (mainTab === 'insights') return <InsightsContent s={s} user={user!} />;
    if (mainTab === 'ai_reports') return <AIReports user={user!} s={s} />;
    if (mainTab === 'health') return <PatientHealthTab />;
    return null;
  };

  const SettingsModal = () => {
    const [localKey, setLocalKey] = useState(manualApiKey);
    const [saved, setSaved] = useState(false);
    const saveKey = () => {
      localStorage.setItem('av_gemini_api_key', localKey);
      setManualApiKey(localKey);
      setSaved(true);
      setTimeout(() => { setSaved(false); setShowSettings(false); }, 1000);
    };
    const LANG_OPTIONS = [
      { code: 'en' as const, label: 'English', flag: '🇬🇧' },
      { code: 'kn' as const, label: 'Kannada', flag: '🇮🇳' },
      { code: 'hi' as const, label: 'हिंदी', flag: '🇮🇳' },
    ];
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,10,16,0.45)', backdropFilter: 'blur(12px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowSettings(false)}>
        <div style={{ background: '#FFFFFF', border: `1px solid rgba(232,84,122,0.2)`, borderRadius: 24, padding: 32, width: '100%', maxWidth: 460, animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 24px 64px rgba(232,84,122,0.12)' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: s.txtPri }}>{t('set_title')}</h2>
            <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: s.txtMuted, fontSize: 24, cursor: 'pointer' }}>✕</button>
          </div>

          {/* Language Selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: s.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>🌍 {t('set_language')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {LANG_OPTIONS.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  style={{ flex: 1, padding: '12px 8px', borderRadius: 14, border: currentLang === l.code ? `2px solid ${s.accent}` : `1px solid ${s.border}`, background: currentLang === l.code ? 'rgba(232,84,122,0.08)' : s.subtle, cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: 13, color: currentLang === l.code ? s.accent : s.txtMuted, transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                >
                  <span style={{ fontSize: 22 }}>{l.flag}</span>
                  <span>{l.label}</span>
                  {currentLang === l.code && <span style={{ fontSize: 10, color: s.accent }}>✓ Active</span>}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: s.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{t('set_api_key')}</label>
            <input
              type="password"
              placeholder={t('set_api_placeholder')}
              value={localKey}
              onChange={e => setLocalKey(e.target.value)}
              style={{ width: '100%', background: '#FFF5F8', border: `1.5px solid ${s.border}`, borderRadius: 14, padding: '16px', color: s.txtPri, fontSize: 16, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }}
            />
            <p style={{ margin: '12px 0 0', fontSize: 13, color: s.txtMuted, lineHeight: 1.5 }}>
              Enter your API key to enable prescription scanning. Key is saved locally on your device.
            </p>
          </div>
          
          {/* Notifications & Alerts */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: s.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>🔔 Notifications & Alerts</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: s.subtle, borderRadius: 14, cursor: 'pointer' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: s.txtPri }}>Push Notifications</span>
                <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: s.accent }} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: s.subtle, borderRadius: 14, cursor: 'pointer' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: s.txtPri }}>Voice Reminders</span>
                <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: s.accent }} />
              </label>
            </div>
          </div>

          {/* Data Privacy & Security */}
          <div style={{ marginBottom: 24, padding: '16px', background: 'rgba(139,92,246,0.05)', borderRadius: 16, border: '1px solid rgba(139,92,246,0.2)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#8b5cf6', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>🛡️</span> Data Privacy & Vault
            </label>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: s.txtSec, lineHeight: 1.5 }}>
              All your health records and vitals are encrypted and stored <strong>locally</strong> on this device. We do not store your data on our servers.
            </p>
            <button 
              onClick={() => {
                if(window.confirm('Are you sure you want to permanently delete all your local health data and logout?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }} 
              style={{ width: '100%', padding: '12px', background: 'rgba(229,57,53,0.1)', color: '#e53935', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,57,53,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(229,57,53,0.1)'}
            >
              Clear All Local Data
            </button>
          </div>

          <button onClick={saveKey} style={{ width: '100%', background: saved ? '#D43369' : s.accent, color: '#fff', border: 'none', borderRadius: 50, padding: '16px', fontWeight: 900, fontSize: 16, cursor: 'pointer', transition: 'background 0.3s', boxShadow: '0 6px 20px rgba(232,84,122,0.30)' }}>
            {saved ? t('set_api_saved') : 'Save Settings'}
          </button>
        </div>
      </div>
    );
  };

  const GlobalSOSOverlay = () => {
    if (!globalSOS) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(229,57,53,0.95)', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'sosBgPulse 2s infinite' }}>
        <style>{`
          @keyframes sosBgPulse { 0%,100%{background:rgba(229,57,53,0.95)} 50%{background:rgba(198,40,40,0.98)} }
        `}</style>
        <span style={{ fontSize: 80, marginBottom: 20, animation: 'pulse 1s infinite' }}>🚨</span>
        <h1 style={{ margin: '0 0 10px', fontSize: 36, fontWeight: 900, color: '#fff', textAlign: 'center', letterSpacing: '-0.02em' }}>SOS EMERGENCY</h1>
        <p style={{ margin: '0 0 40px', fontSize: 18, color: 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: 400, lineHeight: 1.5 }}>
          <strong style={{ color: '#fff', fontWeight: 900 }}>{globalSOS.from}</strong> pressed their emergency button at {new Date(globalSOS.at).toLocaleTimeString()}.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 300 }}>
          <button onClick={dismissGlobalSOS}
            style={{ background: '#fff', color: '#c62828', border: 'none', borderRadius: 50, padding: '18px', fontSize: 18, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            ✓ Mark as Safe
          </button>
        </div>
      </div>
    );
  };

  const AskAIAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);

    const handleAsk = () => {
      if (!('webkitSpeechRecognition' in window)) {
        alert("Speech recognition not supported in this browser.");
        return;
      }
      setIsListening(true);
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = currentLang === 'en' ? 'en-US' : currentLang === 'kn' ? 'kn-IN' : 'hi-IN';
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        // Pass to Gemini
        const meds = localStorage.getItem('av_medications') || '[]';
        const prompt = `User asked: "${transcript}". Current medications strictly for reference: ${meds}. Answer very briefly.`;
        try {
          // Trigger a dummy thinking state
          setAiResponse("...");
          const res = await decodePrescriptionText(transcript, manualApiKey, false, currentLang); // Text mode
          setAiResponse(res.rawSummary || "Done");
          const langMapping: Record<string, string> = { hi: 'hindi', kn: 'kannada', en: 'hinglish' };
          TTSEngine.speakInstruction(res.ttsScript, (langMapping[currentLang] || 'hinglish') as any);
          setTimeout(() => setAiResponse(null), 8000);
        } catch {
          setAiResponse("Sorry, I couldn't understand that.");
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.start();
    };

    if (isAnchor) return null;

    return (
      <div style={{ position: 'fixed', bottom: 110, left: 24, zIndex: 100 }}>
        {aiResponse && (
          <div className="fade-up" style={{ background: s.accent, color: '#fff', padding: '12px 18px', borderRadius: 20, marginBottom: 12, fontSize: 14, fontWeight: 700, maxWidth: 240, boxShadow: '0 8px 30px rgba(232,84,122,0.35)' }}>
            {aiResponse}
          </div>
        )}
        <button
          onClick={handleAsk}
          style={{ width: 64, height: 64, borderRadius: '50%', background: isListening ? s.red : s.accent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(232,84,122,0.38)', transition: 'all 0.3s', cursor: 'pointer', transform: isListening ? 'scale(1.15)' : 'scale(1)' }}
        >
          <div style={{ width: 30, height: 30, color: '#fff' }}>
            <MicIcon />
          </div>
          {isListening && <div style={{ position: 'absolute', inset: -8, border: `2px solid ${s.accent}`, borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />}
        </button>
      </div>
    );
  };

  const NavTabs = () => (
    <nav style={{ height: 72, background: 'rgba(255,255,255,0.96)', borderTop: `1px solid ${s.border}`, position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-around' }}>
        {TABS.map(tab => {
          const active = mainTab === tab.id;
          const isRed = tab.id === 'sos';
          return (
            <button key={tab.id} onClick={() => setMainTab(tab.id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'none', color: active ? (isRed ? s.red : s.accent) : s.txtMuted, flex: 1, minWidth: 0, transition: 'all 0.2s', position: 'relative' }}
            >
              <div style={{ width: 22, height: 22 }}>
                <tab.IconComp />
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.02em' }}>{tab.label}</span>
              {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isRed ? s.red : s.accent, position: 'absolute', bottom: 6 }} />}
            </button>
          );
        })}
      </div>
    </nav>
  );

  /* ═══════════════════════════════════════════════
     DESKTOP LAYOUT — Sidebar + Content
  ═══════════════════════════════════════════════ */
  if (isDesktop) {
    // Group tabs by category for sidebar sections
    const patientHealthTabs = TABS.filter(t => ['scanner', 'reminders', 'calendar', 'health'].includes(t.id));
    const patientSecurityTabs = TABS.filter(t => ['sos'].includes(t.id));
    const anchorMonitorTabs = TABS.filter(t => ['insights', 'reminders', 'calendar'].includes(t.id));
    const anchorToolsTabs = TABS.filter(t => ['ai_reports'].includes(t.id));

    const SidebarSection = ({ label, tabs }: { label: string; tabs: typeof TABS }) => (
      <div style={{ marginBottom: 8 }}>
        <p style={{ margin: '0 0 6px 14px', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.txtMuted, opacity: 0.6 }}>{label}</p>
        {tabs.map(tab => {
          const active = mainTab === tab.id;
          const isRed = tab.id === 'sos';
          const isHealth = tab.id === 'health';
          const tabColor = isRed ? s.red : isHealth ? '#26c6da' : s.accent;
          return (
            <button key={tab.id} onClick={() => navigateTo(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                borderRadius: 14, border: 'none', cursor: 'pointer', width: '100%',
                textAlign: 'left', fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
                fontWeight: active ? 800 : 600, fontSize: 14, letterSpacing: '-0.01em',
                transition: 'all 0.18s',
                background: active ? `${tabColor}14` : 'transparent',
                color: active ? tabColor : s.txtSec,
                position: 'relative',
                marginBottom: 2,
              }}
            >
              {/* Active left bar */}
              {active && <div style={{ position: 'absolute', left: 0, top: '20%', height: '60%', width: 3, borderRadius: '0 3px 3px 0', background: tabColor }} />}
              {/* Icon bubble */}
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: active ? `${tabColor}18` : s.subtle,
                border: `1px solid ${active ? `${tabColor}30` : s.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: active ? tabColor : s.txtMuted,
                transition: 'all 0.18s',
              }}>
                <tab.IconComp />
              </div>
              {tab.label}
              {tab.id === 'sos' && <span style={{ marginLeft: 'auto', background: s.red, color: '#fff', fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 50, letterSpacing: '0.05em' }}>SOS</span>}
              {tab.id === 'health' && <span style={{ marginLeft: 'auto', fontSize: 10 }}>💓</span>}
            </button>
          );
        })}
      </div>
    );

    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: s.bg, fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif', color: s.txtPri }}>
        {/* Sidebar */}
        <aside style={{ width: 272, flexShrink: 0, background: s.sidebar, borderRight: `1px solid ${s.border}`, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
          {/* Logo */}
          <div style={{ padding: '24px 20px 18px', borderBottom: `1px solid ${s.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${s.accent}, #D43369)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(232,84,122,0.35)' }}>
                <div style={{ width: 18, height: 18, color: '#fff' }}><MicIcon /></div>
              </div>
              <div>
                <span style={{ fontWeight: 900, fontSize: 19, letterSpacing: '-0.03em', display: 'block', lineHeight: 1 }}>Aarogya<span style={{ color: s.accent }}>Vani</span></span>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.txtMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Health Companion</span>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {isAnchor ? (
              <>
                <SidebarSection label="Patient Monitoring" tabs={anchorMonitorTabs} />
                <SidebarSection label="AI Tools" tabs={anchorToolsTabs} />
              </>
            ) : (
              <>
                <SidebarSection label="Health Tools" tabs={patientHealthTabs} />
              </>
            )}
          </nav>

          {/* Fixed Footer: SOS + User card + Care Anchor code + logout */}
          <div style={{ padding: '12px 12px 20px', borderTop: `1px solid ${s.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Fixed SOS Button (Patient only) */}
            {!isAnchor && (
              <button onClick={() => navigateTo('sos')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  width: '100%', padding: '14px', borderRadius: 14,
                  background: mainTab === 'sos' ? '#e53935' : 'rgba(229,57,53,0.1)',
                  color: mainTab === 'sos' ? '#fff' : '#e53935',
                  border: mainTab === 'sos' ? 'none' : '1px solid rgba(229,57,53,0.3)',
                  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
                  fontWeight: 900, fontSize: 14, letterSpacing: '0.05em',
                  transition: 'all 0.2s', marginBottom: 8,
                  boxShadow: mainTab === 'sos' ? '0 4px 16px rgba(229,57,53,0.4)' : 'none'
                }}
              >
                <div style={{ width: 22, height: 22 }}>
                  <AlertIcon />
                </div>
                EMERGENCY SOS
              </button>
            )}

            {/* Anchor badge */}
            {isAnchor && (
              <div style={{ background: 'rgba(21,101,192,0.15)', border: '1px solid rgba(21,101,192,0.3)', borderRadius: 10, padding: '8px 12px' }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>🛡️ Managing: <strong style={{ color: '#1A0A10' }}>{user.linkedPatientName}</strong></p>
              </div>
            )}

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: s.subtle, borderRadius: 12 }}>
              <div style={{ width: 36, height: 36, background: isAnchor ? '#1565c0' : s.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff' }}>
                <div style={{ width: 18, height: 18 }}>{isAnchor ? '🛡️' : <UserIcon />}</div>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: s.txtPri, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div style={{ fontSize: 12, color: s.txtMuted, textTransform: 'capitalize' }}>{user.role}</div>
              </div>
            </div>

            {/* Care Anchor Code (patient only) */}
            {user.role === 'patient' && user.careAnchorCode && (
              <div style={{ background: 'rgba(232,84,122,0.07)', border: `1px solid rgba(232,84,122,0.2)`, borderRadius: 12, padding: '10px 12px' }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.accent }}>Care Anchor Code</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: '0.15em', color: s.txtPri, fontFamily: 'monospace' }}>{user.careAnchorCode}</p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: s.txtMuted }}>Share with your family member</p>
              </div>
            )}

          </div>
        </aside>

        {/* Main content + Top Header */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

          {/* Top Header (Desktop) */}
          <header style={{ height: 76, borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', zIndex: 10 }}>
            <div style={{ width: 320, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: 14, color: s.txtMuted, width: 16, height: 16 }}><SearchIcon /></div>
              <input type="text" placeholder="Search medicines, vitals..." style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 50, border: `1px solid ${s.border}`, background: '#FFFFFF', fontSize: 13, outline: 'none', color: s.txtPri, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

              {/* Notifications */}
              <button style={{ height: 40, width: 40, border: `1px solid ${s.border}`, borderRadius: '50%', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.txtSec, transition: 'all 0.2s', position: 'relative' }}>
                <div style={{ width: 18, height: 18 }}><BellIcon /></div>
                <div style={{ position: 'absolute', top: 10, right: 10, width: 6, height: 6, borderRadius: '50%', background: s.red }} />
              </button>

              {/* Language Switcher Dropdown */}
              <div style={{ position: 'relative' }}>
                <select value={currentLang} onChange={(e) => setLanguage(e.target.value)}
                  style={{ height: 40, padding: '0 32px 0 16px', border: `1.5px solid ${s.accent}`, borderRadius: 50, background: 'rgba(232,84,122,0.10)', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800, fontSize: 13, color: s.accent, outline: 'none', appearance: 'none', WebkitAppearance: 'none' }}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: s.accent, fontSize: 10 }}>▼</div>
              </div>

              {/* Settings */}
              <button onClick={() => setShowSettings(true)}
                style={{ height: 40, padding: '0 16px', border: `1px solid ${s.border}`, borderRadius: 50, background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: s.txtPri, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: 13, transition: 'all 0.2s' }}
              >
                <div style={{ width: 16, height: 16 }}><SettingsIcon /></div>
                {t('settings')}
              </button>

              {/* Logout */}
              <button onClick={handleLogout}
                style={{ height: 38, padding: '0 16px', border: `1px solid rgba(229,57,53,0.3)`, borderRadius: 10, background: 'rgba(229,57,53,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: s.red, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: 13, transition: 'all 0.2s' }}
              >
                <div style={{ width: 16, height: 16 }}><LogoutIcon /></div>
                {t('logout')}
              </button>
            </div>
          </header>

          <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
            <div style={{ maxWidth: 900 }}>
              {mainContent()}
            </div>
          </main>
        </div>

        {/* Auto-add confirm modal */}
        {addConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,10,16,0.45)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setAddConfirm(null)}>
            <div style={{ background: '#FFFFFF', border: `1px solid rgba(232,84,122,0.2)`, borderRadius: 24, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(232,84,122,0.12)' }} onClick={e => e.stopPropagation()}>
              <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.accent }}>{t('sc_add_confirm')}</p>
              <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 900, color: s.txtPri }}>{addConfirm.name}</h2>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: s.txtMuted, lineHeight: 1.5 }}>{addConfirm.dosage}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {addConfirm.times.map(t => (
                  <span key={t} style={{ fontSize: 14, padding: '6px 14px', borderRadius: 50, background: 'rgba(232,84,122,0.10)', color: s.accent, fontWeight: 800, border: `1px solid rgba(232,84,122,0.22)` }}>🕐 {t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => saveMedicineToLS(addConfirm.name, addConfirm.dosage, addConfirm.times)}
                  style={{ flex: 1, background: s.accent, color: '#fff', border: 'none', borderRadius: 50, padding: '14px', cursor: 'pointer', fontWeight: 900, fontSize: 15, fontFamily: 'Inter, system-ui, sans-serif' }}>
                  ✓ {t('sc_confirm_btn')}
                </button>
                <button onClick={() => setAddConfirm(null)}
                  style={{ flex: 1, background: 'transparent', color: s.txtMuted, border: `1px solid ${s.border}`, borderRadius: 50, padding: '14px', cursor: 'pointer', fontWeight: 700, fontSize: 15, fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════
     MOBILE LAYOUT — Header + Content + Bottom Tab
  ═══════════════════════════════════════════════ */
  return (
    <div style={{ color: s.txtPri, minHeight: '100svh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,0.82)', borderBottom: `1px solid ${s.border}`, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => { setMainTab('scanner'); reset(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ width: 32, height: 32, background: s.accent, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 16, height: 16, color: '#fff' }}><MicIcon /></div>
            </div>
            <span style={{ fontWeight: 900, fontSize: 17, color: s.txtPri, letterSpacing: '-0.02em' }}>Aarogya<span style={{ color: s.accent }}>Vani</span></span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: s.txtMuted, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isAnchor ? '🛡️' : 'Hi,'} {user.name.split(' ')[0]}!</span>
            {/* Language toggle dropdown for mobile */}
            <div style={{ position: 'relative' }}>
              <select value={currentLang} onChange={(e) => setLanguage(e.target.value)}
                style={{ height: 32, padding: '0 24px 0 10px', border: `1.5px solid ${s.accent}`, borderRadius: 12, background: 'rgba(232,84,122,0.12)', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800, fontSize: 11, color: s.accent, outline: 'none', appearance: 'none', WebkitAppearance: 'none' }}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.code.toUpperCase()}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: s.accent, fontSize: 9 }}>▼</div>
            </div>
            <button onClick={() => setShowSettings(true)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: s.subtle, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: s.txtPri }}
              title="Settings"
            >
              <div style={{ width: 18, height: 18 }}><SettingsIcon /></div>
            </button>
            <button onClick={handleLogout}
              style={{ width: 36, height: 36, borderRadius: '50%', background: s.subtle, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: s.red }}
              title="Sign out"
            >
              <div style={{ width: 16, height: 16 }}><LogoutIcon /></div>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 480, width: '100%', margin: '0 auto', padding: '20px 16px 90px' }}>
        {mainContent()}
      </main>

      {/* Bottom Tab Bar */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', borderTop: `1px solid ${s.border}`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', zIndex: 50 }}>
        {TABS.map(tab => {
          const active = mainTab === tab.id;
          const isRed = tab.id === 'sos';
          return (
            <button key={tab.id} onClick={() => navigateTo(tab.id)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '10px 4px 14px', border: 'none', background: 'transparent', cursor: 'pointer', color: active ? (isRed ? s.red : s.accent) : s.txtMuted, transition: 'color 0.2s', WebkitTapHighlightColor: 'transparent', fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              <tab.IconComp />
              <span style={{ fontSize: 10, fontWeight: active ? 800 : 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Auto-add confirm modal (mobile) */}
      {addConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,10,16,0.38)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', padding: '0 0 20px' }} onClick={() => setAddConfirm(null)}>
          <div style={{ background: '#FFFFFF', border: `1px solid rgba(232,84,122,0.2)`, borderRadius: 24, padding: 24, width: '100%', margin: '0 16px', boxShadow: '0 20px 60px rgba(232,84,122,0.12)' }} onClick={e => e.stopPropagation()}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.accent }}>{t('sc_add_confirm')}</p>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: s.txtPri }}>{addConfirm.name}</h2>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: s.txtMuted, lineHeight: 1.5 }}>{addConfirm.dosage}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
              {addConfirm.times.map(t => (
                <span key={t} style={{ fontSize: 13, padding: '5px 12px', borderRadius: 50, background: 'rgba(232,84,122,0.10)', color: s.accent, fontWeight: 800 }}>🕐 {t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => saveMedicineToLS(addConfirm.name, addConfirm.dosage, addConfirm.times)}
                style={{ flex: 1, background: s.accent, color: '#fff', border: 'none', borderRadius: 50, padding: '14px', cursor: 'pointer', fontWeight: 900, fontSize: 15 }}>
                ✓ {t('sc_confirm_btn')}
              </button>
              <button onClick={() => setAddConfirm(null)}
                style={{ flex: 1, background: 'transparent', color: s.txtMuted, border: `1px solid ${s.border}`, borderRadius: 50, padding: '14px', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Nav tabs for mobile */}
      {!isDesktop && <NavTabs />}

      {!isAnchor && <AskAIAssistant />}

      {/* Global SOS for anchor */}
      <GlobalSOSOverlay />

      {/* Settings Modal */}
      {showSettings && <SettingsModal />}
    </div>
  );
}
