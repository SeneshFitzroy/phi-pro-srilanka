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
