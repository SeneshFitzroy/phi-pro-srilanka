'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  UtensilsCrossed,
  School,
  Activity,
  HardHat,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const statsCards = [
  {
    titleKey: 'dashboard.totalInspections',
    fallback: 'Inspections',
    value: '127',
    change: '+12%',
    trend: 'up' as const,
    icon: CheckCircle,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-500',
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

const domainCards = [
  {
    titleKey: 'nav.food', fallback: 'Food Safety', icon: UtensilsCrossed, href: '/dashboard/food',
    stats: '45 inspections • 12 pending',
    accent: 'from-emerald-500 to-green-600',
    accentLight: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    hoverShadow: 'hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20',
  },
  {
    titleKey: 'nav.school', fallback: 'School Health', icon: School, href: '/dashboard/school',
    stats: '12 schools visited • 3 pending',
    accent: 'from-blue-500 to-indigo-600',
    accentLight: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-400',
    hoverShadow: 'hover:shadow-blue-100 dark:hover:shadow-blue-900/20',
  },
  {
    titleKey: 'nav.epidemiology', fallback: 'Epidemiology', icon: Activity, href: '/dashboard/epidemiology',
    stats: '3 active investigations',
    accent: 'from-red-500 to-rose-600',
    accentLight: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-400',
    hoverShadow: 'hover:shadow-red-100 dark:hover:shadow-red-900/20',
  },
  {
    titleKey: 'nav.occupational', fallback: 'Occupational Health', icon: HardHat, href: '/dashboard/occupational',
    stats: '8 factories inspected',
    accent: 'from-amber-500 to-orange-600',
    accentLight: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-400',
    hoverShadow: 'hover:shadow-amber-100 dark:hover:shadow-amber-900/20',
  },
  {
    titleKey: 'nav.administration', fallback: 'Administration', icon: ClipboardList, href: '/dashboard/administration',
    stats: 'Monthly report due',
    accent: 'from-violet-500 to-purple-600',
    accentLight: 'bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800',
    textColor: 'text-violet-700 dark:text-violet-400',
    hoverShadow: 'hover:shadow-violet-100 dark:hover:shadow-violet-900/20',
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
            {greeting()}, {user?.displayName?.split(' ')[0] || 'Officer'} 👋
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

      {/* Domain Quick Access */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Five Core Domains</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {domainCards.map((domain) => (
            <Link
              key={domain.titleKey}
              href={domain.href}
              className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:shadow-lg ${domain.accentLight} ${domain.hoverShadow}`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${domain.accent}`} />
              <div className={`mt-1 inline-flex rounded-lg p-2 ${domain.accentLight}`}>
                <domain.icon className={`h-6 w-6 ${domain.textColor}`} />
              </div>
              <h3 className={`mt-3 text-sm font-semibold ${domain.textColor}`}>
                {t(domain.titleKey) || domain.fallback}
              </h3>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{domain.stats}</p>
              <ArrowRight className="mt-2 h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Activity + Tasks */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('dashboard.recentActivity') || 'Recent Activity'}
            </h3>
            <button className="text-xs font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
              View all
            </button>
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
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
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
            <button className="text-xs font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
              View all tasks →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}