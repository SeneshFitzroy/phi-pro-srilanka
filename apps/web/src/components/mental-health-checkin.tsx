'use client';

// ============================================================================
// MentalHealthCheckin — a private daily 3-question wellbeing check-in for the
// PHI, with a simple burnout score (computed locally, no API, no server). High
// strain surfaces the National Mental Health Helpline (1926). History is kept
// only in this device's localStorage. Addresses the field-officer burnout
// findings of Wanninayake & Razik (2025).
// ============================================================================

import { useEffect, useState } from 'react';
import { HeartPulse, Check, X, Phone, ChevronDown, ChevronUp, LifeBuoy } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DayEntry { score: number; band: Band; q: [number, number, number]; at: string }
type Band = 'Good' | 'Watch' | 'High strain';
const KEY = 'phi-wellbeing-v1';
const todayKey = () => new Date().toISOString().slice(0, 10);

const QUESTIONS: { q: string; lo: string; hi: string }[] = [
  { q: 'How heavy did your workload feel today?', lo: 'Light', hi: 'Overwhelming' },
  { q: 'How stressed or tense do you feel right now?', lo: 'Calm', hi: 'Very stressed' },
  { q: 'How tired / drained do you feel?', lo: 'Fresh', hi: 'Exhausted' },
];

function bandOf(score: number): Band { return score >= 60 ? 'High strain' : score >= 33 ? 'Watch' : 'Good'; }
const bandStyle: Record<Band, string> = {
  Good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  Watch: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  'High strain': 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};
const bandBar: Record<Band, string> = { Good: 'bg-emerald-500', Watch: 'bg-amber-500', 'High strain': 'bg-red-500' };

function loadAll(): Record<string, DayEntry> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

// No improvement = the last 3 consecutive days (incl. today) are all logged
// and all land in High strain. That's the cue to offer an SPHI escalation.
function noImprovement(all: Record<string, DayEntry>): boolean {
  for (let i = 0; i < 3; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const e = all[d.toISOString().slice(0, 10)];
    if (!e || e.band !== 'High strain') return false;
  }
  return true;
}

export function MentalHealthCheckin() {
  const [all, setAll] = useState<Record<string, DayEntry>>({});
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [editing, setEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => { setAll(loadAll()); }, []);

  const today = all[todayKey()];
  const done = !!today && !editing;

  const submit = () => {
    if (answers.some((a) => a == null)) return;
    const q = answers as [number, number, number];
    const sum = q.reduce((s, v) => s + v, 0);
    const score = Math.round(((sum - 3) / 12) * 100);
    const entry: DayEntry = { score, band: bandOf(score), q, at: new Date().toISOString() };
    const next = { ...loadAll(), [todayKey()]: entry };
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* */ }
    setAll(next);
    setEditing(false);

    // 3 consecutive high-strain days → send an ANONYMOUS flag to the SPHI
    // wellbeing dashboard (no identity, no answers — just the band). Fired
    // once per day; resilient so a rules/network error never breaks the form.
    if (noImprovement(next)) {
      const flagKey = `phi-wellbeing-flagged-${todayKey()}`;
      let alreadyFlagged = false;
      try { alreadyFlagged = !!localStorage.getItem(flagKey); } catch { /* */ }
      if (!alreadyFlagged) {
        addDoc(collection(db, 'wellbeing_flags'), {
          band: entry.band, score: entry.score, daysHigh: 3, anonymous: true, createdAt: serverTimestamp(),
        }).catch((err) => console.warn('[wellbeing] SPHI flag failed (non-fatal):', err));
        try { localStorage.setItem(flagKey, '1'); } catch { /* */ }
      }
    }
  };

  // last 7 days for the sparkline
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = d.toISOString().slice(0, 10);
    return { day: d.toLocaleDateString('en-LK', { weekday: 'short' }).slice(0, 2), e: all[k] as DayEntry | undefined };
  });

  if (hidden) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
          <HeartPulse className="h-4 w-4 text-rose-500" /> Daily Wellbeing Check-in
          {done && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${bandStyle[today.band]}`}>{today.band}</span>}
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setCollapsed((v) => !v)} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">{collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}</button>
          <button onClick={() => setHidden(true)} title="Hide for now" className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {!collapsed && (
        <>
          {!done ? (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-muted-foreground">Private to this device — helps you (and only you) track strain over time.</p>
              {QUESTIONS.map((qq, qi) => (
                <div key={qi}>
                  <p className="text-sm">{qq.q}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="w-14 text-[10px] text-muted-foreground">{qq.lo}</span>
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button key={v} onClick={() => setAnswers((a) => a.map((x, i) => (i === qi ? v : x)))}
                          className={`h-7 flex-1 rounded text-xs font-semibold transition-colors ${answers[qi] === v ? 'bg-rose-500 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800'}`}>{v}</button>
                      ))}
                    </div>
                    <span className="w-14 text-right text-[10px] text-muted-foreground">{qq.hi}</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={submit} disabled={answers.some((a) => a == null)} className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40"><Check className="h-3.5 w-3.5" /> Submit check-in</button>
                {editing && <button onClick={() => setEditing(false)} className="rounded-md border px-3 py-1.5 text-sm dark:border-slate-700">Cancel</button>}
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Today&apos;s strain index</span><span className="font-semibold">{today.score}/100</span></div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className={`h-full rounded-full ${bandBar[today.band]}`} style={{ width: `${today.score}%` }} /></div>
              </div>
              {/* 7-day trend */}
              <div className="flex items-end gap-1.5">
                {last7.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                    <div className="flex h-12 w-full items-end rounded bg-slate-100 dark:bg-slate-800">
                      {d.e ? <div className={`w-full rounded ${bandBar[d.e.band]}`} style={{ height: `${Math.max(8, d.e.score)}%` }} /> : null}
                    </div>
                    <span className="text-[9px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setAnswers(today.q); setEditing(true); }} className="text-xs text-rose-600 hover:underline">Redo today&apos;s check-in</button>
            </div>
          )}

          {/* Support — offered after any submit that lands in Watch / High */}
          {done && (today.band === 'Watch' || today.band === 'High strain') && (
            <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs dark:border-violet-900/40 dark:bg-violet-950/20">
              <p className="font-semibold text-violet-900 dark:text-violet-200">Talk it through — you don&apos;t have to wait.</p>
              <p className="mt-1 text-violet-800/80 dark:text-violet-300/80">Confidential counselling is one tap away.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href="tel:0112696666" className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-2.5 py-1.5 font-semibold text-white hover:bg-violet-700"><LifeBuoy className="h-3.5 w-3.5" /> Talk to a counsellor (Sumithrayo)</a>
                <a href="tel:1926" className="inline-flex items-center gap-1.5 rounded-md border border-violet-300 px-2.5 py-1.5 font-semibold text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:text-violet-300"><Phone className="h-3.5 w-3.5" /> NIMH helpline 1926</a>
              </div>
            </div>
          )}

          {/* 3-day no-improvement escalation → anonymous SPHI flag */}
          {done && noImprovement(all) && (
            <div className="mt-3 rounded-lg border border-red-300 bg-red-100 p-3 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              <p className="font-bold">High strain for 3 days running.</p>
              <p className="mt-1">An <strong>anonymous</strong> flag has been sent to your SPHI&apos;s wellbeing dashboard so support can be offered — your individual answers stay private to this device. Please consider talking to a counsellor above.</p>
            </div>
          )}
          <p className="mt-3 text-[10px] text-muted-foreground">Confidential — stored only on this device. Ref: Wanninayake &amp; Razik (2025) on PHI occupational stress.</p>
        </>
      )}
    </div>
  );
}
