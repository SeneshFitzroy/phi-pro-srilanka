'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Users, FileText, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  const barData = [
    { month: 'Sep', food: 45, school: 12, epi: 8, occ: 6, admin: 20 },
    { month: 'Oct', food: 52, school: 15, epi: 12, occ: 8, admin: 22 },
    { month: 'Nov', food: 48, school: 18, epi: 15, occ: 7, admin: 25 },
    { month: 'Dec', food: 38, school: 8, epi: 20, occ: 5, admin: 18 },
    { month: 'Jan', food: 55, school: 20, epi: 10, occ: 9, admin: 28 },
    { month: 'Feb', food: 42, school: 16, epi: 14, occ: 7, admin: 24 },
  ];

  const phiPerformance = [
    { name: 'K. Perera', area: 'Colombo North', inspections: 45, reports: 12, compliance: 94, trend: 'up' },
    { name: 'M. Silva', area: 'Kaduwela East', inspections: 38, reports: 10, compliance: 88, trend: 'up' },