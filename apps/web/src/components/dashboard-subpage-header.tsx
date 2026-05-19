'use client';

/**
 * Shared header for dashboard subpages (food, school, occupational, etc.).
 * Gives every form / report subpage the same industrial chrome:
 *   - Breadcrumb-back arrow
 *   - Gradient icon block + module / H-form chips
 *   - Title + subtitle
 *   - Right-aligned action slot
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

type Tone = 'blue' | 'emerald' | 'amber' | 'cyan' | 'purple' | 'indigo' | 'rose';

const TONE: Record<Tone, { ring: string; bg: string; chip: string; iconBg: string }> = {
  blue:    { ring: 'ring-blue-200    dark:ring-blue-800',    bg: 'from-blue-100 to-indigo-50    dark:from-blue-950/60 dark:to-indigo-900/40',    chip: 'text-blue-700 dark:text-blue-300',       iconBg: 'text-blue-700 dark:text-blue-300' },
  emerald: { ring: 'ring-emerald-200 dark:ring-emerald-800', bg: 'from-emerald-100 to-emerald-50 dark:from-emerald-950/60 dark:to-emerald-900/40', chip: 'text-emerald-700 dark:text-emerald-300', iconBg: 'text-emerald-700 dark:text-emerald-300' },
  amber:   { ring: 'ring-amber-200   dark:ring-amber-800',   bg: 'from-amber-100 to-amber-50    dark:from-amber-950/60 dark:to-amber-900/40',    chip: 'text-amber-700 dark:text-amber-300',     iconBg: 'text-amber-700 dark:text-amber-300' },
  cyan:    { ring: 'ring-cyan-200    dark:ring-cyan-800',    bg: 'from-cyan-100 to-cyan-50      dark:from-cyan-950/60 dark:to-cyan-900/40',      chip: 'text-cyan-700 dark:text-cyan-300',       iconBg: 'text-cyan-700 dark:text-cyan-300' },
  purple:  { ring: 'ring-purple-200  dark:ring-purple-800',  bg: 'from-purple-100 to-purple-50  dark:from-purple-950/60 dark:to-purple-900/40',  chip: 'text-purple-700 dark:text-purple-300',   iconBg: 'text-purple-700 dark:text-purple-300' },
  indigo:  { ring: 'ring-indigo-200  dark:ring-indigo-800',  bg: 'from-indigo-100 to-indigo-50  dark:from-indigo-950/60 dark:to-indigo-900/40',  chip: 'text-indigo-700 dark:text-indigo-300',   iconBg: 'text-indigo-700 dark:text-indigo-300' },
  rose:    { ring: 'ring-rose-200    dark:ring-rose-800',    bg: 'from-rose-100 to-rose-50      dark:from-rose-950/60 dark:to-rose-900/40',      chip: 'text-rose-700 dark:text-rose-300',       iconBg: 'text-rose-700 dark:text-rose-300' },
};

interface Props {
  backHref: string;
  module: string;       // e.g. 'Module 04 · School Health'
  code?: string;        // e.g. 'H1214'
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  tone?: Tone;
  actions?: React.ReactNode;
}

export function SubpageHeader({
  backHref, module, code, icon: Icon, title, subtitle, tone = 'blue', actions,
}: Props) {
  const t = TONE[tone];
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <Link href={backHref}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className={`rounded-xl bg-gradient-to-br ${t.bg} p-2.5 ring-1 ${t.ring}`}>
          <Icon className={`h-6 w-6 ${t.iconBg}`} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${t.chip}`}>{module}</p>
            {code && (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {code}
              </span>
            )}
          </div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
