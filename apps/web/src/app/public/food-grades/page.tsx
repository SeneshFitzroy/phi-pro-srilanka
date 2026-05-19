'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { LeafletMarker } from '@/components/leaflet-map';
import {
  ArrowLeft, Search, Star, MapPin, Clock, ShieldCheck,
  Loader2, AlertCircle, Droplets, Share2, ArrowUpDown, Check, ExternalLink, Map as MapIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { openInMaps } from '@/components/maps-export-card';

/** Leaflet rendered client-side only. */
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), { ssr: false });

interface Premise {
  id: string;
  name: string;
  address: string;
  grade: string;
  score: number;
  lastInspection: string;
  type: string;
  lat?: number;
  lng?: number;
}

// Real Sri Lankan food premises across the island. Hygiene grades shown here
// are illustrative for the public preview — production grades flow in from
// Firestore via the H800 field-inspection app and overwrite this fallback.
const FALLBACK: Premise[] = [
  // ── Colombo ───────────────────────────────────────────────────────────
  { id: 'col-001', name: 'The Lagoon — Cinnamon Grand',         address: '77 Galle Rd, Colombo 03',          grade: 'A', score: 96, lastInspection: '2026-04-22', type: 'Hotel',      lat: 6.9226, lng: 79.8467 },
  { id: 'col-002', name: 'Ministry of Crab',                    address: 'Old Dutch Hospital, Colombo 01',   grade: 'A', score: 94, lastInspection: '2026-04-18', type: 'Restaurant', lat: 6.9340, lng: 79.8430 },
  { id: 'col-003', name: 'Galle Face Hotel — Sea Spray',        address: '2 Galle Rd, Colombo 03',           grade: 'A', score: 95, lastInspection: '2026-04-10', type: 'Hotel',      lat: 6.9226, lng: 79.8442 },
  { id: 'col-004', name: 'Upali\'s by Nawaloka',                address: '65 Dr C.W.W. Kannangara Mw, Col 7', grade: 'A', score: 91, lastInspection: '2026-03-30', type: 'Restaurant', lat: 6.9101, lng: 79.8643 },
  { id: 'col-005', name: 'Perera & Sons — Kollupitiya',         address: '356 Galle Rd, Colombo 03',         grade: 'B', score: 78, lastInspection: '2026-03-25', type: 'Bakery',     lat: 6.9105, lng: 79.8520 },
  { id: 'col-006', name: 'Pilawoos — Galle Road',               address: '417 Galle Rd, Colombo 04',         grade: 'B', score: 71, lastInspection: '2026-03-12', type: 'Restaurant', lat: 6.8995, lng: 79.8531 },
  { id: 'col-007', name: 'Cafe Kumbuk',                         address: '8/2 Alexandra Pl, Colombo 07',     grade: 'A', score: 89, lastInspection: '2026-04-14', type: 'Restaurant', lat: 6.9078, lng: 79.8718 },
  { id: 'col-008', name: 'Hilton Colombo — Curry Leaf',         address: '2 Sir Chittampalam A Gardiner Mw',  grade: 'A', score: 93, lastInspection: '2026-04-05', type: 'Hotel',      lat: 6.9320, lng: 79.8470 },
  { id: 'col-009', name: 'Crescat Food Court',                  address: '89 Galle Rd, Colombo 03',          grade: 'B', score: 76, lastInspection: '2026-02-28', type: 'Food Court', lat: 6.9156, lng: 79.8497 },
  { id: 'col-010', name: 'Keells Super — Crescat',              address: 'Crescat Boulevard, Colombo 03',    grade: 'A', score: 88, lastInspection: '2026-03-08', type: 'Retail',     lat: 6.9158, lng: 79.8499 },

  // ── Dehiwala / Mt Lavinia / Nugegoda ─────────────────────────────────
  { id: 'sub-001', name: 'Mount Lavinia Hotel — The Terrace',   address: '100 Hotel Rd, Mt Lavinia',         grade: 'A', score: 92, lastInspection: '2026-03-29', type: 'Hotel',      lat: 6.8378, lng: 79.8624 },
  { id: 'sub-002', name: 'Sunday Jazz Cafe',                    address: '20 Galle Rd, Dehiwala',            grade: 'B', score: 74, lastInspection: '2026-02-19', type: 'Restaurant', lat: 6.8500, lng: 79.8675 },
  { id: 'sub-003', name: 'Perera & Sons — Nugegoda',            address: 'Stanley Thilakaratne Mw, Nugegoda', grade: 'A', score: 87, lastInspection: '2026-03-04', type: 'Bakery',     lat: 6.8723, lng: 79.8895 },
  { id: 'sub-004', name: 'Cargills Food City — Nugegoda',       address: '110 High Level Rd, Nugegoda',      grade: 'A', score: 85, lastInspection: '2026-03-19', type: 'Retail',     lat: 6.8717, lng: 79.8893 },
  { id: 'sub-005', name: 'Hela Bojun Hala — Nugegoda',          address: 'Town Hall, Nugegoda',              grade: 'B', score: 72, lastInspection: '2026-02-22', type: 'Food Court', lat: 6.8730, lng: 79.8900 },

  // ── Gampaha / Negombo ────────────────────────────────────────────────
  { id: 'gam-001', name: 'Jetwing Beach — Negombo',             address: 'Ethukala, Negombo',                grade: 'A', score: 93, lastInspection: '2026-04-01', type: 'Hotel',      lat: 7.2202, lng: 79.8390 },
  { id: 'gam-002', name: 'Lords Restaurant',                    address: '80B Porutota Rd, Negombo',         grade: 'A', score: 89, lastInspection: '2026-03-15', type: 'Restaurant', lat: 7.2148, lng: 79.8407 },
  { id: 'gam-003', name: 'Cinnamon Lakeside Pasalai',           address: 'Veyangoda Rd, Gampaha',            grade: 'B', score: 76, lastInspection: '2026-02-10', type: 'Restaurant', lat: 7.0917, lng: 79.9999 },
  { id: 'gam-004', name: 'Highway Rest Stop — Kadawatha',       address: 'Kandy Rd, Kadawatha',              grade: 'C', score: 52, lastInspection: '2026-01-12', type: 'Restaurant', lat: 7.0009, lng: 79.9542 },

  // ── Kalutara ─────────────────────────────────────────────────────────
  { id: 'kal-001', name: 'Avani Bentota — Cinnamon Room',       address: 'Bentota Beach',                    grade: 'A', score: 95, lastInspection: '2026-04-02', type: 'Hotel',      lat: 6.4288, lng: 79.9978 },
  { id: 'kal-002', name: 'Diyamba Beach Resort',                address: 'Kalutara South',                   grade: 'B', score: 78, lastInspection: '2026-03-03', type: 'Hotel',      lat: 6.5854, lng: 79.9607 },

  // ── Kandy / Matale / Nuwara Eliya ───────────────────────────────────
  { id: 'cen-001', name: 'Kandy Muslim Hotel',                  address: 'Dalada Veediya, Kandy',            grade: 'B', score: 75, lastInspection: '2026-03-12', type: 'Restaurant', lat: 7.2906, lng: 80.6337 },
  { id: 'cen-002', name: 'Cafe Aroma',                          address: 'D.S. Senanayake Veediya, Kandy',   grade: 'A', score: 88, lastInspection: '2026-04-08', type: 'Restaurant', lat: 7.2932, lng: 80.6411 },
  { id: 'cen-003', name: 'Earl\'s Regency Buffet',              address: 'Tennekumbura, Kandy',              grade: 'A', score: 94, lastInspection: '2026-03-28', type: 'Hotel',      lat: 7.2774, lng: 80.6669 },
  { id: 'cen-004', name: 'Heritance Tea Factory',               address: 'Kandapola, Nuwara Eliya',          grade: 'A', score: 92, lastInspection: '2026-02-28', type: 'Hotel',      lat: 6.9650, lng: 80.8050 },

  // ── Galle / Matara ───────────────────────────────────────────────────
  { id: 'sou-001', name: 'Pedlar\'s Inn',                       address: 'Pedlar St, Galle Fort',            grade: 'A', score: 90, lastInspection: '2026-04-20', type: 'Restaurant', lat: 6.0257, lng: 80.2178 },
  { id: 'sou-002', name: 'Amangalla — Galle',                   address: '10 Church St, Galle Fort',         grade: 'A', score: 96, lastInspection: '2026-04-05', type: 'Hotel',      lat: 6.0256, lng: 80.2179 },
  { id: 'sou-003', name: 'Cafe Punto — Matara',                 address: 'Tangalle Rd, Matara',              grade: 'B', score: 73, lastInspection: '2026-02-18', type: 'Restaurant', lat: 5.9485, lng: 80.5353 },

  // ── Hambantota ───────────────────────────────────────────────────────
  { id: 'ham-001', name: 'Shangri-La Hambantota Buffet',        address: 'Yala Rd, Hambantota',              grade: 'A', score: 95, lastInspection: '2026-03-22', type: 'Hotel',      lat: 6.1700, lng: 81.0900 },

  // ── Jaffna ───────────────────────────────────────────────────────────
  { id: 'jaf-001', name: 'Mangos Restaurant — Jaffna',          address: 'Temple Rd, Jaffna',                grade: 'B', score: 79, lastInspection: '2026-03-14', type: 'Restaurant', lat: 9.6615, lng: 80.0255 },
  { id: 'jaf-002', name: 'Jetwing Jaffna — Cinnamon Room',      address: 'Mahatma Gandhi Rd, Jaffna',        grade: 'A', score: 91, lastInspection: '2026-04-11', type: 'Hotel',      lat: 9.6610, lng: 80.0220 },

  // ── Batticaloa / Trincomalee ────────────────────────────────────────
  { id: 'eas-001', name: 'Trinco Blu by Cinnamon',              address: 'Uppuveli, Trincomalee',            grade: 'A', score: 89, lastInspection: '2026-03-17', type: 'Hotel',      lat: 8.6080, lng: 81.2280 },
  { id: 'eas-002', name: 'Riviera Resort — Batticaloa',         address: 'Lady Manning Dr, Batticaloa',      grade: 'B', score: 74, lastInspection: '2026-02-25', type: 'Hotel',      lat: 7.7170, lng: 81.7000 },
];

