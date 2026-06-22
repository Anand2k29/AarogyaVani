import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser, getDataNamespace } from '../services/authService';
import { useLanguage } from '../src/context/LanguageContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Colors {
    card: string; subtle: string; border: string;
    txtPri: string; txtSec: string; txtMuted: string;
    accent: string; red: string; bg: string;
}

interface CareConnectProps {
    s: Colors;
    navigateTo: (tab: string) => void;
}

interface DirectoryItem {
    id: string;
    name: string;
    type: 'hospital' | 'doctor' | 'pharmacy';
    specialty?: string;
    distance: string;
    rating: number;
    reviews: number;
    status: string;
    phone: string;
    address: string;
    lat: number;
    lng: number;
}

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    time: string;
}

const LOCAL_DIRECTORY: DirectoryItem[] = [
    {
        id: 'h1',
        name: 'City Care Multi-Specialty Hospital',
        type: 'hospital',
        distance: '0.6 km',
        rating: 4.8,
        reviews: 320,
        status: 'Open 24/7',
        phone: '+91 80223 45678',
        address: '12, Palace Road, Vasanth Nagar, Bengaluru',
        lat: 40,
        lng: 70
    },
    {
        id: 'h2',
        name: 'Aarogya Memorial Clinic & Diagnostic Center',
        type: 'hospital',
        distance: '1.4 km',
        rating: 4.5,
        reviews: 98,
        status: 'Open 8:00 AM - 9:00 PM',
        phone: '+91 80334 56789',
        address: '45, MG Road, Trinity Circle, Bengaluru',
        lat: 65,
        lng: 120
    },
    {
        id: 'd1',
        name: 'Dr. Ramesh Verma',
        type: 'doctor',
        specialty: 'Cardiologist (Heart Specialist)',
        distance: '1.1 km',
        rating: 4.9,
        reviews: 145,
        status: 'Available Now (Call/Consult)',
        phone: '+91 99887 76655',
        address: 'Apex Heart Care, Indira Nagar, Bengaluru',
        lat: 110,
        lng: 90
    },
    {
        id: 'd2',
        name: 'Dr. Ananya Nair',
        type: 'doctor',
        specialty: 'Geriatrician (Elderly Care Specialist)',
        distance: '0.8 km',
        rating: 4.9,
        reviews: 210,
        status: 'Opens at 4:00 PM',
        phone: '+91 88776 65544',
        address: 'Narayana Health, HSR Layout, Bengaluru',
        lat: 130,
        lng: 150
    },
    {
        id: 'd3',
        name: 'Dr. Srinivas Murthy',
        type: 'doctor',
        specialty: 'General Physician',
        distance: '1.5 km',
        rating: 4.7,
        reviews: 84,
        status: 'Available Now',
        phone: '+91 77665 54433',
        address: 'Murthy Clinic, Jayanagar 4th Block, Bengaluru',
        lat: 90,
        lng: 180
    },
    {
        id: 'p1',
        name: 'Apollo Pharmacy (24 Hours)',
        type: 'pharmacy',
        distance: '0.3 km',
        rating: 4.7,
        reviews: 450,
        status: 'Open 24/7',
        phone: '+91 99000 11223',
        address: 'Shop 5, Ground Floor, Koramangala 80ft Road, Bengaluru',
        lat: 160,
        lng: 40
    },
    {
        id: 'p2',
        name: 'MedPlus Pharmacy',
        type: 'pharmacy',
        distance: '0.9 km',
        rating: 4.6,
        reviews: 185,
        status: 'Open 7:00 AM - 11:00 PM',
        phone: '+91 99000 44556',
        address: 'Opp. BDA Complex, Banashankari, Bengaluru',
        lat: 180,
        lng: 110
    }
];

