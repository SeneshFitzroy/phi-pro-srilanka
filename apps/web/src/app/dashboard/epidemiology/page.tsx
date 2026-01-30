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