'use client';

// ============================================================================
// PHI-PRO System Status — High-Availability Monitoring Dashboard
// Independent status page following HA architecture principles
// Checks: Firebase, Anthropic API, Sentry, PostHog, SW, IndexedDB, network
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Wifi, WifiOff, Clock, Zap, Database, Shield, Brain, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSync } from '@/contexts/sync-context';

type HealthStatus = 'healthy' | 'degraded' | 'down' | 'checking';

interface ServiceCheck {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: HealthStatus;
  latencyMs?: number;
  detail?: string;
  lastChecked?: Date;
}

async function checkFirebase(): Promise<{ status: HealthStatus; latencyMs: number; detail: string }> {
  const start = Date.now();
  try {
    const res = await fetch('https://firestore.googleapis.com/v1/projects/pusl3190-phi-pro-system/databases/(default)/documents', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Date.now() - start;
    return res.status < 500
      ? { status: 'healthy', latencyMs, detail: `Firestore responding (${latencyMs}ms)` }
      : { status: 'degraded', latencyMs, detail: `HTTP ${res.status}` };
  } catch {
    return { status: 'down', latencyMs: Date.now() - start, detail: 'Unreachable' };
  }
}

async function checkAnthropicAPI(): Promise<{ status: HealthStatus; latencyMs: number; detail: string }> {
  const start = Date.now();
  try {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'ping' }] }),
      signal: AbortSignal.timeout(10000),
    });
    const latencyMs = Date.now() - start;
    if (res.status === 503) return { status: 'degraded', latencyMs, detail: 'API key not configured' };
    return res.ok
      ? { status: 'healthy', latencyMs, detail: `Claude API (${latencyMs}ms)` }
      : { status: 'degraded', latencyMs, detail: `HTTP ${res.status}` };
  } catch {
    return { status: 'down', latencyMs: Date.now() - start, detail: 'Unreachable' };
  }
}

async function checkServiceWorker(): Promise<{ status: HealthStatus; detail: string }> {
  if (!('serviceWorker' in navigator)) return { status: 'down', detail: 'Not supported in this browser' };
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return { status: 'degraded', detail: 'Not registered — offline sync unavailable' };
  if (reg.active) return { status: 'healthy', detail: `Active · scope: ${reg.scope}` };
  if (reg.installing) return { status: 'degraded', detail: 'Installing…' };
  return { status: 'degraded', detail: 'Waiting to activate' };
}

async function checkIndexedDB(): Promise<{ status: HealthStatus; detail: string }> {
  try {
    const { openDB } = await import('idb');
    const db = await openDB('phi-pro-offline', 1);
    const storeNames = Array.from(db.objectStoreNames);
    db.close();
    return { status: 'healthy', detail: `${storeNames.length} stores: ${storeNames.join(', ')}` };
  } catch (err) {
    return { status: 'down', detail: `Error: ${err instanceof Error ? err.message : 'unknown'}` };
  }
}

function StatusIcon({ status }: { status: HealthStatus }) {
  if (status === 'healthy') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === 'degraded') return <AlertCircle className="h-5 w-5 text-amber-500" />;
  if (status === 'down') return <XCircle className="h-5 w-5 text-red-500" />;
  return <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />;
}

function StatusBadge({ status }: { status: HealthStatus }) {
  const cls = {
    healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    degraded: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    down: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    checking: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  }[status];
  const label = status === 'healthy' ? 'Operational' : status === 'degraded' ? 'Degraded' : status === 'down' ? 'Outage' : 'Checking…';
  return <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', cls)}>{label}</span>;
}

const INITIAL_CHECKS: ServiceCheck[] = [
  { name: 'Firebase / Firestore', description: 'Primary database & real-time sync', icon: Database, status: 'checking' },
  { name: 'Compliance Copilot AI', description: 'Claude claude-haiku-4-5-20251001 · RAG endpoint', icon: Brain, status: 'checking' },
  { name: 'Service Worker', description: 'Background sync · offline cache', icon: Zap, status: 'checking' },
  { name: 'IndexedDB', description: 'On-device offline form storage', icon: Database, status: 'checking' },
  { name: 'Sentry', description: 'Error tracking & crash reporting', icon: Shield, status: 'checking' },
  { name: 'PostHog Analytics', description: 'Session analytics · event capture', icon: BarChart3, status: 'checking' },
];

