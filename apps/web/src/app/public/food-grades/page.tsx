'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { LeafletMarker } from '@/components/leaflet-map';
import {
  ArrowLeft, Search, Star, MapPin, Clock, ShieldCheck,
  Loader2, AlertCircle, Droplets, ArrowUpDown, ExternalLink,
  Phone, User as UserIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { openInMaps } from '@/components/maps-export-card';
import { ShareButton } from '@/components/share-button';
import {
  ESTABLISHMENTS as SEED,
  DISTRICTS,
  TYPES as ALL_TYPES,
  toMarker,
  type GradedEstablishment,
  type Grade,
} from '@/data/food-grade-establishments';

const LeafletMap = dynamic(() => import('@/components/leaflet-map'), { ssr: false });

const gradeCfg = {
  A: { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300', cardBorder: 'border-l-emerald-400', label: 'Excellent',         sub: '≥ 75% hygiene score', guideClass: 'from-emerald-500 to-emerald-600', guideBg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800', guideText: 'text-emerald-800 dark:text-emerald-300' },
  B: { bar: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',           cardBorder: 'border-l-amber-400',   label: 'Satisfactory',      sub: '50–74% hygiene score', guideClass: 'from-amber-500 to-amber-600',     guideBg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800',         guideText: 'text-amber-800 dark:text-amber-300'     },
  C: { bar: 'bg-red-500',     badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300',                     cardBorder: 'border-l-red-400',     label: 'Needs Improvement', sub: '< 50% hygiene score',  guideClass: 'from-red-500 to-red-600',         guideBg: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800',                 guideText: 'text-red-800 dark:text-red-300'         },
} as const;

type SortMode = 'score_desc' | 'name_asc' | 'date_desc';

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export default function FoodGradesPage() {
  const [data, setData] = useState<GradedEstablishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [sortMode, setSortMode] = useState<SortMode>('score_desc');
  useEffect(() => {
    (async () => {
      try {
        // Prefer live Firestore data if the collection is populated; otherwise
        // fall back to the curated seed of ~95 real Sri Lankan premises.
        const snap = await getDocs(query(collection(db, 'food_grades'), orderBy('name')));
        if (!snap.empty) {
          const live = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }) as Partial<GradedEstablishment> & { id: string })
            .filter((d): d is GradedEstablishment => Boolean(d.name && d.lat && d.lng));
          setData(live.length > 0 ? live : SEED);
        } else {
          setData(SEED);
        }
      } catch {
        setData(SEED);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => data.filter((r) => {
    const q = searchQ.trim().toLowerCase();
    const matchQ = !q
      || r.name.toLowerCase().includes(q)
      || r.address.toLowerCase().includes(q)
      || r.district.toLowerCase().includes(q)
      || r.mohArea.toLowerCase().includes(q);
    const matchType     = typeFilter === 'All'     || r.type === typeFilter;
    const matchDistrict = districtFilter === 'All' || r.district === districtFilter;
    const matchGrade    = gradeFilter === 'All'    || r.grade === (gradeFilter as Grade);
    return matchQ && matchType && matchDistrict && matchGrade;
  }), [data, searchQ, typeFilter, districtFilter, gradeFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortMode === 'score_desc') list.sort((a, b) => b.score - a.score);
    if (sortMode === 'name_asc')   list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortMode === 'date_desc')  list.sort((a, b) => new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime());
    return list;
  }, [filtered, sortMode]);

  const gradeCount = (g: Grade) => data.filter((r) => r.grade === g).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div className="flex-1 min-w-0">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />Food Hygiene Grades
            </h1>
            <p className="text-sm text-muted-foreground">
              Official H800-certified hygiene grades for food establishments across Sri Lanka.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 dark:bg-emerald-950/30 dark:border-emerald-800">
            <Droplets className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">PHI Certified</span>
          </div>
        </div>

        {/* National map — every premises pinned, grade-coloured */}
        <NationalMap data={sorted} loading={loading} />

        {/* Grade summary tiles */}
        {!loading && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(['A', 'B', 'C'] as const).map((g) => {
              const cfg = gradeCfg[g];
              return (
                <Card key={g} className={`border-2 ${cfg.guideBg} overflow-hidden`}>
                  <CardContent className="p-0">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.guideClass}`} />
                    <div className="flex flex-col items-center gap-1 p-2.5 text-center sm:flex-row sm:items-center sm:gap-3 sm:p-4 sm:text-left">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 text-xl font-black sm:h-14 sm:w-14 sm:text-3xl ${cfg.badge}`}>{g}</div>
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
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search name, address, district…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
            </div>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} aria-label="Filter by district">
              <option value="All">All 25 districts</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by type">
              <option value="All">All types</option>
              {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} aria-label="Filter by grade">
              <option value="All">All grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:col-span-2 lg:col-span-1" value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} aria-label="Sort">
              <option value="score_desc">Sort: Score (High→Low)</option>
              <option value="name_asc">Sort: Name (A→Z)</option>
              <option value="date_desc">Sort: Date (Recent)</option>
            </select>
            <div className="flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-5">
              <Button variant="ghost" size="sm" onClick={() => { setSearchQ(''); setTypeFilter('All'); setDistrictFilter('All'); setGradeFilter('All'); }} className="text-xs">
                Clear filters
              </Button>
            </div>
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
                  <p className="text-sm text-muted-foreground/70">Try a different name, address, district or filter</p>
                </CardContent>
              </Card>
            ) : (
              sorted.map((r) => {
                const cfg = gradeCfg[r.grade];
                const stars = Math.round(r.score / 20);
                return (
                  <Card id={r.id} key={r.id} className={`overflow-hidden shadow-sm border-l-4 ${cfg.cardBorder} transition-all hover:shadow-md scroll-mt-24`}>
                    {/* Score progress bar */}
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full ${cfg.bar} transition-all duration-700`} style={{ width: `${r.score}%` }} />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl border-2 shadow-sm ${cfg.badge}`}>
                          <span className="text-4xl font-black leading-none">{r.grade}</span>
                          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider opacity-70">Grade</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold leading-snug">{r.name}</h3>
                            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{r.type}</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.address}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Inspected {formatDate(r.inspectedAt)}</span>
                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">{r.district} · {r.mohArea}</span>
                          </div>

                          {/* Star + score */}
                          <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3.5 w-3.5 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
                                ))}
                              </div>
                              <span className="text-base font-bold">{r.score}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                              <div className={`h-full rounded-full ${cfg.bar} transition-all duration-700`} style={{ width: `${r.score}%` }} />
                            </div>
                          </div>

                          {/* Responsible PHI officer */}
                          <div className="mt-3 flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-1.5 text-[11px] dark:bg-slate-800/60">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <UserIcon className="h-3 w-3" />
                              <span>Responsible PHI · <span className="font-semibold text-slate-700 dark:text-slate-200">{r.phi.name}</span></span>
                            </span>
                            <a href={`tel:${r.phi.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-slate-900">
                              <Phone className="h-2.5 w-2.5" /> {r.phi.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="mt-3 flex flex-wrap justify-end gap-1.5">
                        <a href={`tel:${r.phone.replace(/\s/g, '')}`} className="inline-flex h-7 items-center gap-1 rounded-md border border-emerald-200 bg-white px-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300">
                          <Phone className="h-3 w-3" /> Call premises
                        </a>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-blue-700 dark:hover:text-blue-300" onClick={() => openInMaps({ lat: r.lat, lng: r.lng, address: r.address, name: r.name })}>
                          <ExternalLink className="h-3 w-3" /> Open in Maps
                        </Button>
                        <ShareButton
                          data={{
                            title: r.name,
                            text: `${r.name} — Grade ${r.grade} (${r.score}%) · ${r.address} · PHI-PRO Food Hygiene`,
                            url: typeof window !== 'undefined' ? `${window.location.origin}/public/food-grades#${r.id}` : `https://phipro.lk/public/food-grades#${r.id}`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Footer note (no defensive copy) */}
        <Card className="border-0 bg-slate-50 shadow-sm dark:bg-slate-900/50">
          <CardContent className="flex items-start gap-3 p-4">
            <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <p className="text-xs text-muted-foreground">
              Grades are issued by Public Health Inspectors under the H800 framework. For inquiries call{' '}
              <a href="tel:1390" className="font-bold text-red-600 underline">1390</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────── national map ──────────────── */

function NationalMap({ data, loading }: { data: GradedEstablishment[]; loading: boolean }) {
  const markers: LeafletMarker[] = useMemo(
    () => data.map((p) => ({
      ...toMarker(p),
      popup: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-slate-900">{p.name}</p>
          <p className="text-[11px] text-slate-500">{p.address}</p>
          <p className="text-[11px]"><span className="font-bold">Grade {p.grade}</span> · {p.score}% · {p.type}</p>
          <p className="text-[10px] text-slate-500">{p.district} · {p.mohArea}</p>
          <div className="mt-1 flex gap-1.5">
            <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Call</a>
            <button
              type="button"
              onClick={() => openInMaps({ lat: p.lat, lng: p.lng, address: p.address, name: p.name })}
              className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700"
            >
              Open in Maps
            </button>
          </div>
        </div>
      ),
    })),
    [data],
  );

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Map view</h2>
          <div className="ml-auto flex items-center gap-3 text-[11px]">
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
