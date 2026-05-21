'use client';

import { useMemo, useState } from 'react';
import { Save, Plus, Trash2, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubpageHeader } from '@/components/dashboard-subpage-header';
import { toast } from 'sonner';
import { SCHOOL_NAMES } from '@/data/colombo-schools';

const today = () => new Date().toISOString().slice(0, 10);

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
    { id: 1, date: today(), school: '', activity: '', details: '', duration: '', studentsReached: '' },
  ]);

  const addEntry = () => {
    setEntries(prev => [...prev, { id: (prev.at(-1)?.id ?? 0) + 1, date: today(), school: '', activity: '', details: '', duration: '', studentsReached: '' }]);
  };

  const removeEntry = (id: number) => setEntries(prev => prev.filter(e => e.id !== id));

  const update = (id: number, field: keyof ActivityEntry, value: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const totals = useMemo(() => ({
    students: entries.reduce((s, e) => s + (parseInt(e.studentsReached) || 0), 0),
    hours: entries.reduce((s, e) => s + (parseFloat(e.duration) || 0), 0),
  }), [entries]);

  const submit = () => {
    const valid = entries.filter((e) => e.school.trim() && e.activity);
    if (valid.length === 0) { toast.error('Add at least one entry with a school and activity.'); return; }
    toast.success(`Activity log submitted — ${valid.length} entr${valid.length === 1 ? 'y' : 'ies'}, ${totals.students} students reached.`);
  };

  return (
    <div className="space-y-6">
      <SubpageHeader
        backHref="/dashboard/school"
        module="Module 04 · School Health"
        code="H1014"
        icon={Activity}
        title="Field activity log"
        subtitle="Record all school-health program activities for the month"
        tone="indigo"
        actions={
          <Button className="bg-indigo-700 hover:bg-indigo-800" onClick={submit}><Save className="mr-2 h-4 w-4" />Submit log</Button>
        }
      />

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>Month / Year</Label><Input type="month" defaultValue={new Date().toISOString().slice(0, 7)} /></div>
          <div className="space-y-2"><Label>PHI Officer</Label><Input placeholder="Your name" /></div>
          <div className="space-y-2"><Label>MOH Area</Label><Input defaultValue="Colombo (CMC)" placeholder="Area name" /></div>
        </CardContent>
      </Card>

      {/* Running totals */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{entries.length}</p><p className="text-xs text-muted-foreground">Activity entries</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{totals.students.toLocaleString()}</p><p className="text-xs text-muted-foreground">Students reached</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{totals.hours}</p><p className="text-xs text-muted-foreground">Total hours</p></CardContent></Card>
      </div>

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
                  <div className="space-y-1"><Label className="text-xs">School</Label><Input list="activity-school-list" value={entry.school} onChange={(e) => update(entry.id, 'school', e.target.value)} placeholder="Select or type a school…" /><datalist id="activity-school-list">{SCHOOL_NAMES.map((n) => <option key={n} value={n} />)}</datalist></div>
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
      </Card>
    </div>
  );
}