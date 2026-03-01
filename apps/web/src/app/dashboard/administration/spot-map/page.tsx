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
  notes: string;
}

export default function SpotMapPage() {
  const [pins, setPins] = useState<Pin[]>([
    { id: 1, disease: 'Dengue', gnDivision: '', latitude: '', longitude: '', date: '', notes: '' },
  ]);

  const addPin = () => setPins(prev => [...prev, { id: Date.now(), disease: 'Dengue', gnDivision: '', latitude: '', longitude: '', date: '', notes: '' }]);
  const removePin = (id: number) => setPins(prev => prev.filter(p => p.id !== id));
  const updatePin = (id: number, field: keyof Pin, val: string) => setPins(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/administration"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Map className="h-6 w-6 text-administration" />Disease Spot Map</h1>
            <p className="text-sm text-muted-foreground">Plot disease cases on the area map</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button className="bg-administration hover:bg-administration/90"><Save className="mr-2 h-4 w-4" />Save</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Disease Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(DISEASE_COLORS).map(([disease, color]) => (
              <div key={disease} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs">{disease}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {pins.map((pin, idx) => (
        <Card key={pin.id}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Pin #{idx + 1}</CardTitle>
            {pins.length > 1 && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removePin(pin.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Disease</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={pin.disease} onChange={(e) => updatePin(pin.id, 'disease', e.target.value)}>
                  {Object.keys(DISEASE_COLORS).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">GN Division</Label><Input value={pin.gnDivision} onChange={(e) => updatePin(pin.id, 'gnDivision', e.target.value)} placeholder="GN division" /></div>
              <div className="space-y-1"><Label className="text-xs">Latitude</Label><Input value={pin.latitude} onChange={(e) => updatePin(pin.id, 'latitude', e.target.value)} placeholder="e.g. 6.9271" /></div>
              <div className="space-y-1"><Label className="text-xs">Longitude</Label><Input value={pin.longitude} onChange={(e) => updatePin(pin.id, 'longitude', e.target.value)} placeholder="e.g. 79.8612" /></div>
              <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={pin.date} onChange={(e) => updatePin(pin.id, 'date', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Notes</Label><Input value={pin.notes} onChange={(e) => updatePin(pin.id, 'notes', e.target.value)} placeholder="Additional notes" /></div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="w-full border-dashed" onClick={addPin}>
        <Plus className="mr-2 h-4 w-4" />Add Pin
      </Button>
    </div>
  );
}