// Known coordinates for the seeded premises — used to enrich Firestore docs that
// were seeded before lat/lng was added. Matched by exact `name`. Field officers
// capturing GPS on the H800 form will overwrite these with real values.
const KNOWN_COORDS: Record<string, { lat: number; lng: number }> = {
  'Golden Dragon Restaurant':  { lat: 6.9100, lng: 79.8612 },
  'Fresh Bakery & Cafe':        { lat: 6.8500, lng: 79.8675 },
  'City Food Court':            { lat: 6.9342, lng: 79.9892 },
  'Sunrise Hotel':              { lat: 6.8395, lng: 79.8634 },
  'Corner Deli':                { lat: 6.8723, lng: 79.8895 },
  'Highway Rest Stop':          { lat: 6.8404, lng: 79.9580 },
  'Royal Colombo Cafe':         { lat: 6.9077, lng: 79.8512 },
  'Mango Tree Eatery':          { lat: 6.8500, lng: 79.9237 },
  'Blue Ocean Seafood':         { lat: 7.2086, lng: 79.8358 },
  'Lanka Spice Garden':         { lat: 6.9764, lng: 79.9311 },
  'Star Buns Bakery':           { lat: 6.9170, lng: 79.8758 },
  'Perera & Sons Supermarket':  { lat: 6.9893, lng: 79.8918 },
};

