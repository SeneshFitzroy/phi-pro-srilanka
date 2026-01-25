'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StudentRecord {
  id: number;
  name: string;
  grade: string;
  age: string;
  gender: string;
  defects: string;
  action: string;
  referred: boolean;
}

export default function SchoolDefectsPage() {
  const [records, setRecords] = useState<StudentRecord[]>([
    { id: 1, name: '', grade: '1', age: '', gender: 'M', defects: '', action: '', referred: false },
  ]);

  const addRecord = () => {
    setRecords(prev => [...prev, { id: prev.length + 1, name: '', grade: '1', age: '', gender: 'M', defects: '', action: '', referred: false }]);
  };

  const removeRecord = (id: number) => { setRecords(prev => prev.filter(r => r.id !== id)); };

  const updateRecord = (id: number, field: keyof StudentRecord, value: string | boolean) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/school"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">Student Defect Record (H1046)</h1>
            <p className="text-sm text-muted-foreground">Record individual student health defects found during medical inspections</p>
          </div>
        </div>
        <Button className="bg-school hover:bg-school/90"><Save className="mr-2 h-4 w-4" />Save Records</Button>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>School Name *</Label><Input placeholder="Enter school name" /></div>
          <div className="space-y-2"><Label>Inspection Date</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>PHI Officer</Label><Input placeholder="Your name" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Student Records ({records.length})</CardTitle>
          <Button size="sm" onClick={addRecord}><Plus className="mr-1 h-4 w-4" />Add Student</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((r, idx) => (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Student #{idx + 1}</span>
                  {records.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeRecord(r.id)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1"><Label className="text-xs">Student Name</Label><Input placeholder="Full name" value={r.name} onChange={(e) => updateRecord(r.id, 'name', e.target.value)} /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">Grade</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.grade} onChange={(e) => updateRecord(r.id, 'grade', e.target.value)}>
                      <option value="1">Grade 1</option><option value="4">Grade 4</option><option value="7">Grade 7</option><option value="10">Grade 10</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Age</Label><Input type="number" placeholder="Age" value={r.age} onChange={(e) => updateRecord(r.id, 'age', e.target.value)} /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">Gender</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.gender} onChange={(e) => updateRecord(r.id, 'gender', e.target.value)}>
                      <option value="M">Male</option><option value="F">Female</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 mt-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Defect(s) Found</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.defects} onChange={(e) => updateRecord(r.id, 'defects', e.target.value)}>
                      <option value="">Select defect...</option>
                      <option>Vision - Myopia</option><option>Vision - Hyperopia</option><option>Vision - Squint</option>
                      <option>Hearing Loss</option><option>Dental Caries</option><option>Malocclusion</option>
                      <option>Scabies</option><option>Ringworm</option><option>Pediculosis</option>
                      <option>Underweight</option><option>Stunting</option><option>Overweight</option>
                      <option>Scoliosis</option><option>Flat Feet</option><option>Asthma</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Action Taken</Label>