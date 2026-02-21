'use client';

import Link from 'next/link';
import { ArrowLeft, AlertCircle, Bell, Shield, Bug, Droplets, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ALERTS = [
  { id: 1, type: 'critical', icon: AlertCircle, title: 'Dengue Outbreak Alert — Western Province', date: '2025-02-10', body: 'Increased dengue cases detected in Colombo, Gampaha, and Kalutara districts. Breeding index elevated above threshold. Take precautions: eliminate stagnant water, use mosquito nets, seek medical attention for high fever.', area: 'Western Province' },
  { id: 2, type: 'warning', icon: Bug, title: 'Leptospirosis Risk — Post-Flood Advisory', date: '2025-02-08', body: 'Following recent floods in Ratnapura district, leptospirosis risk is elevated. Avoid contact with flood water, wear protective footwear. Farmers and workers should take extra precautions.', area: 'Sabaragamuwa' },
  { id: 3, type: 'info', icon: Droplets, title: 'Water Quality Advisory — Kelani River Basin', date: '2025-02-05', body: 'Routine testing indicates elevated coliform levels in Kelani River downstream areas. Boil water before consumption if sourced from river or unprotected wells in affected GN divisions.', area: 'Colombo / Gampaha' },
  { id: 4, type: 'info', icon: Shield, title: 'HPV Vaccination Campaign — Schools', date: '2025-01-28', body: 'The National HPV Vaccination Programme for Grade 6 girls is ongoing. Please ensure consent forms are completed. Contact your nearest MOH office for information.', area: 'Nationwide' },
  { id: 5, type: 'warning', icon: AlertCircle, title: 'Food Recall — Contaminated Canned Fish', date: '2025-01-20', body: 'Batch XYZ-2025-001 of "Ocean Fresh" canned mackerel recalled due to suspected histamine contamination. Do not consume. Return to point of purchase.', area: 'Nationwide' },
  { id: 6, type: 'info', icon: Bell, title: 'Seasonal Flu Advisory', date: '2025-01-15', body: 'Seasonal influenza cases are rising. High-risk groups (elderly, children, pregnant women) should get vaccinated. Practice hand hygiene and respiratory etiquette.', area: 'Nationwide' },
];

const typeStyles: Record<string, { border: string; bg: string; badge: string; badgeText: string }> = {
  critical: { border: 'border-l-red-500', bg: 'bg-red-50 dark:bg-red-950/10', badge: 'bg-red-100 text-red-800', badgeText: 'CRITICAL' },
  warning: { border: 'border-l-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/10', badge: 'bg-yellow-100 text-yellow-800', badgeText: 'WARNING' },
  info: { border: 'border-l-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/10', badge: 'bg-blue-100 text-blue-800', badgeText: 'INFO' },
};

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/public"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6 text-red-500" />Health Alerts</h1>
            <p className="text-sm text-muted-foreground">Official public health advisories and outbreak notifications</p>
          </div>
        </div>

        <Card className="bg-red-600 text-white border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-8 w-8 shrink-0" />
            <div>
              <p className="font-semibold">Emergency Hotline: 1390</p>
              <p className="text-sm text-red-100">For suspected disease outbreaks or acute public health emergencies, call immediately.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">All</Button>
          <Button variant="outline" size="sm" className="text-xs text-red-600 border-red-200">Critical</Button>
          <Button variant="outline" size="sm" className="text-xs text-yellow-600 border-yellow-200">Warnings</Button>
          <Button variant="outline" size="sm" className="text-xs text-blue-600 border-blue-200">Info</Button>
        </div>

        <div className="space-y-4">
          {ALERTS.map(alert => {
            const style = typeStyles[alert.type];
            const Icon = alert.icon;
            return (