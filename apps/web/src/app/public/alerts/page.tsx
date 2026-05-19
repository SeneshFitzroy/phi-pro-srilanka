'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowLeft, AlertCircle, Bell, Shield, Bug, Droplets,
  Loader2, RefreshCw, MapPin, Clock, Share2, Check,
  ChevronDown, ChevronUp, X, Mail, ExternalLink,
  Copy, MessageCircle, Phone, Send,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, getDocs, query, orderBy, limit, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Alert {
  id: string;
  severity: string;
  title: string;
  body: string;
  area: string;
  date: string;
  active: boolean;
  /** Authoritative source URL for the citizen to read more. */
  sourceUrl?: string;
  /** Source name shown alongside the link. */
  source?: string;
}

// MoH / Epidemiology Unit Sri Lanka public landing pages — used as the
// default "Read more" target when a Firestore record doesn't ship its own.
const READ_MORE_DEFAULT: Record<string, { url: string; label: string }> = {
  dengue:        { url: 'https://www.epid.gov.lk/web/index.php?option=com_casesanddeaths&Itemid=448&lang=en', label: 'Epidemiology Unit · Cases & Deaths' },
  leptospirosis: { url: 'https://www.epid.gov.lk/web/images/pdf/Disease_outbreak_news/Leptospirosis.pdf',     label: 'Epidemiology Unit · Leptospirosis fact sheet' },
  food:          { url: 'https://www.health.gov.lk/?p=4&lang=en',                                            label: 'Ministry of Health · Food Safety' },
  water:         { url: 'https://www.epid.gov.lk/',                                                         label: 'Epidemiology Unit · Water Quality' },
  hpv:           { url: 'https://www.health.gov.lk/?p=8045&lang=en',                                        label: 'Ministry of Health · Vaccination' },
  influenza:     { url: 'https://www.epid.gov.lk/web/index.php?option=com_content&view=article&id=151&Itemid=482&lang=en', label: 'Epidemiology Unit · Influenza' },
  default:       { url: 'https://www.epid.gov.lk/',                                                         label: 'Epidemiology Unit · Sri Lanka' },
};

function readMoreFor(alert: Alert): { url: string; label: string } {
  if (alert.sourceUrl) return { url: alert.sourceUrl, label: alert.source ?? 'Read more' };
  const t = (alert.title + ' ' + alert.body).toLowerCase();
  if (t.includes('dengue'))                          return READ_MORE_DEFAULT.dengue;
  if (t.includes('lepto'))                           return READ_MORE_DEFAULT.leptospirosis;
  if (t.includes('food') || t.includes('recall'))    return READ_MORE_DEFAULT.food;
  if (t.includes('water') || t.includes('coliform')) return READ_MORE_DEFAULT.water;
  if (t.includes('hpv') || t.includes('vaccin'))     return READ_MORE_DEFAULT.hpv;
  if (t.includes('influenza') || t.includes('flu'))  return READ_MORE_DEFAULT.influenza;
  return READ_MORE_DEFAULT.default;
}

const FALLBACK: Alert[] = [
  { id: '1', severity: 'critical', title: 'Dengue Outbreak Alert — Western Province',                       date: '2026-05-05', body: 'Increased dengue cases detected in Colombo, Gampaha, and Kalutara districts. Breeding index elevated above threshold. Eliminate stagnant water, use mosquito nets, and seek medical attention for high fever immediately.', area: 'Western Province',          active: true },
  { id: '2', severity: 'warning',  title: 'Leptospirosis Risk — Post-Flood Advisory',                       date: '2026-05-02', body: 'Following recent floods in Ratnapura district, leptospirosis risk is elevated. Avoid contact with flood water, wear protective footwear. Farmers and workers must take extra precautions.',                                       area: 'Sabaragamuwa Province',    active: true },
  { id: '3', severity: 'warning',  title: 'Food Recall — Contaminated Canned Fish (Batch XYZ-2025-001)',    date: '2026-04-20', body: '"Ocean Fresh" canned mackerel batch XYZ-2025-001 has been recalled due to suspected histamine contamination. Do not consume. Return to your point of purchase immediately for a full refund.',                                       area: 'Nationwide',                active: true },
  { id: '4', severity: 'info',     title: 'Water Quality Advisory — Kelani River Basin',                    date: '2026-04-15', body: 'Routine testing shows elevated coliform levels in Kelani River downstream areas. Boil all water before consumption if sourced from river or unprotected wells in affected GN divisions.',                                                     area: 'Colombo / Gampaha Districts', active: true },
  { id: '5', severity: 'info',     title: 'HPV Vaccination Campaign — Grade 6 Schools',                     date: '2026-03-28', body: 'The National HPV Vaccination Programme for Grade 6 girls is ongoing across all districts. Ensure consent forms are completed and returned to school health staff. Contact your nearest MOH office for details.',                          area: 'Nationwide',                active: true },
  { id: '6', severity: 'info',     title: 'Seasonal Influenza Advisory',                                    date: '2026-03-15', body: 'Seasonal influenza cases are rising island-wide. High-risk groups — elderly, children under 5, pregnant women, and immunocompromised individuals — should seek vaccination. Practice hand hygiene and respiratory etiquette.',           area: 'Nationwide',                active: true },
];

