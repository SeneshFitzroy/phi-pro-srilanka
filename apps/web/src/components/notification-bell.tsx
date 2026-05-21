'use client';

// NotificationBell — a working header notification centre. Surfaces live
// operational alerts (sync state + standing PHI reminders), shows an unread
// count, opens a dropdown, lets the officer mark items read / clear, and
// navigates to the relevant module on click. Read state persists locally.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, AlertTriangle, FileWarning, Syringe, Bug, CloudUpload, X } from 'lucide-react';
import { useSync } from '@/contexts/sync-context';

type Note = {
  id: string;
  title: string;
  body: string;
  href: string;
  icon: 'alert' | 'food' | 'vaccine' | 'vector' | 'sync';
  at: number;
};

const READ_KEY = 'phi-pro-notifications-read-v1';

// Standing operational reminders for a Colombo PHI — realistic, actionable.
const BASE_NOTES: Omit<Note, 'at'>[] = [
  { id: 'reinspect-grade-c', title: 'Re-inspection due', body: '2 Grade C premises in Pettah are due for re-inspection this week (H800).', href: '/dashboard/food', icon: 'food' },
  { id: 'dengue-cluster', title: 'Dengue cluster alert', body: 'Rising dengue notifications in Wanathamulla — review the cluster map.', href: '/dashboard/epidemiology/map', icon: 'vector' },
  { id: 'h399-due', title: 'Weekly H399 return', body: 'The communicable disease weekly return (H399) is due Friday.', href: '/dashboard/epidemiology/weekly', icon: 'alert' },
  { id: 'vaccine-session', title: 'School vaccination', body: 'BCG/MMR session at Royal College scheduled — confirm consent forms.', href: '/dashboard/school/vaccine', icon: 'vaccine' },
  { id: 'sample-pending', title: 'Lab samples pending', body: '3 food samples awaiting Government Analyst results (H802).', href: '/dashboard/food/sampling', icon: 'food' },
];

const ICONS = {
  alert: AlertTriangle,
  food: FileWarning,
  vaccine: Syringe,
  vector: Bug,
  sync: CloudUpload,
} as const;

function loadRead(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')); } catch { return new Set(); }
}
function saveRead(ids: Set<string>) {
  try { localStorage.setItem(READ_KEY, JSON.stringify([...ids])); } catch { /* ignore */ }
}

export function NotificationBell() {
  const router = useRouter();
  const { pendingCount, failedCount } = useSync();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setRead(loadRead()); }, []);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const notes = useMemo<Note[]>(() => {
    const now = Date.now();
    const list: Note[] = BASE_NOTES.map((n, i) => ({ ...n, at: now - (i + 1) * 3600_000 }));
    if (pendingCount > 0 || failedCount > 0) {
      list.unshift({
        id: 'sync-pending',
        title: failedCount > 0 ? 'Sync failures' : 'Records pending sync',
        body: `${pendingCount} pending${failedCount > 0 ? `, ${failedCount} failed` : ''} — will upload when online.`,
        href: '/dashboard/settings',
        icon: 'sync',
        at: now,
      });
    }
    return list;
  }, [pendingCount, failedCount]);

  const unread = notes.filter((n) => !read.has(n.id));

  const markRead = (id: string) => { setRead((prev) => { const next = new Set(prev); next.add(id); saveRead(next); return next; }); };
  const markAll = () => { const next = new Set(notes.map((n) => n.id)); setRead(next); saveRead(next); };
  const onClick = (n: Note) => { markRead(n.id); setOpen(false); router.push(n.href); };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread.length ? ` (${unread.length} unread)` : ''}`}
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-800">
            <p className="text-sm font-bold">Notifications {unread.length > 0 && <span className="text-xs font-normal text-muted-foreground">· {unread.length} new</span>}</p>
            <div className="flex items-center gap-1">
              {unread.length > 0 && (
                <button onClick={markAll} className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40">
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
            {notes.map((n) => {
              const Icon = ICONS[n.icon];
              const isRead = read.has(n.id);
              return (
                <li key={n.id}>
                  <button onClick={() => onClick(n)} className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${isRead ? 'opacity-60' : ''}`}>
                    <span className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${n.icon === 'sync' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : n.icon === 'vector' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{n.title}</span>
                        {!isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{n.body}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
