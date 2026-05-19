'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, AlertCircle, Bell, Shield, Bug, Droplets,
  Loader2, RefreshCw, MapPin, Clock, Share2, Check,
  ChevronDown, ChevronUp, X, Mail,
} from 'lucide-react';
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
    badge: 'bg-red-600 text-white',
    label: 'CRITICAL',
    dot: 'bg-red-500 animate-pulse',
    icon: AlertCircle,
    iconCls: 'text-red-600',
    headerBg: 'bg-red-600/5',
  },
  warning: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/10',
    badge: 'bg-amber-500 text-white',
    label: 'WARNING',
    dot: 'bg-amber-500',
    icon: Bug,
    iconCls: 'text-amber-600',
    headerBg: 'bg-amber-500/5',
  },
  info: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/10',
    badge: 'bg-blue-600 text-white',
    label: 'INFO',
    dot: 'bg-blue-500',
    icon: Bell,
    iconCls: 'text-blue-600',
    headerBg: 'bg-blue-600/5',
  },
};

const FILTERS = ['All', 'Critical', 'Warning', 'Info'] as const;
const AREAS = ['All Areas', 'Western Province', 'Central Province', 'Southern Province', 'Northern Province', 'Eastern Province', 'North Western Province', 'Sabaragamuwa Province', 'Nationwide'];

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  } catch {
    return dateStr;
  }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [lastFetch, setLastFetch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);

  const fetchAlerts = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const visible = alerts.filter(a => {
    const matchSev = filter === 'All' || a.severity === filter.toLowerCase();
    const matchArea = areaFilter === 'All Areas' || a.area === areaFilter || a.area === 'Nationwide';
    return matchSev && matchArea;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleShare = useCallback((alert: Alert) => {
    const text = `[PHI-PRO Alert] ${alert.title} — ${alert.area} (${alert.date})\n${alert.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(alert.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-red-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8 pb-24">

        {/* Header — stacks on mobile so the title doesn't collide with the
            Subscribe/Refresh buttons. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="shrink-0">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-xl font-bold leading-tight sm:text-2xl">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 sm:h-6 sm:w-6" />
                <span className="truncate">Disease &amp; Health Alerts</span>
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Official advisories from PHI officers across Sri Lanka
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowSubModal(true)} className="flex-1 sm:flex-none">
              <Mail className="h-3.5 w-3.5 mr-1.5" />Subscribe
            </Button>
            <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={loading} className="flex-1 sm:flex-none">
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Active critical banner */}
        {criticalCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-red-600 px-5 py-3.5 shadow-md">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white shrink-0" />
            <p className="text-sm font-semibold text-white flex-1">
              {criticalCount} critical alert{criticalCount > 1 ? 's' : ''} active — take immediate precautions
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              value={areaFilter}
              onChange={e => setAreaFilter(e.target.value)}
            >
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {lastFetch && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />Updated at {lastFetch}
          </p>
        )}

        {/* Alerts list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            <p className="text-sm text-muted-foreground">Loading alerts…</p>
          </div>
        ) : visible.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Shield className="mx-auto h-14 w-14 text-green-500/30" />
              <p className="mt-3 font-semibold text-muted-foreground">No {filter !== 'All' ? filter.toLowerCase() : ''} alerts</p>
              <p className="text-sm text-muted-foreground/70">No active health alerts in this category or area</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{visible.length}</span> alert{visible.length !== 1 ? 's' : ''} shown
            </p>
            {visible.map(alert => {
              const cfg = SEVERITY_CFG[alert.severity as keyof typeof SEVERITY_CFG] ?? SEVERITY_CFG.info;
              const Icon = cfg.icon;
              const isExpanded = expanded.has(alert.id);
              const isCopied = copiedId === alert.id;
              const PREVIEW_CHARS = 140;
              const truncated = alert.body.length > PREVIEW_CHARS && !isExpanded;

              return (
                <Card key={alert.id} className={`border-l-4 ${cfg.border} ${cfg.bg} overflow-hidden shadow-sm transition-all`}>
                  <CardContent className="p-0">
                    {/* Card header */}
                    <div className={`flex items-center justify-between gap-3 px-5 pt-4 pb-3 ${cfg.headerBg}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cfg.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} bg-white`} />
                          {cfg.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{alert.area}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
                        <Icon className={`h-3.5 w-3.5 ${cfg.iconCls}`} />
                        {timeAgo(alert.date)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-5 pb-4">
                      <h2 className="mb-2 font-semibold leading-snug">{alert.title}</h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {truncated ? alert.body.slice(0, PREVIEW_CHARS) + '…' : alert.body}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => toggleExpand(alert.id)}
                        >
                          {isExpanded ? (
                            <><ChevronUp className="mr-1 h-3 w-3" />Show less</>
                          ) : (
                            <><ChevronDown className="mr-1 h-3 w-3" />Read more</>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground"
                          onClick={() => handleShare(alert)}
                        >
                          {isCopied ? (
                            <><Check className="mr-1 h-3 w-3 text-green-600" /><span className="text-green-600">Copied!</span></>
                          ) : (
                            <><Share2 className="mr-1 h-3 w-3" />Share</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Source note */}
        <Card className="border-0 bg-slate-50 shadow-sm dark:bg-slate-900/50">
          <CardContent className="flex items-start gap-3 p-4">
            <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-xs text-muted-foreground">
              Alerts are issued by authorised PHI officers and the Epidemiology Unit of the Ministry of Health, Sri Lanka.
              For emergencies call <strong className="text-foreground">1390</strong>. Last data source: PHI-PRO system.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sticky emergency bar (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between border-t bg-red-600 px-5 py-3 sm:hidden z-40 shadow-xl">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-white" />
          <p className="text-sm font-bold text-white">Health Emergency?</p>
        </div>
        <a
          href="tel:1390"
          className="rounded-full bg-white px-4 py-1.5 text-sm font-black text-red-600 shadow"
        >
          Call 1390
        </a>
      </div>

      {/* Subscribe modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-xl">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">Subscribe to Alerts</h3>
                  <p className="text-sm text-muted-foreground">Get notified when new health alerts are published</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowSubModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-950/20">
                <Bell className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Coming Soon</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Alert subscriptions are not yet available. Check back soon — this feature is under development.
                </p>
              </div>
              <Button className="w-full" onClick={() => setShowSubModal(false)}>Got it</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
