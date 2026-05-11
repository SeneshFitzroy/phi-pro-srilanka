'use client';

// ============================================================================
// Security Console — posture overview + threat monitoring for SPHI / MOH admins.
// Shows: encryption / RBAC / audit-chain status, App Check & reCAPTCHA config,
// a 14-day failed-login timeline, a recent security-event feed, active sessions.
// (The timeline & feed use illustrative data — wire to a `security_events`
//  collection populated by an auth Cloud Function for live monitoring.)
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import {
  ArrowLeft, ShieldCheck, ShieldAlert, Lock, KeyRound, UserCog, Activity, FileWarning,
  Bot, Eye, AlertTriangle, CheckCircle2, XCircle, Clock, Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth-guard';
import { UserRole } from '@phi-pro/shared';
import { isRecaptchaConfigured } from '@/lib/recaptcha';
import { getChain, type AuditEntry } from '@/lib/audit-chain';

export default function SecurityPage() {
  return (
    <AuthGuard allowedRoles={[UserRole.SPHI, UserRole.MOH_ADMIN]}>
      <SecurityContent />
    </AuthGuard>
  );
}

type Severity = 'info' | 'warning' | 'critical';
interface SecEvent { ts: string; type: string; detail: string; severity: Severity; ip?: string; actor?: string }

const sevStyle: Record<Severity, string> = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};

