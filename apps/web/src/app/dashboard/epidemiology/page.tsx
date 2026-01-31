'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Biohazard, FileText, AlertTriangle, Search as SearchIcon, MapPin, Activity, TrendingUp, Clock, Bell, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const quickActions = [
  { title: 'Weekly Return', subtitle: 'H399', icon: FileText, href: '/dashboard/epidemiology/weekly', color: 'bg-red-50 text-epidemiology border-red-200' },
  { title: 'Monthly Return', subtitle: 'H411', icon: Activity, href: '/dashboard/epidemiology/monthly', color: 'bg-red-50 text-epidemiology border-red-200' },
  { title: 'Disease Notification', subtitle: 'Health 160', icon: Bell, href: '/dashboard/epidemiology/notification', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { title: 'Case Investigation', subtitle: 'SIV Form', icon: SearchIcon, href: '/dashboard/epidemiology/investigation', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { title: 'Disease Map', subtitle: 'GIS Clusters', icon: MapPin, href: '/dashboard/epidemiology/map', color: 'bg-rose-50 text-rose-600 border-rose-200' },
];

const notifiableDiseases = [
  'Dengue Fever', 'Dengue Haemorrhagic Fever', 'Typhoid', 'Chickenpox', 'Measles',
  'Leptospirosis', 'Hepatitis A', 'Hepatitis B', 'Food Poisoning', 'Rabies (Animal Bite)',
  'Tuberculosis', 'Malaria', 'COVID-19', 'Diarrhoea', 'Dysentery',
];

const recentCases = [
  { id: 'EPI-2025-041', disease: 'Dengue Fever', patient: 'A. Perera', age: 34, gn: 'Borella South', reportedDate: '2025-02-14', status: 'Under Investigation', priority: 'HIGH' },
  { id: 'EPI-2025-040', disease: 'Leptospirosis', patient: 'S. Fernando', age: 45, gn: 'Narahenpita', reportedDate: '2025-02-13', status: 'Investigated', priority: 'HIGH' },
  { id: 'EPI-2025-039', disease: 'Chickenpox', patient: 'M. Silva', age: 8, gn: 'Kirulapone', reportedDate: '2025-02-12', status: 'Investigated', priority: 'MEDIUM' },
  { id: 'EPI-2025-038', disease: 'Food Poisoning', patient: 'K. Bandara', age: 28, gn: 'Cinnamon Gardens', reportedDate: '2025-02-11', status: 'Closed', priority: 'LOW' },
  { id: 'EPI-2025-037', disease: 'Dengue Fever', patient: 'D. Jayasekera', age: 22, gn: 'Borella North', reportedDate: '2025-02-10', status: 'Under Investigation', priority: 'HIGH' },
  { id: 'EPI-2025-036', disease: 'Typhoid', patient: 'R. Wijesekera', age: 31, gn: 'Havelock Town', reportedDate: '2025-02-09', status: 'Investigated', priority: 'HIGH' },
];

export default function EpidemiologyPage() {
  const [search, setSearch] = useState('');

  const filteredCases = recentCases.filter(c =>
    c.disease.toLowerCase().includes(search.toLowerCase()) ||
    c.patient.toLowerCase().includes(search.toLowerCase()) ||
    c.gn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Biohazard className="h-7 w-7 text-epidemiology" /> Epidemiology & Disease Surveillance</h1>
          <p className="text-sm text-muted-foreground mt-1">48-hour investigation mandate • 45 notifiable diseases • 150m cluster radius</p>
        </div>
        <Link href="/dashboard/epidemiology/notification">
          <Button className="bg-epidemiology hover:bg-epidemiology/90"><Plus className="mr-2 h-4 w-4" />New Notification</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-epidemiology">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Active Cases</p><p className="text-2xl font-bold">23</p></div><AlertTriangle className="h-8 w-8 text-epidemiology/60" /></div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending Investigation</p><p className="text-2xl font-bold text-amber-600">8</p><p className="text-xs text-amber-500">within 48hr mandate</p></div><Clock className="h-8 w-8 text-amber-500/60" /></div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Investigated This Week</p><p className="text-2xl font-bold">15</p></div><TrendingUp className="h-8 w-8 text-green-500/60" /></div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-600">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Active Clusters</p><p className="text-2xl font-bold text-red-600">3</p><p className="text-xs text-red-500">150m radius alerts</p></div><MapPin className="h-8 w-8 text-red-600/60" /></div></CardContent>
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

      {/* Top Diseases this week */}
      <Card>
        <CardHeader><CardTitle className="text-base">Disease Trend — This Week</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Dengue Fever', count: 12, max: 20, color: 'bg-red-500' },
              { name: 'Leptospirosis', count: 4, max: 20, color: 'bg-amber-500' },
              { name: 'Chickenpox', count: 3, max: 20, color: 'bg-blue-500' },
              { name: 'Food Poisoning', count: 2, max: 20, color: 'bg-green-500' },
              { name: 'Typhoid', count: 2, max: 20, color: 'bg-purple-500' },
            ].map(d => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-32 text-sm shrink-0">{d.name}</span>
                <div className="flex-1 h-6 rounded-full bg-accent overflow-hidden">
                  <div className={`h-full rounded-full ${d.color} transition-all`} style={{ width: `${(d.count / d.max) * 100}%` }} />
                </div>
                <span className="text-sm font-bold w-8 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifiable Diseases Quick Reference */}
      <Card>
        <CardHeader><CardTitle className="text-base">Notifiable Diseases (Quick Reference)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {notifiableDiseases.map((d) => (
              <span key={d} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700">{d}</span>
            ))}
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500">+30 more</span>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Cases</CardTitle>
          <div className="relative"><SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cases..." className="pl-9 w-64" /></div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">Case ID</th><th className="pb-3 pr-4 font-medium">Disease</th><th className="pb-3 pr-4 font-medium">Patient</th><th className="pb-3 pr-4 font-medium">Age</th><th className="pb-3 pr-4 font-medium">GN Division</th><th className="pb-3 pr-4 font-medium">Reported</th><th className="pb-3 pr-4 font-medium">Priority</th><th className="pb-3 font-medium">Status</th></tr></thead>
              <tbody>
                {filteredCases.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-accent/50">
                    <td className="py-3 pr-4 font-mono text-xs">{c.id}</td>
                    <td className="py-3 pr-4 font-medium">{c.disease}</td>
                    <td className="py-3 pr-4">{c.patient}</td>
                    <td className="py-3 pr-4">{c.age}</td>
                    <td className="py-3 pr-4">{c.gn}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.reportedDate}</td>
                    <td className="py-3 pr-4"><span className={`rounded px-2 py-0.5 text-xs font-bold ${c.priority === 'HIGH' ? 'bg-red-100 text-red-700' : c.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{c.priority}</span></td>
                    <td className="py-3"><span className={`text-xs font-medium ${c.status === 'Under Investigation' ? 'text-amber-600' : c.status === 'Investigated' ? 'text-green-600' : 'text-gray-500'}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
