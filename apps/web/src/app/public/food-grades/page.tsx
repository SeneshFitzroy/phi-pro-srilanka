'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Search, Star, MapPin, Clock, ShieldCheck,
  Loader2, AlertCircle, Droplets, Share2, ArrowUpDown, Check, ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MapsExportCard, openInMaps } from '@/components/maps-export-card';

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

const FALLBACK: Premise[] = [
  { id: '1', name: 'Golden Dragon Restaurant', address: '45 Main St, Colombo 07', grade: 'A', score: 92, lastInspection: '2025-01-15', type: 'Restaurant', lat: 6.9100, lng: 79.8612 },
  { id: '2', name: 'Fresh Bakery & Cafe', address: '12 Galle Rd, Dehiwala', grade: 'A', score: 88, lastInspection: '2025-01-10', type: 'Bakery', lat: 6.8500, lng: 79.8675 },
  { id: '3', name: 'City Food Court', address: '78 Kandy Rd, Kaduwela', grade: 'B', score: 72, lastInspection: '2024-12-20', type: 'Food Court', lat: 6.9342, lng: 79.9892 },
  { id: '4', name: 'Sunrise Hotel', address: '200 Beach Rd, Mt. Lavinia', grade: 'A', score: 95, lastInspection: '2025-02-01', type: 'Hotel', lat: 6.8395, lng: 79.8634 },
  { id: '5', name: 'Corner Deli', address: '5 Temple Rd, Nugegoda', grade: 'C', score: 48, lastInspection: '2024-11-25', type: 'Retail', lat: 6.8723, lng: 79.8895 },
  { id: '6', name: 'Highway Rest Stop', address: 'A1 Highway, Kottawa', grade: 'B', score: 65, lastInspection: '2024-12-15', type: 'Restaurant', lat: 6.8404, lng: 79.9580 },
  { id: '7', name: 'Lanka Spice Garden', address: '33 Lake Rd, Kiribathgoda', grade: 'A', score: 90, lastInspection: '2025-01-22', type: 'Restaurant', lat: 6.9764, lng: 79.9311 },
  { id: '8', name: 'Blue Ocean Seafood', address: '17 Harbour View, Negombo', grade: 'B', score: 70, lastInspection: '2025-01-08', type: 'Restaurant', lat: 7.2086, lng: 79.8358 },
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

        {/* Stats summary bar */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3">
            {(['A', 'B', 'C'] as const).map(g => {
              const cfg = gradeCfg[g];
              return (
                <Card key={g} className={`border-2 ${cfg.guideBg} overflow-hidden`}>
                  <CardContent className="p-0">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.guideClass}`} />
                    <div className="flex items-center gap-3 p-4">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 text-3xl font-black ${cfg.badge}`}>
                        {g}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-lg font-bold ${cfg.guideText}`}>{gradeCount(g)}</p>
                        <p className={`text-xs font-semibold ${cfg.guideText}`}>{cfg.label}</p>
                        <p className="text-[10px] text-muted-foreground">{cfg.sub}</p>
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

        {/* Maps export — open in Google/Apple Maps, KML for My Maps, embed iframe */}
        <MapsExportCard premises={filtered} />

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
