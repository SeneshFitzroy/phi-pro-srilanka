'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  UtensilsCrossed,
  School,
  Activity,
  HardHat,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  LayoutDashboard,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { MentalHealthCheckin } from '@/components/mental-health-checkin';
import { DashboardMiniCalendar } from '@/components/dashboard-mini-calendar';
import { AdministrationPanel } from '@/components/administration-panel';
import { ComplaintsManager } from '@/components/complaints-manager';

type DashTab = 'overview' | 'administration' | 'complaints';

const statsCards = [
  {
    titleKey: 'dashboard.totalInspections',
    fallback: 'Inspections',
    value: '127',
    change: '+12%',
    trend: 'up' as const,
    icon: CheckCircle,
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconColor: 'text-blue-600',
  },
  {
    titleKey: 'dashboard.pendingReports',
    fallback: 'Pending Reports',
    value: '8',
    change: '-3',
    trend: 'down' as const,
    icon: Clock,
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconColor: 'text-amber-500',
  },
  {
    titleKey: 'dashboard.activeComplaints',
    fallback: 'Active Complaints',
    value: '5',
    change: '+2',
    trend: 'up' as const,
    icon: AlertTriangle,
    iconBg: 'bg-red-50 dark:bg-red-950/50',
    iconColor: 'text-red-500',
  },
  {
    titleKey: 'dashboard.upcomingTasks',
    fallback: 'Upcoming Tasks',
    value: '14',
    change: 'this week',
    trend: 'neutral' as const,
    icon: FileText,
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconColor: 'text-blue-500',
  },
];

const recentActivity = [
  { icon: UtensilsCrossed, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'Food inspection at "Saman Hotel" — Grade A', time: '2 hours ago' },
  { icon: Activity, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/50', text: 'Dengue case investigated — GN 547A', time: '4 hours ago' },
  { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'Complaint #CMP-2026-001234 assigned to you', time: '6 hours ago' },
  { icon: School, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'Grade 4 medical exam at Mahinda Vidyalaya completed', time: 'Yesterday' },
  { icon: HardHat, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/50', text: 'Factory H1203 inspection overdue — Star Garments', time: 'Yesterday' },
];

const upcomingTasks = [
  { title: 'Submit monthly report', date: 'Today', priority: 'high' },
  { title: 'Food premises re-inspection — Lotus Inn', date: 'Tomorrow', priority: 'medium' },
  { title: 'School medical camp — St. Joseph\'s', date: 'Wed, 18 Jun', priority: 'low' },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<DashTab>('overview');

  // Deep-link support: /dashboard?tab=administration | complaints. Clicking
  // plain "Dashboard" (no ?tab) resets to Overview.
  useEffect(() => {
    const q = searchParams.get('tab');
    setTab(q === 'administration' || q === 'complaints' ? q : 'overview');
  }, [searchParams]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
            {greeting()}, {user?.displayName?.split(' ')[0] || 'Officer'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {t('dashboard.overview') || 'Here\'s what\'s happening in your PHI area today'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Tab switcher — Overview · Administration · Complaints (merged in) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800">
        {([
          { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
          { id: 'administration' as const, label: 'Administration', icon: ClipboardList },
          { id: 'complaints' as const, label: 'Complaints', icon: AlertTriangle },
        ]).map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${tab === tb.id ? 'border-blue-600 text-blue-700 dark:text-blue-300' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <tb.icon className="h-4 w-4" /> {tb.label}
          </button>
        ))}
      </div>

      {tab === 'administration' ? (
        <AdministrationPanel />
      ) : tab === 'complaints' ? (
        <ComplaintsManager embedded />
      ) : (
      <>
      {/* Daily wellbeing check-in */}
      <MentalHealthCheckin />

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div
            key={stat.titleKey}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2.5 ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  stat.trend === 'up'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : stat.trend === 'down'
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {t(stat.titleKey) || stat.fallback}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Domain Quick Access — coloured stat tiles removed; the sidebar +
          dashboard search are now the primary way into the five modules. */}

      {/* Bottom Grid: Mini calendar + Recent Activity + Upcoming Tasks */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mini calendar */}
        <DashboardMiniCalendar />

        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('dashboard.recentActivity') || 'Recent Activity'}
            </h3>
            <Link href="/dashboard/activity" className="text-xs font-medium text-blue-700 hover:text-blue-600 dark:text-blue-400">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className={`mt-0.5 rounded-lg p-1.5 ${item.bg}`}>
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.text}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming Tasks</h3>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
              {upcomingTasks.length}
            </span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {upcomingTasks.map((task, idx) => (
              <div key={idx} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`h-2 w-2 rounded-full ${
                  task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{task.title}</p>
                  <p className="text-[11px] text-slate-400">{task.date}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
            <Link href="/dashboard/activity" className="text-xs font-medium text-blue-700 hover:text-blue-600 dark:text-blue-400">
              View all tasks →
            </Link>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}