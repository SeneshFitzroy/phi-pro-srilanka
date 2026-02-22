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
