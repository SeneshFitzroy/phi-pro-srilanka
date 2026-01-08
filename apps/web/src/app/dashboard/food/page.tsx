'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  TestTube,
  ClipboardCheck,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const foodStats = [
  { label: 'Total Inspections', value: '45', icon: ClipboardCheck, color: 'text-food bg-food-light', change: '+8 this month' },
  { label: 'Grade A', value: '28', icon: CheckCircle, color: 'text-green-600 bg-green-50', change: '62%' },
  { label: 'Grade B', value: '12', icon: TrendingUp, color: 'text-amber-600 bg-amber-50', change: '27%' },
  { label: 'Grade C', value: '5', icon: AlertTriangle, color: 'text-red-600 bg-red-50', change: '11% - Follow up required' },