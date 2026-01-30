'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Biohazard, FileText, AlertTriangle, Search as SearchIcon, MapPin, Activity, TrendingUp, Clock, Bell, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const quickActions = [
  { title: 'Weekly Return', subtitle: 'H399', icon: FileText, href: '/dashboard/epidemiology/weekly', color: 'bg-red-50 text-epidemiology border-red-200' },
  { title: 'Monthly Return', subtitle: 'H411', icon: Activity, href: '/dashboard/epidemiology/monthly', color: 'bg-red-50 text-epidemiology border-red-200' },
  { title: 'Disease Notification', subtitle: 'Health 160', icon: Bell, href: '/dashboard/epidemiology/notification', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { title: 'Case Investigation', subtitle: 'SIV Form', icon: SearchIcon, href: '/dashboard/epidemiology/investigation', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { title: 'Disease Map', subtitle: 'GIS Clusters', icon: MapPin, href: '/dashboard/epidemiology/map', color: 'bg-rose-50 text-rose-600 border-rose-200' },
];

const notifiableDiseases = [
  'Dengue Fever', 'Dengue Haemorrhagic Fever', 'Typhoid', 'Chickenpox', 'Measles',
  'Leptospirosis', 'Hepatitis A', 'Hepatitis B', 'Food Poisoning', 'Rabies (Animal Bite)',
  'Tuberculosis', 'Malaria', 'COVID-19', 'Diarrhoea', 'Dysentery',
];

const recentCases = [
  { id: 'EPI-2025-041', disease: 'Dengue Fever', patient: 'A. Perera', age: 34, gn: 'Borella South', reportedDate: '2025-02-14', status: 'Under Investigation', priority: 'HIGH' },
  { id: 'EPI-2025-040', disease: 'Leptospirosis', patient: 'S. Fernando', age: 45, gn: 'Narahenpita', reportedDate: '2025-02-13', status: 'Investigated', priority: 'HIGH' },
  { id: 'EPI-2025-039', disease: 'Chickenpox', patient: 'M. Silva', age: 8, gn: 'Kirulapone', reportedDate: '2025-02-12', status: 'Investigated', priority: 'MEDIUM' },
  { id: 'EPI-2025-038', disease: 'Food Poisoning', patient: 'K. Bandara', age: 28, gn: 'Cinnamon Gardens', reportedDate: '2025-02-11', status: 'Closed', priority: 'LOW' },
  { id: 'EPI-2025-037', disease: 'Dengue Fever', patient: 'D. Jayasekera', age: 22, gn: 'Borella North', reportedDate: '2025-02-10', status: 'Under Investigation', priority: 'HIGH' },
  { id: 'EPI-2025-036', disease: 'Typhoid', patient: 'R. Wijesekera', age: 31, gn: 'Havelock Town', reportedDate: '2025-02-09', status: 'Investigated', priority: 'HIGH' },
];

export default function EpidemiologyPage() {
  const [search, setSearch] = useState('');

  const filteredCases = recentCases.filter(c =>
    c.disease.toLowerCase().includes(search.toLowerCase()) ||
    c.patient.toLowerCase().includes(search.toLowerCase()) ||
    c.gn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">