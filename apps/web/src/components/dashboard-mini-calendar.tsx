'use client';

/**
 * Compact month calendar for the dashboard hero row. Sits beside Recent
 * Activity and Upcoming Tasks; clicking any day routes to /dashboard/activity
 * with the day pre-selected (deep-link via ?date=YYYY-MM-DD).
 */

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowUpRight } from 'lucide-react';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const daysInMonth  = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const iso = (d: Date) => d.toISOString().slice(0, 10);

// Visual hints — which day-of-month numbers have events scheduled. In a real
// build this comes from a Firestore query keyed by month+year.
const SAMPLE_BUSY: Record<number, number> = { 1: 2, 3: 1, 7: 3, 12: 1, 18: 2, 22: 4, 28: 1 };

export function DashboardMiniCalendar() {
  const today = new Date();
  const [cursor, setCursor] = useState(() => startOfMonth(today));
  const monthLabel = cursor.toLocaleDateString('en-LK', { month: 'long', year: 'numeric' });

  const firstWeekday = (startOfMonth(cursor).getDay() + 6) % 7; // Mon = 0
  const total = daysInMonth(cursor);
  const cells: ({ day: number; date: Date } | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push({ day: d, date: new Date(cursor.getFullYear(), cursor.getMonth(), d) });

  const shift = (delta: number) => {
    const next = new Date(cursor); next.setMonth(next.getMonth() + delta);
    setCursor(startOfMonth(next));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <CalendarIcon className="h-4 w-4 text-blue-700 dark:text-blue-300" />
          {monthLabel}
        </h3>
        <div className="flex items-center gap-0.5">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => shift(1)} aria-label="Next month" className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {WEEKDAYS.map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => {
            if (!c) return <div key={`pad-${i}`} className="aspect-square" />;
            const isToday = iso(c.date) === iso(today);
            const busy = SAMPLE_BUSY[c.day];
            return (
              <Link
                key={c.day}
                href={`/dashboard/activity?date=${iso(c.date)}`}
                className={`relative flex aspect-square items-center justify-center rounded-md text-[12px] font-semibold transition-colors ${
                  isToday
                    ? 'bg-blue-700 text-white shadow-sm'
                    : busy
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {c.day}
                {busy && !isToday && (
                  <span className="absolute -bottom-0.5 left-1/2 inline-block h-1 w-1 -translate-x-1/2 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
        <Link
          href="/dashboard/activity"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-600 dark:text-blue-400"
        >
          Open full calendar <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
