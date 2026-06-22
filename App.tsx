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
import { CareConnectContent } from './components/CareConnectContent';
import { GoogleGenerativeAI } from '@google/generative-ai';

declare global {
  interface Window {
    confetti: any;
  }
}

type AppState = 'IDLE' | 'DETECTING' | 'SUCCESS' | 'ERROR';
type MainTab = 'dashboard' | 'scanner' | 'companion' | 'reminders' | 'calendar' | 'sos' | 'insights' | 'ai_reports' | 'health' | 'care_connect';
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
const CareConnectIcon = () => <Icon d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />;

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
    const validTabs: MainTab[] = ['dashboard', 'scanner', 'companion', 'reminders', 'calendar', 'sos', 'insights', 'ai_reports', 'health', 'care_connect'];
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

  // Global Chatbot States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>(() => [
    {
      sender: 'ai',
      text: 'Namaste! I am AarogyaVani\'s AI assistant. I can help answer medical questions, check symptoms, or give health guidance. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isChatListening, setIsChatListening] = useState(false);

  const sendChatMessage = async (textToSend?: string) => {
    const msgText = (textToSend || chatInput).trim();
    if (!msgText) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: msgText, time: userTime }]);
    setChatInput('');
    setIsChatLoading(true);

    const sanitizeKey = (k: any) => (typeof k === 'string' && !k.includes('your_')) ? k.trim() : '';
    const manualKey = sanitizeKey(manualApiKey);
    // @ts-ignore
    const envGemini = sanitizeKey(typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GEMINI_API_KEY || '' : '');
    // @ts-ignore
    const envOpenRouter = sanitizeKey(typeof import.meta !== 'undefined' ? import.meta.env?.VITE_OPENROUTER_API_KEY || '' : '');
    const activeApiKey = envGemini || manualKey || envOpenRouter;

    const currentHistory = chatMessages.slice(-6);

    try {
      let aiText = '';

      if (activeApiKey) {
        const resolvedLanguage = currentLang === 'hi' ? 'Hindi' : currentLang === 'kn' ? 'Kannada' : 'English';
        const systemPrompt = `You are a helpful and compassionate healthcare AI assistant on AarogyaVani. Your goal is to guide the user (usually elderly or their family members) through medical questions, symptom triage, and general healthcare queries.
Respond strictly and natively in the ${resolvedLanguage} script (e.g. Hindi in Devanagari script, Kannada in Kannada script).
Keep responses brief, supportive, polite, and extremely clear. Use bullet points for steps.
If the symptoms described sound severe or life-threatening (e.g. crushing chest pain, paralysis, severe shortness of breath), instruct them to call Ambulance (108) or tap the red SOS button immediately.
Here is the chat history:
${currentHistory.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}
USER: ${msgText}
AI RESPONSE:`;

        if (activeApiKey.startsWith('AIza')) {
          const genAI = new GoogleGenerativeAI(activeApiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const result = await model.generateContent(systemPrompt);
          aiText = result.response.text();
        } else {
          // OpenRouter fallback
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${activeApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [{ role: 'user', content: systemPrompt }],
              temperature: 0.3
            })
          });
          if (response.ok) {
            const data = await response.json();
            aiText = data.choices?.[0]?.message?.content || 'Done';
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        }
      } else {
        // Pre-programmed Rule-Based Responses
        await new Promise(resolve => setTimeout(resolve, 1000));
        const lowerMsg = msgText.toLowerCase();
        
        const responseMap = {
          en: {
            chest: "⚠️ **WARNING:** Chest pain can indicate a cardiac emergency. Please press the red **SOS button** on the bottom nav or sidebar to alert your caregiver, and dial **108** for an Ambulance immediately. Rest in a comfortable position and do not exert yourself.",
            fever: "🌡️ A fever is typically your body's response to an infection. Ensure you drink plenty of fluids (water, electrolyte solutions) and rest. You can consult our local general physician or visit a pharmacy for OTC medicine advice.",
            cough: "💨 For a mild cough or cold, keep hydrated with warm fluids like herbal tea or honey water. If you experience difficulty breathing, call for medical assistance.",
            headache: "💆 For general headaches, resting in a quiet, dark room and staying hydrated can help. If it is accompanied by dizziness or vision changes, please consult a General Physician.",
            bp: "📊 High blood pressure should be monitored regularly. Ensure you take your prescribed medication. If you feel dizzy, have a severe headache, or chest pain, consult a cardiologist.",
            diabetes: "🍬 For blood sugar issues, ensure you follow your prescribed diet and take insulin/medications. If you feel shaky, sweaty, or confused, eat/drink something sugary immediately and contact your doctor.",
            default: "Thank you for reaching out. For medical queries, we recommend consulting our local specialists. You can view doctors and clinics in our Care Connect section. If this is an emergency, please call **108** immediately."
          },
          hi: {
            chest: "⚠️ **चेतावनी:** छाती में दर्द हृदय संबंधी आपातकाल का संकेत हो सकता है। कृपया तुरंत अपने केयरगिवर को सचेत करने के लिए लाल **SOS बटन** को दबाएं और तत्काल एम्बुलेंस के लिए **108** डायल करें। शांत रहें और कोई शारीरिक गतिविधि न करें।",
            fever: "🌡️ बुखार आमतौर पर संक्रमण के प्रति आपके शरीर की प्रतिक्रिया है। पर्याप्त तरल पदार्थ (पानी, ओआरएस) पिएं और आराम करें। आप हमारे निर्देशिका से किसी जनरल फिजिशियन से संपर्क कर सकते हैं या दवा के लिए फार्मेसी जा सकते हैं।",
            cough: "💨 सामान्य खांसी या सर्दी के लिए, गर्म पानी, हर्बल चाय या शहद लें। यदि सांस लेने में कठिनाई हो, तो तुरंत चिकित्सा सहायता लें।",
            headache: "💆 सामान्य सिरदर्द के लिए, शांत व अंधेरे कमरे में आराम करें। यदि सिरदर्द के साथ चक्कर आ रहे हों या धुंधला दिख रहा हो, तो कृपया डॉक्टर से सलाह लें।",
            bp: "📊 उच्च रक्तचाप की नियमित जांच होनी चाहिए। अपनी दवाएं समय पर लें। यदि चक्कर आएं, तेज सिरदर्द या छाती में दर्द हो, तो तुरंत डॉक्टर से संपर्क करें।",
            diabetes: "🍬 शुगर की समस्या में उचित आहार लें। यदि कंपकंपी, पसीना या भ्रम महसूस हो, तो तुरंत मीठा खाएं/पिएं और अपने डॉक्टर से संपर्क करें।",
            default: "हमसे संपर्क करने के लिए धन्यवाद। किसी भी स्वास्थ्य समस्या के लिए, हम डॉक्टर से सलाह लेने की सलाह देते हैं। आप केयर कनेक्ट निर्देशिका में डॉक्टरों से संपर्क कर सकते हैं। आपातकाल में तुरंत **108** कॉल करें।"
          },
          kn: {
            chest: "⚠️ **ಎಚ್ಚರಿಕೆ:** ಎದೆ ನೋವು ಹೃದಯದ ತುರ್ತುಸ್ಥಿತಿಯ ಸಂಕೇತವಾಗಿರಬಹುದು. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆರೈಕೆದಾರರಿಗೆ ತಿಳಿಸಲು ಕೆಳಗಿನ ಕೆಂಪು **SOS ಬಟನ್** ಒತ್ತಿರಿ ಮತ್ತು ತಕ್ಷಣ ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ **108** ಗೆ ಕರೆ ಮಾಡಿ.",
            fever: "🌡️ ಜ್ವರವು ಸಾಮಾನ್ಯವಾಗಿ ಸೋಂಕಿಗೆ ನಿಮ್ಮ ದೇಹದ ಪ್ರತಿಕ್ರಿಯೆಯಾಗಿದೆ. ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ನೀವು ಜನರಲ್ ಫಿಸಿಶಿಯನ್ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು.",
            cough: "💨 ಸೌಮ್ಯವಾದ ಕೆಮ್ಮು ಅಥವಾ ಶೀತಕ್ಕೆ ಬಿಸಿ ನೀರು ಅಥವಾ ಜೇನುತುಪ್ಪದ ನೀರನ್ನು ಕುಡಿಯಿರಿ. ಉಸಿರಾಟದ ತೊಂದರೆ ಇದ್ದರೆ ವೈದ್ಯರ ಸಹಾಯ ಪಡೆಯಿರಿ.",
            headache: "💆 ಸಾಮಾನ್ಯ ತಲೆನೋವಿಗೆ ಶಾಂತ ಮತ್ತು ಕತ್ತಲೆ ಕೋಣೆಯಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ತಲೆತಿರುಗುವಿಕೆ ಇದ್ದರೆ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ.",
            bp: "📊 ರಕ್ತದೊತ್ತಡವನ್ನು ನಿಯಮಿತವಾಗಿ ಪರೀಕ್ಷಿಸಿ. ನಿಮ್ಮ ಔಷಧಿಗಳನ್ನು ಸಮಯಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಿ. ತಲೆತಿರುಗುವಿಕೆ ಅಥವಾ ಎದೆನೋವು ಇದ್ದರೆ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
            diabetes: "🍬 ಮಧುಮೇಹ ತೊಂದರೆಗಳಿಗೆ ವೈದ್ಯರು ಸೂಚಿಸಿದ ಆಹಾರಕ್ರಮ ಪಾಲಿಸಿ. ನಡುಕ ಅಥವಾ ಗೊಂದಲವಿದ್ದರೆ ತಕ್ಷಣ ಸಿಹಿ ಪದಾರ್ಥ ಸೇವಿಸಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
            default: "ಸಂಪರ್ಕಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳಿಗೆ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಲು ನಾವು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ. ಕೇರ್ ಕನೆಕ್ಟ್ ವಿಭಾಗದಲ್ಲಿ ವೈದ್ಯರ ವಿವರಗಳನ್ನು ಪಡೆಯಬಹುದು. ತುರ್ತು ಸಮಯದಲ್ಲಿ ತಕ್ಷಣ **108** ಗೆ ಕರೆ ಮಾಡಿ."
          }
        };

        const currentMap = responseMap[currentLang as 'en'|'hi'|'kn'] || responseMap.en;
        if (lowerMsg.includes('chest') || lowerMsg.includes('heart') || lowerMsg.includes('दर्द') || lowerMsg.includes('ನೋವು')) {
          aiText = currentMap.chest;
        } else if (lowerMsg.includes('fever') || lowerMsg.includes('cold') || lowerMsg.includes('बुखार') || lowerMsg.includes('ಜ್ವರ')) {
          aiText = currentMap.fever;
        } else if (lowerMsg.includes('cough') || lowerMsg.includes('खांसी') || lowerMsg.includes('ಕೆಮ್ಮು')) {
          aiText = currentMap.cough;
        } else if (lowerMsg.includes('headache') || lowerMsg.includes('head') || lowerMsg.includes('सिर') || lowerMsg.includes('ತಲೆ')) {
          aiText = currentMap.headache;
        } else if (lowerMsg.includes('bp') || lowerMsg.includes('pressure') || lowerMsg.includes('ರಕ್ತದೊತ್ತಡ')) {
          aiText = currentMap.bp;
        } else if (lowerMsg.includes('diabetes') || lowerMsg.includes('sugar') || lowerMsg.includes('ಮಧುಮೇಹ')) {
          aiText = currentMap.diabetes;
        } else {
          aiText = currentMap.default;
        }
      }

      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages(prev => [...prev, { sender: 'ai', text: aiText, time: aiTime }]);
    } catch (err) {
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I am facing connectivity issues. Please try again or seek manual help.', time: aiTime }]);
    } finally {
      setIsChatLoading(false);
    }
  };

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
      const validTabs: MainTab[] = ['dashboard', 'scanner', 'companion', 'reminders', 'calendar', 'sos', 'insights', 'ai_reports', 'health', 'care_connect'];

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
      const validTabs: MainTab[] = ['dashboard', 'scanner', 'companion', 'reminders', 'calendar', 'sos', 'insights', 'ai_reports', 'health', 'care_connect'];
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
    { id: 'care_connect', label: t('care_connect') || 'Care Connect', IconComp: () => <div style={{ width: 22, height: 22 }}><CareConnectIcon /></div> },
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
    if (mainTab === 'care_connect') return <CareConnectContent s={s} navigateTo={navigateTo} />;
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
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isChatOpen) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, [chatMessages, isChatOpen]);

    const handleVoiceInput = () => {
      if (!('webkitSpeechRecognition' in window)) {
        alert("Speech recognition not supported in this browser.");
        return;
      }
      setIsChatListening(true);
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = currentLang === 'en' ? 'en-US' : currentLang === 'kn' ? 'kn-IN' : 'hi-IN';
      
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsChatListening(false);
        setChatInput(transcript);
        await sendChatMessage(transcript);
      };

      recognition.onerror = () => setIsChatListening(false);
      recognition.onend = () => setIsChatListening(false);
      recognition.start();
    };

    const handlePlayTTS = (text: string) => {
      const langMapping: Record<string, string> = { hi: 'hindi', kn: 'kannada', en: 'hinglish' };
      const currentVoice = langMapping[currentLang] || 'hinglish';
      TTSEngine.speakInstruction(text, currentVoice as any);
    };

    if (isAnchor) return null;

    const widgetBottom = isDesktop ? 30 : 88;
    const widgetRight = isDesktop ? 30 : 16;
    const widgetWidth = isDesktop ? 385 : 'calc(100vw - 32px)';
    const widgetHeight = isDesktop ? 500 : 'calc(100vh - 180px)';

    return (
      <div style={{ position: 'fixed', bottom: widgetBottom, right: widgetRight, zIndex: 999, fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Chat Widget Panel */}
        {isChatOpen && (
          <div className="fade-up" style={{
            position: 'absolute',
            bottom: 76,
            right: 0,
            width: widgetWidth,
            height: widgetHeight,
            maxHeight: 520,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1.5px solid ${s.border}`,
            borderRadius: 28,
            boxShadow: '0 20px 60px rgba(232, 84, 122, 0.16)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'chatAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <style>{`
              @keyframes chatAppear {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>
            
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: `linear-gradient(135deg, ${s.accent}, #D43369)`,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>🩺</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 900 }}>AarogyaVani Assistant</h4>
                  <p style={{ margin: 0, fontSize: 10, opacity: 0.85, fontWeight: 700 }}>AI MEDICAL CONSULTATION</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900
                }}
              >
                ✕
              </button>
            </div>

            {/* Chat History Panel */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: '#FFFDFE'
            }}>
              {chatMessages.map((msg, idx) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
                    {!isUser && (
                      <button 
                        onClick={() => handlePlayTTS(msg.text)}
                        style={{
                          background: s.subtle,
                          border: `1px solid ${s.border}`,
                          borderRadius: '50%',
                          width: 26,
                          height: 26,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: 11,
                          color: s.accent,
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                        title="Listen to Message"
                      >
                        🔊
                      </button>
                    )}
                    <div style={{
                      maxWidth: '75%',
                      padding: '10px 14px',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      background: isUser ? s.accent : 'rgba(232,84,122,0.06)',
                      color: isUser ? '#fff' : s.txtPri,
                      border: isUser ? 'none' : `1px solid ${s.border}`,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
                    }}>
                      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.45, fontWeight: isUser ? 600 : 500, whiteSpace: 'pre-line' }}>{msg.text}</p>
                      <span style={{ display: 'block', fontSize: 9, textAlign: 'right', marginTop: 3, opacity: 0.6, color: isUser ? '#fff' : s.txtMuted }}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isChatLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 32 }}>
                  <div style={{ background: 'rgba(232,84,122,0.05)', border: `1px solid ${s.border}`, padding: '10px 16px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.accent, animation: 'bounceChat 0.6s infinite 0s' }} />
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.accent, animation: 'bounceChat 0.6s infinite 0.2s' }} />
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.accent, animation: 'bounceChat 0.6s infinite 0.4s' }} />
                  </div>
                  <style>{`
                    @keyframes bounceChat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
                  `}</style>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div style={{
              padding: '12px 16px',
              borderTop: `1px solid ${s.border}`,
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                background: '#FFF5F8',
                border: `1.5px solid ${s.border}`,
                borderRadius: 18,
                padding: '4px 10px'
              }}>
                <input
                  type="text"
                  placeholder="Ask symptoms or health advice..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    padding: '8px 4px',
                    fontSize: 13.5,
                    color: s.txtPri,
                    outline: 'none',
                    fontFamily: 'Inter, system-ui, sans-serif'
                  }}
                />
                
                {/* Voice Dictation Button */}
                <button
                  onClick={handleVoiceInput}
                  style={{
                    background: isChatListening ? s.red : 'transparent',
                    border: 'none',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isChatListening ? '#fff' : s.accent,
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  title="Speak Message"
                >
                  <div style={{ width: 14, height: 14 }}>
                    <MicIcon />
                  </div>
                  {isChatListening && (
                    <div style={{
                      position: 'absolute',
                      inset: -4,
                      border: `1.5px solid ${s.red}`,
                      borderRadius: '50%',
                      animation: 'pulseChatRing 1.2s infinite'
                    }} />
                  )}
                  <style>{`
                    @keyframes pulseChatRing {
                      0% { transform: scale(1); opacity: 1; }
                      100% { transform: scale(1.4); opacity: 0; }
                    }
                  `}</style>
                </button>
              </div>
              
              {/* Send Button */}
              <button
                onClick={() => sendChatMessage()}
                style={{
                  background: s.accent,
                  border: 'none',
                  borderRadius: 16,
                  width: 36,
                  height: 36,
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                  boxShadow: '0 4px 10px rgba(232,84,122,0.2)'
                }}
              >
                ➔
              </button>
            </div>
          </div>
        )}

        {/* Floating Bubble Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${s.accent}, #D43369)`,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(232,84,122,0.38)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: isChatOpen ? 'scale(0.9) rotate(90deg)' : 'scale(1) rotate(0deg)'
          }}
          title="AarogyaVani AI Chatbot"
        >
          <span style={{ fontSize: 26, color: '#fff' }}>💬</span>
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
    const patientHealthTabs = TABS.filter(t => ['scanner', 'reminders', 'calendar', 'health', 'care_connect'].includes(t.id));
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
          const isCareConnect = tab.id === 'care_connect';
          const tabColor = isRed ? s.red : isHealth ? '#26c6da' : isCareConnect ? '#ab47bc' : s.accent;
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
