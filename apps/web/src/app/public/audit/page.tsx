'use client';

// ============================================================================
// Public Audit-Chain Verification
// Anyone (e.g. a business owner with a certificate QR) can paste an entry id or
// hash and have the browser re-walk the whole chain and re-compute every hash
// to confirm the record has not been altered.
// ============================================================================

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { ShieldCheck, Search, Loader2, CheckCircle2, AlertTriangle, Hash, Link2 } from 'lucide-react';
import { getDocument } from '@/lib/firestore';
import {
  getChain, verifyChain, type AuditEntry, type VerifyResult,
} from '@/lib/audit-chain';

const short = (h: string, n = 12) => (h && h.length > 2 * n ? `${h.slice(0, n)}…${h.slice(-n)}` : h);

function AuditVerifier() {
  const params = useSearchParams();
  const [idInput, setIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<AuditEntry | null>(null);
  const [chainResult, setChainResult] = useState<VerifyResult | null>(null);
  const [positionOk, setPositionOk] = useState<boolean | null>(null);
  const [notFound, setNotFound] = useState(false);

  const lookup = useCallback(async (raw: string) => {
    const key = raw.trim();
    if (!key) return;
    setLoading(true);
    setEntry(null); setChainResult(null); setPositionOk(null); setNotFound(false);
    try {
      const chain = await getChain();
      const result = await verifyChain(chain);
      setChainResult(result);

      // Match by document id first, then by entryHash.
      let found: AuditEntry | null = await getDocument<AuditEntry>('audit_chain', key).catch(() => null);
      if (!found) found = chain.find((e) => e.entryHash === key || e.entryHash.startsWith(key)) ?? null;

      if (!found) { setNotFound(true); return; }
      setEntry(found);
      // Is this exact entry present, in order, in the verified chain?
      const inChain = chain.find((e) => e.id === found!.id || e.entryHash === found!.entryHash);
      setPositionOk(!!inChain && (result.valid || (result.brokenAt !== null && inChain.index < result.brokenAt)));
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = params.get('id') || params.get('hash');
    if (id) { setIdInput(id); void lookup(id); }
  }, [params, lookup]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">Tamper-Evident Records</p>
      <h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        <ShieldCheck className="h-8 w-8 text-emerald-600" /> Audit Chain Verification
      </h1>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        Paste an audit-record id or hash (or scan the QR on a certificate). Your browser fetches the whole chain
        and re-computes every SHA-256 hash — if anything had been altered, the check would fail.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); void lookup(idInput); }}
        className="mt-6 flex flex-col gap-2 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
            placeholder="Audit record id or entry hash…"
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <button type="submit" disabled={loading || !idInput.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Verify
        </button>
      </form>

      {/* Chain integrity banner */}
      {chainResult && (
        <div className={`mt-6 flex items-start gap-3 rounded-xl border p-4 ${chainResult.valid ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20' : 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20'}`}>
          {chainResult.valid ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
          <div className="text-sm">
            <p className={`font-semibold ${chainResult.valid ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
              {chainResult.valid ? `Chain intact — ${chainResult.length} records, every hash recomputed and matched.` : `Chain integrity FAILED at record #${chainResult.brokenAt}.`}
            </p>
            {chainResult.reason && <p className="mt-0.5 text-slate-600 dark:text-slate-400">{chainResult.reason}</p>}
          </div>
        </div>
      )}

      {notFound && (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
          No audit record matched that id or hash. Check the value, or scan the QR again.
        </p>
      )}

      {/* Entry detail */}
      {entry && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white dark:bg-slate-700">Record #{entry.index}</span>
            {positionOk !== null && (
              positionOk
                ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Authentic — sealed in the chain</span>
                : <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300"><AlertTriangle className="h-3.5 w-3.5" /> Not validated</span>
            )}
          </div>
          <p className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{entry.summary}</p>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-slate-400">Action</dt><dd className="font-medium">{entry.action}</dd></div>
            <div><dt className="text-xs text-slate-400">Timestamp</dt><dd className="font-medium">{new Date(entry.ts).toLocaleString('en-LK')}</dd></div>
            <div><dt className="text-xs text-slate-400">Recorded by</dt><dd className="font-mono text-xs">{short(entry.actorUid, 8)}</dd></div>
            <div><dt className="text-xs text-slate-400">References</dt><dd className="font-mono text-xs">{entry.refCollection}/{short(entry.refDocId, 8)}</dd></div>
          </dl>
          <div className="mt-4 space-y-1 rounded-lg bg-slate-50 p-3 font-mono text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <p className="flex items-center gap-1.5"><Link2 className="h-3 w-3" /> prev&nbsp;&nbsp;&nbsp; {short(entry.prevHash, 16)}</p>
            <p className="flex items-center gap-1.5"><Hash className="h-3 w-3" /> payload {short(entry.payloadHash, 16)}</p>
            <p className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-white"><Hash className="h-3 w-3" /> entry&nbsp;&nbsp; {short(entry.entryHash, 16)}</p>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Only a SHA-256 fingerprint of the original action is stored here — never the underlying personal data.
          </p>
        </div>
      )}
    </div>
  );
}

export default function PublicAuditPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />
      <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-slate-500"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>}>
        <AuditVerifier />
      </Suspense>
      <PublicFooter />
    </div>
  );
}
