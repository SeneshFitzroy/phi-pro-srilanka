'use client';

// WellbeingBell — compact dashboard-header trigger for the Daily Wellbeing
// Check-in. Shows today's strain band as a pill; click opens a dropdown that
// hosts the full MentalHealthCheckin component (3-question survey, 7-day
// trend, counsellor links). Private to this device — same data as before,
// just lifted out of the main dashboard column into the nav.

import { useEffect, useRef, useState } from 'react';
import { HeartPulse, X } from 'lucide-react';
import { MentalHealthCheckin } from './mental-health-checkin';

type Band = 'Good' | 'Watch' | 'High strain';
interface DayEntry { score: number; band: Band }

const KEY = 'phi-wellbeing-v1';
const todayKey = () => new Date().toISOString().slice(0, 10);

const pillStyle: Record<Band | 'none', string> = {
  Good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  Watch: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  'High strain': 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  none: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export function WellbeingBell() {
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState<DayEntry | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Read today's entry from localStorage, and keep it in sync with the widget
  // (the widget writes back to the same key) via a storage event + a poll on
  // dropdown open so the pill stays accurate after a fresh check-in.
  const refresh = () => {
    try {
      const all = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, DayEntry>;
      setToday(all[todayKey()] ?? null);
    } catch { setToday(null); }
  };
  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) refresh(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const band: Band | 'none' = today?.band ?? 'none';
  const label = today ? today.band : 'Wellbeing';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((v) => { if (!v) refresh(); return !v; }); }}
        aria-label="Daily wellbeing check-in"
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${pillStyle[band]} hover:brightness-105`}
      >
        <HeartPulse className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{label}</span>
        {today && <span className="hidden sm:inline font-mono text-[10px] opacity-70">· {today.score}</span>}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Daily Wellbeing Check-in</p>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-2">
            <MentalHealthCheckin />
          </div>
        </div>
      )}
    </div>
  );
}
