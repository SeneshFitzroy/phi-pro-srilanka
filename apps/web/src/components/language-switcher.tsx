'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'en', label: 'English',  short: 'EN' },
  { code: 'si', label: 'සිංහල',   short: 'SI' },
  { code: 'ta', label: 'தமிழ்',   short: 'TA' },
] as const;

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGS.find((l) => l.code === language) ?? LANGS[0];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{current!.short}</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-700',
                language === lang.code
                  ? 'font-bold text-blue-700 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300',
              )}
            >
              <span className="w-6 font-mono text-xs text-slate-400">{lang.short}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
