import React, { createContext, useContext, useState, useEffect } from 'react';
import { lexicon, Language } from '../constants/lexicon';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof lexicon['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<Language>(() => {
        return (localStorage.getItem('av_language') as Language) || 'en';
    });

    useEffect(() => {
        localStorage.setItem('av_language', lang);
    }, [lang]);

    const t = (key: keyof typeof lexicon['en']) => {
        return (lexicon as any)[lang][key] || (lexicon as any)['en'][key];
    };

    return (
        <LanguageContext.Provider value={{ language: lang, setLanguage: setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};
