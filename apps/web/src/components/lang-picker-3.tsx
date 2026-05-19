'use client';

// Mobile-first language picker — three big tappable buttons (EN, සිංහල,
// தமிழ்). Programmatically drives the Google Translate <select> that the
// GoogleTranslateWidget already mounts, but presents a touch-friendly UI
// the user can actually hit on a phone.

import { useCallback, useEffect, useState } from 'react';
import { Globe, Check } from 'lucide-react';

const STORAGE_KEY = 'phi-pro-gt-lang';

const LANGS = [
  { code: 'en', short: 'EN',   label: 'English' },
  { code: 'si', short: 'සිං', label: 'සිංහල' },
  { code: 'ta', short: 'த',    label: 'தமிழ்' },
] as const;
type LangCode = (typeof LANGS)[number]['code'];

function readCurrentLang(): LangCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'si' || stored === 'ta') return stored;
    const cookie = document.cookie.split('; ').find((c) => c.startsWith('googtrans='));
    if (cookie) {
      const val = decodeURIComponent(cookie.split('=')[1] ?? '');
      const last = val.split('/').pop();
      if (last === 'si' || last === 'ta') return last;
    }
  } catch { /* ignore */ }
  return 'en';
}

function applyLanguage(target: LangCode) {
  // Persist user preference. We also force the Google Translate cookie
  // directly so the change survives a page refresh even if the widget
  // hasn't fully mounted yet.
  try { localStorage.setItem(STORAGE_KEY, target); } catch { /* ignore */ }

  if (target === 'en') {
    // Easiest way to revert to English is to clear the cookie + reload —
    // Google Translate's element doesn't expose a clean 'reset' path.
    try { document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch { /* ignore */ }
    try { document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`; } catch { /* ignore */ }
    window.location.reload();
    return;
  }

  // Set the cookie that Google Translate watches, then try driving the
  // hidden <select> for an in-place transition (no reload flash).
  try {
    document.cookie = `googtrans=/auto/${target}; path=/`;
    document.cookie = `googtrans=/auto/${target}; path=/; domain=${window.location.hostname}`;
  } catch { /* ignore */ }

  const select = document.querySelector<HTMLSelectElement>('#google_translate_element select');
  if (select) {
    select.value = target;
    select.dispatchEvent(new Event('change'));
  } else {
    // Widget not mounted yet (e.g. user tapped before script loaded) — reload
    // and the cookie + storage we just set will be picked up on hydration.
    window.location.reload();
  }
}

export function LangPicker3({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  const [current, setCurrent] = useState<LangCode>('en');

  useEffect(() => { setCurrent(readCurrentLang()); }, []);

  const pick = useCallback((code: LangCode) => {
    setCurrent(code);
    applyLanguage(code);
  }, []);

  return (
    <div
      className={`flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${variant === 'full' ? 'w-full' : ''}`}
      role="group"
      aria-label="Site language"
    >
      <Globe className="ml-1 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
      {LANGS.map((l) => {
        const active = l.code === current;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => pick(l.code)}
            aria-pressed={active}
            aria-label={`Switch language to ${l.label}`}
            className={`relative inline-flex flex-1 items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
              active
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
            } ${variant === 'full' ? 'min-h-[40px] text-sm' : ''}`}
          >
            {active && <Check className="h-3 w-3" aria-hidden />}
            <span>{variant === 'full' ? l.label : l.short}</span>
          </button>
        );
      })}
    </div>
  );
}
