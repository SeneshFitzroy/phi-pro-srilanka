'use client';

// ============================================================================
// GoogleTranslate — Official Google Translate Element v2
// Handles: EN / SI / TA with localStorage persistence + zero-flicker reload
// ============================================================================

import { useEffect, useRef } from 'react';

interface GoogleTranslateElementCtor {
  new (
    config: {
      pageLanguage: string;
      includedLanguages: string;
      layout?: number;
      autoDisplay?: boolean;
      multilanguagePage?: boolean;
    },
    elementId: string,
  ): void;
  InlineLayout: { SIMPLE: number; HORIZONTAL: number; VERTICAL: number };
}

declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: GoogleTranslateElementCtor;
      };
    };
    googleTranslateElementInit: () => void;
  }
}

const STORAGE_KEY = 'phi-pro-gt-lang';

// Map Google Translate cookie lang codes to display labels
const LANG_LABELS: Record<string, string> = {
  en: 'English',
  si: 'සිංහල',
  ta: 'தமிழ்',
};

export function GoogleTranslateWidget() {
  const divRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Init callback required by Google Translate script
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,si,ta',
          layout: 1, // SIMPLE
          autoDisplay: false,
        },
        'google_translate_element',
      );

      // Restore saved language after widget loads
      const savedLang = localStorage.getItem(STORAGE_KEY);
      if (savedLang && savedLang !== 'en') {
        // Small delay to let the widget fully mount
        setTimeout(() => applyGoogleTranslateLang(savedLang), 800);
      }
    };

    // Load Google Translate script once
    if (!document.getElementById('gt-script')) {
      const script = document.createElement('script');
      script.id = 'gt-script';
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    }

    // Watch for language change via the Google Translate cookie
    const observer = new MutationObserver(() => {
      const lang = getGoogleTranslateLang();
      if (lang) localStorage.setItem(STORAGE_KEY, lang);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      {/* Google Translate mounts here — widget auto-renders the dropdown */}
      <div id="google_translate_element" ref={divRef} />

      <style>{`
        /* Hide GT's injected top banner — but NOT the widget itself */
        .goog-te-banner-frame { display: none !important; }
        /* Prevent body shift that causes cursor misalignment */
        body { top: 0 !important; position: static !important; }
        /* Hide "Powered by Google" text inside gadget */
        .goog-te-gadget > span { display: none !important; }
        .goog-logo-link { display: none !important; }
        /* Style the dropdown */
        .goog-te-gadget-simple {
          background: transparent !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 6px !important;
          padding: 3px 8px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
        }
        .goog-te-menu-value span:first-child {
          color: #475569 !important;
          font-size: 12px !important;
          font-weight: 600 !important;
        }
        .goog-te-menu-value span { color: #94a3b8 !important; }
        #google_translate_element select {
          background: transparent;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
        }
        #google_translate_element select:focus { outline: 2px solid #0066cc; }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers to read/write Google Translate language
// ---------------------------------------------------------------------------

function getGoogleTranslateLang(): string | null {
  try {
    const cookie = document.cookie.split('; ').find((c) => c.startsWith('googtrans='));
    if (!cookie) return null;
    const val = decodeURIComponent(cookie.split('=')[1] ?? '');
    // Format: /en/si or /en/ta
    const parts = val.split('/');
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

function applyGoogleTranslateLang(lang: string) {
  try {
    const select = document.querySelector<HTMLSelectElement>(
      '#google_translate_element select',
    );
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
    }
  } catch {
    // Widget not ready yet
  }
}

export { LANG_LABELS, getGoogleTranslateLang };
