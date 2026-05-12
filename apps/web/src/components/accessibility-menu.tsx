'use client';

// ============================================================================
// AccessibilityMenu — site-wide accessibility controls (WCAG 2.1 AA support):
// high-contrast theme, large / extra-large text, OpenDyslexic font, underline
// links, reduce motion, always-visible focus ring, and text-to-speech readback
// (uses the current UI language — Sinhala / Tamil / English where a voice exists).
// Settings persist in localStorage and apply to <html> via classes (see globals.css).
// Mounted globally (in Providers) so it's on every page.
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { Accessibility, X, Contrast, Type, BookOpenText, Link2, Snail, ScanEye, Volume2, Square, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/i18n-context';

type TextSize = 'normal' | 'large' | 'xlarge';
interface A11ySettings {
  contrast: boolean;
  textSize: TextSize;
  dyslexic: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
  focusRing: boolean;
}
const DEFAULTS: A11ySettings = { contrast: false, textSize: 'normal', dyslexic: false, underlineLinks: false, reduceMotion: false, focusRing: false };
const KEY = 'phi-a11y-v1';

function apply(s: A11ySettings) {
  const h = document.documentElement;
  h.classList.toggle('a11y-contrast', s.contrast);
  h.classList.toggle('a11y-large-text', s.textSize === 'large');
  h.classList.toggle('a11y-xlarge-text', s.textSize === 'xlarge');
  h.classList.toggle('a11y-dyslexic', s.dyslexic);
  h.classList.toggle('a11y-underline-links', s.underlineLinks);
  h.classList.toggle('a11y-reduce-motion', s.reduceMotion);
  h.classList.toggle('a11y-focus', s.focusRing);
}

export function AccessibilityMenu() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<A11ySettings>(DEFAULTS);
  const [speaking, setSpeaking] = useState(false);
  const ttsLang = language === 'si' ? 'si-LK' : language === 'ta' ? 'ta-LK' : 'en-US';
  const hasTTS = mounted && typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(KEY);
      const loaded = raw ? { ...DEFAULTS, ...JSON.parse(raw) } as A11ySettings : DEFAULTS;
      setS(loaded);
      apply(loaded);
    } catch { /* */ }
  }, []);

  const update = useCallback((patch: Partial<A11ySettings>) => {
    setS((prev) => {
      const next = { ...prev, ...patch };
      apply(next);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
  }, []);

  const reset = () => update(DEFAULTS);

  const stopSpeak = useCallback(() => { if (hasTTS) window.speechSynthesis.cancel(); setSpeaking(false); }, [hasTTS]);

  const speak = useCallback((selectionOnly: boolean) => {
    if (!hasTTS) return;
    window.speechSynthesis.cancel();
    let text = selectionOnly ? (window.getSelection()?.toString() ?? '') : '';
    if (!text) {
      const main = document.querySelector('main') ?? document.body;
      text = (main as HTMLElement).innerText.replace(/\s+/g, ' ').trim();
    }
    text = text.slice(0, 6000);
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = ttsLang;
    const v = window.speechSynthesis.getVoices().find((vc) => vc.lang === ttsLang || vc.lang.startsWith(ttsLang.split('-')[0]));
    if (v) u.voice = v;
    u.rate = 1; u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }, [hasTTS, ttsLang]);

  useEffect(() => () => { if (hasTTS) window.speechSynthesis.cancel(); }, [hasTTS]);

  const Toggle = ({ on, onClick, icon: Icon, label }: { on: boolean; onClick: () => void; icon: typeof Contrast; label: string }) => (
    <button onClick={onClick} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${on ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-200' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'}`}>
      <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
      <span className={`h-4 w-7 rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}><span className={`block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-3.5' : 'translate-x-0.5'} mt-[1px]`} /></span>
    </button>
  );

  if (!mounted) return null; // client-only overlay — avoids SSR/hydration mismatch

  return (
    <div className="print:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Accessibility options"
        title="Accessibility options"
        className="fixed bottom-5 left-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Accessibility className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed bottom-5 left-5 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-label="Accessibility settings">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold"><Accessibility className="h-4 w-4 text-blue-700" /> Accessibility</span>
            <div className="flex items-center gap-1">
              <button onClick={reset} title="Reset" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><RotateCcw className="h-3.5 w-3.5" /></button>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="space-y-2">
            <Toggle on={s.contrast} onClick={() => update({ contrast: !s.contrast })} icon={Contrast} label="High contrast" />

            <div className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
              <span className="flex items-center gap-2 text-sm"><Type className="h-4 w-4" /> Text size</span>
              <div className="mt-2 grid grid-cols-3 gap-1">
                {(['normal', 'large', 'xlarge'] as TextSize[]).map((ts) => (
                  <button key={ts} onClick={() => update({ textSize: ts })} className={`rounded-md px-2 py-1 text-xs font-semibold capitalize ${s.textSize === ts ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800'}`}>{ts === 'xlarge' ? 'X-Large' : ts}</button>
                ))}
              </div>
            </div>

            <Toggle on={s.dyslexic} onClick={() => update({ dyslexic: !s.dyslexic })} icon={BookOpenText} label="Dyslexia-friendly font" />
            <Toggle on={s.underlineLinks} onClick={() => update({ underlineLinks: !s.underlineLinks })} icon={Link2} label="Underline links" />
            <Toggle on={s.reduceMotion} onClick={() => update({ reduceMotion: !s.reduceMotion })} icon={Snail} label="Reduce motion" />
            <Toggle on={s.focusRing} onClick={() => update({ focusRing: !s.focusRing })} icon={ScanEye} label="Always show focus" />

            {hasTTS && (
              <div className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                <span className="flex items-center gap-2 text-sm"><Volume2 className="h-4 w-4" /> Read aloud <span className="ml-auto text-[10px] text-muted-foreground">{ttsLang}</span></span>
                <div className="mt-2 flex gap-1">
                  {speaking ? (
                    <button onClick={stopSpeak} className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-red-600 px-2 py-1.5 text-xs font-semibold text-white"><Square className="h-3 w-3" /> Stop</button>
                  ) : (
                    <>
                      <button onClick={() => speak(false)} className="flex-1 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Read page</button>
                      <button onClick={() => speak(true)} className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Read selection</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">Settings are saved on this device. Keyboard navigation and screen-reader landmarks (WCAG 2.1 AA) are built in throughout.</p>
        </div>
      )}
    </div>
  );
}