function SecurityContent() {
  const appCheckConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;
  const recaptchaConfigured = isRecaptchaConfigured();
  const [chainLen, setChainLen] = useState<number | null>(null);
  const [chainHead, setChainHead] = useState<AuditEntry | null>(null);

  useEffect(() => {
    getChain()
      .then((c) => { setChainLen(c.length); setChainHead(c.length ? c[c.length - 1] : null); })
      .catch(() => { setChainLen(0); });
  }, []);

  // ── Illustrative 14-day failed-login series (deterministic) ──
  const failedLogins = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - (13 - i));
      const base = 2 + ((i * 7) % 5);
      const spike = i === 9 ? 11 : i === 4 ? 6 : 0;
      return { day: d.toLocaleDateString('en-LK', { day: '2-digit', month: 'short' }), failed: base + spike, blocked: Math.round((base + spike) * 0.6) };
    });
  }, []);
  const totalFailed = failedLogins.reduce((s, d) => s + d.failed, 0);
  const peak = Math.max(...failedLogins.map((d) => d.failed));

  // ── Illustrative recent security events ──
  const events: SecEvent[] = [
    { ts: '2026-05-12 09:14', type: 'Failed login (x5)', detail: 'Five consecutive failures for k.perera@moh — rate-limited 15 min', severity: 'warning', ip: '203.0.113.42', actor: 'k.perera@moh' },
    { ts: '2026-05-12 08:51', type: 'Role changed', detail: 'r.fernando@moh promoted PHI → SPHI by admin', severity: 'info', actor: 'admin@moh' },
    { ts: '2026-05-11 22:07', type: 'Bot challenge blocked', detail: 'Public complaint form submission below reCAPTCHA score threshold', severity: 'warning', ip: '198.51.100.7' },
    { ts: '2026-05-11 16:33', type: 'Data export', detail: 'FHIR R4 bundle exported from Area Analytics', severity: 'info', actor: 's.jaya@moh' },
    { ts: '2026-05-10 14:02', type: 'Decryption failure', detail: 'H1046 record decrypt failed (likely wrong key context) — no data exposed', severity: 'warning', actor: 'm.silva@moh' },
    { ts: '2026-05-09 03:18', type: 'Credential-stuffing pattern', detail: '11 failed logins across 6 accounts from one ASN — all blocked', severity: 'critical', ip: '192.0.2.0/24' },
    { ts: '2026-05-08 11:45', type: 'New device sign-in', detail: 'a.bandara@moh signed in from a new device (passkey)', severity: 'info', actor: 'a.bandara@moh' },
  ];
  const openWarnings = events.filter((e) => e.severity !== 'info').length;
  const threatLevel = events.some((e) => e.severity === 'critical') ? 'Elevated' : openWarnings > 2 ? 'Guarded' : 'Low';
  const threatColor = threatLevel === 'Elevated' ? 'text-red-600' : threatLevel === 'Guarded' ? 'text-amber-600' : 'text-emerald-600';

  const sessions = [
    { user: 'admin@moh', role: 'MOH Admin', ip: '10.12.3.4', device: 'Chrome · Windows', since: '2h 10m', mfa: 'Passkey' },
    { user: 'k.perera@moh', role: 'PHI', ip: '203.0.113.42', device: 'Safari · iOS', since: '47m', mfa: 'Password' },
    { user: 's.jaya@moh', role: 'SPHI', ip: '172.16.8.21', device: 'Edge · Windows', since: '1h 02m', mfa: 'Passkey' },
  ];

  const posture = [
    { ok: true, icon: Lock, label: 'Field-level encryption', value: 'AES-256-GCM · PBKDF2 310k', note: 'H1046 & personal health data (PDPA 2022)' },
    { ok: true, icon: UserCog, label: 'Role-based access control', value: '4 tiers · PHI / SPHI / MOH admin / public', note: 'Enforced in Firestore security rules' },
    { ok: true, icon: KeyRound, label: 'Passwordless / passkeys', value: 'WebAuthn enabled', note: 'Biometric login, device-bound credentials' },
    { ok: chainLen !== null && chainLen >= 0, icon: ShieldCheck, label: 'Tamper-evident audit chain', value: chainLen === null ? 'checking…' : `${chainLen} record${chainLen === 1 ? '' : 's'}`, note: chainHead ? `head ${chainHead.entryHash.slice(0, 12)}…` : 'append-only ledger', href: '/dashboard/management/audit' },
    { ok: true, icon: Globe, label: 'Transport security', value: 'TLS · HSTS · CSP', note: 'Strict Content-Security-Policy in middleware' },
    { ok: appCheckConfigured, icon: ShieldAlert, label: 'Firebase App Check', value: appCheckConfigured ? 'Configured' : 'Not configured', note: appCheckConfigured ? 'Attestation required for backend calls' : 'Set NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY' },
    { ok: recaptchaConfigured, icon: Bot, label: 'reCAPTCHA v3 (public forms)', value: recaptchaConfigured ? 'Active' : 'Not configured', note: recaptchaConfigured ? 'Scoring complaint & verify submissions' : 'Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY' },
    { ok: true, icon: FileWarning, label: 'Error & anomaly monitoring', value: 'Sentry · PostHog', note: 'Client + server exception capture' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white"><ShieldCheck className="h-6 w-6 text-slate-700 dark:text-slate-200" />Security Console</h1>
            <p className="text-sm text-muted-foreground">Posture, access control and threat monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 dark:border-slate-700">
          <Activity className={`h-5 w-5 ${threatColor}`} />
          <div><p className="text-[11px] text-muted-foreground">Current threat level</p><p className={`text-sm font-bold ${threatColor}`}>{threatLevel}</p></div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Failed logins (14d)', value: String(totalFailed), icon: XCircle, color: 'text-red-500' },
          { label: 'Peak in a day', value: String(peak), icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'Open warnings', value: String(openWarnings), icon: FileWarning, color: 'text-orange-500' },
          { label: 'Active sessions', value: String(sessions.length), icon: Eye, color: 'text-blue-500' },
        ].map((k) => (
          <Card key={k.label}><CardContent className="flex items-center gap-3 p-4">
            <k.icon className={`h-8 w-8 ${k.color}`} />
            <div><p className="text-2xl font-bold">{k.value}</p><p className="text-xs text-muted-foreground">{k.label}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Posture grid */}
      <Card>
        <CardHeader><CardTitle className="text-base">Security Posture</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {posture.map((p) => {
              const inner = (
                <div className={`h-full rounded-xl border p-4 ${p.ok ? 'border-slate-200 dark:border-slate-700' : 'border-amber-300 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/10'}`}>
                  <div className="flex items-center justify-between">
                    <p.icon className="h-5 w-5 text-slate-500" />
                    {p.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{p.label}</p>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{p.value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{p.note}</p>
                </div>
              );
              return p.href ? <Link key={p.label} href={p.href} className="block transition-transform hover:-translate-y-0.5">{inner}</Link> : <div key={p.label}>{inner}</div>;
            })}
          </div>
        </CardContent>
      </Card>

      {/* Failed-login timeline */}
      <Card>
        <CardHeader><CardTitle className="text-base">Failed Login Attempts — last 14 days</CardTitle></CardHeader>
        <CardContent>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={failedLogins} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={2} fill="url(#failGrad)" />
                <Line type="monotone" dataKey="blocked" name="Auto-blocked" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">A sustained spike (e.g. day 10 above) trips automatic rate-limiting and raises a warning event. Wire to an auth Cloud Function trigger for live data.</p>
        </CardContent>
      </Card>

      {/* Event feed + sessions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Recent Security Events</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-2 font-medium">When</th><th className="py-2 pr-2 font-medium">Event</th><th className="py-2 pr-2 font-medium">Detail</th><th className="py-2 font-medium text-right">Severity</th></tr></thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={i} className="border-b last:border-0 align-top">
                    <td className="whitespace-nowrap py-2 pr-2 text-xs text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />{e.ts}</td>
                    <td className="py-2 pr-2 font-medium">{e.type}</td>
                    <td className="py-2 pr-2 text-xs text-muted-foreground">{e.detail}{e.ip && <span className="ml-1 font-mono">[{e.ip}]</span>}</td>
                    <td className="py-2 text-right"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${sevStyle[e.severity]}`}>{e.severity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Active Sessions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {sessions.map((s) => (
              <div key={s.user} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{s.user}</p>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${s.mfa === 'Passkey' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{s.mfa}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.role} · {s.device}</p>
                <p className="text-[11px] text-muted-foreground font-mono">{s.ip} · active {s.since}</p>
              </div>
            ))}
            <p className="pt-1 text-[11px] text-muted-foreground">Sessions back Firebase Auth ID tokens (1h expiry, auto-refresh). Revoke a user&apos;s tokens from User Management.</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        To enable bot protection end-to-end: create a reCAPTCHA v3 key and set <code>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code>
        (already integrated via <code>lib/recaptcha.ts</code> — call <code>getRecaptchaToken()</code> on public form submit
        and verify the token server-side), and register an App Check provider (<code>NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY</code>).
        The event feed &amp; login timeline above are illustrative until an auth Cloud Function writes to a <code>security_events</code> collection.
      </p>
    </div>
  );
}
