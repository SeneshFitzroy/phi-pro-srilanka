'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Search, Clock, MapPin, Eye, Sparkles, ArrowUpDown, Image as ImageIcon, ShieldCheck, Radio } from 'lucide-react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/modal';
import { cn } from '@/lib/utils';
import { analyseComplaint, priorityRank, type TriagePriority } from '@/lib/sentiment';
import { LiveChatsPanel } from '@/components/live-chats-panel';
import { MessageSquare } from 'lucide-react';

interface Complaint {
  id: string;
  type: string;
  desc: string;
  location: string;
  area: string;
  reporter: string;
  date: string;
  status: string;
  priority: string;
  assigned: string;
  // Live (real public submission) extras
  isLive?: boolean;
  nicNumber?: string;
  nicPhotoUrl?: string | null;
  selfieUrl?: string | null;
  photoUrls?: string[];
  videoUrls?: string[];
}

// Demo rows — shown alongside real submissions so the queue is never empty
// during a walkthrough. Real public_complaints from Firestore sort to the top.
const SAMPLE_COMPLAINTS: Complaint[] = [
  { id: 'CMP-10234521', type: 'Food Safety Concern', desc: 'Cockroaches observed in kitchen area of restaurant. Unhygienic food handling practices.', location: '45 Main St, Colombo 07', area: 'Colombo North', reporter: 'Anonymous', date: '2025-02-10', status: 'new', priority: 'high', assigned: '-' },
  { id: 'CMP-10234520', type: 'Mosquito Breeding', desc: 'Stagnant water in abandoned construction site, many mosquito larvae visible.', location: '78 Temple Rd, Nugegoda', area: 'Nugegoda', reporter: 'R. Silva — 077-1234567', date: '2025-02-09', status: 'assigned', priority: 'high', assigned: 'K. Perera' },
  { id: 'CMP-10234519', type: 'Garbage Dumping', desc: 'Illegal garbage dumping near canal. Attracting rats and producing foul smell.', location: 'Canal Rd, Dehiwala', area: 'Dehiwala West', reporter: 'M. Fernando — m.f@email.com', date: '2025-02-09', status: 'investigating', priority: 'medium', assigned: 'R. Fernando' },
  { id: 'CMP-10234518', type: 'Water Contamination', desc: 'Well water has unusual color and smell after nearby factory started operations.', location: '23 Factory Ln, Homagama', area: 'Homagama', reporter: 'A. Bandara — 070-9876543', date: '2025-02-08', status: 'investigating', priority: 'high', assigned: 'A. Bandara' },
  { id: 'CMP-10234517', type: 'Unsanitary Premises', desc: 'Public toilet near bus stand in very poor condition. No water supply, broken doors.', location: 'Bus Stand, Moratuwa', area: 'Moratuwa', reporter: 'Anonymous', date: '2025-02-07', status: 'resolved', priority: 'low', assigned: 'S. Jayawardena' },
];

// Shape of a public_complaints Firestore doc (only the fields we read).
interface RawComplaint {
  trackingId?: string;
  type?: string;
  description?: string;
  location?: string;
  district?: string;
  gnDivision?: string | null;
  contactName?: string | null;
  contactInfo?: string | null;
  status?: string;
  assignedTo?: string | null;
  createdAt?: { toDate?: () => Date };
  identity?: { nicNumber?: string; nicPhotoUrl?: string | null; selfieUrl?: string | null };
  media?: { photoUrls?: string[]; videoUrls?: string[] };
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  assigned: 'bg-yellow-100 text-yellow-700',
  investigating: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
};

const triageBadge: Record<TriagePriority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
};

type ComplaintWithTriage = Complaint & { triage: ReturnType<typeof analyseComplaint> };

