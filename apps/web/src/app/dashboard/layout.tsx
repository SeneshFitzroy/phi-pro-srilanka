'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  LayoutDashboard,
  UtensilsCrossed,
  School,
  Activity,
  HardHat,
  ClipboardList,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  Bell,
  Globe,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/i18n-context';

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { href: '/dashboard/food', icon: UtensilsCrossed, labelKey: 'nav.food', color: 'text-food' },
  { href: '/dashboard/school', icon: School, labelKey: 'nav.school', color: 'text-school' },
  { href: '/dashboard/epidemiology', icon: Activity, labelKey: 'nav.epidemiology', color: 'text-epidemiology' },
  { href: '/dashboard/occupational', icon: HardHat, labelKey: 'nav.occupational', color: 'text-occupational' },
  { href: '/dashboard/administration', icon: ClipboardList, labelKey: 'nav.administration', color: 'text-administration' },
];

const secondaryNavItems = [
  { href: '/dashboard/complaints', icon: MessageSquare, labelKey: 'nav.complaints' },
  { href: '/dashboard/permits', icon: FileText, labelKey: 'nav.permits' },
  { href: '/dashboard/analytics', icon: BarChart3, labelKey: 'nav.analytics' },
];

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'si', label: 'සිං' },
  { code: 'ta', label: 'தமி' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 lg:relative',
          collapsed ? 'w-[68px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              <span className="text-lg font-bold text-primary">PHI-PRO</span>
            </Link>
          )}
          {collapsed && (
            <Shield className="mx-auto h-7 w-7 text-primary" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden text-muted-foreground hover:text-foreground lg:block"
          >
            <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'