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

  // The app always boots in English. We deliberately DON'T auto-restore a
  // persisted i18next language: the only place that used to set it (the
  // dashboard Settings "Language" card) has been removed, so a stale value
  // (e.g. 'ta') would otherwise freeze the whole dashboard in a language the
  // user can no longer switch out of. Site-wide multilingual is handled by
  // the Google Translate picker in the public header instead. Any leftover
  // key is cleared here so the <head> lang bootstrap also resets to English.
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      try {
        localStorage.removeItem('i18nextLng');
        document.documentElement.setAttribute('lang', 'en');
      } catch {
        // localStorage not available
      }
    }
  }, []);

  // In-session language switch (used by the voice commands "switch to
  // Sinhala/Tamil"). NOT persisted — resets to English on the next load so
  // the user can never get permanently stuck again.
  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
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
