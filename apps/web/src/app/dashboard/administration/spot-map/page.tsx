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