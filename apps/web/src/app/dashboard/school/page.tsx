'use client';

import { useState } from 'react';
import Link from 'next/link';
import { School, FileText, Syringe, Droplets, Activity, ClipboardList, Search, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const quickActions = [
  { title: 'Monthly Summary', subtitle: 'H1214', icon: FileText, href: '/dashboard/school/monthly', color: 'bg-blue-50 text-school border-blue-200' },
  { title: 'Student Defects', subtitle: 'H1046', icon: ClipboardList, href: '/dashboard/school/defects', color: 'bg-blue-50 text-school border-blue-200' },
  { title: 'WASH Survey', subtitle: 'H1015', icon: Droplets, href: '/dashboard/school/wash', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { title: 'Vaccine Program', subtitle: 'H1247', icon: Syringe, href: '/dashboard/school/vaccine', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { title: 'Activity Log', subtitle: 'H1014', icon: Activity, href: '/dashboard/school/activity', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
];

const recentSchools = [
  { id: 'SCH-001', name: 'Ananda College', type: 'National', students: 3200, lastVisit: '2025-02-10', grade1Done: true, grade4Done: true, grade7Done: false, grade10Done: false },