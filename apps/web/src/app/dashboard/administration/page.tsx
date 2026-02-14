'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, FileText, MapPin, BarChart3, Calendar, Map, Search, ClipboardList, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const quickActions = [
  { title: 'GN Area Mapping', subtitle: 'H795', icon: MapPin, href: '/dashboard/administration/gn-mapping', color: 'bg-purple-50 text-administration border-purple-200' },
  { title: 'Five-Year Stats', subtitle: 'H796', icon: BarChart3, href: '/dashboard/administration/statistics', color: 'bg-purple-50 text-administration border-purple-200' },
  { title: 'Monthly Report', subtitle: 'PHI-1', icon: FileText, href: '/dashboard/administration/monthly-report', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { title: 'Area Survey', subtitle: 'H1200', icon: Map, href: '/dashboard/administration/area-survey', color: 'bg-violet-50 text-violet-600 border-violet-200' },
  { title: 'Spot Map', subtitle: 'A3 Color', icon: Map, href: '/dashboard/administration/spot-map', color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200' },
];

const gnDivisions = [
  { code: 'GN-001', name: 'Borella South', population: 4200, households: 980, lastSurvey: '2025-01-15', status: 'Complete' },
  { code: 'GN-002', name: 'Borella North', population: 3800, households: 890, lastSurvey: '2025-01-20', status: 'Complete' },
  { code: 'GN-003', name: 'Narahenpita', population: 5100, households: 1200, lastSurvey: '2025-02-01', status: 'In Progress' },
  { code: 'GN-004', name: 'Kirulapone', population: 3200, households: 750, lastSurvey: '2024-12-10', status: 'Complete' },
  { code: 'GN-005', name: 'Cinnamon Gardens', population: 2800, households: 640, lastSurvey: '2024-11-20', status: 'Outdated' },
  { code: 'GN-006', name: 'Havelock Town', population: 4500, households: 1050, lastSurvey: '2024-10-05', status: 'Outdated' },
];

export default function AdministrationPage() {
  const [search, setSearch] = useState('');
  const filtered = gnDivisions.filter(gn =>
    gn.name.toLowerCase().includes(search.toLowerCase()) || gn.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPop = gnDivisions.reduce((s, g) => s + g.population, 0);
  const totalHH = gnDivisions.reduce((s, g) => s + g.households, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="h-7 w-7 text-administration" /> Administration & Reporting</h1>
        <p className="text-sm text-muted-foreground mt-1">GN area management, statistical reporting, and area surveys</p>
      </div>