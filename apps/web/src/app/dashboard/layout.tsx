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
