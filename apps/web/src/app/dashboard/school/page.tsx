'use client';

import { useState } from 'react';
import Link from 'next/link';
import { School, FileText, Syringe, Droplets, Activity, ClipboardList, Search, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const quickActions = [
  { title: 'Monthly Summary', subtitle: 'H1214', icon: FileText, href: '/dashboard/school/monthly', color: 'bg-blue-50 text-school border-blue-200' },
  { title: 'Student Defects', subtitle: 'H1046', icon: ClipboardList, href: '/dashboard/school/defects', color: 'bg-blue-50 text-school border-blue-200' },
  { title: 'WASH Survey', subtitle: 'H1015', icon: Droplets, href: '/dashboard/school/wash', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { title: 'Vaccine Program', subtitle: 'H1247', icon: Syringe, href: '/dashboard/school/vaccine', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { title: 'Activity Log', subtitle: 'H1014', icon: Activity, href: '/dashboard/school/activity', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
];

const recentSchools = [
  { id: 'SCH-001', name: 'Ananda College', type: 'National', students: 3200, lastVisit: '2025-02-10', grade1Done: true, grade4Done: true, grade7Done: false, grade10Done: false },
  { id: 'SCH-002', name: 'Rathnavali Balika', type: 'Provincial', students: 1800, lastVisit: '2025-02-08', grade1Done: true, grade4Done: false, grade7Done: false, grade10Done: false },
  { id: 'SCH-003', name: 'St. Thomas College', type: 'National', students: 2500, lastVisit: '2025-02-05', grade1Done: true, grade4Done: true, grade7Done: true, grade10Done: false },
  { id: 'SCH-004', name: 'Muslim Ladies College', type: 'Provincial', students: 1200, lastVisit: '2025-01-28', grade1Done: true, grade4Done: true, grade7Done: true, grade10Done: true },
  { id: 'SCH-005', name: 'Dharmaraja College', type: 'National', students: 2800, lastVisit: '2025-01-20', grade1Done: false, grade4Done: false, grade7Done: false, grade10Done: false },
];

export default function SchoolHealthPage() {
  const [search, setSearch] = useState('');

  const filteredSchools = recentSchools.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><School className="h-7 w-7 text-school" /> School Health Program</h1>
        <p className="text-sm text-muted-foreground mt-1">Medical inspections for Grades 1, 4, 7 & 10 — approximately 200 students per grade</p>
      </div>

      {/* Stats */}