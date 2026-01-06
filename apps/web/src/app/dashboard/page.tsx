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