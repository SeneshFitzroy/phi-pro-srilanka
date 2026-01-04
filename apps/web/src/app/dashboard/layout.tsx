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