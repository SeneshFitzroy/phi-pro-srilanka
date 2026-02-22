'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Shield, BarChart3, FileCheck, AlertTriangle, Settings, ChevronRight, ClipboardList, MapPin, TrendingUp, UserPlus, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QUICK_ACTIONS = [
  { title: 'Pending Approvals', desc: 'Review & approve PHI submissions', icon: FileCheck, href: '/dashboard/management/approvals', count: 12, color: 'text-orange-500' },
  { title: 'User Management', desc: 'Manage PHI & staff accounts', icon: Users, href: '/dashboard/management/users', count: 45, color: 'text-blue-500' },
  { title: 'Complaints', desc: 'Review public complaints', icon: AlertTriangle, href: '/dashboard/management/complaints', count: 8, color: 'text-red-500' },
  { title: 'Permits & Licenses', desc: 'Issue & track permits', icon: ClipboardList, href: '/dashboard/management/permits', count: 15, color: 'text-green-500' },
  { title: 'Area Analytics', desc: 'Performance & trends', icon: BarChart3, href: '/dashboard/management/analytics', count: null, color: 'text-purple-500' },
  { title: 'System Settings', desc: 'Configure system preferences', icon: Settings, href: '/dashboard/settings', count: null, color: 'text-gray-500' },
];

const RECENT_SUBMISSIONS = [
  { id: 1, officer: 'K. Perera', form: 'H800 Inspection', area: 'Colombo North', date: '2025-02-10', status: 'pending' },
  { id: 2, officer: 'M. Silva', form: 'H399 Weekly', area: 'Kaduwela East', date: '2025-02-10', status: 'pending' },
  { id: 3, officer: 'R. Fernando', form: 'PHI-1 Monthly', area: 'Dehiwala West', date: '2025-02-09', status: 'approved' },
  { id: 4, officer: 'S. Jayawardena', form: 'SIV Investigation', area: 'Moratuwa', date: '2025-02-09', status: 'pending' },
  { id: 5, officer: 'A. Bandara', form: 'H1203 Factory', area: 'Homagama', date: '2025-02-08', status: 'approved' },
];

const statusColor = (s: string) => s === 'approved' ? 'bg-green-100 text-green-700' : s === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

export default function ManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-7 w-7 text-indigo-600" />Management Console</h1>
        <p className="text-sm text-muted-foreground">SPHI / MOH Admin — oversight, approvals, and analytics</p>
      </div>