'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
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
  LogOut,
  ChevronLeft,
  Bell,
  Globe,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/i18n-context';
import { AuthGuard } from '@/components/auth-guard';

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', exact: true },
  { href: '/dashboard/food', icon: UtensilsCrossed, labelKey: 'nav.food', accent: 'emerald' },
  { href: '/dashboard/school', icon: School, labelKey: 'nav.school', accent: 'blue' },
  { href: '/dashboard/epidemiology', icon: Activity, labelKey: 'nav.epidemiology', accent: 'red' },
  { href: '/dashboard/occupational', icon: HardHat, labelKey: 'nav.occupational', accent: 'amber' },
  { href: '/dashboard/administration', icon: ClipboardList, labelKey: 'nav.administration', accent: 'violet' },
];

const secondaryNavItems = [
  { href: '/dashboard/management/complaints', icon: MessageSquare, labelKey: 'nav.complaints' },
  { href: '/dashboard/management/permits', icon: FileText, labelKey: 'nav.permits' },
  { href: '/dashboard/management/analytics', icon: BarChart3, labelKey: 'nav.analytics' },
];

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'si', label: 'සිං' },
  { code: 'ta', label: 'தமி' },
];

const accentMap: Record<string, { bg: string; text: string; activeBg: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-500/15' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', activeBg: 'bg-blue-500/15' },
  red: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', activeBg: 'bg-red-500/15' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', activeBg: 'bg-amber-500/15' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', activeBg: 'bg-violet-500/15' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex flex-col bg-white shadow-xl transition-all duration-300 dark:bg-slate-900 lg:relative lg:shadow-none lg:border-r lg:border-slate-200 dark:lg:border-slate-800',
            collapsed ? 'w-[72px]' : 'w-[260px]',
            mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          {/* Logo */}
          <div className={cn('flex h-16 items-center border-b border-slate-100 dark:border-slate-800', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
            {!collapsed && (
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <Image src="/phi-emblem.png" alt="PHI" width={32} height={32} className="rounded-lg shadow-sm" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">PHI-PRO</span>
                  <span className="text-[10px] font-medium leading-none text-slate-400">Health Enforcement</span>
                </div>
              </Link>
            )}
            {collapsed && (
              <Image src="/phi-emblem.png" alt="PHI" width={32} height={32} className="rounded-lg shadow-sm" />
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 lg:block"
            >
              <ChevronLeft className={cn('h-4 w-4 transition-transform duration-200', collapsed && 'rotate-180')} />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {!collapsed && (
              <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Core Domains
              </div>
            )}
            <div className="space-y-0.5">
              {mainNavItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + '/');
                const accent = item.accent ? accentMap[item.accent] : null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                      isActive
                        ? accent
                          ? `${accent.activeBg} ${accent.text}`
                        : 'bg-blue-700/10 text-blue-700 dark:text-blue-400'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                      collapsed && 'justify-center px-2',
                    )}
                    title={collapsed ? t(item.labelKey) : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className={cn(
                      'h-[18px] w-[18px] shrink-0 transition-colors',
                      isActive && accent ? accent.text : isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300',
                    )} />
                    {!collapsed && <span>{t(item.labelKey)}</span>}
                    {!collapsed && isActive && (
                      <div className={cn('ml-auto h-1.5 w-1.5 rounded-full', accent ? accent.text.replace('text-', 'bg-').split(' ')[0] : 'bg-blue-700')} />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="my-4 mx-3 border-t border-slate-100 dark:border-slate-800" />

            {!collapsed && (
              <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Management
              </div>
            )}
            <div className="space-y-0.5">
              {secondaryNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                      isActive
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                      collapsed && 'justify-center px-2',
                    )}
                    title={collapsed ? t(item.labelKey) : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className={cn('h-[18px] w-[18px] shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300', isActive && 'text-slate-700 dark:text-slate-200')} />
                    {!collapsed && <span>{t(item.labelKey)}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom User Section */}
          <div className="border-t border-slate-100 p-3 dark:border-slate-800">
            <Link
              href="/dashboard/settings"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                collapsed && 'justify-center px-2',
              )}
            >
              <Settings className="h-[18px] w-[18px]" />
              {!collapsed && <span>{t('nav.settings')}</span>}
            </Link>

            <div className={cn('mt-2 flex items-center gap-3 rounded-lg px-3 py-2', collapsed && 'justify-center px-2')}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-xs font-bold text-white shadow-sm">
                {initials}
              </div>
              {!collapsed && (
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">
                    {user?.displayName || 'PHI Officer'}
                  </span>
                  <span className="truncate text-[11px] text-slate-400">
                    {user?.email || ''}
                  </span>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={() => signOut()}
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
            <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Search */}
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800 sm:flex">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-40 bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none dark:text-slate-300 lg:w-56"
                />
                <kbd className="hidden rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-600 dark:bg-slate-700 lg:inline-block">⌘K</kbd>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language switcher */}
              <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
                <Globe className="ml-1.5 h-3 w-3 text-slate-400" />
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as 'en' | 'si' | 'ta')}
                    className={cn(
                      'rounded-md px-2 py-1 text-[11px] font-medium transition-all',
                      language === lang.code
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Notifications */}
              <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
              </button>

              {/* User avatar — mobile only */}
              <Link href="/dashboard/profile" className="lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-xs font-bold text-white shadow-sm">
                  {initials}
                </div>
              </Link>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950 lg:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}