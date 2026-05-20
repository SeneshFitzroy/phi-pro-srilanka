'use client';

/**
 * UnifiedCalendar — the single activity & tasks calendar for PHI officers.
 *
 * This is the ONE calendar in the app: it lives inside /dashboard and every
 * domain (food / school / epidemiology / occupational / administration) feeds
 * its events here instead of keeping its own separate calendar. Renders a
 * month grid (each day shows its activity/task count + domain dots) beside a
 * timeline of the selected day.
 *
 * Data is sample-seeded for now — easy to swap for a Firestore query keyed by
 * month + officer.
 */

import { useMemo, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  UtensilsCrossed, School, Activity, HardHat, ClipboardList, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

type EventKind = 'activity' | 'task';
type Domain = 'food' | 'school' | 'epidemiology' | 'occupational' | 'administration';

interface CalEvent {
  id: string;
  date: string;           // ISO yyyy-mm-dd
  time?: string;          // HH:mm
  kind: EventKind;
  domain: Domain;
  title: string;
  detail?: string;
  priority?: 'high' | 'medium' | 'low';
  completed?: boolean;
}

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const offset = (days: number) => { const d = new Date(today); d.setDate(d.getDate() + days); return iso(d); };

const SAMPLE_EVENTS: CalEvent[] = [
  // Activity (already filed)
  { id: 'a1', date: offset(0),  time: '09:30', kind: 'activity', domain: 'food',          title: 'Saman Hotel food inspection',              detail: 'Graded A · 94/100',                completed: true },
  { id: 'a2', date: offset(0),  time: '11:15', kind: 'activity', domain: 'epidemiology',  title: 'Dengue case investigated',                 detail: 'GN 547A · positive · contact-traced', completed: true },
  { id: 'a3', date: offset(0),  time: '14:00', kind: 'activity', domain: 'administration',title: 'Complaint CMP-2026-001234 assigned',       detail: 'Unsanitary food premises',          completed: false },
  { id: 'a4', date: offset(-1), time: '10:00', kind: 'activity', domain: 'school',        title: 'Grade 4 medical exam — Mahinda Vidyalaya', detail: '142 students examined',          completed: true },
  { id: 'a5', date: offset(-1), time: '15:30', kind: 'activity', domain: 'occupational',  title: 'Star Garments factory inspection',         detail: 'H1203 — minor PPE non-compliance',  completed: true },
  { id: 'a6', date: offset(-2), time: '08:45', kind: 'activity', domain: 'food',          title: 'Highway Diner re-inspection',              detail: 'Graded B → action plan filed',      completed: true },
  { id: 'a7', date: offset(-3), time: '13:20', kind: 'activity', domain: 'school',        title: 'HPV vaccine — Visakha Vidyalaya',          detail: '128 girls · Dose 2',                completed: true },
  { id: 'a8', date: offset(-4), time: '09:00', kind: 'activity', domain: 'epidemiology',  title: 'Cluster review meeting',                   detail: '3 wards in scope',                  completed: true },

  // Tasks (still due)
  { id: 't1', date: offset(0),  kind: 'task', domain: 'administration', title: 'Submit monthly report',             priority: 'high'   },
  { id: 't2', date: offset(1),  kind: 'task', domain: 'food',           title: 'Lotus Inn — re-inspection',         priority: 'medium' },
  { id: 't3', date: offset(3),  kind: 'task', domain: 'school',         title: 'St. Joseph\'s — medical camp',      priority: 'low'    },
  { id: 't4', date: offset(5),  kind: 'task', domain: 'occupational',   title: 'Lanka Garments H1203 follow-up',     priority: 'medium' },
  { id: 't5', date: offset(7),  kind: 'task', domain: 'epidemiology',   title: 'Weekly notifiable-disease report',   priority: 'high'   },
  { id: 't6', date: offset(10), kind: 'task', domain: 'food',           title: 'New premises H801 — Riverside Cafe', priority: 'low'    },
  { id: 't7', date: offset(12), kind: 'task', domain: 'school',         title: 'WASH survey — Royal College',        priority: 'medium' },
];

const DOMAIN_META: Record<Domain, { icon: LucideIcon; chip: string; dot: string; label: string }> = {
  food:           { icon: UtensilsCrossed, chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', dot: 'bg-emerald-500', label: 'Food' },
  school:         { icon: School,          chip: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',             dot: 'bg-blue-500',    label: 'School' },
  epidemiology:   { icon: Activity,        chip: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',             dot: 'bg-rose-500',    label: 'Epidemiology' },
  occupational:   { icon: HardHat,         chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',         dot: 'bg-amber-500',   label: 'Occupational' },
  administration: { icon: ClipboardList,   chip: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',     dot: 'bg-violet-500',  label: 'Administration' },
};

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function daysInMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Filter = 'all' | 'activity' | 'task';

export function UnifiedCalendar() {
  const [cursor, setCursor] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<string>(iso(today));
  const [filter, setFilter] = useState<Filter>('all');

  const byDate = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    SAMPLE_EVENTS.filter((e) => filter === 'all' || e.kind === filter).forEach((e) => {
      const arr = m.get(e.date) ?? [];
      arr.push(e); m.set(e.date, arr);
    });
    return m;
  }, [filter]);

  const monthLabel = cursor.toLocaleDateString('en-LK', { month: 'long', year: 'numeric' });
  const firstWeekday = ((startOfMonth(cursor).getDay() + 6) % 7); // Mon = 0
  const total = daysInMonth(cursor);

  const cells: ({ day: number; date: string } | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= total; d++) {
    const date = iso(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    cells.push({ day: d, date });
  }

  const selectedEvents = (byDate.get(selectedDate) ?? []).slice().sort((a, b) => (a.time ?? '00:00').localeCompare(b.time ?? '00:00'));

  const goToToday = () => { setCursor(startOfMonth(today)); setSelectedDate(iso(today)); };
  const shiftMonth = (delta: number) => {
    const next = new Date(cursor); next.setMonth(next.getMonth() + delta);
    setCursor(startOfMonth(next));
  };

  return (
    <div className="space-y-4">
      {/* Header — title + activity/task filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
          <CalendarIcon className="h-4 w-4 text-blue-700 dark:text-blue-300" />
          Activity &amp; tasks calendar
        </h3>
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
          {([
            { v: 'all',      label: 'All' },
            { v: 'activity', label: 'Activity' },
            { v: 'task',     label: 'Tasks' },
          ] as const).map((t) => (
            <button
              key={t.v}
              onClick={() => setFilter(t.v)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                filter === t.v
                  ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* ── Calendar grid ── */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{monthLabel}</h2>
                <Button variant="outline" size="icon" onClick={() => shiftMonth(1)} aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={goToToday}>
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" /> Today
              </Button>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {WEEKDAY_LABELS.map((d) => <div key={d} className="py-1">{d}</div>)}
            </div>

            {/* Day cells */}
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((c, i) => {
                if (!c) return <div key={`pad-${i}`} className="aspect-square rounded-md bg-slate-50/40 dark:bg-slate-900/40" />;
                const list = byDate.get(c.date) ?? [];
                const isToday = c.date === iso(today);
                const isSelected = c.date === selectedDate;
                return (
                  <button
                    key={c.date}
                    onClick={() => setSelectedDate(c.date)}
                    className={`relative aspect-square rounded-md border p-1.5 text-left transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/30 dark:bg-blue-950/30'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 dark:hover:bg-blue-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isToday ? 'flex h-5 w-5 items-center justify-center rounded-full bg-blue-700 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {c.day}
                      </span>
                      {list.length > 0 && (
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {list.length}
                        </span>
                      )}
                    </div>
                    {list.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-0.5">
                        {list.slice(0, 4).map((e) => (
                          <span key={e.id} className={`inline-block h-1.5 w-1.5 rounded-full ${DOMAIN_META[e.domain].dot}`} />
                        ))}
                        {list.length > 4 && <span className="text-[8px] text-slate-400">+{list.length - 4}</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-[11px] dark:border-slate-800">
              {(Object.entries(DOMAIN_META) as [Domain, typeof DOMAIN_META[Domain]][]).map(([k, v]) => (
                <span key={k} className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <span className={`inline-block h-2 w-2 rounded-full ${v.dot}`} /> {v.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Selected-day timeline ── */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">Selected day</p>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {new Date(selectedDate).toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                {selectedEvents.length} entr{selectedEvents.length === 1 ? 'y' : 'ies'}
              </span>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarIcon className="mx-auto h-10 w-10 text-slate-200 dark:text-slate-700" />
                <p className="mt-2 text-sm text-slate-500">Nothing scheduled or logged.</p>
              </div>
            ) : (
              <ol className="space-y-3">
                {selectedEvents.map((e) => {
                  const meta = DOMAIN_META[e.domain];
                  const Icon = meta.icon;
                  return (
                    <li key={e.id} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.chip}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.chip}`}>
                            {meta.label}
                          </span>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            e.kind === 'task'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                          }`}>
                            {e.kind}
                          </span>
                          {e.priority && (
                            <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              e.priority === 'high'   ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' :
                              e.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                            }`}>
                              <AlertCircle className="h-2.5 w-2.5" /> {e.priority}
                            </span>
                          )}
                          {e.time && <span className="text-[11px] font-mono text-slate-500">{e.time}</span>}
                          {e.completed && (
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" /> Done
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{e.title}</p>
                        {e.detail && <p className="text-[12px] text-slate-500">{e.detail}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
