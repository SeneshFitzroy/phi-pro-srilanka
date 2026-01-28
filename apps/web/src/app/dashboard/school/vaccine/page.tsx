'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Syringe, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VaccineRecord {
  id: number;
  studentName: string;
  grade: string;
  age: string;
  gender: string;
  vaccine: string;
  doseNumber: string;
  batchNo: string;
  site: string;
  reaction: string;
  consent: boolean;
}

export default function SchoolVaccinePage() {
  const [records, setRecords] = useState<VaccineRecord[]>([
    { id: 1, studentName: '', grade: '6', age: '', gender: 'F', vaccine: 'HPV', doseNumber: '1', batchNo: '', site: 'Left Deltoid', reaction: 'None', consent: true },
  ]);

  const addRecord = () => {
    setRecords(prev => [...prev, { id: prev.length + 1, studentName: '', grade: '6', age: '', gender: 'F', vaccine: 'HPV', doseNumber: '1', batchNo: '', site: 'Left Deltoid', reaction: 'None', consent: true }]);
  };

  const removeRecord = (id: number) => setRecords(prev => prev.filter(r => r.id !== id));

  const updateRecord = (id: number, field: keyof VaccineRecord, value: string | boolean) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const hpvCount = records.filter(r => r.vaccine === 'HPV').length;
  const apdtCount = records.filter(r => r.vaccine === 'aPdT').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/school"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Syringe className="h-6 w-6 text-purple-600" />Vaccination Program (H1247)</h1>
            <p className="text-sm text-muted-foreground">HPV (Grade 6, Girls, 2 doses) & aP/dT (Grade 7, All, 1 dose)</p>
          </div>
        </div>
        <Button className="bg-school hover:bg-school/90"><Save className="mr-2 h-4 w-4" />Save Records</Button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <p className="font-semibold text-purple-700">HPV Vaccine</p>
            <p className="text-sm text-purple-600 mt-1">Target: Girls in Grade 6</p>
            <p className="text-sm text-purple-600">Schedule: Dose 1 (Day 0), Dose 2 (6 months)</p>
            <p className="text-lg font-bold text-purple-700 mt-2">{hpvCount} records this session</p>
          </CardContent>
        </Card>
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="p-4">
            <p className="font-semibold text-indigo-700">aP/dT Vaccine</p>
            <p className="text-sm text-indigo-600 mt-1">Target: All students in Grade 7</p>
            <p className="text-sm text-indigo-600">Schedule: Single dose</p>
            <p className="text-lg font-bold text-indigo-700 mt-2">{apdtCount} records this session</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>School Name *</Label><Input placeholder="Enter school" /></div>
          <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Vaccinator Name</Label><Input placeholder="Name" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Vaccination Records ({records.length})</CardTitle>