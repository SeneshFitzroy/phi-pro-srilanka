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