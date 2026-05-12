'use client';

// ============================================================================
// VoiceInput — a small microphone button for hands-free dictation into text
// fields (useful for PHIs wearing gloves during an inspection).
//
// Uses the browser-native Web Speech API (window.SpeechRecognition /
// webkitSpeechRecognition). Works offline for English in Chromium; Sinhala
// (si-LK) and Tamil (ta-LK) use Google's online recognition. If the API isn't
// available the button simply doesn't render. Recognition language follows the
// app language unless overridden via the `lang` prop.
//
// (Hook for higher-accuracy Sinhala/Tamil: record with MediaRecorder and POST
//  to an AssemblyAI route — left as a future enhancement.)
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';
import { useLanguage } from '@/contexts/i18n-context';
import { toast } from 'sonner';
import type { SpeechRecognitionInstance } from '@/types/speech';

interface Props {
  /** Called with the recognised text (already trimmed). Caller decides append vs. replace. */
  onTranscript: (text: string) => void;
  /** BCP-47 override (e.g. 'en-US'). Defaults to the app language. */
  lang?: string;
  className?: string;
  title?: string;
}

export function VoiceInput({ onTranscript, lang, className, title }: Props) {
  const { language } = useLanguage();
  const [supported, setSupported] = useState(false); // resolved after mount → no SSR/hydration mismatch
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setSupported(!!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)));
    return () => { try { recRef.current?.stop(); } catch { /* */ } };
  }, []);

  const bcp47 = lang ?? (language === 'si' ? 'si-LK' : language === 'ta' ? 'ta-LK' : 'en-US');

  const start = () => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) { toast.error('Voice input is not supported in this browser.'); return; }
    const rec = new Ctor();
    rec.lang = bcp47;
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0]?.transcript ?? '').join(' ').trim();
      if (text) onTranscript(text);
    };
    rec.onerror = (e) => {
      if (e.error === 'no-speech') toast.message('No speech detected — try again.');
      else if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast.error('Microphone permission denied.');
      else if (e.error !== 'aborted') toast.error(`Voice input error: ${e.error}`);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    try { rec.start(); } catch { setListening(false); }
  };

  const stop = () => { try { recRef.current?.stop(); } catch { /* */ } setListening(false); };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      title={title ?? `Dictate (${bcp47})`}
      aria-label={listening ? 'Stop dictation' : 'Start dictation'}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
        listening
          ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30'
          : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800'
      } ${className ?? ''}`}
    >
      {listening ? (
        <span className="relative flex h-4 w-4 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
          <Mic className="relative h-4 w-4" />
        </span>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </button>
  );
}
