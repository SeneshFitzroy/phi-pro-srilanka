'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ActivityEntry {
  id: number;
  date: string;
  school: string;
  activity: string;
  details: string;
  duration: string;
  studentsReached: string;
}

const activityTypes = [
  'Medical Inspection (Grade 1)', 'Medical Inspection (Grade 4)', 'Medical Inspection (Grade 7)', 'Medical Inspection (Grade 10)',
  'HPV Vaccination', 'aP/dT Vaccination', 'Health Education Session', 'WASH Survey',
  'Dental Screening', 'Vision Screening', 'BMI Assessment', 'De-worming Campaign',
  'First Aid Training', 'Nutrition Education', 'Mental Health Awareness', 'Follow-up Visit',
  'Teacher Training', 'Canteen Inspection', 'Other',
];

export default function SchoolActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([
    { id: 1, date: '', school: '', activity: '', details: '', duration: '', studentsReached: '' },
  ]);

  const addEntry = () => {
    setEntries(prev => [...prev, { id: prev.length + 1, date: '', school: '', activity: '', details: '', duration: '', studentsReached: '' }]);
  };

  const removeEntry = (id: number) => setEntries(prev => prev.filter(e => e.id !== id));

  const update = (id: number, field: keyof ActivityEntry, value: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/school"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-indigo-600" />Activity Log (H1014)</h1>
            <p className="text-sm text-muted-foreground">Record all school health program activities</p>
          </div>
        </div>
        <Button className="bg-school hover:bg-school/90"><Save className="mr-2 h-4 w-4" />Submit Log</Button>
      </div>

      <Card>