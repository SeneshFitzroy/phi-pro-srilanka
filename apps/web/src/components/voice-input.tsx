'use client';

// ============================================================================
// VoiceInput — a small microphone button for hands-free dictation into text
// fields (useful for PHIs wearing gloves during an inspection, citizens
// filing complaints, etc.).
//
// Uses the browser-native Web Speech API (window.SpeechRecognition /
// webkitSpeechRecognition). Works offline for English in Chromium; Sinhala
// (si-LK) and Tamil (ta-LK) use Google's online recognition. If the API isn't
// available the button simply doesn't render. Recognition language follows
// the app language unless overridden via the `lang` prop.
//
// Behaviour:
//   - Continuous + interim results so the user sees text appear live and can
//     dictate multi-sentence paragraphs without re-tapping the mic.
//   - Auto-restart on the silent network drop-outs that Chromium's recogniser
//     sometimes hits during a long dictation, so the user doesn't have to tap
//     the mic again every ~30s.
//   - One-tap stop. The button glows red while listening.
//   - Pure text is sent back via onTranscript — caller decides whether to
//     append or replace.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const wantListenRef = useRef(false);

  useEffect(() => {
    setSupported(!!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)));
    return () => {
      wantListenRef.current = false;
      try { recRef.current?.stop(); } catch { /* */ }
    };
  }, []);

  const bcp47 = lang ?? (language === 'si' ? 'si-LK' : language === 'ta' ? 'ta-LK' : 'en-US');

  const start = useCallback(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) { toast.error('Voice input is not supported in this browser.'); return; }
    const rec = new Ctor();
    rec.lang = bcp47;
    rec.interimResults = true;   // user sees text appear live
    rec.continuous = true;       // multi-sentence dictation
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      // Emit only final segments to the caller so the parent doesn't have
      // to deduplicate interim text.
      let finalChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalChunk += (r[0]?.transcript ?? '');
      }
      const trimmed = finalChunk.trim();
      if (trimmed) onTranscript(trimmed);
    };

    rec.onerror = (e) => {
      // 'no-speech' and 'aborted' fire during natural pauses — silent.
      // Network drop-outs auto-restart in onend.
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        toast.error('Microphone permission denied. Allow it in browser settings to dictate.');
        wantListenRef.current = false;
        setListening(false);
      } else if (e.error === 'audio-capture') {
        toast.error('No microphone detected on this device.');
        wantListenRef.current = false;
        setListening(false);
      } else if (e.error === 'language-not-supported') {
        toast.error(`Voice recognition for ${bcp47} is not available. Try English.`);
        wantListenRef.current = false;
        setListening(false);
      } else if (e.error !== 'aborted' && e.error !== 'no-speech') {
        // Recoverable — let onend retry.
        console.warn('[voice-input] recoverable error:', e.error);
      }
    };

    rec.onend = () => {
      // If the user still wants to listen, restart automatically. Critical
      // on Chrome where recognition silently ends every ~30s.
      if (wantListenRef.current) {
        try { rec.start(); } catch { setListening(false); wantListenRef.current = false; }
      } else {
        setListening(false);
      }
    };

    recRef.current = rec;
    wantListenRef.current = true;
    setListening(true);
    try { rec.start(); } catch { setListening(true); /* already running */ }
  }, [bcp47, onTranscript]);

  const stop = useCallback(() => {
    wantListenRef.current = false;
    try { recRef.current?.stop(); } catch { /* */ }
    setListening(false);
  }, []);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      title={title ?? `Dictate (${bcp47})`}
      aria-label={listening ? 'Stop dictation' : 'Start dictation'}
      aria-pressed={listening}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
        listening
          ? 'border-red-300 bg-red-50 text-red-600 shadow-[0_0_0_3px_rgba(239,68,68,0.15)] dark:border-red-800 dark:bg-red-950/30'
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
