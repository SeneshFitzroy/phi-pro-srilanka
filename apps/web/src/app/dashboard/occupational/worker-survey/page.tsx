'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Users, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WorkerRecord {
  id: number;
  name: string;
  age: string;
  gender: string;
  section: string;
  yearsEmployed: string;
  healthIssues: string;
  ppeCompliant: boolean;
  lastMedical: string;
}

export default function WorkerSurveyPage() {
  const [records, setRecords] = useState<WorkerRecord[]>([
    { id: 1, name: '', age: '', gender: 'M', section: '', yearsEmployed: '', healthIssues: '', ppeCompliant: true, lastMedical: '' },
  ]);

  const addRecord = () => {
    setRecords(prev => [...prev, { id: Date.now(), name: '', age: '', gender: 'M', section: '', yearsEmployed: '', healthIssues: '', ppeCompliant: true, lastMedical: '' }]);
  };
  const removeRecord = (id: number) => setRecords(prev => prev.filter(r => r.id !== id));
  const updateRecord = (id: number, field: keyof WorkerRecord, value: string | boolean) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/occupational"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-orange-500" />Worker Health Survey (H1205)</h1>
            <p className="text-sm text-muted-foreground">Individual worker health assessment records</p>
          </div>
        </div>
        <Button className="bg-occupational hover:bg-occupational/90"><Save className="mr-2 h-4 w-4" />Save Survey</Button>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>Factory Name *</Label><Input placeholder="Factory name" /></div>
          <div className="space-y-2"><Label>Survey Date</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>PHI Officer</Label><Input placeholder="Your name" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Worker Records ({records.length})</CardTitle>
          <Button size="sm" onClick={addRecord}><Plus className="mr-1 h-4 w-4" />Add Worker</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((r, idx) => (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">