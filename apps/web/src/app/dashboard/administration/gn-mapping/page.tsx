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

      {records.map((record, idx) => (
        <Card key={record.id}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">GN Division #{idx + 1}</CardTitle>
            {records.length > 1 && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeRecord(record.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1"><Label className="text-xs">GN Code</Label><Input value={record.gnCode} onChange={(e) => update(record.id, 'gnCode', e.target.value)} placeholder="Code" /></div>
              <div className="space-y-1"><Label className="text-xs">GN Name</Label><Input value={record.gnName} onChange={(e) => update(record.id, 'gnName', e.target.value)} placeholder="Name" /></div>
              <div className="space-y-1"><Label className="text-xs">GN Officer</Label><Input value={record.gnOfficer} onChange={(e) => update(record.id, 'gnOfficer', e.target.value)} placeholder="Officer name" /></div>
              <div className="space-y-1"><Label className="text-xs">Population</Label><Input type="number" value={record.population} onChange={(e) => update(record.id, 'population', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Households</Label><Input type="number" value={record.households} onChange={(e) => update(record.id, 'households', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Water Source</Label><Input value={record.waterSource} onChange={(e) => update(record.id, 'waterSource', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Sanitation Type</Label><Input value={record.sanitationType} onChange={(e) => update(record.id, 'sanitationType', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Health Facilities</Label><Input type="number" value={record.healthFacilities} onChange={(e) => update(record.id, 'healthFacilities', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Schools</Label><Input type="number" value={record.schools} onChange={(e) => update(record.id, 'schools', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Factories</Label><Input type="number" value={record.factories} onChange={(e) => update(record.id, 'factories', e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Food Premises</Label><Input type="number" value={record.foodPremises} onChange={(e) => update(record.id, 'foodPremises', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="w-full border-dashed" onClick={addRecord}>
        <Plus className="mr-2 h-4 w-4" />Add GN Division
      </Button>
    </div>
  );
}