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
                  <span className="text-sm font-medium text-muted-foreground">Worker #{idx + 1}</span>
                  {records.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeRecord(r.id)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1"><Label className="text-xs">Worker Name</Label><Input value={r.name} onChange={(e) => updateRecord(r.id, 'name', e.target.value)} placeholder="Full name" /></div>
                  <div className="space-y-1"><Label className="text-xs">Age</Label><Input type="number" value={r.age} onChange={(e) => updateRecord(r.id, 'age', e.target.value)} /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">Gender</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.gender} onChange={(e) => updateRecord(r.id, 'gender', e.target.value)}><option value="M">Male</option><option value="F">Female</option></select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Section / Department</Label><Input value={r.section} onChange={(e) => updateRecord(r.id, 'section', e.target.value)} placeholder="e.g. Assembly" /></div>
                  <div className="space-y-1"><Label className="text-xs">Years Employed</Label><Input type="number" value={r.yearsEmployed} onChange={(e) => updateRecord(r.id, 'yearsEmployed', e.target.value)} /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">Health Issues</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.healthIssues} onChange={(e) => updateRecord(r.id, 'healthIssues', e.target.value)}>
                      <option value="">None</option><option>Respiratory</option><option>Skin Condition</option><option>Hearing Loss</option><option>Musculoskeletal</option><option>Eye Strain</option><option>Chemical Exposure</option><option>Fatigue/Stress</option><option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">PPE Compliant</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.ppeCompliant ? 'yes' : 'no'} onChange={(e) => updateRecord(r.id, 'ppeCompliant', e.target.value === 'yes')}>
                      <option value="yes">Yes</option><option value="no">No</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Last Medical Exam</Label><Input type="date" value={r.lastMedical} onChange={(e) => updateRecord(r.id, 'lastMedical', e.target.value)} /></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}