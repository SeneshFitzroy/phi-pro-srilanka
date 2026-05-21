'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  School, FileText, Syringe, Droplets, Activity, ClipboardList, Search, TrendingUp,
  Users, AlertTriangle, ArrowRight, X, Plus, CheckCircle2, Circle, Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { COLOMBO_SCHOOLS } from '@/data/colombo-schools';

const quickActions = [
  { title: 'Monthly Summary',  code: 'H1214', icon: FileText,       href: '/dashboard/school/monthly',  desc: 'Roll up the month\'s school-health activity.',         accent: 'from-blue-600 to-indigo-700' },
  { title: 'Student Defects',  code: 'H1046', icon: ClipboardList,  href: '/dashboard/school/defects',  desc: 'Record defects found at the grade-level exam.',         accent: 'from-rose-600 to-red-700' },
  { title: 'WASH Survey',      code: 'H1015', icon: Droplets,       href: '/dashboard/school/wash',     desc: 'Water, sanitation and hygiene audit.',                  accent: 'from-cyan-600 to-sky-700' },
  { title: 'Vaccine Program',  code: 'H1247', icon: Syringe,        href: '/dashboard/school/vaccine',  desc: 'HPV & aP/dT campaign tracker.',                         accent: 'from-purple-600 to-fuchsia-700' },
  { title: 'Activity Log',     code: 'H1014', icon: Activity,       href: '/dashboard/school/activity', desc: 'Field activity diary.',                                 accent: 'from-emerald-600 to-teal-700' },
];

interface SchoolRow {
  id: string; name: string; type: 'National' | 'Provincial' | 'Private';
  students: number; lastVisit: string;
  grade1Done: boolean; grade4Done: boolean; grade7Done: boolean; grade10Done: boolean;
}

// Colombo school register — seeded from the shared Colombo schools dataset.
const SEED_SCHOOLS: SchoolRow[] = COLOMBO_SCHOOLS.map((s, i) => ({
  id: s.id, name: s.name, type: s.type, students: s.students,
  lastVisit: `2026-0${(i % 2) + 1}-${String(((i * 3) % 27) + 1).padStart(2, '0')}`,
  grade1Done: i % 2 === 0, grade4Done: i % 3 === 0, grade7Done: i % 4 === 0, grade10Done: i % 5 === 0,
}));

type TypeFilter = 'All' | SchoolRow['type'];
type ProgressFilter = 'All' | 'Complete' | 'Partial' | 'Not started';
type SortKey = 'name' | 'students' | 'lastVisit';

