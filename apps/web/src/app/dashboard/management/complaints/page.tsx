'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Search, Clock, MapPin, Eye, Sparkles, ArrowUpDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/modal';
import { analyseComplaint, priorityRank, type TriagePriority } from '@/lib/sentiment';

const COMPLAINTS = [
  { id: 'CMP-10234521', type: 'Food Safety Concern', desc: 'Cockroaches observed in kitchen area of restaurant. Unhygienic food handling practices.', location: '45 Main St, Colombo 07', area: 'Colombo North', reporter: 'Anonymous', date: '2025-02-10', status: 'new', priority: 'high', assigned: '-' },
  { id: 'CMP-10234520', type: 'Mosquito Breeding', desc: 'Stagnant water in abandoned construction site, many mosquito larvae visible.', location: '78 Temple Rd, Nugegoda', area: 'Nugegoda', reporter: 'R. Silva — 077-1234567', date: '2025-02-09', status: 'assigned', priority: 'high', assigned: 'K. Perera' },
  { id: 'CMP-10234519', type: 'Garbage Dumping', desc: 'Illegal garbage dumping near canal. Attracting rats and producing foul smell.', location: 'Canal Rd, Dehiwala', area: 'Dehiwala West', reporter: 'M. Fernando — m.f@email.com', date: '2025-02-09', status: 'investigating', priority: 'medium', assigned: 'R. Fernando' },
  { id: 'CMP-10234518', type: 'Water Contamination', desc: 'Well water has unusual color and smell after nearby factory started operations.', location: '23 Factory Ln, Homagama', area: 'Homagama', reporter: 'A. Bandara — 070-9876543', date: '2025-02-08', status: 'investigating', priority: 'high', assigned: 'A. Bandara' },
  { id: 'CMP-10234517', type: 'Unsanitary Premises', desc: 'Public toilet near bus stand in very poor condition. No water supply, broken doors.', location: 'Bus Stand, Moratuwa', area: 'Moratuwa', reporter: 'Anonymous', date: '2025-02-07', status: 'resolved', priority: 'low', assigned: 'S. Jayawardena' },
];

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  assigned: 'bg-yellow-100 text-yellow-700',
  investigating: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

const triageBadge: Record<TriagePriority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
};

type Complaint = (typeof COMPLAINTS)[number];
type ComplaintWithTriage = Complaint & { triage: ReturnType<typeof analyseComplaint> };

