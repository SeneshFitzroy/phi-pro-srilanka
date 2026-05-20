'use client';

/**
 * Global dashboard search — lives in the layout header so it's available on
 * every dashboard route. Indexes every routable subpage; tokens are matched
 * AND-style against label + group + keyword bag. Cmd/Ctrl+K focuses it.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, CornerDownLeft } from 'lucide-react';

interface Entry { label: string; href: string; group: string; keywords: string }

const INDEX: Entry[] = [
  // Food Safety
  { label: 'Food Safety overview',           href: '/dashboard/food',                       group: 'Food Safety',     keywords: 'food premises restaurant kitchen hygiene grade h800' },
  { label: 'New H800 food inspection',       href: '/dashboard/food/inspection/new',        group: 'Food Safety',     keywords: 'h800 inspection food premises new score' },
  { label: 'Register food premises (H801)',  href: '/dashboard/food/registration',          group: 'Food Safety',     keywords: 'h801 registration premises new licence' },
  { label: 'Submit food sample (H802)',      href: '/dashboard/food/sampling',              group: 'Food Safety',     keywords: 'h802 sample testing lab adulteration' },
  { label: 'Food inspection calendar (H803)',href: '/dashboard/food/calendar',              group: 'Food Safety',     keywords: 'h803 schedule calendar followup' },
  // School Health
  { label: 'School Health overview',         href: '/dashboard/school',                     group: 'School Health',   keywords: 'school medical inspection grade students' },
  { label: 'School monthly summary (H1214)', href: '/dashboard/school/monthly',             group: 'School Health',   keywords: 'h1214 monthly summary report school' },
  { label: 'Student defects (H1046)',        href: '/dashboard/school/defects',             group: 'School Health',   keywords: 'h1046 defects students medical examination' },
  { label: 'WASH school survey (H1015)',     href: '/dashboard/school/wash',                group: 'School Health',   keywords: 'h1015 wash water sanitation hygiene' },
  { label: 'School vaccine program (H1247)', href: '/dashboard/school/vaccine',             group: 'School Health',   keywords: 'h1247 vaccine hpv apdt immunisation' },
  { label: 'School activity log (H1014)',    href: '/dashboard/school/activity',            group: 'School Health',   keywords: 'h1014 activity log school' },
  // Epidemiology
  { label: 'Epidemiology overview',          href: '/dashboard/epidemiology',               group: 'Epidemiology',    keywords: 'epidemiology dengue outbreak surveillance' },
  { label: 'Contact tracing network',        href: '/dashboard/epidemiology', group: 'Epidemiology',  keywords: 'contact tracing outbreak case investigation cluster transmission graph' },
  { label: 'SIR epidemic forecast',          href: '/dashboard/epidemiology', group: 'Epidemiology',  keywords: 'sir model forecast reproduction number rt capacity planning' },
  { label: 'Live HACCP telemetry (IoT)',     href: '/dashboard/food',         group: 'Food Safety',   keywords: 'iot cold chain temperature sensor mqtt haccp fridge' },
  // Occupational
  { label: 'Occupational Health overview',   href: '/dashboard/occupational',               group: 'Occupational',    keywords: 'occupational factory worker health safety' },
  { label: 'Worker survey',                  href: '/dashboard/occupational/worker-survey', group: 'Occupational',    keywords: 'worker survey factory health' },
  { label: 'Workplace safety checklist',     href: '/dashboard/occupational/checklist',     group: 'Occupational',    keywords: 'safety checklist workplace factory' },
  { label: 'Factory health certificate',     href: '/dashboard/occupational/factory-health',group: 'Occupational',    keywords: 'factory health certificate h1203' },
  // Administration
  { label: 'Administration overview',        href: '/dashboard/administration',             group: 'Administration',  keywords: 'administration reports area survey monthly' },
  { label: 'Monthly report',                 href: '/dashboard/administration/monthly-report', group: 'Administration', keywords: 'monthly report administration h399' },
  { label: 'Area survey',                    href: '/dashboard/administration/area-survey', group: 'Administration',  keywords: 'area survey administration' },
  { label: 'Spot map',                       href: '/dashboard/administration/spot-map',    group: 'Administration',  keywords: 'spot map gis cases administration' },
  // Tools / account
  { label: 'AI Copilot',                     href: '/dashboard/copilot',                    group: 'Tools',           keywords: 'copilot ai assistant help' },
  { label: 'Activity & tasks calendar',      href: '/dashboard/activity',                   group: 'Tools',           keywords: 'activity calendar tasks recent' },
  { label: 'Profile & settings',             href: '/dashboard/profile',                    group: 'Account',         keywords: 'profile account settings' },
];

interface Props { className?: string }

export function DashboardSearch({ className = '' }: Props) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [] as Entry[];
    const tokens = term.split(/\s+/);
    return INDEX
      .map((e) => {
        const hay = (e.label + ' ' + e.group + ' ' + e.keywords).toLowerCase();
        const score = tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
        return { e, score };
      })
      .filter((r) => r.score === tokens.length)
      .slice(0, 8)
      .map((r) => r.e);
  }, [q]);

  // Cmd/Ctrl + K → focus the input from anywhere on the dashboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isShortcut) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Click-outside to close
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  useEffect(() => { setHighlight(0); }, [results.length]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (results.length > 0) {
            router.push(results[highlight]?.href ?? results[0].href);
            setOpen(false);
            setQ('');
          }
        }}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800"
      >
        <Search className="h-3.5 w-3.5 text-slate-400" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (results.length === 0) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, results.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
          }}
          type="text"
          placeholder="Search…  H800 · school vaccine · contact tracing"
          className="w-44 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 lg:w-72 xl:w-80"
          aria-label="Search the dashboard"
        />
        <kbd className="hidden rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-600 dark:bg-slate-700 lg:inline-block">
          ⌘K
        </kbd>
      </form>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-slate-500">
              No matches for &ldquo;{q}&rdquo;. Try a different keyword.
            </p>
          ) : (
            results.map((entry, i) => (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={() => { setOpen(false); setQ(''); }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  i === highlight ? 'bg-blue-50 dark:bg-blue-950/40' : ''
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">{entry.label}</p>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">{entry.group}</p>
                </div>
                {i === highlight && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    <CornerDownLeft className="h-2.5 w-2.5" /> Enter
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
