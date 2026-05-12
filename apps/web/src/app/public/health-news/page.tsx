'use client';

// ============================================================================
// Public health-news feed with verification badges. Pulls Sri Lanka health news
// (NewsAPI via /api/health-news), cross-references across outlets, and screens
// headlines against the Google Fact Check Tools API. Includes a "check a claim"
// box so the public can screen a circulating message before sharing it.
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { Newspaper, ShieldCheck, ShieldAlert, ShieldQuestion, RefreshCw, Loader2, ExternalLink, Search, CalendarDays } from 'lucide-react';

type Verification = 'verified' | 'single-source' | 'disputed';
interface NewsItem { title: string; description: string; url: string; source: string; publishedAt: string; verification: Verification; corroboratingSources: string[]; factCheck?: { rating: string; publisher: string; url: string } | null }

const badge: Record<Verification, { cls: string; icon: typeof ShieldCheck; label: string }> = {
  verified: { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', icon: ShieldCheck, label: 'Verified — corroborated' },
  'single-source': { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', icon: ShieldQuestion, label: 'Single source' },
  disputed: { cls: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300', icon: ShieldAlert, label: 'Disputed / unverified' },
};
const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return iso; } };

export default function HealthNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState('');
  const [claim, setClaim] = useState('');
  const [claimResult, setClaimResult] = useState<{ verdict: string; factCheck?: { rating: string; publisher: string; url: string } | null } | null>(null);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health-news');
      const data = (await res.json()) as { articles: NewsItem[]; source: string };
      setItems(data.articles ?? []);
      setSrc(data.source ?? '');
    } catch { setItems([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const checkClaim = async () => {
    if (!claim.trim()) return;
    setChecking(true); setClaimResult(null);
    try {
      const res = await fetch(`/api/health-news?claim=${encodeURIComponent(claim.trim())}`);
      setClaimResult(await res.json());
    } catch { setClaimResult({ verdict: 'error' }); } finally { setChecking(false); }
  };

  const verifiedCount = items.filter((i) => i.verification === 'verified').length;
  const disputedCount = items.filter((i) => i.verification === 'disputed').length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">Health Information</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white"><Newspaper className="h-8 w-8 text-blue-700" /> Sri Lanka Health News — verified</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Health news about Sri Lanka, each item cross-referenced across outlets and screened against fact-check databases. Always rely on official Ministry of Health bulletins for outbreak alerts.
          </p>
        </div>
      </section>

      {/* Claim checker */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <h2 className="flex items-center gap-2 text-sm font-bold"><ShieldAlert className="h-4 w-4 text-red-500" /> Seen a health message you&apos;re unsure about?</h2>
          <p className="mt-1 text-xs text-muted-foreground">Paste the claim or headline — we&apos;ll check it against published fact-checks before you share it.</p>
          <form onSubmit={(e) => { e.preventDefault(); void checkClaim(); }} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={claim} onChange={(e) => setClaim(e.target.value)} placeholder="e.g. “new waterborne outbreak in …”" className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            </div>
            <button type="submit" disabled={checking || !claim.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50">{checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Check</button>
          </form>
          {claimResult && (
            <div className={`mt-3 rounded-lg p-3 text-sm ${claimResult.factCheck ? 'bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300' : 'bg-blue-50 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300'}`}>
              {claimResult.factCheck
                ? <span><strong>Flagged.</strong> {claimResult.factCheck.publisher} rates this: “{claimResult.factCheck.rating}”. {claimResult.factCheck.url && <a href={claimResult.factCheck.url} target="_blank" rel="noopener noreferrer" className="underline">See review</a>}</span>
                : claimResult.verdict === 'fact-check-not-configured'
                  ? <span>No fact-check service is configured on this instance. Treat unverified claims with caution and check the MOH bulletins.</span>
                  : <span>No published fact-check matched this claim. That doesn&apos;t make it true — verify against official Ministry of Health sources before sharing.</span>}
            </div>
          )}
        </div>
      </section>

      {/* Feed */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /><strong className="text-emerald-600">{verifiedCount}</strong> verified</span>
            <span className="flex items-center gap-1.5"><ShieldAlert className="h-4 w-4 text-red-500" /><strong className="text-red-600">{disputedCount}</strong> disputed</span>
            {src && <span className="text-[11px]">source: {src === 'newsapi' ? 'NewsAPI · live' : 'curated sample (set NEWSAPI_KEY for live)'}</span>}
          </div>
          <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm dark:border-slate-700"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => {
              const b = badge[it.verification]; const Icon = b.icon;
              return (
                <article key={i} className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${it.verification === 'disputed' ? 'border-red-200 dark:border-red-900/40' : 'border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${b.cls}`}><Icon className="h-3 w-3" />{b.label}</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><CalendarDays className="h-3 w-3" />{fmtDate(it.publishedAt)}</span>
                  </div>
                  <h3 className="mt-2.5 text-sm font-bold leading-snug text-slate-900 dark:text-white">{it.title}</h3>
                  {it.description && <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-4">{it.description}</p>}
                  {it.factCheck && <p className="mt-2 rounded bg-red-50 px-2 py-1 text-[11px] text-red-700 dark:bg-red-950/20 dark:text-red-300">{it.factCheck.publisher}: “{it.factCheck.rating}”</p>}
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{it.source}{it.corroboratingSources.length > 1 && ` · +${it.corroboratingSources.length - 1} outlet${it.corroboratingSources.length - 1 === 1 ? '' : 's'}`}</span>
                    <a href={it.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline dark:text-blue-400">Read <ExternalLink className="h-3 w-3" /></a>
                  </div>
                </article>
              );
            })}
            {items.length === 0 && <p className="col-span-full rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No health news available right now.</p>}
          </div>
        )}
        <p className="mt-6 text-[11px] text-muted-foreground">Verification: a story is marked <em>verified</em> when ≥2 distinct outlets carry it; <em>disputed</em> when a published fact-check rates it false/misleading. This is automated screening, not editorial endorsement — for outbreak information always use <a href="https://www.epid.gov.lk" target="_blank" rel="noopener noreferrer" className="underline">the Epidemiology Unit</a> and <a href="https://www.health.gov.lk" target="_blank" rel="noopener noreferrer" className="underline">the Ministry of Health</a>.</p>
      </section>

      <PublicFooter />
    </div>
  );
}
