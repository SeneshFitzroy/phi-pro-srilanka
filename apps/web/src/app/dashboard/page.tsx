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