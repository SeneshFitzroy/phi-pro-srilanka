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