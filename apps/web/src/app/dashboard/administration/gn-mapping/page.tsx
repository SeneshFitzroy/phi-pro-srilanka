'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, MapPin, Plus, Trash2, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GNRecord {
  id: number;
  gnCode: string;
  gnName: string;
  gnOfficer: string;
  population: string;
  households: string;
  waterSource: string;
  sanitationType: string;
  healthFacilities: string;
  schools: string;
  factories: string;
  foodPremises: string;
}

export default function GNMappingPage() {
  const [records, setRecords] = useState<GNRecord[]>([
    { id: 1, gnCode: '', gnName: '', gnOfficer: '', population: '', households: '', waterSource: '', sanitationType: '', healthFacilities: '', schools: '', factories: '', foodPremises: '' },
  ]);

  const addRecord = () => setRecords(prev => [...prev, { id: Date.now(), gnCode: '', gnName: '', gnOfficer: '', population: '', households: '', waterSource: '', sanitationType: '', healthFacilities: '', schools: '', factories: '', foodPremises: '' }]);
  const removeRecord = (id: number) => setRecords(prev => prev.filter(r => r.id !== id));
  const update = (id: number, field: keyof GNRecord, val: string) => setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/administration"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin className="h-6 w-6 text-administration" />GN Area Mapping (H795)</h1>
            <p className="text-sm text-muted-foreground">Map and document all Grama Niladhari divisions in PHI area</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button className="bg-administration hover:bg-administration/90"><Save className="mr-2 h-4 w-4" />Save</Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>MOH Area</Label><Input placeholder="Area name" /></div>
          <div className="space-y-2"><Label>PHI Area Code</Label><Input placeholder="Code" /></div>
          <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">GN Division Records ({records.length})</CardTitle>
          <Button size="sm" onClick={addRecord}><Plus className="mr-1 h-4 w-4" />Add GN</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((r, idx) => (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">GN Division #{idx + 1}</span>
                  {records.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeRecord(r.id)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1"><Label className="text-xs">GN Code</Label><Input value={r.gnCode} onChange={(e) => update(r.id, 'gnCode', e.target.value)} placeholder="e.g. GN-001" /></div>
                  <div className="space-y-1"><Label className="text-xs">GN Name</Label><Input value={r.gnName} onChange={(e) => update(r.id, 'gnName', e.target.value)} placeholder="Division name" /></div>
                  <div className="space-y-1"><Label className="text-xs">GN Officer</Label><Input value={r.gnOfficer} onChange={(e) => update(r.id, 'gnOfficer', e.target.value)} placeholder="Officer name" /></div>
                  <div className="space-y-1"><Label className="text-xs">Population</Label><Input type="number" value={r.population} onChange={(e) => update(r.id, 'population', e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Households</Label><Input type="number" value={r.households} onChange={(e) => update(r.id, 'households', e.target.value)} /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">Water Source</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.waterSource} onChange={(e) => update(r.id, 'waterSource', e.target.value)}>