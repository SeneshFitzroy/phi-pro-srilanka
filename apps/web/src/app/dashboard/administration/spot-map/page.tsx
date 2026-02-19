'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Map, Printer, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DISEASE_COLORS: Record<string, string> = {
  Dengue: '#ef4444',
  Typhoid: '#f97316',
  Dysentery: '#eab308',
  'Food Poisoning': '#22c55e',
  Leptospirosis: '#3b82f6',
  Tuberculosis: '#8b5cf6',
  Chickenpox: '#ec4899',
  Hepatitis: '#14b8a6',
  Rabies: '#6b7280',
  Other: '#a3a3a3',
};

interface Pin {
  id: number;
  disease: string;
  gnDivision: string;
  latitude: string;
  longitude: string;
  date: string;
  patientAge: string;
  patientGender: string;
  notes: string;
}

export default function SpotMapPage() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedDisease, setSelectedDisease] = useState('Dengue');

  const addPin = () => setPins(prev => [...prev, {
    id: Date.now(), disease: selectedDisease, gnDivision: '', latitude: '', longitude: '', date: new Date().toISOString().split('T')[0], patientAge: '', patientGender: '', notes: '',
  }]);

  const removePin = (id: number) => setPins(prev => prev.filter(p => p.id !== id));
  const updatePin = (id: number, field: keyof Pin, val: string) => setPins(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));

  const diseaseCounts = Object.keys(DISEASE_COLORS).reduce((acc, d) => {
    acc[d] = pins.filter(p => p.disease === d).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/administration"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Map className="h-6 w-6 text-administration" />Disease Spot Map</h1>
            <p className="text-sm text-muted-foreground">A3 color-coded spot map for disease case locations by GN division</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Export A3 PDF</Button>
          <Button className="bg-administration hover:bg-administration/90"><Save className="mr-2 h-4 w-4" />Save</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Map Area */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Map View</CardTitle></CardHeader>
          <CardContent>
            <div className="relative aspect-[4/3] w-full rounded-lg border-2 border-dashed bg-muted/30 flex flex-col items-center justify-center gap-4">
              <Map className="h-16 w-16 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Interactive map will be rendered here</p>
              <p className="text-xs text-muted-foreground">Requires Mapbox GL token in environment</p>
              <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                <Button size="sm" variant="outline" className="text-xs h-7">+ Zoom</Button>
                <Button size="sm" variant="outline" className="text-xs h-7">- Zoom</Button>
              </div>
              {/* Simulated pins */}
              {pins.length > 0 && (
                <div className="absolute top-4 left-4 text-xs bg-background/90 rounded p-2 border">
                  {pins.length} pin(s) placed
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legend & Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Legend</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(DISEASE_COLORS).map(([disease, color]) => (
                <div key={disease} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs">{disease}</span>
                  </div>
                  <span className="text-xs font-medium tabular-nums">{diseaseCounts[disease] || 0}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex items-center justify-between font-medium">
                <span className="text-xs">Total Pins</span>
                <span className="text-sm">{pins.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Add Case Pin</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Disease Type</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={selectedDisease} onChange={e => setSelectedDisease(e.target.value)}>
                  {Object.keys(DISEASE_COLORS).map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <Button size="sm" className="w-full" onClick={addPin}><Plus className="mr-1 h-4 w-4" />Place Pin ({selectedDisease})</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-3 p-4">
              <div className="space-y-1"><Label className="text-xs">GN Division Filter</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option>All Divisions</option>
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Date Range</Label>
                <div className="flex gap-2"><Input type="date" className="h-9 text-xs" /><Input type="date" className="h-9 text-xs" /></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pin Data Table */}
      {pins.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Case Pins ({pins.length})</CardTitle></CardHeader>
          <CardContent className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left text-xs">#</th>
                  <th className="py-2 text-left text-xs">Disease</th>
                  <th className="py-2 text-left text-xs">GN Division</th>
                  <th className="py-2 text-left text-xs">Lat</th>
                  <th className="py-2 text-left text-xs">Lng</th>
                  <th className="py-2 text-left text-xs">Date</th>
                  <th className="py-2 text-left text-xs">Age</th>
                  <th className="py-2 text-left text-xs">Gender</th>
                  <th className="py-2 text-left text-xs">Notes</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {pins.map((p, idx) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-1"><div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DISEASE_COLORS[p.disease] || '#999' }} />{idx + 1}</div></td>
                    <td className="py-1">
                      <select className="h-7 rounded border border-input bg-background px-1 text-xs" value={p.disease} onChange={e => updatePin(p.id, 'disease', e.target.value)}>
                        {Object.keys(DISEASE_COLORS).map(d => <option key={d}>{d}</option>)}
                      </select>
                    </td>
                    <td className="py-1"><Input className="h-7 text-xs w-28" value={p.gnDivision} onChange={e => updatePin(p.id, 'gnDivision', e.target.value)} placeholder="GN name" /></td>
                    <td className="py-1"><Input className="h-7 text-xs w-20" value={p.latitude} onChange={e => updatePin(p.id, 'latitude', e.target.value)} placeholder="6.xxx" /></td>
                    <td className="py-1"><Input className="h-7 text-xs w-20" value={p.longitude} onChange={e => updatePin(p.id, 'longitude', e.target.value)} placeholder="80.xxx" /></td>
                    <td className="py-1"><Input type="date" className="h-7 text-xs" value={p.date} onChange={e => updatePin(p.id, 'date', e.target.value)} /></td>
                    <td className="py-1"><Input type="number" className="h-7 text-xs w-14 text-center" value={p.patientAge} onChange={e => updatePin(p.id, 'patientAge', e.target.value)} /></td>
                    <td className="py-1">
                      <select className="h-7 rounded border border-input bg-background px-1 text-xs" value={p.patientGender} onChange={e => updatePin(p.id, 'patientGender', e.target.value)}>
                        <option value="">-</option><option>Male</option><option>Female</option>
                      </select>
                    </td>
                    <td className="py-1"><Input className="h-7 text-xs w-28" value={p.notes} onChange={e => updatePin(p.id, 'notes', e.target.value)} /></td>
                    <td className="py-1"><Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removePin(p.id)}><Trash2 className="h-3 w-3" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
