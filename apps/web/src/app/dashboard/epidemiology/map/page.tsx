'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, Layers, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const clusters = [
  { id: 'CLU-001', disease: 'Dengue Fever', cases: 8, radius: '150m', center: 'Borella South', lat: 6.9167, lng: 79.8750, severity: 'HIGH', date: '2025-02-12' },
  { id: 'CLU-002', disease: 'Chickenpox', cases: 4, radius: '150m', center: 'Narahenpita', lat: 6.8986, lng: 79.8756, severity: 'MEDIUM', date: '2025-02-10' },
  { id: 'CLU-003', disease: 'Leptospirosis', cases: 3, radius: '150m', center: 'Kirulapone', lat: 6.8800, lng: 79.8667, severity: 'HIGH', date: '2025-02-08' },
];

const recentPins = [
  { disease: 'Dengue Fever', gn: 'Borella South', date: '2025-02-14', type: 'case' },
  { disease: 'Dengue Fever', gn: 'Borella North', date: '2025-02-14', type: 'case' },
  { disease: 'Leptospirosis', gn: 'Narahenpita', date: '2025-02-13', type: 'case' },
  { disease: 'Food Poisoning', gn: 'Cinnamon Gardens', date: '2025-02-11', type: 'case' },
  { disease: 'Dengue Fever', gn: 'Kirulapone', date: '2025-02-10', type: 'case' },
];

export default function DiseaseMapPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/epidemiology"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin className="h-6 w-6 text-rose-500" />Disease Cluster Map</h1>
            <p className="text-sm text-muted-foreground">GIS-based disease mapping — 150m cluster radius detection</p>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <Card className="overflow-hidden">
        <div className="relative h-[400px] bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-epidemiology/40 mx-auto" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">Interactive Map</p>
            <p className="text-sm text-muted-foreground">Connect Mapbox API key in .env.local to enable</p>
            <p className="text-xs text-muted-foreground mt-1">NEXT_PUBLIC_MAPBOX_TOKEN=your_token</p>
          </div>
          {/* Simulated pins */}
          {clusters.map((c, i) => (
            <div key={c.id} className={`absolute ${i === 0 ? 'top-1/4 left-1/3' : i === 1 ? 'top-1/2 left-1/2' : 'bottom-1/4 right-1/3'}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold animate-pulse ${c.severity === 'HIGH' ? 'bg-red-500' : 'bg-amber-500'}`}>
                {c.cases}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layers className="h-4 w-4" />Map Legend</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">