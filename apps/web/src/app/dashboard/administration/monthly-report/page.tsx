'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, FileText, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Section { title: string; items: { key: string; label: string }[]; color: string; }

const SECTIONS: Section[] = [
  {
    title: '1. Food & Water Safety',
    color: 'bg-green-50 dark:bg-green-950/10',
    items: [
      { key: 'f1', label: 'Food premises inspected' },
      { key: 'f2', label: 'Food samples collected' },
      { key: 'f3', label: 'Water samples collected' },
      { key: 'f4', label: 'Premises registered (new)' },
      { key: 'f5', label: 'Court cases filed' },
      { key: 'f6', label: 'Seizures/destructions' },
      { key: 'f7', label: 'Warnings issued' },
      { key: 'f8', label: 'Food handler medicals' },
    ],
  },
  {
    title: '2. Disease Surveillance',
    color: 'bg-red-50 dark:bg-red-950/10',
    items: [
      { key: 'd1', label: 'Notifiable diseases reported' },
      { key: 'd2', label: 'Case investigations done' },
      { key: 'd3', label: 'Dengue cases' },
      { key: 'd4', label: 'Dengue breeding sites destroyed' },
      { key: 'd5', label: 'Source reduction campaigns' },
      { key: 'd6', label: 'Fogging operations' },
    ],
  },
  {
    title: '3. School Health',
    color: 'bg-blue-50 dark:bg-blue-950/10',
    items: [
      { key: 's1', label: 'Schools visited' },
      { key: 's2', label: 'Students examined' },
      { key: 's3', label: 'Defects found' },
      { key: 's4', label: 'Students referred' },
      { key: 's5', label: 'HPV vaccines given' },
      { key: 's6', label: 'aP/dT vaccines given' },
      { key: 's7', label: 'WASH inspections' },
    ],
  },
  {
    title: '4. Occupational Health',
    color: 'bg-yellow-50 dark:bg-yellow-950/10',
    items: [
      { key: 'o1', label: 'Factories inspected' },
      { key: 'o2', label: 'Workers surveyed' },
      { key: 'o3', label: 'Safety violations found' },
      { key: 'o4', label: 'Notices issued' },
      { key: 'o5', label: 'Occupational disease cases' },
    ],
  },
  {
    title: '5. Environmental & Sanitation',
    color: 'bg-cyan-50 dark:bg-cyan-950/10',
    items: [
      { key: 'e1', label: 'Sanitary inspections' },
      { key: 'e2', label: 'Nuisance complaints investigated' },
      { key: 'e3', label: 'Premises improved (sanitary)' },
      { key: 'e4', label: 'Drain/garbage complaints' },
      { key: 'e5', label: 'Building plan approvals' },
    ],
  },
  {
    title: '6. Health Education & Other',
    color: 'bg-purple-50 dark:bg-purple-950/10',
    items: [
      { key: 'h1', label: 'Health education sessions' },
      { key: 'h2', label: 'Participants in HE sessions' },
      { key: 'h3', label: 'Home visits' },
      { key: 'h4', label: 'Office days' },
      { key: 'h5', label: 'Field days' },
      { key: 'h6', label: 'Meetings attended' },
      { key: 'h7', label: 'Leave days' },
    ],
  },
];

export default function MonthlyReportPage() {
  const [data, setData] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    SECTIONS.forEach(s => s.items.forEach(i => { d[i.key] = ''; }));
    return d;
  });
