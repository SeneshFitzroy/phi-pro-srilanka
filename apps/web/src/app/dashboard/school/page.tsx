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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-school">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Schools in Area</p><p className="text-2xl font-bold">32</p></div><Users className="h-8 w-8 text-school/60" /></div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Inspected This Term</p><p className="text-2xl font-bold">18</p></div><TrendingUp className="h-8 w-8 text-green-500/60" /></div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Defects Found</p><p className="text-2xl font-bold">124</p></div><AlertTriangle className="h-8 w-8 text-amber-500/60" /></div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Vaccines Administered</p><p className="text-2xl font-bold">856</p></div><Syringe className="h-8 w-8 text-purple-500/60" /></div></CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className={`cursor-pointer border transition hover:shadow-md ${action.color}`}>
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <action.icon className="h-8 w-8" />
                <p className="font-semibold text-sm">{action.title}</p>
                <p className="text-xs opacity-75">{action.subtitle}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Vaccination Info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Vaccination Schedule</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-center gap-2"><Syringe className="h-5 w-5 text-purple-600" /><h3 className="font-semibold text-purple-700">HPV Vaccine</h3></div>
              <p className="mt-1 text-sm text-purple-600">Girls — Grade 6 — 2 doses (0, 6 months)</p>
              <div className="mt-2 flex items-center gap-4">
                <div><p className="text-xs text-purple-500">Dose 1</p><p className="text-lg font-bold text-purple-700">142/156</p></div>
                <div><p className="text-xs text-purple-500">Dose 2</p><p className="text-lg font-bold text-purple-700">128/156</p></div>
              </div>
            </div>
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
              <div className="flex items-center gap-2"><Syringe className="h-5 w-5 text-indigo-600" /><h3 className="font-semibold text-indigo-700">aP/dT Vaccine</h3></div>
              <p className="mt-1 text-sm text-indigo-600">All students — Grade 7 — 1 dose</p>
              <div className="mt-2 flex items-center gap-4">
                <div><p className="text-xs text-indigo-500">Administered</p><p className="text-lg font-bold text-indigo-700">189/203</p></div>
                <div><p className="text-xs text-indigo-500">Coverage</p><p className="text-lg font-bold text-indigo-700">93.1%</p></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}