'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, ClipboardCheck, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const checklistCategories = [
  {
    title: 'Administration & Documentation',
    items: ['Factory registration valid', 'Workers compensation insurance', 'Safety policy displayed', 'Accident register maintained', 'Training records available', 'Emergency contacts posted'],
  },
  {
    title: 'Fire & Emergency',
    items: ['Fire extinguishers serviced (date)', 'Emergency exits marked & clear', 'Fire alarm functional', 'Evacuation plan posted', 'Assembly point designated', 'Fire drill records'],
  },
  {
    title: 'Personal Protective Equipment',
    items: ['PPE provided for all hazards', 'Workers trained on PPE use', 'PPE condition acceptable', 'PPE replacement schedule', 'Storage for PPE available'],
  },
  {
    title: 'Machinery & Equipment',
    items: ['Guards on all moving parts', 'Emergency stop buttons functional', 'Maintenance schedule followed', 'Operators trained & certified', 'Warning signs on hazardous machines'],
  },
  {
    title: 'Chemical Safety',
    items: ['MSDS for all chemicals', 'Proper chemical storage', 'Spill containment available', 'Exposure limits monitored', 'Ventilation for chemical areas'],
  },
  {
    title: 'Environmental & Welfare',
    items: ['Adequate lighting', 'Ventilation sufficient', 'Noise levels acceptable', 'Clean drinking water', 'Sanitary toilets adequate', 'Rest/lunch area provided', 'First aid kit stocked'],
  },
];

export default function OHSChecklistPage() {
  const [checks, setChecks] = useState<Record<string, 'yes' | 'no' | 'na' | ''>>({});

  const total = checklistCategories.reduce((s, c) => s + c.items.length, 0);
  const yes = Object.values(checks).filter(v => v === 'yes').length;
  const no = Object.values(checks).filter(v => v === 'no').length;
  const score = (yes + no) > 0 ? Math.round((yes / (yes + no)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/occupational"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="h-6 w-6 text-yellow-600" />OHS Checklist</h1>
            <p className="text-sm text-muted-foreground">Comprehensive occupational health & safety checklist</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button className="bg-occupational hover:bg-occupational/90"><Save className="mr-2 h-4 w-4" />Submit</Button>
        </div>
      </div>