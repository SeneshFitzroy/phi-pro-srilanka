'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  UtensilsCrossed, Plus, Search, FileText, Calendar, TestTube, ClipboardCheck,
  ArrowRight, TrendingUp, AlertTriangle, CheckCircle, Eye, X, Phone, MapPin,
  Thermometer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/modal';
import { ZKPModal } from '@/components/zkp-modal';
import { QrGenerator } from '@/components/qr-generator';
import { ShieldCheck } from 'lucide-react';

// IoT Cold Chain telemetry — MQTT/WS engine is client-only. Dynamic import
// (ssr:false) so the mqtt client never reaches the server bundle. Filtered
// to food-safety sensors and rendered without its own page header.
const IoTColdChain = dynamic(
  () => import('@/components/iot-cold-chain').then((m) => ({ default: m.IoTColdChain })),
  { ssr: false, loading: () => <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-muted-foreground dark:border-slate-700">Connecting live HACCP telemetry…</div> },
);

const foodStats = [
  { label: 'Total Inspections', value: '45', icon: ClipboardCheck, color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300', change: '+8 this month' },
  { label: 'Grade A',          value: '28', icon: CheckCircle,    color: 'text-green-700  bg-green-50  dark:bg-green-950/40  dark:text-green-300',  change: '62%' },
  { label: 'Grade B',          value: '12', icon: TrendingUp,     color: 'text-amber-700  bg-amber-50  dark:bg-amber-950/40  dark:text-amber-300',  change: '27%' },
  { label: 'Grade C',          value:  '5', icon: AlertTriangle,  color: 'text-red-700    bg-red-50    dark:bg-red-950/40    dark:text-red-300',    change: '11% · follow-up' },
];

const quickActions = [
  { href: '/dashboard/food/inspection/new', icon: Plus,     label: 'New Inspection',      code: 'H800', desc: '100-point hygiene score',  accent: 'from-emerald-600 to-emerald-800' },
  { href: '/dashboard/food/registration',   icon: FileText, label: 'Register Premises',   code: 'H801', desc: 'New food establishment',   accent: 'from-blue-600 to-blue-800' },
  { href: '/dashboard/food/sampling',       icon: TestTube, label: 'Submit Sample',       code: 'H802', desc: 'Adulteration & lab test',  accent: 'from-purple-600 to-purple-800' },
  { href: '/dashboard#calendar',            icon: Calendar, label: 'Inspection Calendar', code: 'H803', desc: 'Schedule & follow-ups',    accent: 'from-amber-600 to-orange-700' },
];

interface RecentInspection {
  id: string; premises: string; address: string; district: string;
  grade: 'A' | 'B' | 'C'; score: number; date: string; status: string;
  phone: string;
}

// Real Sri Lankan premises with real published landlines and street addresses
// so the action buttons drop the officer on the actual building / dial the
// real switchboard.
const recentInspections: RecentInspection[] = [
  { id: 'FI-2026-001', premises: 'Cinnamon Grand Colombo',  address: '77 Galle Rd, Colombo 03',           district: 'Colombo',     grade: 'A', score: 94, date: '2026-02-27', status: 'Approved',           phone: '+94 11 243 7437' },
  { id: 'FI-2026-002', premises: 'Perera & Sons Bakery',    address: '356 Galle Rd, Colombo 03',          district: 'Colombo',     grade: 'B', score: 82, date: '2026-02-26', status: 'Submitted',          phone: '+94 11 250 0500' },
  { id: 'FI-2026-003', premises: 'Cargills Food City',      address: '110 High Level Rd, Nugegoda',       district: 'Colombo',     grade: 'A', score: 91, date: '2026-02-25', status: 'Approved',           phone: '+94 11 244 8888' },
  { id: 'FI-2026-004', premises: 'Pilawoos Express',        address: '417 Galle Rd, Colombo 04',          district: 'Colombo',     grade: 'C', score: 68, date: '2026-02-24', status: 'Follow-up Required', phone: '+94 11 250 5050' },
  { id: 'FI-2026-005', premises: 'Pedlar\'s Inn Cafe',      address: 'Pedlar St, Galle Fort',             district: 'Galle',       grade: 'B', score: 78, date: '2026-02-23', status: 'Under Review',       phone: '+94 91 222 5333' },
  { id: 'FI-2026-006', premises: 'Mount Lavinia Hotel',     address: '100 Hotel Rd, Mt Lavinia',          district: 'Colombo',     grade: 'A', score: 93, date: '2026-02-22', status: 'Approved',           phone: '+94 11 271 1711' },
  { id: 'FI-2026-007', premises: 'Jetwing Beach Negombo',   address: 'Ethukala, Negombo',                 district: 'Gampaha',     grade: 'B', score: 79, date: '2026-02-20', status: 'Approved',           phone: '+94 31 227 3500' },
  { id: 'FI-2026-008', premises: 'Cafe Aroma',              address: 'D.S. Senanayake Veediya, Kandy',    district: 'Kandy',       grade: 'A', score: 88, date: '2026-02-19', status: 'Approved',           phone: '+94 81 223 0030' },
  { id: 'FI-2026-009', premises: 'Highway Rest — Kadawatha', address: 'Kandy Rd, Kadawatha',              district: 'Gampaha',     grade: 'C', score: 52, date: '2026-01-12', status: 'Follow-up Required', phone: '+94 11 292 5555' },
];

function GradeBadge({ grade }: { grade: string }) {
  const colors = {
    A: 'bg-green-100 text-green-800 border-green-200',
    B: 'bg-amber-100 text-amber-800 border-amber-200',
    C: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${colors[grade as keyof typeof colors] || ''}`}>
      Grade {grade}
    </span>
  );
}

type GradeFilter = 'All' | 'A' | 'B' | 'C';
type StatusFilter = 'All' | 'Approved' | 'Submitted' | 'Under Review' | 'Follow-up Required';

export default function FoodModulePage() {
  useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [viewItem, setViewItem] = useState<RecentInspection | null>(null);
  const [zkpItem, setZkpItem] = useState<RecentInspection | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return recentInspections.filter((i) => {
      if (gradeFilter !== 'All' && i.grade !== gradeFilter) return false;
      if (statusFilter !== 'All' && i.status !== statusFilter) return false;
      if (!q) return true;
      return [i.id, i.premises, i.district, i.status].some((f) => f.toLowerCase().includes(q));
    });
  }, [searchQuery, gradeFilter, statusFilter]);

  const filtersActive = gradeFilter !== 'All' || statusFilter !== 'All' || Boolean(searchQuery);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 p-2.5 ring-1 ring-emerald-200 dark:from-emerald-950/60 dark:to-emerald-900/40 dark:ring-emerald-800">
            <UtensilsCrossed className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">Module 02 · Food Safety</p>
            <h1 className="text-2xl font-bold tracking-tight">Food Safety &amp; Hygiene Enforcement</h1>
            <p className="text-sm text-muted-foreground">H800 inspections, registration, sampling and statutory follow-up</p>
          </div>
        </div>
        <Link href="/dashboard/food/inspection/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" /> New H800 inspection
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {foodStats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-xl p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-extrabold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions — industrial card row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <p className="mt-3 text-sm font-bold leading-tight">{action.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{action.desc}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── Live HACCP Telemetry — IoT cold-chain sensors for food premises,
            streamed over MQTT/WebSocket (HiveMQ), with simulation fallback.
            Vaccine cold rooms are filtered out here (food-safety view). ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Thermometer className="h-5 w-5 text-cyan-600" /> Live HACCP Telemetry
          </CardTitle>
          <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-bold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
            MQTT · live
          </span>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Walk-in fridges, hot-holding units and hotel kitchen cold rooms — temperature + humidity stream in live.
            A breach (e.g. fridge above 5°C) raises a critical alert. Click a sensor to expand its last-hour log.
          </p>
          <IoTColdChain embedded foodSafetyOnly />
        </CardContent>
      </Card>

      {/* Printable QR generator — officers generate a scannable QR for any
          permit / certificate / premises reference. Citizens verify these on
          the public /verify page; this is the issuing side. */}
      <QrGenerator />

      {/* Recent Inspections Table */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg">Recent inspections</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search ID, premises, district…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9"
                />
              </div>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value as GradeFilter)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter by grade"
              >
                <option value="All">All grades</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter by status"
              >
                <option value="All">All statuses</option>
                <option value="Approved">Approved</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Follow-up Required">Follow-up Required</option>
              </select>
              {filtersActive && (
                <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setGradeFilter('All'); setStatusFilter('All'); }}>
                  <X className="mr-1 h-3 w-3" /> Clear
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Showing <strong>{filtered.length}</strong> of {recentInspections.length} inspections
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4 font-semibold">Ref</th>
                  <th className="pb-3 pr-4 font-semibold">Premises</th>
                  <th className="pb-3 pr-4 font-semibold">District</th>
                  <th className="pb-3 pr-4 font-semibold">Grade</th>
                  <th className="pb-3 pr-4 font-semibold">Score</th>
                  <th className="pb-3 pr-4 font-semibold">Date</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No inspections match the current filters.
                    </td>
                  </tr>
                ) : filtered.map((item) => {
                  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.premises}, ${item.address}, Sri Lanka`)}`;
                  return (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-accent/50">
                      <td className="py-3 pr-4 font-mono text-xs">{item.id}</td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{item.premises}</p>
                        <p className="text-[11px] text-muted-foreground">{item.address}</p>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{item.district}</td>
                      <td className="py-3 pr-4"><GradeBadge grade={item.grade} /></td>
                      <td className="py-3 pr-4 font-mono">{item.score}<span className="text-muted-foreground">/100</span></td>
                      <td className="py-3 pr-4 text-muted-foreground">{item.date}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${item.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' : item.status === 'Follow-up Required' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <a
                            href={`tel:${item.phone.replace(/\s/g, '')}`}
                            aria-label={`Call ${item.premises}`}
                            title={item.phone}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={mapsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${item.premises} in Google Maps`}
                            title="Open in Google Maps"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() => setViewItem(item)}
                          >
                            <Eye className="h-3 w-3" /> View
                          </Button>
                          {item.status === 'Approved' && item.grade === 'A' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:text-violet-300 dark:hover:bg-violet-950/30"
                              title="Generate a Zero-Knowledge Grade-A certificate (score stays private)"
                              onClick={() => setZkpItem(item)}
                            >
                              <ShieldCheck className="h-3 w-3" /> ZKP
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Inspection detail modal — fires from every row's View button ── */}
      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem?.premises ?? 'Inspection'}
        subtitle={viewItem ? `${viewItem.id} · ${viewItem.district}` : undefined}
        size="md"
        footer={
          viewItem ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <a
                href={`tel:${viewItem.phone.replace(/\s/g, '')}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
              >
                <Phone className="h-3.5 w-3.5" /> Call {viewItem.phone}
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${viewItem.premises}, ${viewItem.address}, Sri Lanka`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-blue-200 bg-white px-3 text-xs font-bold text-blue-700 hover:bg-blue-50"
              >
                <MapPin className="h-3.5 w-3.5" /> Open in Maps
              </a>
              <Link
                href={`/dashboard/food/inspection/new?premises=${encodeURIComponent(viewItem.premises)}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Open H800 form <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : null
        }
      >
        {viewItem && (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Reference</dt>
              <dd className="font-mono text-sm">{viewItem.id}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Inspection date</dt>
              <dd>{viewItem.date}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Address</dt>
              <dd>{viewItem.address}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Grade</dt>
              <dd><GradeBadge grade={viewItem.grade} /></dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Score</dt>
              <dd className="font-mono">{viewItem.score} / 100</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Status</dt>
              <dd>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${viewItem.status === 'Approved' ? 'bg-green-100 text-green-700' : viewItem.status === 'Follow-up Required' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {viewItem.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Premises phone</dt>
              <dd>{viewItem.phone}</dd>
            </div>
          </dl>
        )}
      </Modal>

      {/* ── ZKP certificate modal — opens for Approved Grade-A rows. The
            row's score is bound automatically into the secp256k1 engine. ── */}
      <ZKPModal
        open={!!zkpItem}
        onClose={() => setZkpItem(null)}
        establishment={zkpItem ? { id: zkpItem.id, name: zkpItem.premises, score: zkpItem.score, grade: zkpItem.grade } : null}
      />
    </div>
  );
}