import React, { useState, useEffect } from 'react';
import { MedicationReminders } from './MedicationReminders';
import { AppointmentCalendar } from './AppointmentCalendar';
import { CaregiverDashboard } from './CaregiverDashboard';
import { useLanguage } from '../src/context/LanguageContext';

type Tab = 'meds' | 'appts' | 'caregiver';

export const ElderlyCompanion: React.FC<{ onTakeSuccess: () => void }> = ({ onTakeSuccess }) => {
    const { t } = useLanguage();
    const [tab, setTab] = useState<Tab>('meds');
    const [isDark, setIsDark] = useState(!document.body.classList.contains('light'));

    const TABS: { id: Tab; label: string; icon: string }[] = [
        { id: 'meds', label: t('reminders'), icon: '💊' },
        { id: 'appts', label: t('appointments'), icon: '📅' },
        { id: 'caregiver', label: t('family'), icon: '👨‍👩‍👧' },
    ];

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(!document.body.classList.contains('light'));
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const s = {
        card: isDark ? '#1a1a1a' : '#fff',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        txtPri: isDark ? '#fff' : '#000',
        txtSec: isDark ? '#a7a7a7' : '#3c3c43',
        txtMuted: isDark ? '#6a6a6a' : '#8e8e93',
        subtle: isDark ? '#282828' : '#e5e5ea',
        accent: '#E8547A',
    };

    return (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
                <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em', color: s.txtPri, margin: '0 0 6px' }}>
                    {(t('app_name') || 'AarogyaVani').slice(0, 10)} <span style={{ color: s.accent }}>{t('companion') || 'Companion'}</span>
                </h1>
                <p style={{ fontSize: 15, color: s.txtSec, margin: 0 }}>{(t('why_outstanding') || 'Vernacular AI Medical Companion').split('.')[0]}</p>
            </div>

            {/* Tab selector */}
            <div style={{ display: 'flex', background: s.subtle, borderRadius: 16, padding: 6, gap: 4 }}>
                {TABS.map(tabItem => (
                    <button
                        key={tabItem.id}
                        onClick={() => setTab(tabItem.id)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            padding: '10px 4px',
                            border: 'none',
                            borderRadius: 12,
                            cursor: 'pointer',
                            transition: 'all 0.25s',
                            background: tab === tabItem.id ? s.card : 'transparent',
                            boxShadow: tab === tabItem.id ? (isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.1)') : 'none',
                            color: tab === tabItem.id ? s.accent : s.txtMuted,
                            position: 'relative'
                        }}
                    >
                        <span style={{ fontSize: 22 }}>{tabItem.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{tabItem.label}</span>
                    </button>
                ))}
            </div>

            {/* Panel */}
            <div className="fade-in">
                {tab === 'meds' && <MedicationReminders onTakeSuccess={onTakeSuccess} />}
                {tab === 'appts' && <AppointmentCalendar />}
                {tab === 'caregiver' && <CaregiverDashboard />}
            </div>
        </div>
    );
};
