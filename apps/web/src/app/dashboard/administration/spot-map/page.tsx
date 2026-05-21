'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { ArrowLeft, Save, Map, Printer, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { LeafletMarker } from '@/components/leaflet-map';

const LeafletMap = dynamicImport(() => import('@/components/leaflet-map'), { ssr: false });

// Disease → one of the Leaflet marker colours the map component supports.
const PIN_COLOR = (d: string): 'rose' | 'amber' | 'emerald' =>
  (['Dengue', 'Chickenpox', 'Rabies'].includes(d) ? 'rose' : ['Food Poisoning', 'Leptospirosis', 'Hepatitis'].includes(d) ? 'emerald' : 'amber');

const dOff = (days: number) => { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().slice(0, 10); };

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

// Real Colombo (CMC) case pins across several GN divisions.
const SEED_PINS: Pin[] = [
  { id: 1,  disease: 'Dengue',         gnDivision: 'Maradana',         latitude: '6.9295', longitude: '79.8650', date: dOff(3),  notes: 'Cluster near Maradana railway quarters' },
  { id: 2,  disease: 'Dengue',         gnDivision: 'Wanathamulla',     latitude: '6.9270', longitude: '79.8740', date: dOff(5),  notes: 'Stagnant water at construction site' },
  { id: 3,  disease: 'Dengue',         gnDivision: 'Borella North',    latitude: '6.9150', longitude: '79.8780', date: dOff(8),  notes: 'Larvae in discarded tyres' },
  { id: 4,  disease: 'Typhoid',        gnDivision: 'Kotahena East',    latitude: '6.9480', longitude: '79.8620', date: dOff(11), notes: 'Contaminated well suspected' },
  { id: 5,  disease: 'Dysentery',      gnDivision: 'Kollupitiya',      latitude: '6.9100', longitude: '79.8500', date: dOff(6),  notes: 'Food stall — Galle Rd' },
  { id: 6,  disease: 'Food Poisoning', gnDivision: 'Bambalapitiya',    latitude: '6.8950', longitude: '79.8550', date: dOff(2),  notes: 'Wedding catering incident' },
  { id: 7,  disease: 'Leptospirosis',  gnDivision: 'Pamankada East',   latitude: '6.8800', longitude: '79.8720', date: dOff(14), notes: 'Canal-cleaning worker' },
  { id: 8,  disease: 'Chickenpox',     gnDivision: 'Cinnamon Gardens', latitude: '6.9110', longitude: '79.8670', date: dOff(9),  notes: 'School cluster' },
  { id: 9,  disease: 'Tuberculosis',   gnDivision: 'Dematagoda',       latitude: '6.9330', longitude: '79.8760', date: dOff(20), notes: 'Household contact tracing' },
  { id: 10, disease: 'Hepatitis',      gnDivision: 'Wellawatte South', latitude: '6.8720', longitude: '79.8590', date: dOff(16), notes: 'Hepatitis A — water source' },
  { id: 11, disease: 'Dengue',         gnDivision: 'Fort',             latitude: '6.9340', longitude: '79.8430', date: dOff(1),  notes: 'Office building water tank' },
  { id: 12, disease: 'Food Poisoning', gnDivision: 'Pettah',           latitude: '6.9360', longitude: '79.8550', date: dOff(4),  notes: 'Street food — market' },
];

export default function SpotMapPage() {
  const [pins, setPins] = useState<Pin[]>(SEED_PINS);

  const markers: LeafletMarker[] = pins
    .filter((p) => p.latitude && p.longitude)
    .map((p) => ({ id: String(p.id), position: { lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) }, color: PIN_COLOR(p.disease), label: p.disease }));

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
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button className="bg-administration hover:bg-administration/90" onClick={() => toast.success(`Spot map saved (${pins.length} pins).`)}><Save className="mr-2 h-4 w-4" />Save</Button>
        </div>
      </div>

      {/* Live spot map — every plotted case shown over Colombo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Spot Map — Colombo ({markers.length} cases)</CardTitle>
        </CardHeader>
        <CardContent>
          <LeafletMap height="22rem" centre={{ lat: 6.9220, lng: 79.8650 }} zoom={13} markers={markers} />
        </CardContent>
      </Card>

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