export default function ComplaintsManagementPage() {
  const [filter, setFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [sortBy, setSortBy] = useState<'triage' | 'date' | 'status'>('triage');
  const [viewItem, setViewItem] = useState<ComplaintWithTriage | null>(null);

  // AI triage: negativity + urgency of the wording → suggested queue priority.
  const withTriage = useMemo(
    () => COMPLAINTS.map(c => ({ ...c, triage: analyseComplaint(`${c.type}. ${c.desc}`) })),
    [],
  );

  const filtered = useMemo(() => {
    const rows = withTriage.filter(c => {
      const matchStatus = filter === 'all' || c.status === filter;
      const matchSearch = !searchQ || c.desc.toLowerCase().includes(searchQ.toLowerCase()) || c.id.toLowerCase().includes(searchQ.toLowerCase());
      return matchStatus && matchSearch;
    });
    if (sortBy === 'triage') return [...rows].sort((a, b) => priorityRank[a.triage.priority] - priorityRank[b.triage.priority] || a.triage.score - b.triage.score);
    if (sortBy === 'date') return [...rows].sort((a, b) => b.date.localeCompare(a.date));
    return [...rows].sort((a, b) => a.status.localeCompare(b.status));
  }, [withTriage, filter, searchQ, sortBy]);

  const aiHigh = withTriage.filter(c => c.triage.priority === 'high').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-orange-500" />Complaints Management</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">{COMPLAINTS.length} total · <Sparkles className="h-3 w-3 text-violet-500" /><span className="text-violet-600 dark:text-violet-400 font-medium">{aiHigh} flagged high-priority by AI triage</span></p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'New', count: COMPLAINTS.filter(c => c.status === 'new').length, color: 'text-blue-500' },
          { label: 'Assigned', count: COMPLAINTS.filter(c => c.status === 'assigned').length, color: 'text-yellow-500' },
          { label: 'Investigating', count: COMPLAINTS.filter(c => c.status === 'investigating').length, color: 'text-purple-500' },
          { label: 'Resolved', count: COMPLAINTS.filter(c => c.status === 'resolved').length, color: 'text-green-500' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4"><p className={`text-xl font-bold ${s.color}`}>{s.count}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search complaints..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'new', 'assigned', 'investigating', 'resolved'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize text-xs">{f}</Button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ArrowUpDown className="h-3.5 w-3.5" /> Sort by:
        {([['triage', 'AI priority'], ['date', 'Newest'], ['status', 'Status']] as const).map(([k, lbl]) => (
          <button key={k} onClick={() => setSortBy(k)} className={`rounded-full px-2.5 py-0.5 font-semibold ${sortBy === k ? 'bg-violet-600 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800'}`}>{lbl}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(complaint => (
          <Card key={complaint.id} className={complaint.triage.priority === 'high' ? 'border-l-4 border-l-red-500' : complaint.triage.priority === 'medium' ? 'border-l-4 border-l-amber-400' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{complaint.id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[complaint.status]}`}>{complaint.status}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[complaint.priority]}`}>{complaint.priority}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${triageBadge[complaint.triage.priority]}`} title={`Negativity ${complaint.triage.score} · urgency ${complaint.triage.urgency}`}>
                      <Sparkles className="h-3 w-3" /> AI: {complaint.triage.priority}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{complaint.type}</p>
                  <p className="text-sm text-muted-foreground">{complaint.desc}</p>
                  {complaint.triage.terms.length > 0 && (
                    <p className="text-[11px] text-muted-foreground">triage cues: {complaint.triage.terms.map(t => <span key={t} className="mr-1 rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">{t}</span>)}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{complaint.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{complaint.date}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setViewItem(complaint)}>
                  <Eye className="mr-1 h-3 w-3" />View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Complaint detail modal — fires from every row's View button ── */}
      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem?.type ?? 'Complaint'}
        subtitle={viewItem ? `${viewItem.id} · ${viewItem.area}` : undefined}
        size="md"
        footer={
          viewItem ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {/^[A-Za-z]/.test(viewItem.reporter) && viewItem.reporter.includes(' — ') && (() => {
                const contact = viewItem.reporter.split(' — ')[1] ?? '';
                const href = contact.includes('@') ? `mailto:${contact}` : `tel:${contact.replace(/[^\d+]/g, '')}`;
                return (
                  <a href={href} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-blue-200 bg-white px-3 text-xs font-bold text-blue-700 hover:bg-blue-50">
                    Contact reporter
                  </a>
                );
              })()}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${viewItem.location}, Sri Lanka`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <MapPin className="h-3.5 w-3.5" /> Open location
              </a>
            </div>
          ) : null
        }
      >
        {viewItem && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[viewItem.status]}`}>{viewItem.status}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[viewItem.priority]}`}>{viewItem.priority} priority</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${triageBadge[viewItem.triage.priority]}`}>
                <Sparkles className="h-3 w-3" /> AI triage: {viewItem.triage.priority}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Description</p>
              <p className="mt-1">{viewItem.desc}</p>
            </div>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Reported by</dt>
                <dd>{viewItem.reporter}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Date filed</dt>
                <dd>{viewItem.date}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Assigned officer</dt>
                <dd>{viewItem.assigned === '-' ? <span className="text-slate-400 italic">Not assigned</span> : viewItem.assigned}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Location</dt>
                <dd>{viewItem.location}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">AI triage detail</dt>
                <dd className="mt-1 rounded-md border border-violet-100 bg-violet-50/60 px-3 py-2 text-xs text-violet-900 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200">
                  Negativity score {viewItem.triage.score} · urgency {viewItem.triage.urgency}
                  {viewItem.triage.terms.length > 0 && (
                    <>
                      {' · '}cues:{' '}
                      {viewItem.triage.terms.map((t) => (
                        <span key={t} className="mr-1 rounded bg-white/70 px-1.5 py-0.5 dark:bg-violet-900/40">{t}</span>
                      ))}
                    </>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}