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
];

const quickActions = [
  { href: '/dashboard/food/inspection/new', icon: Plus, label: 'New Inspection (H800)', desc: '100-point scoring system' },
  { href: '/dashboard/food/registration', icon: FileText, label: 'Register Premises (H801)', desc: 'New food establishment' },
  { href: '/dashboard/food/sampling', icon: TestTube, label: 'Submit Sample (H802)', desc: 'Adulteration testing' },
  { href: '/dashboard/food/calendar', icon: Calendar, label: 'Inspection Calendar (H803)', desc: 'Schedule & follow-ups' },
];

const recentInspections = [
  { id: 'FI-2026-001', premises: 'Saman Hotel', grade: 'A', score: 94, date: '2026-02-27', status: 'Approved' },
  { id: 'FI-2026-002', premises: 'City Bakery', grade: 'B', score: 82, date: '2026-02-26', status: 'Submitted' },
  { id: 'FI-2026-003', premises: 'Fresh Mart', grade: 'A', score: 91, date: '2026-02-25', status: 'Approved' },
  { id: 'FI-2026-004', premises: 'Rasa Bojun', grade: 'C', score: 68, date: '2026-02-24', status: 'Follow-up Required' },
  { id: 'FI-2026-005', premises: 'Lanka Restaurant', grade: 'B', score: 78, date: '2026-02-23', status: 'Under Review' },
];

function GradeBadge({ grade }: { grade: string }) {
  const colors = {
    A: 'bg-green-100 text-green-800 border-green-200',
    B: 'bg-amber-100 text-amber-800 border-amber-200',
    C: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${colors[grade as keyof typeof colors] || ''}`}>
      Grade {grade}
    </span>