export function ComplaintsManager({ embedded = false }: { embedded?: boolean } = {}) {
  const [filter, setFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [sortBy, setSortBy] = useState<'triage' | 'date' | 'status'>('triage');
  const [viewItem, setViewItem] = useState<ComplaintWithTriage | null>(null);
  const [liveComplaints, setLiveComplaints] = useState<Complaint[]>([]);
  const [view, setView] = useState<'complaints' | 'chats'>('complaints');

  // Real-time feed of public submissions. Every complaint filed at
  // /public/complaints lands here instantly with its full data + media URLs.
  useEffect(() => {
    const q = query(collection(db, 'public_complaints'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Complaint[] = snap.docs.map((d) => {
          const x = d.data() as RawComplaint;
          const created = x.createdAt?.toDate ? x.createdAt.toDate() : null;
          const name = x.contactName || (x.contactInfo ? 'Reporter' : '');
          return {
            id: x.trackingId || d.id,
            type: x.type || 'Complaint',
            desc: x.description || '',
            location: [x.location, x.district].filter(Boolean).join(', '),
            area: x.gnDivision || x.district || '—',
            reporter: name ? `${name}${x.contactInfo ? ' — ' + x.contactInfo : ''}` : 'Anonymous',
            date: created ? created.toISOString().slice(0, 10) : '—',
            status: x.status === 'pending' ? 'new' : (x.status || 'new'),
            priority: 'medium',
            assigned: x.assignedTo || '-',
            isLive: true,
            nicNumber: x.identity?.nicNumber,
            nicPhotoUrl: x.identity?.nicPhotoUrl ?? null,
            selfieUrl: x.identity?.selfieUrl ?? null,
            photoUrls: x.media?.photoUrls ?? [],
            videoUrls: x.media?.videoUrls ?? [],
          };
        });
        setLiveComplaints(rows);
      },
      (err) => console.warn('[complaints] live read failed (showing samples):', err),
    );
    return () => unsub();
  }, []);

  // Real submissions first, demo rows after.
  const allComplaints = useMemo(() => [...liveComplaints, ...SAMPLE_COMPLAINTS], [liveComplaints]);

  // AI triage: negativity + urgency of the wording → suggested queue priority.
  const withTriage = useMemo(
    () => allComplaints.map((c) => ({ ...c, triage: analyseComplaint(`${c.type}. ${c.desc}`) })),
    [allComplaints],
  );

  const filtered = useMemo(() => {
    const rows = withTriage.filter((c) => {
      const matchStatus = filter === 'all' || c.status === filter;
      const matchSearch = !searchQ || c.desc.toLowerCase().includes(searchQ.toLowerCase()) || c.id.toLowerCase().includes(searchQ.toLowerCase());
      return matchStatus && matchSearch;
    });
    if (sortBy === 'triage') return [...rows].sort((a, b) => priorityRank[a.triage.priority] - priorityRank[b.triage.priority] || a.triage.score - b.triage.score);
    if (sortBy === 'date') return [...rows].sort((a, b) => b.date.localeCompare(a.date));
    return [...rows].sort((a, b) => a.status.localeCompare(b.status));
  }, [withTriage, filter, searchQ, sortBy]);

  const aiHigh = withTriage.filter((c) => c.triage.priority === 'high').length;
  const liveCount = liveComplaints.length;

  return (
    <div className="space-y-6">
      {/* Header — hidden when embedded inside the Administration tabs */}
      <div className={cn('flex items-center justify-between', embedded && 'hidden')}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-orange-500" />Complaints Management</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">{allComplaints.length} total · <Sparkles className="h-3 w-3 text-violet-500" /><span className="text-violet-600 dark:text-violet-400 font-medium">{aiHigh} flagged high-priority by AI triage</span></p>
          </div>
        </div>
      </div>

      {/* Section toggle — Complaints vs Live chats (separate filter section) */}
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
        <button onClick={() => setView('complaints')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${view === 'complaints' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}><AlertTriangle className="h-3.5 w-3.5" /> Complaints</button>
        <button onClick={() => setView('chats')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${view === 'chats' ? 'bg-white text-violet-700 shadow-sm dark:bg-slate-900 dark:text-violet-300' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}><MessageSquare className="h-3.5 w-3.5" /> Live chats</button>
      </div>

      {view === 'chats' ? <LiveChatsPanel /> : (
      <>
      {/* Live feed indicator */}
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
        <Radio className="h-3.5 w-3.5 animate-pulse" />
        Live — {liveCount} public {liveCount === 1 ? 'submission' : 'submissions'} from the citizen portal{liveCount === 0 ? ' yet (new complaints appear here instantly)' : ''}.
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'New', count: allComplaints.filter((c) => c.status === 'new').length, color: 'text-blue-500' },
          { label: 'Assigned', count: allComplaints.filter((c) => c.status === 'assigned').length, color: 'text-yellow-500' },
          { label: 'Investigating', count: allComplaints.filter((c) => c.status === 'investigating').length, color: 'text-purple-500' },
          { label: 'Resolved', count: allComplaints.filter((c) => c.status === 'resolved').length, color: 'text-green-500' },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4"><p className={`text-xl font-bold ${s.color}`}>{s.count}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search complaints..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'new', 'assigned', 'investigating', 'resolved'].map((f) => (
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
        {filtered.map((complaint) => {
          const mediaCount = (complaint.photoUrls?.length ?? 0) + (complaint.videoUrls?.length ?? 0);
          return (
            <Card key={complaint.id} className={complaint.triage.priority === 'high' ? 'border-l-4 border-l-red-500' : complaint.triage.priority === 'medium' ? 'border-l-4 border-l-amber-400' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{complaint.id}</span>
                      {complaint.isLive && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Radio className="h-2.5 w-2.5" /> Public</span>}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[complaint.status]}`}>{complaint.status}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${triageBadge[complaint.triage.priority]}`} title={`Negativity ${complaint.triage.score} · urgency ${complaint.triage.urgency}`}>
                        <Sparkles className="h-3 w-3" /> AI: {complaint.triage.priority}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{complaint.type}</p>
                    <p className="text-sm text-muted-foreground">{complaint.desc}</p>
                    {complaint.triage.terms.length > 0 && (
                      <p className="text-[11px] text-muted-foreground">triage cues: {complaint.triage.terms.map((t) => <span key={t} className="mr-1 rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">{t}</span>)}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{complaint.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{complaint.date}</span>
                      {mediaCount > 0 && <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400"><ImageIcon className="h-3 w-3" />{mediaCount} attachment{mediaCount === 1 ? '' : 's'}</span>}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setViewItem(complaint)}>
                    <Eye className="mr-1 h-3 w-3" />View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      </>
      )}

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
              {viewItem.isLive && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Radio className="h-3 w-3" /> Public submission</span>}
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[viewItem.status]}`}>{viewItem.status}</span>
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
                <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Tracking reference</dt>
                <dd className="font-mono">{viewItem.id}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Date filed</dt>
                <dd>{viewItem.date}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Reported by</dt>
                <dd>{viewItem.reporter}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Assigned officer</dt>
                <dd>{viewItem.assigned === '-' ? <span className="text-slate-400 italic">Not assigned</span> : viewItem.assigned}</dd>
              </div>
              <div className="sm:col-span-2">
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

            {/* Evidence photos */}
            {viewItem.photoUrls && viewItem.photoUrls.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  <ImageIcon className="h-3.5 w-3.5" /> Evidence photos ({viewItem.photoUrls.length})
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {viewItem.photoUrls.map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
                      {/* eslint-disable-next-line @next/next/no-img-element -- remote Storage URL preview */}
                      <img src={u} alt={`Evidence ${i + 1}`} className="h-24 w-full object-cover transition hover:scale-105" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Video evidence */}
            {viewItem.videoUrls && viewItem.videoUrls.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Video evidence ({viewItem.videoUrls.length})</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {viewItem.videoUrls.map((u, i) => (
                    <video key={i} src={u} controls className="w-full rounded-md border border-slate-200 dark:border-slate-700" />
                  ))}
                </div>
              </div>
            )}

            {/* Identity verification — PHI-only, never published */}
            {viewItem.isLive && (viewItem.nicNumber || viewItem.nicPhotoUrl || viewItem.selfieUrl) && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-900 dark:bg-emerald-950/10">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> Identity verification
                </p>
                {viewItem.nicNumber && (
                  <p className="mt-2 text-xs"><span className="font-semibold">NIC number:</span> <span className="font-mono">{viewItem.nicNumber}</span></p>
                )}
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {viewItem.nicPhotoUrl && (
                    <a href={viewItem.nicPhotoUrl} target="_blank" rel="noopener noreferrer">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">NIC card</p>
                      {/* eslint-disable-next-line @next/next/no-img-element -- remote Storage URL preview */}
                      <img src={viewItem.nicPhotoUrl} alt="NIC card" className="aspect-[1.6/1] w-full rounded border border-slate-200 object-cover dark:border-slate-700" />
                    </a>
                  )}
                  {viewItem.selfieUrl && (
                    <a href={viewItem.selfieUrl} target="_blank" rel="noopener noreferrer">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Live selfie</p>
                      {/* eslint-disable-next-line @next/next/no-img-element -- remote Storage URL preview */}
                      <img src={viewItem.selfieUrl} alt="Reporter selfie" className="aspect-square w-full rounded border border-slate-200 object-cover dark:border-slate-700" />
                    </a>
                  )}
                </div>
                <p className="mt-2 text-[10px] text-emerald-700/70 dark:text-emerald-300/60">Shown to the receiving PHI office only — never published.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
