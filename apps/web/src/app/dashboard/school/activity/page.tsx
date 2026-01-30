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
        <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>Month / Year</Label><Input type="month" /></div>
          <div className="space-y-2"><Label>PHI Officer</Label><Input placeholder="Your name" /></div>
          <div className="space-y-2"><Label>MOH Area</Label><Input placeholder="Area name" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Activity Entries ({entries.length})</CardTitle>
          <Button size="sm" onClick={addEntry}><Plus className="mr-1 h-4 w-4" />Add Entry</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries.map((entry, idx) => (
              <div key={entry.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Entry #{idx + 1}</span>
                  {entries.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeEntry(entry.id)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={entry.date} onChange={(e) => update(entry.id, 'date', e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">School</Label><Input value={entry.school} onChange={(e) => update(entry.id, 'school', e.target.value)} placeholder="School name" /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">Activity Type</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={entry.activity} onChange={(e) => update(entry.id, 'activity', e.target.value)}>
                      <option value="">Select activity...</option>
                      {activityTypes.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Duration (hours)</Label><Input type="number" step="0.5" value={entry.duration} onChange={(e) => update(entry.id, 'duration', e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Students Reached</Label><Input type="number" value={entry.studentsReached} onChange={(e) => update(entry.id, 'studentsReached', e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Details / Notes</Label><Input value={entry.details} onChange={(e) => update(entry.id, 'details', e.target.value)} placeholder="Brief description" /></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>