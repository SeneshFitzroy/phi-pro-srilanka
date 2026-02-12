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