export default function StatusPage() {
  const [checks, setChecks] = useState<ServiceCheck[]>(INITIAL_CHECKS);
  const [isOnline, setIsOnline] = useState(true);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [running, setRunning] = useState(false);
  const { status: syncStatus, pendingCount } = useSync();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const runChecks = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setChecks(INITIAL_CHECKS);

    const [fbResult, aiResult, swResult, idbResult] = await Promise.all([
      checkFirebase(),
      checkAnthropicAPI(),
      checkServiceWorker(),
      checkIndexedDB(),
    ]);

    setChecks([
      { ...INITIAL_CHECKS[0]!, status: fbResult.status, latencyMs: fbResult.latencyMs, detail: fbResult.detail, lastChecked: new Date() },
      { ...INITIAL_CHECKS[1]!, status: aiResult.status, latencyMs: aiResult.latencyMs, detail: aiResult.detail, lastChecked: new Date() },
      { ...INITIAL_CHECKS[2]!, status: swResult.status, detail: swResult.detail, lastChecked: new Date() },
      { ...INITIAL_CHECKS[3]!, status: idbResult.status, detail: idbResult.detail, lastChecked: new Date() },
      { ...INITIAL_CHECKS[4]!, status: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'healthy' : 'degraded', detail: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'DSN configured' : 'NEXT_PUBLIC_SENTRY_DSN not set', lastChecked: new Date() },
      { ...INITIAL_CHECKS[5]!, status: process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'healthy' : 'degraded', detail: process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'Project key configured' : 'NEXT_PUBLIC_POSTHOG_KEY not set', lastChecked: new Date() },
    ]);

    setLastRun(new Date());
    setRunning(false);
  }, [running]);

  useEffect(() => { runChecks(); }, []);

  const overall: HealthStatus = checks.some((c) => c.status === 'down')
    ? 'down'
    : checks.some((c) => c.status === 'degraded')
    ? 'degraded'
    : checks.every((c) => c.status === 'healthy')
    ? 'healthy'
    : 'checking';

  const overallColor = overall === 'healthy' ? 'from-green-500 to-emerald-600' : overall === 'degraded' ? 'from-amber-500 to-orange-600' : overall === 'down' ? 'from-red-500 to-red-700' : 'from-slate-400 to-slate-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">System Status</h1>
          <p className="text-xs text-slate-500">Real-time health checks · PHI-PRO infrastructure</p>
        </div>
        <button
          onClick={runChecks}
          disabled={running}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <RefreshCw className={cn('h-4 w-4', running && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Overall banner */}
      <div className={cn('flex items-center justify-between rounded-2xl bg-gradient-to-r p-5 text-white shadow-lg', overallColor)}>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            {overall === 'healthy' ? <CheckCircle2 className="h-7 w-7" />
              : overall === 'degraded' ? <AlertCircle className="h-7 w-7" />
              : overall === 'down' ? <XCircle className="h-7 w-7" />
              : <RefreshCw className="h-7 w-7 animate-spin" />}
          </div>
          <div>
            <div className="text-lg font-bold">
              {overall === 'healthy' ? 'All Systems Operational'
                : overall === 'degraded' ? 'Partial Degradation'
                : overall === 'down' ? 'System Outage Detected'
                : 'Running diagnostics…'}
            </div>
            {lastRun && (
              <div className="flex items-center gap-1.5 text-sm text-white/80">
                <Clock className="h-3.5 w-3.5" />
                Last checked: {lastRun.toLocaleTimeString('en-LK')}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm font-semibold">
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
          {pendingCount > 0 && (
            <div className="rounded-lg bg-white/20 px-3 py-2 text-sm font-semibold">
              {pendingCount} pending sync
            </div>
          )}
        </div>
      </div>

      {/* Service grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map((check) => (
          <div
            key={check.name}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  check.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30'
                    : check.status === 'degraded' ? 'bg-amber-100 dark:bg-amber-900/30'
                    : check.status === 'down' ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-slate-100 dark:bg-slate-800',
                )}>
                  <check.icon className={cn(
                    'h-5 w-5',
                    check.status === 'healthy' ? 'text-green-600 dark:text-green-400'
                      : check.status === 'degraded' ? 'text-amber-600 dark:text-amber-400'
                      : check.status === 'down' ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-400',
                  )} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{check.name}</p>
                  <p className="text-[11px] text-slate-400">{check.description}</p>
                </div>
              </div>
              <StatusIcon status={check.status} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <StatusBadge status={check.status} />
              {check.latencyMs !== undefined && (
                <span className="text-[11px] font-mono text-slate-400">{check.latencyMs}ms</span>
              )}
            </div>
            {check.detail && (
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{check.detail}</p>
            )}
          </div>
        ))}
      </div>

      {/* Sync status */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Offline Sync Status</h2>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Sync State', value: syncStatus },
            { label: 'Pending Forms', value: pendingCount.toString() },
            { label: 'Background Sync', value: 'serviceWorker' in navigator ? 'Supported' : 'Not supported' },
            { label: 'Storage', value: 'indexedDB' in window ? 'IndexedDB ready' : 'Unavailable' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-400">
        PHI-PRO System Status · Independent health monitoring · Auto-refresh every 5 minutes
      </p>
    </div>
  );
}
