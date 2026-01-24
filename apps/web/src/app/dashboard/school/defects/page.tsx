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