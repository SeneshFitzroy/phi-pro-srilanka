'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  TestTube,
  ClipboardCheck,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const foodStats = [
  { label: 'Total Inspections', value: '45', icon: ClipboardCheck, color: 'text-food bg-food-light', change: '+8 this month' },
  { label: 'Grade A', value: '28', icon: CheckCircle, color: 'text-green-600 bg-green-50', change: '62%' },
  { label: 'Grade B', value: '12', icon: TrendingUp, color: 'text-amber-600 bg-amber-50', change: '27%' },
  { label: 'Grade C', value: '5', icon: AlertTriangle, color: 'text-red-600 bg-red-50', change: '11% - Follow up required' },
];

const quickActions = [
  { href: '/dashboard/food/inspection/new', icon: Plus, label: 'New Inspection (H800)', desc: '100-point scoring system' },
  { href: '/dashboard/food/registration', icon: FileText, label: 'Register Premises (H801)', desc: 'New food establishment' },
  { href: '/dashboard/food/sampling', icon: TestTube, label: 'Submit Sample (H802)', desc: 'Adulteration testing' },
  { href: '/dashboard/food/calendar', icon: Calendar, label: 'Inspection Calendar (H803)', desc: 'Schedule & follow-ups' },
];

const recentInspections = [
  { id: 'FI-2026-001', premises: 'Saman Hotel', grade: 'A', score: 94, date: '2026-02-27', status: 'Approved' },
  { id: 'FI-2026-002', premises: 'City Bakery', grade: 'B', score: 82, date: '2026-02-26', status: 'Submitted' },
  { id: 'FI-2026-003', premises: 'Fresh Mart', grade: 'A', score: 91, date: '2026-02-25', status: 'Approved' },
  { id: 'FI-2026-004', premises: 'Rasa Bojun', grade: 'C', score: 68, date: '2026-02-24', status: 'Follow-up Required' },
  { id: 'FI-2026-005', premises: 'Lanka Restaurant', grade: 'B', score: 78, date: '2026-02-23', status: 'Under Review' },
];

function GradeBadge({ grade }: { grade: string }) {
  const colors = {
    A: 'bg-green-100 text-green-800 border-green-200',
    B: 'bg-amber-100 text-amber-800 border-amber-200',
    C: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${colors[grade as keyof typeof colors] || ''}`}>
      Grade {grade}
    </span>
  );
}

export default function FoodModulePage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-food-light p-2">
            <UtensilsCrossed className="h-6 w-6 text-food" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Food Safety & Hygiene</h1>
            <p className="text-sm text-muted-foreground">H800 Inspections, Registration, Sampling & Enforcement</p>
          </div>
        </div>
        <Link href="/dashboard/food/inspection/new">
          <Button className="bg-food hover:bg-food-dark">
            <Plus className="mr-2 h-4 w-4" /> New Inspection
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {foodStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="group cursor-pointer transition-shadow hover:shadow-md hover:border-food/50">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-food-light p-2 group-hover:bg-food/20">
                  <action.icon className="h-5 w-5 text-food" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Inspections Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Inspections</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search premises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">ID</th>
                  <th className="pb-3 pr-4 font-medium">Premises</th>
                  <th className="pb-3 pr-4 font-medium">Grade</th>
                  <th className="pb-3 pr-4 font-medium">Score</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentInspections
                  .filter((i) =>
                    i.premises.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.id.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-accent/50">
                      <td className="py-3 pr-4 font-mono text-xs">{item.id}</td>
                      <td className="py-3 pr-4 font-medium">{item.premises}</td>
                      <td className="py-3 pr-4"><GradeBadge grade={item.grade} /></td>