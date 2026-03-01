'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import en from '@/i18n/en.json';
import si from '@/i18n/si.json';
import ta from '@/i18n/ta.json';

// Initialize i18next WITHOUT LanguageDetector to avoid SSR/client hydration mismatch.
// Language detection is handled manually in the provider after mount.
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      si: { translation: si },
      ta: { translation: ta },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

interface I18nContextValue {
  language: string;
  setLanguage: (lang: string) => void;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  setLanguage: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en');
  const initialized = useRef(false);

  // Detect saved language on client only (after hydration completes)
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      try {
        const saved = localStorage.getItem('i18nextLng') || 'en';
        const lang = ['en', 'si', 'ta'].includes(saved) ? saved : 'en';
        if (lang !== 'en') {
          i18n.changeLanguage(lang);
          setLanguageState(lang);
        }
      } catch {
        // localStorage not available
      }
    }
  }, []);

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
    try { localStorage.setItem('i18nextLng', lang); } catch { /* noop */ }
  };

  useEffect(() => {
    const handleLangChange = (lng: string) => setLanguageState(lng);
    i18n.on('languageChanged', handleLangChange);
    return () => { i18n.off('languageChanged', handleLangChange); };
  }, []);

  return (
    <I18nContext.Provider value={{ language, setLanguage }}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </I18nContext.Provider>
  );
}

export function useLanguage() {
  return useContext(I18nContext);
}