const SEVERITY_CFG = {
  critical: { border: 'border-l-red-500',    bg: 'bg-red-50 dark:bg-red-950/10',       badge: 'bg-red-600 text-white',     label: 'CRITICAL', dot: 'bg-red-500 animate-pulse',  icon: AlertCircle, iconCls: 'text-red-600',    headerBg: 'bg-red-600/5'   },
  warning:  { border: 'border-l-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950/10',   badge: 'bg-amber-500 text-white',   label: 'WARNING',  dot: 'bg-amber-500',              icon: Bug,         iconCls: 'text-amber-600',  headerBg: 'bg-amber-500/5' },
  info:     { border: 'border-l-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/10',     badge: 'bg-blue-600 text-white',    label: 'INFO',     dot: 'bg-blue-500',               icon: Bell,        iconCls: 'text-blue-600',   headerBg: 'bg-blue-600/5'  },
};

const FILTERS = ['All', 'Critical', 'Warning', 'Info'] as const;
const AREAS = ['All Areas', 'Western Province', 'Central Province', 'Southern Province', 'Northern Province', 'Eastern Province', 'North Western Province', 'Sabaragamuwa Province', 'Nationwide'];

// WhatsApp Channel / Group invite the citizen can scan to join the alert
// broadcast. Replace this URL with the real link from the MOH community
// manager once one is provisioned.
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/phipro-alerts';

// Recency window for the 'critical banner' — show ONLY if at least one
// critical alert was published in the last 30 days.
const CRITICAL_WINDOW_DAYS = 30;

function daysSince(dateStr: string): number {
  try { return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000); }
  catch { return Number.POSITIVE_INFINITY; }
}

