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
        lat: 12.9880,
        lng: 77.5950
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
        lat: 12.9740,
        lng: 77.6080
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
        lat: 12.9780,
        lng: 77.6400
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
        lat: 12.9100,
        lng: 77.6400
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
        lat: 12.9290,
        lng: 77.5910
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
        lat: 12.9340,
        lng: 77.6200
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
        lat: 12.9120,
        lng: 77.5720
    }
];

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

export const CareConnectContent: React.FC<CareConnectProps> = ({ s, navigateTo }) => {
    const { t, language } = useLanguage();
    const user = getCurrentUser();
    const isDesktop = useIsDesktop();
    const sanitizeKey = (k: any) => (typeof k === 'string' && !k.includes('your_')) ? k.trim() : '';
    const manualKey = sanitizeKey(localStorage.getItem('av_gemini_api_key') || '');
    // @ts-ignore
    const envGemini = sanitizeKey(typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GEMINI_API_KEY || '' : '');
    // @ts-ignore
    const envOpenRouter = sanitizeKey(typeof import.meta !== 'undefined' ? import.meta.env?.VITE_OPENROUTER_API_KEY || '' : '');
    const apiKey = envGemini || manualKey || envOpenRouter;

    const [activeCategory, setActiveCategory] = useState<'all' | 'hospital' | 'doctor' | 'pharmacy' | 'emergency'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Doctor Appointment Booking State
    const [bookingItem, setBookingItem] = useState<DirectoryItem | null>(null);
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookingTime, setBookingTime] = useState('10:00');
    const [bookingNotes, setBookingNotes] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Live Leaflet Real Map Initialization
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersGroupRef = useRef<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Effect 1: Load Leaflet and initialize map once
    useEffect(() => {
        const loadLeaflet = () => {
            // Append CSS dynamically
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            // Append JS dynamically
            if (!(window as any).L) {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.async = true;
                script.onload = () => {
                    initMap();
                };
                document.body.appendChild(script);
            } else {
                initMap();
            }
        };

        const initMap = () => {
            const L = (window as any).L;
            if (!L || !mapRef.current || mapInstanceRef.current) return;

            // Center: Richmond Town, Bengaluru
            const userHome: [number, number] = [12.9600, 77.6100];

            const map = L.map('care-connect-map').setView(userHome, 13);
            mapInstanceRef.current = map;

            // Google Maps Tile Layer - looks realistic and high quality
            L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: 'Map data &copy; Google Maps'
            }).addTo(map);

            // User Location Pin
            L.marker(userHome, {
                icon: L.divIcon({
                    html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 12px rgba(59,130,246,0.6); position: relative;">
                             <div style="position: absolute; inset: -5px; border: 2px solid #3b82f6; border-radius: 50%; animation: pulse-ring 1.5s infinite;"></div>
                             <span style="position: absolute; top: -22px; left: 50%; transform: translateX(-50%); background: #3b82f6; color: white; padding: 2px 6px; border-radius: 6px; font-size: 9px; font-weight: 800; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">You (Home)</span>
                           </div>`,
                    className: 'custom-map-pin-user',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            }).addTo(map).bindPopup('<b>Your Home Location</b><br/>Richmond Town, Bengaluru');

            // Initialize markers LayerGroup
            markersGroupRef.current = L.layerGroup().addTo(map);
            setMapLoaded(true);
        };

        loadLeaflet();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markersGroupRef.current = null;
            }
        };
    }, []);

    // Effect 2: Update markers on filter or search query changes instantly
    useEffect(() => {
        const L = (window as any).L;
        if (!L || !mapInstanceRef.current || !markersGroupRef.current) return;

        // Clear existing markers
        markersGroupRef.current.clearLayers();

        // Custom Marker Style Builder
        const createCustomIcon = (color: string, label: string) => {
            return L.divIcon({
                html: `<div style="background-color: ${color}; width: 14px; height: 14px; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.35); position: relative; display: flex; align-items: center; justify-content: center;">
                         <span style="position: absolute; top: -22px; left: 50%; transform: translateX(-50%); background: white; color: #1A0A10; padding: 2px 6px; border-radius: 6px; font-size: 9px; font-weight: 800; border: 1.5px solid ${color}; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${label}</span>
                       </div>`,
                className: 'custom-map-pin',
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });
        };

        // Determine items to map
        const visibleItems = activeCategory === 'emergency' 
            ? [] 
            : LOCAL_DIRECTORY.filter(item => {
                const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
                const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     (item.specialty && item.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                     item.address.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesQuery;
            });

        // Populate markers
        visibleItems.forEach(item => {
            const markerColor = item.type === 'hospital' ? s.accent : item.type === 'doctor' ? '#f59e0b' : '#ab47bc';
            const shortName = item.name.split(' ').slice(0, 2).join(' ');
            L.marker([item.lat, item.lng], {
                icon: createCustomIcon(markerColor, shortName)
            }).addTo(markersGroupRef.current).bindPopup(`
                <div style="font-family: Inter, sans-serif; padding: 2px;">
                    <h4 style="margin: 0 0 4px 0; font-weight: 800; color: #1A0A10;">${item.name}</h4>
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #5C3A4A;">${item.specialty || item.status}</p>
                    <a href="tel:${item.phone}" style="background: ${s.accent}; color: white; border: none; border-radius: 6px; padding: 4px 10px; font-size: 10px; font-weight: 800; text-decoration: none; display: inline-block;">📞 Call Now</a>
                </div>
            `);
        });
    }, [mapLoaded, activeCategory, searchQuery, s]);

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

    // Chatbot function removed from Care Connect to be made available globally.

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

            {/* Main Interactive Row: List/Hotlines on Left, Map on Right */}
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.1fr 1.3fr' : '1fr', gap: 28, alignItems: 'start' }}>
                
                {/* Left Column: Directory Listings or Emergency Hotlines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, order: isDesktop ? 1 : 2 }}>
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
                        filteredDirectory.length === 0 ? (
                            <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 24, padding: 30, textAlign: 'center', color: s.txtMuted }}>
                                🔍 No matches found in your local area.
                            </div>
                        ) : (
                            filteredDirectory.map((item) => (
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
                        )
                    )}
                </div>

                {/* Right Column: Google Maps styled Interactive Map */}
                <div style={{ 
                    position: isDesktop ? 'sticky' : 'relative', 
                    top: isDesktop ? 24 : 'auto', 
                    order: isDesktop ? 2 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                }}>
                    <div style={{ 
                        background: s.card, 
                        border: `1px solid ${s.border}`, 
                        borderRadius: 28, 
                        padding: 20, 
                        boxShadow: '0 8px 40px rgba(0,0,0,0.02)',
                        height: isDesktop ? 650 : 'auto',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.txtMuted }}>📍 Interactive Local Care Map</p>
                            <span style={{ fontSize: 11, fontWeight: 700, color: s.accent, background: 'rgba(232,84,122,0.08)', padding: '4px 10px', borderRadius: 20 }}>0.5 km radius</span>
                        </div>
                        
                        {/* Real Interactive Google Maps styled Map Container */}
                        <div style={{ width: '100%', height: isDesktop ? 570 : 320, borderRadius: 20, border: `1px solid ${s.border}`, overflow: 'hidden', position: 'relative' }}>
                            <div id="care-connect-map" ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
                            
                            {/* Float Legend */}
                            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.92)', border: `1px solid ${s.border}`, borderRadius: 10, padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 1000, pointerEvents: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: s.txtPri }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> You (Home)
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: s.txtPri }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.accent }} /> Hospitals / Clinics
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: s.txtPri }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Doctors / Specialists
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: s.txtPri }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ab47bc' }} /> Pharmacies
                                </div>
                            </div>
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
