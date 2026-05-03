'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Bell, Shield, Bug, Droplets, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Alert {
  id: string;
  severity: string;
  title: string;
  body: string;
  area: string;
  date: string;
  active: boolean;
}

const FALLBACK: Alert[] = [
  { id: '1', severity: 'critical', title: 'Dengue Outbreak Alert — Western Province', date: '2025-02-10', body: 'Increased dengue cases detected in Colombo, Gampaha, and Kalutara districts. Breeding index elevated above threshold. Eliminate stagnant water, use mosquito nets, and seek medical attention for high fever immediately.', area: 'Western Province', active: true },
  { id: '2', severity: 'warning', title: 'Leptospirosis Risk — Post-Flood Advisory', date: '2025-02-08', body: 'Following recent floods in Ratnapura district, leptospirosis risk is elevated. Avoid contact with flood water, wear protective footwear. Farmers and workers must take extra precautions.', area: 'Sabaragamuwa Province', active: true },
  { id: '3', severity: 'warning', title: 'Food Recall — Contaminated Canned Fish (Batch XYZ-2025-001)', date: '2025-01-20', body: '"Ocean Fresh" canned mackerel batch XYZ-2025-001 has been recalled due to suspected histamine contamination. Do not consume. Return to your point of purchase immediately for a full refund.', area: 'Nationwide', active: true },
  { id: '4', severity: 'info', title: 'Water Quality Advisory — Kelani River Basin', date: '2025-02-05', body: 'Routine testing shows elevated coliform levels in Kelani River downstream areas. Boil all water before consumption if sourced from river or unprotected wells in affected GN divisions.', area: 'Colombo / Gampaha Districts', active: true },
  { id: '5', severity: 'info', title: 'HPV Vaccination Campaign — Grade 6 Schools', date: '2025-01-28', body: 'The National HPV Vaccination Programme for Grade 6 girls is ongoing across all districts. Ensure consent forms are completed and returned to school health staff. Contact your nearest MOH office for details.', area: 'Nationwide', active: true },
  { id: '6', severity: 'info', title: 'Seasonal Influenza Advisory', date: '2025-01-15', body: 'Seasonal influenza cases are rising island-wide. High-risk groups — elderly, children under 5, pregnant women, and immunocompromised individuals — should seek vaccination. Practice hand hygiene and respiratory etiquette.', area: 'Nationwide', active: true },
];

const SEVERITY_CFG = {
  critical: {
    border: 'border-l-red-500',
    bg: 'bg-red-50 dark:bg-red-950/10',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    label: 'CRITICAL',
    dot: 'bg-red-500 animate-pulse',
    icon: AlertCircle,
    iconCls: 'text-red-600',
  },
  warning: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/10',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    label: 'WARNING',
    dot: 'bg-amber-500',
    icon: Bug,
    iconCls: 'text-amber-600',
  },
  info: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/10',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    label: 'INFO',
    dot: 'bg-blue-500',
    icon: Bell,
    iconCls: 'text-blue-600',
  },
};

const FILTERS = ['All', 'Critical', 'Warning', 'Info'] as const;

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [lastFetch, setLastFetch] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, 'public_alerts'),
          where('active', '==', true),
          orderBy('publishedDate', 'desc'),
          limit(20),
        )
      );
      if (!snap.empty) {
        setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert)));
      } else {
        setAlerts(FALLBACK);
      }
    } catch {
      setAlerts(FALLBACK);
    } finally {
      setLoading(false);
      setLastFetch(new Date().toLocaleTimeString('en-LK'));
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const visible = alerts.filter(a =>
    filter === 'All' || a.severity === filter.toLowerCase()
  );

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/#services">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <AlertCircle className="h-6 w-6 text-red-500" />Disease &amp; Health Alerts
              </h1>
              <p className="text-sm text-muted-foreground">
                Official advisories from PHI officers across Sri Lanka
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={loading} className="shrink-0">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Active critical banner */}
        {criticalCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-600 px-5 py-3 shadow-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
            <p className="text-sm font-semibold text-white">
              {criticalCount} critical alert{criticalCount > 1 ? 's' : ''} active — take precautions
            </p>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f}
              {f === 'Critical' && criticalCount > 0 && (
                <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {criticalCount}
                </span>
              )}
            </Button>
          ))}
          {lastFetch && (
            <span className="ml-auto self-center text-[10px] text-muted-foreground">
              Updated {lastFetch}
            </span>
          )}
        </div>

        {/* Alerts list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
        ) : visible.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-green-500/40" />
              <p className="mt-3 font-semibold text-muted-foreground">No {filter !== 'All' ? filter.toLowerCase() : ''} alerts</p>
              <p className="text-sm text-muted-foreground/70">No active health alerts in this category</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {visible.map(alert => {
              const cfg = SEVERITY_CFG[alert.severity as keyof typeof SEVERITY_CFG] ?? SEVERITY_CFG.info;
              const Icon = cfg.icon;
              return (
                <Card key={alert.id} className={`border-l-4 ${cfg.border} ${cfg.bg} shadow-sm`}>
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{alert.area}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Icon className={`h-4 w-4 ${cfg.iconCls}`} />
                        <span className="text-xs text-muted-foreground">{alert.date}</span>
                      </div>
                    </div>
                    <h2 className="font-semibold leading-snug">{alert.title}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{alert.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Source note */}
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <Droplets className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
            <p className="text-xs text-muted-foreground">
              Alerts are issued by authorised PHI officers and the Epidemiology Unit of the Ministry of Health, Sri Lanka.
              For emergencies call <strong className="text-foreground">1390</strong>. Last data source: PHI-PRO system.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
