'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HardHat, Factory, FileText, ClipboardCheck, Users, Search, AlertTriangle, TrendingUp, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const quickActions = [
  { title: 'Factory Health', subtitle: 'H1203', icon: Factory, href: '/dashboard/occupational/factory-health', color: 'bg-amber-50 text-occupational border-amber-200' },
  { title: 'Safety Inspection', subtitle: 'H1204', icon: ClipboardCheck, href: '/dashboard/occupational/safety', color: 'bg-amber-50 text-occupational border-amber-200' },
  { title: 'Worker Survey', subtitle: 'H1205', icon: Users, href: '/dashboard/occupational/worker-survey', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { title: 'OHS Checklist', subtitle: 'Inspection', icon: FileText, href: '/dashboard/occupational/checklist', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
];

const recentFactories = [
  { id: 'FAC-001', name: 'Lanka Textile Mills', type: 'Textile', scale: 'LARGE', workers: 450, lastInspection: '2025-02-10', status: 'Active', risk: 'HIGH' },
  { id: 'FAC-002', name: 'Ceylon Rubber Works', type: 'Rubber', scale: 'MEDIUM', workers: 120, lastInspection: '2025-02-05', status: 'Active', risk: 'MEDIUM' },
  { id: 'FAC-003', name: 'Perera Mechanics', type: 'Workshop', scale: 'SMALL', workers: 15, lastInspection: '2025-01-28', status: 'Active', risk: 'LOW' },
  { id: 'FAC-004', name: 'Colombo Chemicals Ltd', type: 'Chemical', scale: 'LARGE', workers: 320, lastInspection: '2025-01-20', status: 'Active', risk: 'HIGH' },
  { id: 'FAC-005', name: 'Sunrise Bakery Factory', type: 'Food Processing', scale: 'MEDIUM', workers: 85, lastInspection: '2025-01-15', status: 'Active', risk: 'MEDIUM' },
];

export default function OccupationalHealthPage() {
  const [search, setSearch] = useState('');
  const filtered = recentFactories.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) || f.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><HardHat className="h-7 w-7 text-occupational" /> Occupational Health & Safety</h1>
        <p className="text-sm text-muted-foreground mt-1">Factory inspections: Small (&lt;50) • Medium (50-250) • Large (250+) workers</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-occupational">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Registered Factories</p><p className="text-2xl font-bold">67</p></div><Factory className="h-8 w-8 text-occupational/60" /></div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Inspected This Quarter</p><p className="text-2xl font-bold">42</p></div><TrendingUp className="h-8 w-8 text-green-500/60" /></div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Violations Found</p><p className="text-2xl font-bold">18</p></div><AlertTriangle className="h-8 w-8 text-red-500/60" /></div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Workers Covered</p><p className="text-2xl font-bold">4,280</p></div><Users className="h-8 w-8 text-blue-500/60" /></div></CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Scale Classification */}
      <Card>
        <CardHeader><CardTitle className="text-base">Factory Scale Classification</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <Building2 className="h-8 w-8 text-green-600 mx-auto" />
              <p className="mt-2 font-semibold text-green-700">Small</p>
              <p className="text-sm text-green-600">&lt;50 workers</p>
              <p className="text-lg font-bold text-green-700 mt-1">28</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
              <Building2 className="h-8 w-8 text-amber-600 mx-auto" />
              <p className="mt-2 font-semibold text-amber-700">Medium</p>
              <p className="text-sm text-amber-600">50-250 workers</p>
              <p className="text-lg font-bold text-amber-700 mt-1">25</p>