export const CareConnectContent: React.FC<CareConnectProps> = ({ s, navigateTo }) => {
    const { t, language } = useLanguage();
    const user = getCurrentUser();
    const apiKey = localStorage.getItem('av_gemini_api_key') || '';

    const [activeCategory, setActiveCategory] = useState<'all' | 'hospital' | 'doctor' | 'pharmacy' | 'emergency'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Doctor Appointment Booking State
    const [bookingItem, setBookingItem] = useState<DirectoryItem | null>(null);
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookingTime, setBookingTime] = useState('10:00');
    const [bookingNotes, setBookingNotes] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // AI Teleconsult State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
        { sender: 'ai', text: 'Namaste! I am AarogyaVani\'s AI Healthcare Support Assistant. How can I help you today? Please feel free to describe any symptoms you have, or ask for local clinic recommendations.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Categories Configuration
    const categories = [
        { id: 'all' as const, label: 'All Services', icon: '🔍' },
        { id: 'emergency' as const, label: 'Emergency Hotlines', icon: '🚑' },
        { id: 'hospital' as const, label: 'Hospitals & Clinics', icon: '🏥' },
        { id: 'doctor' as const, label: 'Doctors & Specialists', icon: '👨‍⚕️' },
        { id: 'pharmacy' as const, label: 'Pharmacies', icon: '💊' }
    ];

    // Emergency Hotlines List
    const emergencyHotlines = [
        { id: 'eh1', name: 'Ambulance Services', number: '108', icon: '🚑', desc: 'Medical emergencies in India' },
        { id: 'eh2', name: 'National Emergency Helpline', number: '112', icon: '🚨', desc: 'All-in-one emergency helpline' },
        { id: 'eh3', name: 'Senior Citizen Helpline', number: '14567', icon: '👴', desc: 'Government toll-free helpline for seniors' },
        { id: 'eh4', name: 'Women Helpline', number: '1091', icon: '👩', desc: 'Safety and assistance for women' },
        { id: 'eh5', name: 'Blood Bank Information', number: '1910', icon: '🩸', desc: 'Indian Red Cross Society hotline' }
    ];

    // Filter directory items
    const filteredDirectory = LOCAL_DIRECTORY.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
        const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (item.specialty && item.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
                             item.address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
    });

    // Handle Appointment Booking
    const handleBookAppointment = () => {
        if (!bookingItem) return;

        const apptsKey = `${getDataNamespace()}_appointments`;
        const existingAppts = JSON.parse(localStorage.getItem(apptsKey) || '[]');
        
        const newAppt = {
            id: Math.random().toString(36).slice(2) + Date.now().toString(36),
            title: bookingItem.type === 'doctor' ? `Consultation with ${bookingItem.name}` : `Visit to ${bookingItem.name}`,
            doctor: bookingItem.type === 'doctor' ? bookingItem.name : undefined,
            location: bookingItem.address,
            date: bookingDate,
            time: bookingTime,
            notes: bookingNotes || `Booked via AarogyaVani Care Connect. Specialty: ${bookingItem.specialty || 'General'}`
        };

        localStorage.setItem(apptsKey, JSON.stringify([...existingAppts, newAppt]));
        setBookingSuccess(true);
        setTimeout(() => {
            setBookingSuccess(false);
            setBookingItem(null);
            setBookingNotes('');
        }, 1500);
    };

    // AI Query Integration
    const handleSendMessage = async () => {
        if (!userInput.trim()) return;
        
        const userMsg = userInput.trim();
        const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: userTime }]);
        setUserInput('');
        setIsAiLoading(true);

        const currentHistory = chatMessages.slice(-6); // Keep last 6 messages context
        
        try {
            let aiText = '';
            
            // Check if user has Gemini API Key
            if (apiKey) {
                const resolvedLanguage = language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : 'English';
                const systemPrompt = `You are a helpful and compassionate healthcare AI assistant on AarogyaVani. Your goal is to guide the user (usually elderly or their family members) through medical questions, symptom triage, and general healthcare queries.
Respond strictly and natively in the ${resolvedLanguage} script (e.g. Hindi in Devanagari script, Kannada in Kannada script).
Keep responses brief, supportive, polite, and extremely clear. Use bullet points for steps.
If the symptoms described sound severe or life-threatening (e.g. crushing chest pain, paralysis, severe shortness of breath), instruct them to call Ambulance (108) or tap the red SOS button immediately.
Here is the chat history:
${currentHistory.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}
USER: ${userMsg}
AI RESPONSE:`;

                if (apiKey.startsWith('AIza')) {
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
                    const result = await model.generateContent(systemPrompt);
                    aiText = result.response.text();
                } else {
                    // OpenRouter fallback
                    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
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
                // Pre-programmed Rule-Based Responses in English/Hindi/Kannada
                await new Promise(resolve => setTimeout(resolve, 1000));
                const lowerMsg = userMsg.toLowerCase();
                
                const responseMap = {
                    en: {
                        chest: "⚠️ **WARNING:** Chest pain can indicate a cardiac emergency. Please press the red **SOS button** on the bottom nav to alert your caregiver, and dial **108** for an Ambulance immediately. Rest in a comfortable position and do not exert yourself.",
                        fever: "🌡️ A fever is typically your body's response to an infection. Ensure you drink plenty of fluids (water, electrolyte solutions) and rest. You can consult Dr. Srinivas Murthy (General Physician, 1.5 km away) at Murthy Clinic or visit Apollo Pharmacy (0.3 km away) for OTC medicine advice.",
                        cough: "💨 For a mild cough or cold, keep hydrated with warm fluids like herbal tea or honey water. If you experience difficulty breathing, call for medical assistance. Dr. Srinivas Murthy is available at Jayanagar 4th Block.",
                        headache: "💆 For general headaches, resting in a quiet, dark room and staying hydrated can help. If it is accompanied by dizziness or vision changes, please consult Dr. Srinivas Murthy (General Physician).",
                        bp: "📊 High blood pressure should be monitored regularly. Ensure you take your prescribed medication. If you feel dizzy, have a severe headache, or chest pain, consult Dr. Ramesh Verma (Cardiologist, 1.1 km away).",
                        diabetes: "🍬 For blood sugar issues, ensure you follow your prescribed diet and take insulin/medications. If you feel shaky, sweaty, or confused, eat/drink something sugary immediately and contact your doctor.",
                        default: "Thank you for reaching out. For medical queries, we recommend consulting our local specialists. You can view doctors like Dr. Srinivas Murthy (General Physician) or Dr. Ramesh Verma (Cardiologist) in our directory. If this is an emergency, please call **108** immediately."
                    },
                    hi: {
                        chest: "⚠️ **चेतावनी:** छाती में दर्द हृदय संबंधी आपातकाल का संकेत हो सकता है। कृपया तुरंत अपने केयरगिवर को सचेत करने के लिए नीचे दिए लाल **SOS बटन** को दबाएं और तत्काल एम्बुलेंस के लिए **108** डायल करें। शांत रहें और कोई शारीरिक गतिविधि न करें।",
                        fever: "🌡️ बुखार आमतौर पर संक्रमण के प्रति आपके शरीर की प्रतिक्रिया है। पर्याप्त तरल पदार्थ (पानी, ओआरएस) पिएं और आराम करें। आप हमारे नजदीकी डॉक्टर डॉ. श्रीनिवास मूर्ति (जनरल फिजिशियन, 1.5 किमी) से संपर्क कर सकते हैं या दवा के लिए अपोलो फार्मेसी (0.3 किमी) जा सकते हैं।",
                        cough: "💨 सामान्य खांसी या सर्दी के लिए, गर्म पानी, हर्बल चाय या शहद लें। यदि सांस लेने में कठिनाई हो, तो तुरंत चिकित्सा सहायता लें। डॉ. श्रीनिवास मूर्ति जयनगर में उपलब्ध हैं।",
                        headache: "💆 सामान्य सिरदर्द के लिए, शांत व अंधेरे कमरे में आराम करें। यदि सिरदर्द के साथ चक्कर आ रहे हों या धुंधला दिख रहा हो, तो कृपया डॉ. श्रीनिवास मूर्ति से सलाह लें।",
                        bp: "📊 उच्च रक्तचाप की नियमित जांच होनी चाहिए। अपनी दवाएं समय पर लें। यदि चक्कर आएं, तेज सिरदर्द या छाती में दर्द हो, तो डॉ. रमेश वर्मा (हृदय रोग विशेषज्ञ, 1.1 किमी) से संपर्क करें।",
                        diabetes: "🍬 शुगर की समस्या में उचित आहार लें। यदि कंपकंपी, पसीना या भ्रम महसूस हो, तो तुरंत मीठा खाएं/पिएं और अपने डॉक्टर से संपर्क करें।",
                        default: "हमसे संपर्क करने के लिए धन्यवाद। किसी भी स्वास्थ्य समस्या के लिए, हम डॉक्टर से सलाह लेने की सलाह देते हैं। आप निर्देशिका में डॉ. रमेश वर्मा (कार्डियोलॉजिस्ट) या डॉ. श्रीनिवास मूर्ति से संपर्क कर सकते हैं। आपातकाल में तुरंत **108** कॉल करें।"
                    },
                    kn: {
                        chest: "⚠️ **ಎಚ್ಚರಿಕೆ:** ಎದೆ ನೋವು ಹೃದಯದ ತುರ್ತುಸ್ಥಿತಿಯ ಸಂಕೇತವಾಗಿರಬಹುದು. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆರೈಕೆದಾರರಿಗೆ ತಿಳಿಸಲು ಕೆಳಗಿನ ಕೆಂಪು **SOS ಬಟನ್** ಒತ್ತಿರಿ ಮತ್ತು ತಕ್ಷಣ ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ **108** ಗೆ ಕರೆ ಮಾಡಿ.",
                        fever: "🌡️ ಜ್ವರವು ಸಾಮಾನ್ಯವಾಗಿ ಸೋಂಕಿಗೆ ನಿಮ್ಮ ದೇಹದ ಪ್ರತಿಕ್ರಿಯೆಯಾಗಿದೆ. ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ನೀವು ಡಾ. ಶ್ರೀನಿವಾಸ್ ಮೂರ್ತಿ (ಜನರಲ್ ಫಿಸಿಶಿಯನ್, 1.5 ಕಿ.ಮೀ) ಅವರನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು.",
                        cough: "💨 ಸೌಮ್ಯವಾದ ಕೆಮ್ಮು ಅಥವಾ ಶೀತಕ್ಕೆ ಬಿಸಿ ನೀರು ಅಥವಾ ಜೇನುತುಪ್ಪದ ನೀರನ್ನು ಕುಡಿಯಿರಿ. ಉಸಿರಾಟದ ತೊಂದರೆ ಇದ್ದರೆ ವೈದ್ಯರ ಸಹಾಯ ಪಡೆಯಿರಿ.",
                        headache: "💆 ಸಾಮಾನ್ಯ ತಲೆನೋವಿಗೆ ಶಾಂತ ಮತ್ತು ಕತ್ತಲೆ ಕೋಣೆಯಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ತಲೆತಿರುಗುವಿಕೆ ಇದ್ದರೆ ಡಾ. ಶ್ರೀನಿವಾಸ್ ಮೂರ್ತಿ ಅವರನ್ನು ಭೇಟಿ ಮಾಡಿ.",
                        bp: "📊 ರಕ್ತದೊತ್ತಡವನ್ನು ನಿಯಮಿತವಾಗಿ ಪರೀಕ್ಷಿಸಿ. ನಿಮ್ಮ ಔಷಧಿಗಳನ್ನು ಸಮಯಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಿ. ತಲೆತಿರುಗುವಿಕೆ ಅಥವಾ ಎದೆನೋವು ಇದ್ದರೆ ಡಾ. ರಮೇಶ್ ವರ್ಮಾ (ಹೃದ್ರೋಗ ತಜ್ಞ, 1.1 ಕಿ.ಮೀ) ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
                        diabetes: "🍬 ಮಧುಮೇಹ ತೊಂದರೆಗಳಿಗೆ ವೈದ್ಯರು ಸೂಚಿಸಿದ ಆಹಾರಕ್ರಮ ಪಾಲಿಸಿ. ನಡುಕ ಅಥವಾ ಗೊಂದಲವಿದ್ದರೆ ತಕ್ಷಣ ಸಿಹಿ ಪದಾರ್ಥ ಸೇವಿಸಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
                        default: "ಸಂಪರ್ಕಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳಿಗೆ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಲು ನಾವು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ. ಡಾ. ರಮೇಶ್ ವರ್ಮಾ ಅಥವಾ ಡಾ. ಶ್ರೀನಿವಾಸ್ ಮೂರ್ತಿ ಅವರ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ಪಡೆಯಬಹುದು. ತುರ್ತು ಸಮಯದಲ್ಲಿ ತಕ್ಷಣ **108** ಗೆ ಕರೆ ಮಾಡಿ."
                    }
                };

                const currentMap = responseMap[language as 'en'|'hi'|'kn'] || responseMap.en;
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
            setIsAiLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.4s ease', paddingBottom: 60 }}>
            {/* Header & Subtitle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: s.txtPri, letterSpacing: '-0.02em', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                        Care <span style={{ color: s.accent }}>Connect</span>
                    </h1>
                    <p style={{ margin: '6px 0 0', fontSize: 15, color: s.txtSec, fontWeight: 500 }}>
                        Seamlessly connects with local doctors, hospitals, and emergency services for real-time support.
                    </p>
                </div>
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, WebkitOverflowScrolling: 'touch' }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            padding: '10px 18px',
                            borderRadius: 50,
                            border: activeCategory === cat.id ? `2px solid ${s.accent}` : `1px solid ${s.border}`,
                            background: activeCategory === cat.id ? 'rgba(232, 84, 122, 0.10)' : s.card,
                            color: activeCategory === cat.id ? s.accent : s.txtSec,
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Interactive Row: Map on Left, List/Chat on Right */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, flexWrap: 'wrap' }}>
                
                {/* Left Side: Mock Map & Support */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    {/* Mock Stylized Map Card */}
                    {activeCategory !== 'emergency' && (
                        <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 28, padding: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.txtMuted }}>📍 Interactive Local Care Map</p>
                                <span style={{ fontSize: 11, fontWeight: 700, color: s.accent, background: 'rgba(232,84,122,0.08)', padding: '4px 10px', borderRadius: 20 }}>0.5 km radius</span>
                            </div>
                            
                            {/* Stylized Vector SVG Map */}
                            <div style={{ width: '100%', height: 260, borderRadius: 20, background: '#F8ECEF', border: `1px solid ${s.border}`, overflow: 'hidden', position: 'relative' }}>
                                <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
                                    {/* Roads Vector Drawing */}
                                    <path d="M 0 100 Q 100 110, 200 90 M 100 0 Q 95 100, 110 200 M 0 30 Q 80 60, 200 40 M 40 0 Q 50 120, 30 200" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
                                    <path d="M 0 100 Q 100 110, 200 90 M 100 0 Q 95 100, 110 200 M 0 30 Q 80 60, 200 40 M 40 0 Q 50 120, 30 200" fill="none" stroke="rgba(232,84,122,0.12)" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 3" />
                                    
                                    {/* Green Areas */}
                                    <rect x="10" y="45" width="25" height="45" rx="4" fill="rgba(34,197,94,0.08)" />
                                    <rect x="130" y="110" width="55" height="60" rx="6" fill="rgba(34,197,94,0.08)" />
                                    
                                    {/* Pulse Animation Definitions */}
                                    <defs>
                                        <radialGradient id="userGlow" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                        </radialGradient>
                                        <radialGradient id="hospGlow" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="#E8547A" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#E8547A" stopOpacity="0" />
                                        </radialGradient>
                                    </defs>

                                    {/* User Marker */}
                                    <circle cx="102" cy="98" r="16" fill="url(#userGlow)" />
                                    <circle cx="102" cy="98" r="5" fill="#3b82f6" stroke="#FFFFFF" strokeWidth="1.5" />
                                    
                                    {/* Directory Items Markers */}
                                    {filteredDirectory.map((item, idx) => {
                                        const isHosp = item.type === 'hospital';
                                        const markerColor = isHosp ? s.accent : '#f59e0b';
                                        return (
                                            <g key={item.id}>
                                                <circle cx={item.lat} cy={item.lng} r="12" fill={isHosp ? "url(#hospGlow)" : "rgba(245,158,11,0.2)"} />
                                                <circle cx={item.lat} cy={item.lng} r="4.5" fill={markerColor} stroke="#FFFFFF" strokeWidth="1" />
                                                <text x={item.lat} y={item.lng - 8} fontSize="6.5" fontWeight="900" fill={s.txtPri} textAnchor="middle" style={{ pointerEvents: 'none', background: '#fff' }}>
                                                    {item.name.split(' ')[0]}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                                
                                {/* Float Legend */}
                                <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.92)', border: `1px solid ${s.border}`, borderRadius: 10, padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: s.txtPri }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> You (Home)
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: s.txtPri }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.accent }} /> Hospitals / Clinics
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: s.txtPri }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Doctors / Chemists
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Directory Listings */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {activeCategory === 'emergency' ? (
                            emergencyHotlines.map(h => (
                                <div key={h.id} style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 20, padding: 18, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(229,57,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                                        {h.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: s.txtPri }}>{h.name}</h4>
                                        <p style={{ margin: '2px 0 0', fontSize: 12, color: s.txtMuted }}>{h.desc}</p>
                                    </div>
                                    <a href={`tel:${h.number}`} style={{ background: s.red, color: '#fff', border: 'none', borderRadius: 14, padding: '10px 18px', textDecoration: 'none', fontWeight: 900, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(229,57,53,0.2)' }}>
                                        📞 CALL {h.number}
                                    </a>
                                </div>
                            ))
                        ) : (
                            filteredDirectory.map((item, idx) => (
                                <div key={item.id} style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 24, padding: 22, display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', transition: 'transform 0.2s', position: 'relative' }}>
                                    
                                    {/* Left Accent Strip */}
                                    <div style={{ width: 5, background: item.type === 'hospital' ? s.accent : item.type === 'doctor' ? '#f59e0b' : '#ab47bc', borderRadius: 10, alignSelf: 'stretch', flexShrink: 0 }} />

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: s.txtPri, letterSpacing: '-0.01em' }}>
                                                {item.name}
                                            </h4>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                                                {item.status}
                                            </span>
                                        </div>
                                        
                                        {item.specialty && (
                                            <p style={{ margin: '0 0 6px', fontSize: 13, color: s.txtSec, fontWeight: 600 }}>👨‍⚕️ {item.specialty}</p>
                                        )}

                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: s.txtPri, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                ⭐ {item.rating} <span style={{ color: s.txtMuted, fontWeight: 500 }}>({item.reviews} reviews)</span>
                                            </span>
                                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: s.border }} />
                                            <span style={{ fontSize: 12, fontWeight: 700, color: s.txtPri, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                📍 {item.distance}
                                            </span>
                                        </div>

                                        <p style={{ margin: '0 0 14px', fontSize: 12, color: s.txtMuted, lineHeight: 1.4 }}>{item.address}</p>

                                        {/* Action buttons */}
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <a href={`tel:${item.phone}`} style={{ textDecoration: 'none', background: 'rgba(232,84,122,0.08)', color: s.accent, border: `1px solid ${s.border}`, borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                📞 Call
                                            </a>
                                            
                                            <a href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=Hello, I would like to query about services.`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#25d366', color: '#fff', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                💬 WhatsApp
                                            </a>

                                            <button onClick={() => setBookingItem(item)} style={{ background: `linear-gradient(135deg, ${s.accent}, #D43369)`, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                                                📅 Book Appointment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Side: AI Medical Support Triage Desk */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 28, display: 'flex', flexDirection: 'column', height: 500, overflow: 'hidden', boxShadow: '0 10px 45px rgba(232,84,122,0.04)' }}>
                        
                        {/* Chat Header */}
                        <div style={{ padding: '20px 24px', background: `linear-gradient(135deg, ${s.accent}, #D43369)`, color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                🩺
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: '-0.01em' }}>AI Consultation Support</h3>
                                <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.85, fontWeight: 700 }}>REAL-TIME MEDICAL TRIAGE</p>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, background: '#FFFDFE' }}>
                            {chatMessages.map((msg, i) => {
                                const isUser = msg.sender === 'user';
                                return (
                                    <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.3s ease' }}>
                                        <div style={{
                                            maxWidth: '85%',
                                            padding: '12px 16px',
                                            borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                            background: isUser ? s.accent : 'rgba(232,84,122,0.06)',
                                            color: isUser ? '#fff' : s.txtPri,
                                            border: isUser ? 'none' : `1px solid ${s.border}`,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                        }}>
                                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, fontWeight: isUser ? 600 : 500, whiteSpace: 'pre-line' }}>{msg.text}</p>
                                            <span style={{ display: 'block', fontSize: 10, textAlign: 'right', marginTop: 4, opacity: 0.7, color: isUser ? '#fff' : s.txtMuted }}>
                                                {msg.time}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {isAiLoading && (
                                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <div style={{ background: 'rgba(232,84,122,0.06)', border: `1px solid ${s.border}`, padding: '12px 20px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.accent, animation: 'bounce 0.6s infinite 0s' }} />
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.accent, animation: 'bounce 0.6s infinite 0.2s' }} />
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.accent, animation: 'bounce 0.6s infinite 0.4s' }} />
                                    </div>
                                    <style>{`
                                        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
                                    `}</style>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Footer */}
                        <div style={{ padding: '14px 20px', borderTop: `1px solid ${s.border}`, background: s.card, display: 'flex', gap: 10 }}>
                            <input
                                type="text"
                                placeholder={apiKey ? "Ask a health question (e.g. Fever guide)..." : "Ask symptom (e.g. Chest pain, Fever)..."}
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                style={{
                                    flex: 1,
                                    border: `1.5px solid ${s.border}`,
                                    borderRadius: 14,
                                    padding: '12px 16px',
                                    fontSize: 14,
                                    color: s.txtPri,
                                    background: '#FFF5F8',
                                    outline: 'none',
                                    fontFamily: 'Inter, system-ui, sans-serif'
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                style={{
                                    background: s.accent,
                                    border: 'none',
                                    borderRadius: 12,
                                    width: 44,
                                    height: 44,
                                    cursor: 'pointer',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18,
                                    boxShadow: '0 4px 10px rgba(232,84,122,0.2)'
                                }}
                            >
                                ➔
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointment Booking Modal Dialog */}
            {bookingItem && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,10,16,0.45)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setBookingItem(null)}>
                    <div style={{ background: '#FFFFFF', border: `1px solid rgba(232,84,122,0.2)`, borderRadius: 28, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(232,84,122,0.12)', animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
                        
                        {bookingSuccess ? (
                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <span style={{ fontSize: 50 }}>✅</span>
                                <h3 style={{ margin: '14px 0 6px', fontSize: 20, fontWeight: 900, color: s.txtPri }}>Booking Successful!</h3>
                                <p style={{ margin: 0, fontSize: 14, color: s.txtSec }}>This appointment has been added to your calendar.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                    <div>
                                        <span style={{ fontSize: 10, fontWeight: 800, color: s.accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Book Consultation</span>
                                        <h3 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 900, color: s.txtPri }}>{bookingItem.name}</h3>
                                        <p style={{ margin: '2px 0 0', fontSize: 13, color: s.txtMuted }}>{bookingItem.specialty || 'General Medical Clinic'}</p>
                                    </div>
                                    <button onClick={() => setBookingItem(null)} style={{ background: 'none', border: 'none', color: s.txtMuted, fontSize: 22, cursor: 'pointer' }}>✕</button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: s.accent, marginBottom: 6 }}>Select Visit Date</label>
                                        <input
                                            type="date"
                                            value={bookingDate}
                                            onChange={e => setBookingDate(e.target.value)}
                                            style={{ width: '100%', border: `1.5px solid ${s.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', background: '#FFF5F8', color: s.txtPri }}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: s.accent, marginBottom: 6 }}>Select Visit Time</label>
                                        <input
                                            type="time"
                                            value={bookingTime}
                                            onChange={e => setBookingTime(e.target.value)}
                                            style={{ width: '100%', border: `1.5px solid ${s.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', background: '#FFF5F8', color: s.txtPri }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: s.accent, marginBottom: 6 }}>Notes or Symptoms (Optional)</label>
                                        <textarea
                                            placeholder="e.g. Regular blood pressure check-up or prescription renewal"
                                            value={bookingNotes}
                                            onChange={e => setBookingNotes(e.target.value)}
                                            style={{ width: '100%', height: 70, border: `1.5px solid ${s.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', background: '#FFF5F8', color: s.txtPri, resize: 'none', fontFamily: 'Inter, system-ui, sans-serif' }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleBookAppointment}
                                    style={{
                                        width: '100%',
                                        background: `linear-gradient(135deg, ${s.accent}, #D43369)`,
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 50,
                                        padding: '14px',
                                        fontWeight: 900,
                                        fontSize: 15,
                                        cursor: 'pointer',
                                        boxShadow: '0 6px 20px rgba(232,84,122,0.25)'
                                    }}
                                >
                                    Confirm Appointment Booking
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
