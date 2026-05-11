'use client';

// ============================================================================
// VoiceCommands — hands-free dashboard navigation via the Web Speech API.
// Toggle the mic, then say e.g. "open food safety", "go to epidemiology",
// "open inventory", "submit", "scroll down", "switch to Sinhala", "go home".
// Continuous recognition; shows a command crib sheet while listening. Hidden if
// the browser has no SpeechRecognition support.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, X, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/i18n-context';
import { toast } from 'sonner';
import type { SpeechRecognitionInstance } from '@/types/speech';

interface Cmd { phrases: string[]; label: string; run: () => void }

export function VoiceCommands() {
  const router = useRouter();
  const { setLanguage } = useLanguage();
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [lastHeard, setLastHeard] = useState('');
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const wantOn = useRef(false);

  // Build the command table (recomputed cheaply — fine, only used on a match).
  const commands: Cmd[] = [
    { phrases: ['home', 'dashboard', 'go home', 'main'], label: 'Dashboard', run: () => router.push('/dashboard') },
    { phrases: ['food', 'food safety', 'open food'], label: 'Food Safety', run: () => router.push('/dashboard/food') },
    { phrases: ['epidemiology', 'disease', 'epi'], label: 'Epidemiology', run: () => router.push('/dashboard/epidemiology') },
    { phrases: ['disease map', 'map', 'outbreak map'], label: 'Disease map', run: () => router.push('/dashboard/epidemiology/map') },
    { phrases: ['school', 'school health'], label: 'School Health', run: () => router.push('/dashboard/school') },
    { phrases: ['occupational', 'factory', 'workplace'], label: 'Occupational', run: () => router.push('/dashboard/occupational') },
    { phrases: ['administration', 'admin', 'reports'], label: 'Administration', run: () => router.push('/dashboard/administration') },
    { phrases: ['inventory', 'stock'], label: 'Inventory', run: () => router.push('/dashboard/administration/inventory') },
    { phrases: ['copilot', 'assistant', 'ai assistant'], label: 'Compliance Copilot', run: () => router.push('/dashboard/copilot') },
    { phrases: ['management', 'console'], label: 'Management', run: () => router.push('/dashboard/management') },
    { phrases: ['analytics', 'statistics'], label: 'Analytics', run: () => router.push('/dashboard/management/analytics') },
    { phrases: ['security', 'security console'], label: 'Security', run: () => router.push('/dashboard/management/security') },
    { phrases: ['audit', 'ledger', 'audit chain'], label: 'Audit Chain', run: () => router.push('/dashboard/management/audit') },
    { phrases: ['new inspection', 'h800', 'new h800'], label: 'New H800', run: () => router.push('/dashboard/food/inspection/new') },
    { phrases: ['profile', 'my profile'], label: 'Profile', run: () => router.push('/dashboard/profile') },
    { phrases: ['settings'], label: 'Settings', run: () => router.push('/dashboard/settings') },
    { phrases: ['scroll down'], label: 'Scroll down', run: () => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' }) },
    { phrases: ['scroll up', 'scroll top'], label: 'Scroll up', run: () => window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' }) },
    { phrases: ['back'], label: 'Back', run: () => router.back() },
    { phrases: ['submit', 'send', 'save'], label: 'Submit form', run: () => clickButtonMatching(/submit|send|save/i) },
    { phrases: ['sinhala', 'switch to sinhala'], label: 'Sinhala', run: () => setLanguage('si') },
    { phrases: ['tamil', 'switch to tamil'], label: 'Tamil', run: () => setLanguage('ta') },
    { phrases: ['english', 'switch to english'], label: 'English', run: () => setLanguage('en') },
  ];

  function clickButtonMatching(re: RegExp) {
    const btns = Array.from(document.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
    const target = btns.find((b) => re.test(b.textContent || '') && b.offsetParent !== null);
    if (target) { target.click(); toast.message('Submitted'); } else toast.error('No submit button found here.');
  }

  function handleUtterance(text: string) {
    const t = text.trim().toLowerCase().replace(/[^a-z\s]/g, '').replace(/^(open|go to|goto|navigate to|show)\s+/g, '').trim();
    if (!t) return;
    setLastHeard(text.trim());
    // best phrase match: exact, then includes
    let best: Cmd | null = null; let bestLen = 0;
    for (const c of commands) for (const p of c.phrases) {
      if (t === p || t.includes(p)) { if (p.length > bestLen) { best = c; bestLen = p.length; } }
    }
    if (best) { toast.message(`▶ ${best.label}`); best.run(); }
  }

  const stop = useCallback(() => { wantOn.current = false; try { recRef.current?.stop(); } catch { /* */ } setListening(false); }, []);

  const start = useCallback(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) { toast.error('Voice commands not supported in this browser.'); return; }
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) handleUtterance(r[0]?.transcript ?? '');
      }
    };
    rec.onerror = (e) => { if (e.error === 'not-allowed') { toast.error('Microphone denied.'); stop(); } };
    rec.onend = () => { if (wantOn.current) { try { rec.start(); } catch { setListening(false); } } else setListening(false); };
    recRef.current = rec;
    wantOn.current = true;
    setListening(true);
    try { rec.start(); toast.success('Voice commands on — say “open …” or “submit”'); } catch { setListening(false); }
  }, [stop]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSupported(!!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)));
    return () => stop();
  }, [stop]);

  if (!supported) return null;

  return (
    <div className="print:hidden">
      {/* Toggle pill (sits above the AI assistant FAB which is at bottom-5) */}
      <button
        onClick={() => (listening ? stop() : start())}
        aria-label={listening ? 'Stop voice commands' : 'Start voice commands'}
        title="Voice commands"
        className={cn(
          'fixed bottom-[88px] right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95',
          listening ? 'bg-red-600 text-white' : 'bg-slate-800 text-white dark:bg-slate-700',
        )}
      >
        {listening ? <span className="relative flex h-5 w-5 items-center justify-center"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" /><Mic className="relative h-5 w-5" /></span> : <Mic className="h-5 w-5" />}
      </button>

      {listening && (
        <div className="fixed bottom-[88px] right-[72px] z-50 w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-1.5 flex items-center justify-between font-semibold text-slate-800 dark:text-slate-100"><span className="flex items-center gap-1.5"><Volume2 className="h-3.5 w-3.5 text-red-500" /> Listening…</span><button onClick={stop}><X className="h-3.5 w-3.5 text-muted-foreground" /></button></div>
          {lastHeard && <p className="mb-1.5 rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">“{lastHeard}”</p>}
          <p className="text-[11px] text-muted-foreground">Try: <span className="font-medium">open food safety</span> · <span className="font-medium">disease map</span> · <span className="font-medium">inventory</span> · <span className="font-medium">analytics</span> · <span className="font-medium">copilot</span> · <span className="font-medium">submit</span> · <span className="font-medium">scroll down</span> · <span className="font-medium">switch to Sinhala</span> · <span className="font-medium">back</span></p>
        </div>
      )}
    </div>
  );
}
