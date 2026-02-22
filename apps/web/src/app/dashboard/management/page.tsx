'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Shield, BarChart3, FileCheck, AlertTriangle, Settings, ChevronRight, ClipboardList, MapPin, TrendingUp, UserPlus, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QUICK_ACTIONS = [
  { title: 'Pending Approvals', desc: 'Review & approve PHI submissions', icon: FileCheck, href: '/dashboard/management/approvals', count: 12, color: 'text-orange-500' },
  { title: 'User Management', desc: 'Manage PHI & staff accounts', icon: Users, href: '/dashboard/management/users', count: 45, color: 'text-blue-500' },
  { title: 'Complaints', desc: 'Review public complaints', icon: AlertTriangle, href: '/dashboard/management/complaints', count: 8, color: 'text-red-500' },
  { title: 'Permits & Licenses', desc: 'Issue & track permits', icon: ClipboardList, href: '/dashboard/management/permits', count: 15, color: 'text-green-500' },
  { title: 'Area Analytics', desc: 'Performance & trends', icon: BarChart3, href: '/dashboard/management/analytics', count: null, color: 'text-purple-500' },
  { title: 'System Settings', desc: 'Configure system preferences', icon: Settings, href: '/dashboard/settings', count: null, color: 'text-gray-500' },
];

const RECENT_SUBMISSIONS = [
  { id: 1, officer: 'K. Perera', form: 'H800 Inspection', area: 'Colombo North', date: '2025-02-10', status: 'pending' },
  { id: 2, officer: 'M. Silva', form: 'H399 Weekly', area: 'Kaduwela East', date: '2025-02-10', status: 'pending' },
  { id: 3, officer: 'R. Fernando', form: 'PHI-1 Monthly', area: 'Dehiwala West', date: '2025-02-09', status: 'approved' },
  { id: 4, officer: 'S. Jayawardena', form: 'SIV Investigation', area: 'Moratuwa', date: '2025-02-09', status: 'pending' },
  { id: 5, officer: 'A. Bandara', form: 'H1203 Factory', area: 'Homagama', date: '2025-02-08', status: 'approved' },
];

const statusColor = (s: string) => s === 'approved' ? 'bg-green-100 text-green-700' : s === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

export default function ManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-7 w-7 text-indigo-600" />Management Console</h1>
        <p className="text-sm text-muted-foreground">SPHI / MOH Admin — oversight, approvals, and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active PHI Officers', value: '24', icon: Users, color: 'text-blue-500' },
          { label: 'Pending Approvals', value: '12', icon: FileCheck, color: 'text-orange-500' },
          { label: 'Open Complaints', value: '8', icon: AlertTriangle, color: 'text-red-500' },
          { label: 'This Month Reports', value: '156', icon: TrendingUp, color: 'text-green-500' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map(action => (
          <Link key={action.title} href={action.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 p-4">
                <action.icon className={`h-8 w-8 shrink-0 ${action.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    {action.count != null && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">{action.count}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Submissions</CardTitle>
          <Link href="/dashboard/management/approvals"><Button variant="outline" size="sm">View All</Button></Link>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="py-2 text-left">Officer</th><th className="py-2 text-left">Form</th><th className="py-2 text-left">Area</th><th className="py-2 text-left">Date</th><th className="py-2 text-left">Status</th></tr></thead>
            <tbody>
              {RECENT_SUBMISSIONS.map(s => (
                <tr key={s.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 font-medium">{s.officer}</td>
                  <td className="py-2">{s.form}</td>
                  <td className="py-2 text-muted-foreground">{s.area}</td>
                  <td className="py-2 text-muted-foreground">{s.date}</td>
                  <td className="py-2"><span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColor(s.status)}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
