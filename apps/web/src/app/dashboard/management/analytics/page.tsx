'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Users, FileText, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  const barData = [
    { month: 'Sep', food: 45, school: 12, epi: 8, occ: 6, admin: 20 },
    { month: 'Oct', food: 52, school: 15, epi: 12, occ: 8, admin: 22 },
    { month: 'Nov', food: 48, school: 18, epi: 15, occ: 7, admin: 25 },
    { month: 'Dec', food: 38, school: 8, epi: 20, occ: 5, admin: 18 },
    { month: 'Jan', food: 55, school: 20, epi: 10, occ: 9, admin: 28 },
    { month: 'Feb', food: 42, school: 16, epi: 14, occ: 7, admin: 24 },
  ];

  const phiPerformance = [
    { name: 'K. Perera', area: 'Colombo North', inspections: 45, reports: 12, compliance: 94, trend: 'up' },
    { name: 'M. Silva', area: 'Kaduwela East', inspections: 38, reports: 10, compliance: 88, trend: 'up' },
    { name: 'R. Fernando', area: 'Dehiwala West', inspections: 42, reports: 11, compliance: 91, trend: 'same' },
    { name: 'A. Bandara', area: 'Homagama', inspections: 35, reports: 9, compliance: 82, trend: 'down' },
    { name: 'S. Jayawardena', area: 'Moratuwa', inspections: 28, reports: 7, compliance: 75, trend: 'down' },
  ];

  const maxInspections = Math.max(...barData.reduce((s, d) => [...s, d.food + d.school + d.epi + d.occ + d.admin], [] as number[]));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-purple-500" />Area Analytics</h1>
          <p className="text-sm text-muted-foreground">MOH area performance overview & trends</p>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Activities (6mo)', value: '782', change: '+12%', icon: Activity, color: 'text-blue-500', up: true },
          { label: 'Avg. Compliance', value: '86%', change: '+3%', icon: FileText, color: 'text-green-500', up: true },
          { label: 'Disease Incidents', value: '79', change: '-8%', icon: AlertTriangle, color: 'text-red-500', up: false },
          { label: 'Active Officers', value: '24', change: '0', icon: Users, color: 'text-purple-500', up: true },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <span className={`text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-600'}`}>{kpi.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stacked Bar Chart (CSS-only) */}
      <Card>
        <CardHeader><CardTitle className="text-base">Monthly Activity Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-48">
            {barData.map(d => {
              const total = d.food + d.school + d.epi + d.occ + d.admin;
              const h = (total / (maxInspections || 1)) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{total}</span>
                  <div className="w-full flex flex-col rounded-t overflow-hidden" style={{ height: `${h}%` }}>
                    <div className="bg-green-500" style={{ flex: d.food }} />
                    <div className="bg-blue-500" style={{ flex: d.school }} />
                    <div className="bg-red-500" style={{ flex: d.epi }} />
                    <div className="bg-yellow-500" style={{ flex: d.occ }} />
                    <div className="bg-purple-500" style={{ flex: d.admin }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{d.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 justify-center flex-wrap">
            {[{ c: 'bg-green-500', l: 'Food' }, { c: 'bg-blue-500', l: 'School' }, { c: 'bg-red-500', l: 'Epi' }, { c: 'bg-yellow-500', l: 'Occ' }, { c: 'bg-purple-500', l: 'Admin' }].map(i => (
              <div key={i.l} className="flex items-center gap-1"><div className={`h-2.5 w-2.5 rounded ${i.c}`} /><span className="text-xs">{i.l}</span></div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PHI Performance Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">PHI Officer Performance (Last 6 Months)</CardTitle></CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="py-2 text-left">Officer</th><th className="py-2 text-left">Area</th><th className="py-2 text-center">Inspections</th><th className="py-2 text-center">Reports</th><th className="py-2 text-center">Compliance %</th><th className="py-2 text-center">Trend</th></tr></thead>
            <tbody>
              {phiPerformance.map(p => (
                <tr key={p.name} className="border-b">
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="py-2 text-muted-foreground">{p.area}</td>
                  <td className="py-2 text-center">{p.inspections}</td>
                  <td className="py-2 text-center">{p.reports}</td>
                  <td className="py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${p.compliance >= 90 ? 'bg-green-500' : p.compliance >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${p.compliance}%` }} /></div>
                      <span className="text-xs">{p.compliance}%</span>
                    </div>
                  </td>
                  <td className="py-2 text-center">{p.trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500 mx-auto" /> : p.trend === 'down' ? <TrendingDown className="h-4 w-4 text-red-500 mx-auto" /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Domain Distribution */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[