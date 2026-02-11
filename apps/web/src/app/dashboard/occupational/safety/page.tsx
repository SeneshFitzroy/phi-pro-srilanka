'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, ClipboardCheck, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const safetySections = [
  {
    title: 'Fire Safety',
    items: [
      { id: 'fire_extinguishers', label: 'Fire extinguishers present & serviced?', options: ['Yes', 'No', 'Partial'] },
      { id: 'fire_exits', label: 'Fire exits clearly marked?', options: ['Yes', 'No'] },
      { id: 'exit_routes', label: 'Exit routes unobstructed?', options: ['Yes', 'No'] },
      { id: 'fire_alarm', label: 'Fire alarm system?', options: ['Yes - Functional', 'Yes - Faulty', 'No'] },
      { id: 'fire_drill', label: 'Fire drills conducted?', options: ['Regular', 'Occasional', 'Never'] },
      { id: 'fire_plan', label: 'Emergency evacuation plan posted?', options: ['Yes', 'No'] },
    ]
  },
  {
    title: 'Machine Safety',
    items: [
      { id: 'machine_guards', label: 'Machine guards in place?', options: ['All', 'Most', 'Some', 'None'] },
      { id: 'lockout_tagout', label: 'Lockout/tagout procedures?', options: ['Yes', 'No'] },
      { id: 'maintenance_schedule', label: 'Maintenance schedule followed?', options: ['Regular', 'Irregular', 'None'] },
      { id: 'safe_distances', label: 'Safe working distances maintained?', options: ['Yes', 'No'] },
      { id: 'training_machines', label: 'Workers trained on machines?', options: ['Yes - All', 'Yes - Some', 'No'] },
    ]
  },
  {
    title: 'Personal Protective Equipment (PPE)',
    items: [
      { id: 'ppe_provided', label: 'PPE provided to all workers?', options: ['Yes', 'No', 'Partial'] },
      { id: 'ppe_used', label: 'PPE usage compliance?', options: ['High (>90%)', 'Medium (50-90%)', 'Low (<50%)'] },
      { id: 'ppe_types', label: 'PPE types available', options: ['Comprehensive', 'Basic', 'Minimal'] },
      { id: 'ppe_condition', label: 'PPE condition?', options: ['Good', 'Fair', 'Poor'] },
    ]
  },
  {
    title: 'Electrical Safety',
    items: [
      { id: 'wiring', label: 'Electrical wiring condition?', options: ['Good', 'Fair', 'Poor/Exposed'] },
      { id: 'grounding', label: 'Equipment properly grounded?', options: ['Yes', 'No', 'Partial'] },
      { id: 'circuit_breakers', label: 'Circuit breakers/fuses adequate?', options: ['Yes', 'No'] },
      { id: 'waterproof', label: 'Electrical in wet areas waterproof?', options: ['Yes', 'No', 'N/A'] },
    ]
  },
  {
    title: 'Structural Safety',
    items: [
      { id: 'building_condition', label: 'Building structural condition?', options: ['Good', 'Fair', 'Poor'] },
      { id: 'floor_condition', label: 'Floor condition (slip risk)?', options: ['Good', 'Fair', 'Poor'] },
      { id: 'stacking', label: 'Material stacking safe?', options: ['Yes', 'No'] },
      { id: 'signage', label: 'Safety signage adequate?', options: ['Yes', 'Partial', 'No'] },
    ]
  },
];

export default function SafetyInspectionPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const update = (id: string, val: string) => setValues(prev => ({ ...prev, [id]: val }));

  // Calculate compliance score
  const total = safetySections.reduce((s, sec) => s + sec.items.length, 0);
  const positive = Object.values(values).filter(v => v.startsWith('Yes') || v === 'Good' || v === 'All' || v === 'Regular' || v === 'Comprehensive' || v.includes('>90')).length;
  const score = total > 0 ? Math.round((positive / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/occupational"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="h-6 w-6 text-occupational" />Safety Inspection (H1204)</h1>
            <p className="text-sm text-muted-foreground">Assess workplace safety conditions and compliance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>