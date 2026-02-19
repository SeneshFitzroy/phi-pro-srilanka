'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Star, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SAMPLE_RESULTS = [
  { id: 1, name: 'Golden Dragon Restaurant', address: '45 Main St, Colombo 07', grade: 'A', score: 92, lastInspection: '2025-01-15', type: 'Restaurant' },
  { id: 2, name: 'Fresh Bakery & Cafe', address: '12 Galle Rd, Dehiwala', grade: 'A', score: 88, lastInspection: '2025-01-10', type: 'Bakery' },
  { id: 3, name: 'City Food Court', address: '78 Kandy Rd, Kaduwela', grade: 'B', score: 72, lastInspection: '2024-12-20', type: 'Food Court' },
  { id: 4, name: 'Sunrise Hotel', address: '200 Beach Rd, Mt. Lavinia', grade: 'A', score: 95, lastInspection: '2025-02-01', type: 'Hotel' },
  { id: 5, name: 'Corner Deli', address: '5 Temple Rd, Nugegoda', grade: 'C', score: 48, lastInspection: '2024-11-25', type: 'Retail' },
  { id: 6, name: 'Highway Rest Stop', address: 'A1 Highway, Kottawa', grade: 'B', score: 65, lastInspection: '2024-12-15', type: 'Restaurant' },
];

const gradeColor = (g: string) => g === 'A' ? 'bg-green-100 text-green-800 border-green-300' : g === 'B' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-red-100 text-red-800 border-red-300';
const gradeLabel = (g: string) => g === 'A' ? 'Excellent (≥75%)' : g === 'B' ? 'Satisfactory (50-74%)' : 'Needs Improvement (<50%)';

export default function FoodGradesPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = SAMPLE_RESULTS.filter(r => {
    const matchQuery = !query || r.name.toLowerCase().includes(query.toLowerCase()) || r.address.toLowerCase().includes(query.toLowerCase());
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    return matchQuery && matchType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/public"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-green-600" />Food Safety Grades</h1>
            <p className="text-sm text-muted-foreground">Search and verify food establishment hygiene grades</p>
          </div>
        </div>

        {/* Grade Guide */}
        <div className="grid grid-cols-3 gap-3">
          {['A', 'B', 'C'].map(g => (
            <Card key={g} className={`border-2 ${gradeColor(g)}`}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-3xl font-black">{g}</span>
                <span className="text-xs">{gradeLabel(g)}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by name or address..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option>All</option><option>Restaurant</option><option>Bakery</option><option>Hotel</option><option>Retail</option><option>Food Court</option>
            </select>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{filtered.length} establishment(s) found</p>
          {filtered.map(r => (
            <Card key={r.id} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 text-2xl font-black ${gradeColor(r.grade)}`}>{r.grade}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{r.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.address}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Inspected: {r.lastInspection}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5">{r.type}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold">{r.score}%</div>
                  <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < Math.round(r.score / 20) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
