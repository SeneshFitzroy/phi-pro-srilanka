'use client';

import { useTranslation } from 'react-i18next';
import {
  UtensilsCrossed,
  School,
  Activity,
  HardHat,
  ClipboardList,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statsCards = [
  {
    titleKey: 'dashboard.totalInspections',
    value: '127',
    change: '+12%',
    trend: 'up' as const,
    icon: CheckCircle,
    color: 'text-green-500 bg-green-50',
  },
  {
    titleKey: 'dashboard.pendingReports',
    value: '8',
    change: '-3',
    trend: 'down' as const,
    icon: Clock,
    color: 'text-amber-500 bg-amber-50',
  },
  {
    titleKey: 'dashboard.activeComplaints',
    value: '5',
    change: '+2',
    trend: 'up' as const,
    icon: AlertTriangle,
    color: 'text-red-500 bg-red-50',
  },
  {
    titleKey: 'dashboard.upcomingTasks',
    value: '14',
    change: 'this week',
    trend: 'neutral' as const,
    icon: FileText,
    color: 'text-blue-500 bg-blue-50',
  },
];

const domainCards = [
  { titleKey: 'nav.food', icon: UtensilsCrossed, color: 'border-food/30 bg-food-light/30', href: '/dashboard/food', stats: '45 inspections this month' },
  { titleKey: 'nav.school', icon: School, color: 'border-school/30 bg-school-light/30', href: '/dashboard/school', stats: '12 schools visited' },
  { titleKey: 'nav.epidemiology', icon: Activity, color: 'border-epidemiology/30 bg-epidemiology-light/30', href: '/dashboard/epidemiology', stats: '3 active investigations' },
  { titleKey: 'nav.occupational', icon: HardHat, color: 'border-occupational/30 bg-occupational-light/30', href: '/dashboard/occupational', stats: '8 factories inspected' },
  { titleKey: 'nav.administration', icon: ClipboardList, color: 'border-administration/30 bg-administration-light/30', href: '/dashboard/administration', stats: 'Monthly report due' },
];

const recentActivity = [
  { type: 'food', text: 'Food inspection at "Saman Hotel" – Grade A', time: '2 hours ago' },
  { type: 'epi', text: 'Dengue case investigated – GN 547A', time: '4 hours ago' },
  { type: 'complaint', text: 'Complaint #CMP-2026-001234 assigned to you', time: '6 hours ago' },
  { type: 'school', text: 'Grade 4 medical exam at Mahinda Vidyalaya completed', time: 'Yesterday' },
  { type: 'ohs', text: 'Factory H1203 inspection overdue – Star Garments', time: 'Yesterday' },
];

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.overview')}</p>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.titleKey}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t(stat.titleKey)}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === 'up'
                        ? 'text-green-600'
                        : stat.trend === 'down'
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>