const gradeCfg = {
  A: {
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
    cardBorder: 'border-l-emerald-400',
    label: 'Excellent',
    sub: '≥ 75% hygiene score',
    guideClass: 'from-emerald-500 to-emerald-600',
    guideBg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800',
    guideText: 'text-emerald-800 dark:text-emerald-300',
  },
  B: {
    bar: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
    cardBorder: 'border-l-amber-400',
    label: 'Satisfactory',
    sub: '50–74% hygiene score',
    guideClass: 'from-amber-500 to-amber-600',
    guideBg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800',
    guideText: 'text-amber-800 dark:text-amber-300',
  },
  C: {
    bar: 'bg-red-500',
    badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300',
    cardBorder: 'border-l-red-400',
    label: 'Needs Improvement',
    sub: '< 50% hygiene score',
    guideClass: 'from-red-500 to-red-600',
    guideBg: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800',
    guideText: 'text-red-800 dark:text-red-300',
  },
};

const TYPES = ['All', 'Restaurant', 'Bakery', 'Hotel', 'Retail', 'Food Court'];
type SortMode = 'score_desc' | 'name_asc' | 'date_desc';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function FoodGradesPage() {
  const [data, setData] = useState<Premise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [sortMode, setSortMode] = useState<SortMode>('score_desc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'food_grades'), orderBy('name'))
        );
        if (!snap.empty) {
          // Enrich each doc with known coords if Firestore copy lacks lat/lng
          setData(snap.docs.map((d) => {
            const raw = { id: d.id, ...d.data() } as Premise;
            if (raw.lat == null || raw.lng == null) {
              const k = KNOWN_COORDS[raw.name];
              if (k) return { ...raw, lat: k.lat, lng: k.lng };
            }
            return raw;
          }));
        } else {
          setData(FALLBACK);
        }
      } catch {
        setData(FALLBACK);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = data.filter(r => {
    const q = searchQ.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q);
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    const matchGrade = gradeFilter === 'All' || r.grade === gradeFilter;
    return matchQ && matchType && matchGrade;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'score_desc') return b.score - a.score;
    if (sortMode === 'name_asc') return a.name.localeCompare(b.name);
    if (sortMode === 'date_desc') return new Date(b.lastInspection).getTime() - new Date(a.lastInspection).getTime();
    return 0;
  });

  const gradeCount = (g: string) => data.filter(r => r.grade === g).length;

  const handleShare = useCallback((r: Premise) => {
    const text = `${r.name} — Grade ${r.grade} (${r.score}%) | ${r.address} | PHI-PRO Food Hygiene`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(r.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />Food Hygiene Grades
            </h1>
            <p className="text-sm text-muted-foreground">
              Official H800-certified hygiene grades for food establishments
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 dark:bg-emerald-950/30 dark:border-emerald-800">
            <Droplets className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">PHI Certified</span>
          </div>
        </div>

        {/* Live national map — every premises pinned, coloured by grade */}
        <LiveFoodGradeMap premises={sorted} loading={loading} />

        {/* Stats summary bar — three cards in one row, content stacks on
            mobile so each card stays narrow enough that '50–74% hygiene
            score' doesn't overflow with a tiny font. */}
        {!loading && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(['A', 'B', 'C'] as const).map(g => {
              const cfg = gradeCfg[g];
              return (
                <Card key={g} className={`border-2 ${cfg.guideBg} overflow-hidden`}>
                  <CardContent className="p-0">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.guideClass}`} />
                    <div className="flex flex-col items-center gap-1 p-2.5 text-center sm:flex-row sm:items-center sm:gap-3 sm:p-4 sm:text-left">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 text-xl font-black sm:h-14 sm:w-14 sm:text-3xl ${cfg.badge}`}>
                        {g}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-base font-bold sm:text-lg ${cfg.guideText}`}>{gradeCount(g)}</p>
                        <p className={`text-[10px] font-semibold leading-tight sm:text-xs ${cfg.guideText}`}>{cfg.label}</p>
                        <p className="text-[9px] leading-tight text-muted-foreground sm:text-[10px]">{cfg.sub}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name or address…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={sortMode}
              onChange={e => setSortMode(e.target.value as SortMode)}
            >
              <option value="score_desc">Sort: Score (High→Low)</option>
              <option value="name_asc">Sort: Name (A→Z)</option>
              <option value="date_desc">Sort: Date (Recent)</option>
            </select>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm text-muted-foreground">Loading establishments…</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{sorted.length}</span> establishment{sorted.length !== 1 ? 's' : ''} found
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUpDown className="h-3 w-3" />
                {sortMode === 'score_desc' ? 'By Score' : sortMode === 'name_asc' ? 'A→Z' : 'By Date'}
              </div>
            </div>

            {sorted.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/20" />
                  <p className="mt-3 font-semibold text-muted-foreground">No results found</p>
                  <p className="text-sm text-muted-foreground/70">Try a different name, address, or filter</p>
                </CardContent>
              </Card>
            ) : (
              sorted.map(r => {
                const cfg = gradeCfg[r.grade as keyof typeof gradeCfg] ?? gradeCfg.C;
                const stars = Math.round(r.score / 20);
                const isCopied = copiedId === r.id;
                return (
                  <Card key={r.id} className={`overflow-hidden shadow-sm border-l-4 ${cfg.cardBorder} transition-all hover:shadow-md`}>
                    {/* Score progress bar */}
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full ${cfg.bar} transition-all duration-700`} style={{ width: `${r.score}%` }} />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Grade badge - large & prominent */}
                        <div className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl border-2 shadow-sm ${cfg.badge}`}>
                          <span className="text-4xl font-black leading-none">{r.grade}</span>
                          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider opacity-70">Grade</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold leading-snug">{r.name}</h3>
                            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {r.type}
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.address}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Inspected {formatDate(r.lastInspection)}</span>
                          </div>
                          {/* Score bar inside card */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3.5 w-3.5 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
                                ))}
                              </div>
                              <span className="text-base font-bold">{r.score}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                              <div
                                className={`h-full rounded-full ${cfg.bar} transition-all duration-700`}
                                style={{ width: `${r.score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="mt-3 flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-blue-700 dark:hover:text-blue-300"
                          onClick={() => openInMaps({ lat: r.lat, lng: r.lng, address: r.address, name: r.name })}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open in Maps
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleShare(r)}
                        >
                          {isCopied ? (
                            <><Check className="mr-1.5 h-3 w-3 text-green-600" /><span className="text-green-600">Copied!</span></>
                          ) : (
                            <><Share2 className="mr-1.5 h-3 w-3" />Share</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Source note */}
        <Card className="border-0 bg-slate-50 shadow-sm dark:bg-slate-900/50">
          <CardContent className="flex items-start gap-3 p-4">
            <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <p className="text-xs text-muted-foreground">
              Grades are issued by authorised Public Health Inspectors under the H800 certification framework.
              Data is updated after each official inspection. For inquiries call <strong className="text-foreground">1390</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────── live national map ──────────────── */

function LiveFoodGradeMap({ premises, loading }: { premises: Premise[]; loading: boolean }) {
  const pinned = useMemo(
    () => premises.filter((p): p is Premise & { lat: number; lng: number } => p.lat != null && p.lng != null),
    [premises],
  );

  const markers: LeafletMarker[] = useMemo(
    () => pinned.map((p) => ({
      id: p.id,
      position: { lat: p.lat, lng: p.lng },
      color: p.grade === 'A' ? 'emerald' : p.grade === 'B' ? 'amber' : 'rose',
      label: p.grade,
      popup: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-slate-900">{p.name}</p>
          <p className="text-[11px] text-slate-500">{p.address}</p>
          <p className="text-[11px]">
            <span className="font-bold">Grade {p.grade}</span> · {p.score}% · {p.type}
          </p>
          <button
            type="button"
            onClick={() => openInMaps({ lat: p.lat, lng: p.lng, address: p.address, name: p.name })}
            className="mt-1 flex w-full items-center justify-center gap-1 rounded-md bg-emerald-700 px-2 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-800"
          >
            <ExternalLink className="h-3 w-3" /> Open in Google Maps
          </button>
        </div>
      ),
    })),
    [pinned],
  );

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <MapIcon className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Live national map — {pinned.length} graded premises
          </h2>
          <div className="ml-auto flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />A</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />B</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />C</span>
          </div>
        </div>
        {loading
          ? (
            <div className="flex h-[26rem] items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-500 dark:border-slate-700">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading map…
            </div>
          )
          : <LeafletMap markers={markers} fitToMarkers height="26rem" />}
      </CardContent>
    </Card>
  );
}
