'use client';

// ============================================================================
// Audit Chain Ledger — tamper-evident record of high-value PHI actions.
// Reads the append-only `audit_chain` collection, lets a supervisor re-verify
// the whole chain (re-hashes every entry), and exposes a public verification
// link / QR for each entry.
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck, Link2, RefreshCw, Loader2, CheckCircle2, AlertTriangle,
  Copy, Plus, ScrollText, Hash, Clock, ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import {
  getChain, verifyChain, appendAuditEntry, type AuditEntry, type VerifyResult,
} from '@/lib/audit-chain';

const short = (h: string, n = 10) => (h.length > 2 * n ? `${h.slice(0, n)}…${h.slice(-n)}` : h);

export default function AuditChainPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [appending, setAppending] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEntries(await getChain());
    } catch {
      toast.error('Could not load the audit chain (check Firestore rules are deployed).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const runVerify = async () => {
    setVerifying(true);
    try {
      const r = await verifyChain(entries.length ? entries : undefined);
      setResult(r);
      if (r.valid) toast.success(`Chain intact — ${r.length} entr${r.length === 1 ? 'y' : 'ies'} verified.`);
      else toast.error(`Tampering detected at entry #${r.brokenAt}.`);
    } finally {
      setVerifying(false);
    }
  };

  const appendDemo = async () => {
    setAppending(true);
    try {
      await appendAuditEntry({
        action: 'LEDGER_DEMO_APPEND',
        refCollection: 'audit_chain',
        refDocId: 'demo',
        actorUid: user?.uid ?? 'anonymous',
        payload: { note: 'Manual ledger demo entry', at: new Date().toISOString() },
        summary: 'Demo entry added from the Audit Chain page',
      });
      toast.success('Demo entry appended.');
      await load();
      setResult(null);
    } catch {
      toast.error('Append failed (sign in and deploy Firestore rules).');
    } finally {
      setAppending(false);
    }
  };

  const copy = (text: string, what: string) => {
    navigator.clipboard?.writeText(text).then(() => toast.message(`${what} copied`), () => {});
  };

  const head = entries.length ? entries[entries.length - 1] : null;
  const ordered = [...entries].reverse(); // newest first

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="h-6 w-6 text-emerald-600" /> Audit Chain Ledger
            </h1>
            <p className="text-sm text-muted-foreground">Append-only, hash-linked record — every entry seals the one before it.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading} className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Reload</Button>
          <Button onClick={runVerify} disabled={verifying || loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Verify Integrity
          </Button>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-xl bg-blue-50 p-2.5 dark:bg-blue-950/40"><ScrollText className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-xs text-muted-foreground">Entries</p><p className="text-2xl font-bold">{loading ? '—' : entries.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-xl bg-violet-50 p-2.5 dark:bg-violet-950/40"><Hash className="h-5 w-5 text-violet-600" /></div>
          <div className="min-w-0"><p className="text-xs text-muted-foreground">Head hash</p>
            <button onClick={() => head && copy(head.entryHash, 'Head hash')} className="truncate font-mono text-xs hover:underline">{head ? short(head.entryHash) : '—'}</button>
          </div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-xl bg-amber-50 p-2.5 dark:bg-amber-950/40"><Clock className="h-5 w-5 text-amber-600" /></div>
          <div><p className="text-xs text-muted-foreground">Last entry</p><p className="text-sm font-semibold">{head ? new Date(head.ts).toLocaleString('en-LK') : '—'}</p></div>
        </CardContent></Card>
      </div>

      {/* Verify result banner */}
      {result && (
        <div className={`flex items-start gap-3 rounded-xl border p-4 ${result.valid ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20' : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20'}`}>
          {result.valid ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
          <div className="text-sm">
            <p className={`font-semibold ${result.valid ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
              {result.valid ? `Integrity confirmed — ${result.length} entries, all hashes recomputed and matched.` : `Integrity FAILED at entry #${result.brokenAt}.`}
            </p>
            {result.reason && <p className="mt-0.5 text-muted-foreground">{result.reason}</p>}
            {result.headHash && <p className="mt-1 font-mono text-xs text-muted-foreground">head: {short(result.headHash, 16)}</p>}
          </div>
        </div>
      )}

      {/* Entries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Ledger Entries</CardTitle>
          <Button variant="outline" size="sm" onClick={appendDemo} disabled={appending} className="gap-1.5">
            {appending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Append demo entry
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading chain…</p>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              The chain is empty. Submit an H800 inspection — or click <strong>Append demo entry</strong> — to create the genesis record.
            </div>
          ) : (
            <div className="space-y-3">
              {ordered.map((e) => {
                const verifyUrl = origin ? `${origin}/public/audit?id=${e.id}` : '';
                return (
                  <div key={e.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-start dark:border-slate-700">
                    <div className="flex flex-col items-center gap-1">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white dark:bg-slate-700">#{e.index}</span>
                      {verifyUrl && <QRCodeSVG value={verifyUrl} size={72} className="rounded bg-white p-1" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{e.action}</span>
                        <span className="text-xs text-muted-foreground">{new Date(e.ts).toLocaleString('en-LK')}</span>
                        <span className="text-xs text-muted-foreground">· by {short(e.actorUid, 6)}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{e.summary}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">ref: {e.refCollection}/{short(e.refDocId, 8)}</p>
                      <div className="mt-2 grid gap-1 font-mono text-[11px] text-muted-foreground sm:grid-cols-2">
                        <p className="truncate">prev: {short(e.prevHash, 12)}</p>
                        <p className="truncate">payload: {short(e.payloadHash, 12)}</p>
                        <p className="truncate sm:col-span-2 text-slate-700 dark:text-slate-300">entry: {short(e.entryHash, 20)}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button onClick={() => copy(e.entryHash, 'Entry hash')} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-800"><Copy className="h-3 w-3" /> Copy hash</button>
                        {verifyUrl && <button onClick={() => copy(verifyUrl, 'Verify link')} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-800"><Link2 className="h-3 w-3" /> Copy verify link</button>}
                        {verifyUrl && <Link href={`/public/audit?id=${e.id}`} target="_blank" className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"><ShieldCheck className="h-3 w-3" /> Public verify</Link>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        What this proves: each entry stores the SHA-256 of the previous entry, so editing or deleting any past
        record changes every later hash — and <strong>Verify Integrity</strong> recomputes them all. Firestore
        security rules make the collection append-only. (Hardening: promote the append to a Firestore transaction;
        optionally anchor the head hash to a public chain — see <code>lib/audit-chain.ts</code>.)
      </p>
    </div>
  );
}