function timeAgo(dateStr: string): string {
  const days = daysSince(dateStr);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [lastFetch, setLastFetch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [shareOpenId, setShareOpenId] = useState<string | null>(null);
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

  // Only count critical alerts published within the recency window.
  const recentCriticalCount = alerts.filter(
    (a) => a.severity === 'critical' && daysSince(a.date) <= CRITICAL_WINDOW_DAYS,
  ).length;

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-red-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8 pb-28">

        {/* Header */}
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

        {/* Hotline strip — visible on every viewport, with a real click-to-call
            number (1390 — MoH Ministry hotline) and the secondary line. */}
        <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-600 to-rose-700 px-5 py-4 text-white shadow-md dark:border-red-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                <Phone className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">Public Health Emergency Hotline</p>
                <p className="text-[12px] text-red-100/90">Ministry of Health · 24 / 7 · report outbreaks &amp; food-poisoning incidents</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a href="tel:1390" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-red-700 shadow-sm hover:bg-red-50">
                <Phone className="h-4 w-4" /> Call 1390
              </a>
              <a href="tel:+94112695112" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
                +94 11 269 5112
              </a>
            </div>
          </div>
        </div>

        {/* Critical banner — gated by the recency window so we don't shout
            'take immediate precautions' over 6-month-old alerts. */}
        {recentCriticalCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-red-600 px-5 py-3.5 shadow-md">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white shrink-0" />
            <p className="text-sm font-semibold text-white flex-1">
              {recentCriticalCount} critical alert{recentCriticalCount > 1 ? 's' : ''} in the last 30 days — take immediate precautions
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
                {f === 'Critical' && recentCriticalCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {recentCriticalCount}
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
              const PREVIEW_CHARS = 140;
              const truncated = alert.body.length > PREVIEW_CHARS && !isExpanded;
              const readMore = readMoreFor(alert);

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

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => toggleExpand(alert.id)}>
                          {isExpanded
                            ? <><ChevronUp className="mr-1 h-3 w-3" />Show less</>
                            : <><ChevronDown className="mr-1 h-3 w-3" />Show more</>}
                        </Button>

                        {/* Read more — opens the relevant Epid Unit / MoH page */}
                        <a
                          href={readMore.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-blue-200 bg-white px-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-300"
                        >
                          <ExternalLink className="h-3 w-3" /> Read more
                        </a>

                        {/* Share — opens a popover with WhatsApp / X / FB /
                            email / copy actions (and the Web Share sheet on
                            mobile if available). */}
                        <ShareControl
                          alert={alert}
                          open={shareOpenId === alert.id}
                          onToggle={() => setShareOpenId(shareOpenId === alert.id ? null : alert.id)}
                          onClose={() => setShareOpenId(null)}
                        />
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
              For emergencies call <a href="tel:1390" className="font-bold text-red-600 underline">1390</a>.
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
        <a href="tel:1390" className="rounded-full bg-white px-4 py-1.5 text-sm font-black text-red-600 shadow">
          Call 1390
        </a>
      </div>

      {/* Subscribe modal */}
      {showSubModal && <SubscribeModal onClose={() => setShowSubModal(false)} />}
    </div>
  );
}

/* ────────────────── share control ────────────────── */

function ShareControl({ alert, open, onToggle, onClose }: {
  alert: Alert;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/public/alerts#${alert.id}`
    : `https://phipro.lk/public/alerts#${alert.id}`;
  const text = `[PHI-PRO Alert] ${alert.title} — ${alert.area} (${alert.date})`;
  const shareUrl = `${text}\n${url}`;

  const canWebShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const tryWebShare = async () => {
    try {
      await navigator.share({ title: alert.title, text, url });
      onClose();
    } catch { /* user cancelled — ignore */ }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); onClose(); }, 1200);
    } catch { /* ignore */ }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-muted-foreground"
        onClick={canWebShare ? tryWebShare : onToggle}
      >
        <Share2 className="mr-1 h-3 w-3" /> Share
      </Button>

      {!canWebShare && open && (
        <div className="absolute right-0 top-8 z-20 w-60 rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Share this alert</p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Send className="h-4 w-4 text-sky-500" /> X / Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Share2 className="h-4 w-4 text-blue-600" /> Facebook
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(shareUrl)}`}
            onClick={onClose}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Mail className="h-4 w-4 text-rose-500" /> Email
          </a>
          <button
            type="button"
            onClick={copyAll}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {copied
              ? <><Check className="h-4 w-4 text-emerald-600" /> Copied!</>
              : <><Copy className="h-4 w-4 text-slate-500" /> Copy link</>}
          </button>
        </div>
      )}
    </div>
  );
}

/* ────────────────── subscribe modal ────────────────── */

function SubscribeModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const qrRef = useRef<HTMLDivElement | null>(null);

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!name.trim() || !email.trim()) { setErr('Please enter your name and email address.'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setErr('That email address looks invalid.'); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'alert_subscribers'), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        createdAt: serverTimestamp(),
        source: 'public/alerts',
        verified: false,
      });
      setDone(true);
    } catch {
      setErr('Could not subscribe right now. Please try again in a few minutes.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={onClose}>
      <Card className="w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">Subscribe to alerts</h3>
              <p className="text-sm text-muted-foreground">Email + WhatsApp — pick either or both.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>

          {!done ? (
            <form onSubmit={onSubscribe} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="sub-name">Full name</Label>
                <Input id="sub-name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sub-email">Email address</Label>
                <Input id="sub-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {err && <p className="text-xs text-rose-600">{err}</p>}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subscribing…</> : <><Mail className="mr-2 h-4 w-4" />Subscribe by email</>}
              </Button>
            </form>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              <p>You&apos;re subscribed. New alerts will reach you at <strong>{email}</strong>.</p>
            </div>
          )}

          {/* WhatsApp group */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <MessageCircle className="h-3.5 w-3.5" /> Join the WhatsApp alerts group
            </p>
            <p className="mt-1 text-[12px] text-emerald-900/80 dark:text-emerald-200/80">
              Scan the QR with your phone&apos;s camera, or tap the button below. Critical bulletins go out here first.
            </p>
            <div ref={qrRef} className="mt-3 flex items-center gap-3">
              <div className="rounded-md border border-emerald-200 bg-white p-1.5 dark:border-emerald-800">
                <QRCodeCanvas
                  value={WHATSAPP_GROUP_URL}
                  size={104}
                  marginSize={1}
                  level="M"
                  fgColor="#065f46"
                  bgColor="#ffffff"
                />
              </div>
              <a
                href={WHATSAPP_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
              >
                <MessageCircle className="h-4 w-4" /> Open WhatsApp
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
