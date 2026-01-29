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