export default function SchoolHealthPage() {
  const [schools, setSchools] = useState<SchoolRow[]>(SEED_SCHOOLS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>('All');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ name: '', type: 'National' as SchoolRow['type'], students: '' });

  const addSchool = () => {
    if (!draft.name.trim()) { toast.error('School name is required.'); return; }
    setSchools((prev) => [{
      id: `SCH-${String(prev.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
      name: draft.name.trim(), type: draft.type, students: Number(draft.students) || 0,
      lastVisit: new Date().toISOString().slice(0, 10),
      grade1Done: false, grade4Done: false, grade7Done: false, grade10Done: false,
    }, ...prev]);
    toast.success(`Added ${draft.name.trim()}.`);
    setDraft({ name: '', type: 'National', students: '' }); setShowAdd(false);
  };
  const removeSchool = (id: string) => setSchools((prev) => prev.filter((s) => s.id !== id));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = schools.filter((s) => {
      if (typeFilter !== 'All' && s.type !== typeFilter) return false;
      const flags = [s.grade1Done, s.grade4Done, s.grade7Done, s.grade10Done];
      const done = flags.filter(Boolean).length;
      const progress: ProgressFilter = done === 4 ? 'Complete' : done === 0 ? 'Not started' : 'Partial';
      if (progressFilter !== 'All' && progress !== progressFilter) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    });
    return [...rows].sort((a, b) =>
      sortBy === 'students' ? b.students - a.students
      : sortBy === 'lastVisit' ? b.lastVisit.localeCompare(a.lastVisit)
      : a.name.localeCompare(b.name));
  }, [schools, search, typeFilter, progressFilter, sortBy]);

  const filtersActive = typeFilter !== 'All' || progressFilter !== 'All' || sortBy !== 'name' || Boolean(search);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 p-2.5 ring-1 ring-blue-200 dark:from-blue-950/60 dark:to-indigo-900/40 dark:ring-blue-800">
            <School className="h-6 w-6 text-blue-700 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">Module 04 · School Health</p>
            <h1 className="text-2xl font-bold tracking-tight">School Health &amp; Medical Inspections</h1>
            <p className="text-sm text-muted-foreground">
              Grade 1 · 4 · 7 · 10 medical exams, defects tracking, WASH audits and vaccine campaigns
            </p>
          </div>
        </div>
        <Link href="/dashboard/school/defects">
          <Button className="bg-blue-700 hover:bg-blue-800">
            <Plus className="mr-2 h-4 w-4" /> New defect entry
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users         className="h-5 w-5" />} label="Schools in area"      value="32"  tone="blue"   sub="across the MOH division" />
        <StatCard icon={<TrendingUp    className="h-5 w-5" />} label="Inspected this term" value="18"  tone="green"  sub="56% coverage" />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Defects found"        value="124" tone="amber"  sub="referred for follow-up" />
        <StatCard icon={<Syringe       className="h-5 w-5" />} label="Vaccines administered" value="856" tone="purple" sub="across HPV + aP/dT" />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href} className="group">
            <Card className="overflow-hidden border-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800">
              <div className={`h-1 w-full bg-gradient-to-r ${action.accent}`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg bg-gradient-to-br ${action.accent} p-2 text-white shadow-sm`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {action.code}
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold leading-tight">{action.title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{action.desc}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                  Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Vaccination Info */}
      <div className="grid gap-4 lg:grid-cols-2">
        <VaccineCard
          tone="purple"
          name="HPV vaccine"
          cohort="Girls — Grade 6 — 2 doses (0, 6 months)"
          rows={[
            { label: 'Dose 1', value: '142 / 156', pct: Math.round((142 / 156) * 100) },
            { label: 'Dose 2', value: '128 / 156', pct: Math.round((128 / 156) * 100) },
          ]}
        />
        <VaccineCard
          tone="indigo"
          name="aP / dT vaccine"
          cohort="All students — Grade 7 — 1 dose"
          rows={[
            { label: 'Administered', value: '189 / 203', pct: Math.round((189 / 203) * 100) },
            { label: 'Coverage',     value: '93.1 %',    pct: 93 },
          ]}
        />
      </div>

      {/* Schools Table */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Schools register</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search school name or ID…" className="w-64 pl-9" />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter by school type"
              >
                <option value="All">All types</option>
                <option value="National">National</option>
                <option value="Provincial">Provincial</option>
                <option value="Private">Private</option>
              </select>
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value as ProgressFilter)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter by exam progress"
              >
                <option value="All">All progress</option>
                <option value="Complete">Complete (G1–G10)</option>
                <option value="Partial">Partial</option>
                <option value="Not started">Not started</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Sort schools"
              >
                <option value="name">Sort: Name</option>
                <option value="students">Sort: Students</option>
                <option value="lastVisit">Sort: Last visit</option>
              </select>
              {filtersActive && (
                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setTypeFilter('All'); setProgressFilter('All'); setSortBy('name'); }}>
                  <X className="mr-1 h-3 w-3" /> Clear
                </Button>
              )}
              <Button size="sm" onClick={() => setShowAdd((v) => !v)} className="bg-blue-700 hover:bg-blue-800">
                <Plus className="mr-1 h-3.5 w-3.5" /> Add school
              </Button>
            </div>
          </div>
          {showAdd && (
            <div className="grid gap-2 rounded-lg border border-dashed border-slate-300 p-3 sm:grid-cols-4 dark:border-slate-700">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="School name" className="sm:col-span-2" />
              <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as SchoolRow['type'] })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="National">National</option>
                <option value="Provincial">Provincial</option>
                <option value="Private">Private</option>
              </select>
              <div className="flex gap-2">
                <Input type="number" value={draft.students} onChange={(e) => setDraft({ ...draft, students: e.target.value })} placeholder="Students" />
                <Button onClick={addSchool} className="shrink-0 bg-blue-700 hover:bg-blue-800">Add</Button>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Showing <strong>{filtered.length}</strong> of {schools.length} schools
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4 font-semibold">School</th>
                  <th className="pb-3 pr-4 font-semibold">Type</th>
                  <th className="pb-3 pr-4 font-semibold">Students</th>
                  <th className="pb-3 pr-4 font-semibold">Last visit</th>
                  <th className="pb-3 pr-2 text-center font-semibold">G1</th>
                  <th className="pb-3 pr-2 text-center font-semibold">G4</th>
                  <th className="pb-3 pr-2 text-center font-semibold">G7</th>
                  <th className="pb-3 pr-2 text-center font-semibold">G10</th>
                  <th className="pb-3 text-right font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                      No schools match the current filters.
                    </td>
                  </tr>
                ) : filtered.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-accent/50">
                    <td className="py-3 pr-4">
                      <p className="font-semibold">{s.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{s.id}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {s.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono">{s.students.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{s.lastVisit}</td>
                    {[s.grade1Done, s.grade4Done, s.grade7Done, s.grade10Done].map((done, i) => (
                      <td key={i} className="py-3 pr-2 text-center">
                        {done
                          ? <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
                          : <Circle className="mx-auto h-5 w-5 text-slate-300 dark:text-slate-700" />}
                      </td>
                    ))}
                    <td className="py-3 text-right">
                      <button onClick={() => removeSchool(s.id)} aria-label={`Remove ${s.name}`} title="Remove school" className="rounded p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── helpers ── */

function StatCard({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: 'blue' | 'green' | 'amber' | 'purple' }) {
  const colors = {
    blue:   'border-l-blue-500   bg-blue-50/40   text-blue-700   dark:bg-blue-950/20   dark:text-blue-300',
    green:  'border-l-green-500  bg-green-50/40  text-green-700  dark:bg-green-950/20  dark:text-green-300',
    amber:  'border-l-amber-500  bg-amber-50/40  text-amber-700  dark:bg-amber-950/20  dark:text-amber-300',
    purple: 'border-l-purple-500 bg-purple-50/40 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300',
  } as const;
  return (
    <Card className={`border-l-4 ${colors[tone]}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
            <p className="text-[11px] text-muted-foreground">{sub}</p>
          </div>
          <div className="text-[opacity-60]">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function VaccineCard({ name, cohort, rows, tone }: {
  name: string; cohort: string;
  rows: { label: string; value: string; pct: number }[];
  tone: 'purple' | 'indigo';
}) {
  const accents = {
    purple: { border: 'border-purple-200 dark:border-purple-900/40', bg: 'bg-purple-50/40 dark:bg-purple-950/20', text: 'text-purple-700 dark:text-purple-300', bar: 'bg-purple-500' },
    indigo: { border: 'border-indigo-200 dark:border-indigo-900/40', bg: 'bg-indigo-50/40 dark:bg-indigo-950/20', text: 'text-indigo-700 dark:text-indigo-300', bar: 'bg-indigo-500' },
  } as const;
  const a = accents[tone];
  return (
    <Card className={`border ${a.border} ${a.bg}`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <Syringe className={`h-5 w-5 ${a.text}`} />
          <h3 className={`font-bold ${a.text}`}>{name}</h3>
        </div>
        <p className={`mt-1 text-sm ${a.text} opacity-80`}>{cohort}</p>
        <div className="mt-4 space-y-3">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className={a.text}>{r.label}</span>
                <span className={a.text}>{r.value}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/60 dark:bg-slate-800">
                <div className={`h-full ${a.bar} transition-all duration-700`} style={{ width: `${Math.min(100, r.pct)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
