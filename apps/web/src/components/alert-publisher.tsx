'use client';

// AlertPublisher — SPHI / MOH-only form that publishes a public health alert
// straight to the citizen-facing /public/alerts feed (Firestore public_alerts).
// Renders nothing for other roles. Firestore rules require isSupervisor() +
// the title/severity/createdBy/createdAt fields; we also set active +
// publishedDate so the alert surfaces in the public query immediately.

import { useState } from 'react';
import { Megaphone, Send, Loader2, Check, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@phi-pro/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AREAS = [
  'Nationwide', 'Western Province', 'Central Province', 'Southern Province',
  'Northern Province', 'Eastern Province', 'North Western Province',
  'North Central Province', 'Uva Province', 'Sabaragamuwa Province',
];

const SEVERITIES = [
  { v: 'critical', label: 'Critical', cls: 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300' },
  { v: 'warning', label: 'Warning', cls: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' },
  { v: 'info', label: 'Info', cls: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300' },
] as const;

export function AlertPublisher() {
  const { user } = useAuth();
  const [severity, setSeverity] = useState<'critical' | 'warning' | 'info'>('warning');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [area, setArea] = useState('Nationwide');
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const role = user?.role;
  // SPHI / MOH only — field PHIs don't publish public alerts.
  if (role !== UserRole.SPHI && role !== UserRole.MOH_ADMIN) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!title.trim() || !body.trim()) { setErr('Title and details are both required.'); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'public_alerts'), {
        title: title.trim(),
        body: body.trim(),
        severity,
        area,
        date: new Date().toISOString().slice(0, 10),
        publishedDate: serverTimestamp(),
        active: true,
        sourceUrl: sourceUrl.trim() || null,
        createdBy: user?.displayName || user?.uid || 'SPHI',
        createdAt: serverTimestamp(),
      });
      setDone(true);
      setTitle(''); setBody(''); setSourceUrl(''); setSeverity('warning'); setArea('Nationwide');
    } catch (e2) {
      console.warn('[alerts] publish failed:', e2);
      setErr('Could not publish — check your connection or that you have supervisor permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="h-5 w-5 text-red-500" /> Issue a public health alert
        </CardTitle>
        <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:bg-red-950/40 dark:text-red-300">
          SPHI / MOH
        </span>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-xs text-muted-foreground">
          Published alerts appear instantly on the citizen-facing <span className="font-mono">/public/alerts</span> feed.
        </p>

        {done && (
          <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
            <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Alert published to the public feed.</span>
            <button onClick={() => setDone(false)} aria-label="Dismiss"><X className="h-4 w-4" /></button>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Severity</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s.v}
                  type="button"
                  onClick={() => setSeverity(s.v)}
                  className={`rounded-md border-2 px-3 py-1.5 text-xs font-bold transition-colors ${severity === s.v ? s.cls : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="al-title">Title</Label>
            <Input id="al-title" placeholder="e.g. Dengue outbreak — Gampaha district" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="al-body">Details</Label>
            <textarea
              id="al-body"
              placeholder="What is happening, who is affected, and what the public should do."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={600}
              required
              className="flex min-h-[96px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-right text-[11px] text-muted-foreground">{body.length}/600</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="al-area">Area</Label>
              <select
                id="al-area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="al-src">Source link <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Input id="al-src" type="url" placeholder="https://epid.gov.lk/…" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
            </div>
          </div>

          {err && <p className="text-xs text-rose-600">{err}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing…</> : <><Send className="mr-2 h-4 w-4" />Publish alert</>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
