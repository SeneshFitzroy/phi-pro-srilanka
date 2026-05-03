'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Star, MapPin, Clock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Premise {
  id: string;
  name: string;
  address: string;
  grade: string;
  score: number;
  lastInspection: string;
  type: string;
}

const FALLBACK: Premise[] = [
  { id: '1', name: 'Golden Dragon Restaurant', address: '45 Main St, Colombo 07', grade: 'A', score: 92, lastInspection: '2025-01-15', type: 'Restaurant' },
  { id: '2', name: 'Fresh Bakery & Cafe', address: '12 Galle Rd, Dehiwala', grade: 'A', score: 88, lastInspection: '2025-01-10', type: 'Bakery' },
  { id: '3', name: 'City Food Court', address: '78 Kandy Rd, Kaduwela', grade: 'B', score: 72, lastInspection: '2024-12-20', type: 'Food Court' },
  { id: '4', name: 'Sunrise Hotel', address: '200 Beach Rd, Mt. Lavinia', grade: 'A', score: 95, lastInspection: '2025-02-01', type: 'Hotel' },
  { id: '5', name: 'Corner Deli', address: '5 Temple Rd, Nugegoda', grade: 'C', score: 48, lastInspection: '2024-11-25', type: 'Retail' },
  { id: '6', name: 'Highway Rest Stop', address: 'A1 Highway, Kottawa', grade: 'B', score: 65, lastInspection: '2024-12-15', type: 'Restaurant' },
  { id: '7', name: 'Lanka Spice Garden', address: '33 Lake Rd, Kiribathgoda', grade: 'A', score: 90, lastInspection: '2025-01-22', type: 'Restaurant' },
  { id: '8', name: 'Blue Ocean Seafood', address: '17 Harbour View, Negombo', grade: 'B', score: 70, lastInspection: '2025-01-08', type: 'Restaurant' },
];

const gradeCfg = {
  A: { bar: 'bg-green-500', badge: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/40 dark:text-green-300', label: 'Excellent — ≥ 75%' },
  B: { bar: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-300', label: 'Satisfactory — 50–74%' },
  C: { bar: 'bg-red-500',   badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300',   label: 'Needs Improvement — < 50%' },
};

const TYPES = ['All', 'Restaurant', 'Bakery', 'Hotel', 'Retail', 'Food Court'];

export default function FoodGradesPage() {
  const [data, setData] = useState<Premise[]>([]);
  const [loading, setLoading] = useState(true);
  const [query_, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'food_grades'), orderBy('name'))
        );
        if (!snap.empty) {
          setData(snap.docs.map(d => ({ id: d.id, ...d.data() } as Premise)));
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
    const q = query_.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q);
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    const matchGrade = gradeFilter === 'All' || r.grade === gradeFilter;
    return matchQ && matchType && matchGrade;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/#services">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />Food Hygiene Grades
            </h1>
            <p className="text-sm text-muted-foreground">
              Official H800-certified hygiene grades for food establishments
            </p>
          </div>
        </div>

        {/* Grade guide */}
        <div className="grid grid-cols-3 gap-3">
          {(['A', 'B', 'C'] as const).map(g => (
            <Card key={g} className={`border-2 ${gradeCfg[g].badge}`}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-3xl font-black">{g}</span>
                <span className="text-xs leading-tight">{gradeCfg[g].label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name or address…"
                value={query_}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} establishment{filtered.length !== 1 ? 's' : ''} found
            </p>

            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-3 font-medium text-muted-foreground">No results found</p>
                  <p className="text-sm text-muted-foreground/70">Try a different name, address, or filter</p>
                </CardContent>
              </Card>
            ) : (
              filtered.map(r => {
                const cfg = gradeCfg[r.grade as keyof typeof gradeCfg] ?? gradeCfg.C;
                const stars = Math.round(r.score / 20);
                return (
                  <Card key={r.id} className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                    {/* Top score bar */}
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full ${cfg.bar} transition-all`} style={{ width: `${r.score}%` }} />
                    </div>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 text-3xl font-black ${cfg.badge}`}>
                        {r.grade}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">{r.name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.address}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Inspected {r.lastInspection}</span>
                          <span className="rounded bg-muted px-1.5 py-0.5">{r.type}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-2xl font-bold">{r.score}%</div>
                        <div className="flex items-center justify-end gap-0.5 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
