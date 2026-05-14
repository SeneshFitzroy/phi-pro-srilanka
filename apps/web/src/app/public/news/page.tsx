'use client';

// ============================================================================
// /public/news — Live Sri Lanka health news feed (NewsAPI) + verification
// badges (cross-outlet corroboration + Google Fact Check screening). Falls
// back to a curated sample when NEWSAPI_KEY is not set on the server.
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import {
  Newspaper, ShieldCheck, ShieldAlert, ShieldQuestion, RefreshCw,
  Loader2, ExternalLink, CalendarDays, Search,
} from 'lucide-react';

type Verification = 'verified' | 'single-source' | 'disputed';
interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  verification: Verification;
  corroboratingSources: string[];
  factCheck?: { rating: string; publisher: string; url: string } | null;
}

const badge: Record<Verification, { cls: string; icon: typeof ShieldCheck; label: string }> = {
  verified: { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', icon: ShieldCheck, label: 'Verified — corroborated' },
  'single-source': { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', icon: ShieldQuestion, label: 'Single source' },
  disputed: { cls: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300', icon: ShieldAlert, label: 'Disputed / unverified' },
};

const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
};

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState('');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health-news', { cache: 'no-store' });
      const data = (await res.json()) as { articles: NewsItem[]; source: string };
      setItems(data.articles ?? []);
      setSrc(data.source ?? '');
    } catch { setItems([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = q.trim()
    ? items.filter((i) =>
        (i.title + ' ' + i.description + ' ' + i.source).toLowerCase().includes(q.trim().toLowerCase()),
      )
    : items;

  const verifiedCount = items.filter((i) => i.verification === 'verified').length;
  const disputedCount = items.filter((i) => i.verification === 'disputed').length;

  const sourceLabel =
    src === 'newsapi' ? 'NewsAPI · live'
    : src === 'sample-fallback' ? 'NewsAPI unreachable — showing curated sample'
    : 'Curated sample (set NEWSAPI_KEY for live)';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">From the Newsroom</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            <Newspaper className="h-8 w-8 text-blue-700" /> News &amp; Events
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Live Sri Lanka public health news from the wire — cross-referenced across outlets and
            screened against published fact-checks. Refresh anytime; updates every 15 minutes.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <strong className="text-emerald-600 dark:text-emerald-400">{verifiedCount}</strong> verified
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              <strong className="text-red-600 dark:text-red-400">{disputedCount}</strong> disputed
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-500">source: {sourceLabel}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search news — dengue, food safety, outbreak…"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              aria-label="Search news"
            />
          </div>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></p>
        ) : filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
            No matching stories. Try a different search term.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((it, i) => {
              const b = badge[it.verification];
              const Icon = b.icon;
              return (
                <article
                  key={`${it.url}-${i}`}
                  className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${
                    it.verification === 'disputed' ? 'border-red-200 dark:border-red-900/40' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${b.cls}`}>
                      <Icon className="h-3 w-3" />{b.label}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <CalendarDays className="h-3 w-3" />{fmtDate(it.publishedAt)}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-sm font-bold leading-snug text-slate-900 dark:text-white">{it.title}</h3>
                  {it.description && (
                    <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-600 line-clamp-4 dark:text-slate-400">
                      {it.description}
                    </p>
                  )}
                  {it.factCheck && (
                    <p className="mt-2 rounded bg-red-50 px-2 py-1 text-[11px] text-red-700 dark:bg-red-950/20 dark:text-red-300">
                      {it.factCheck.publisher}: “{it.factCheck.rating}”
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      {it.source}
                      {it.corroboratingSources.length > 1 &&
                        ` · +${it.corroboratingSources.length - 1} outlet${it.corroboratingSources.length - 1 === 1 ? '' : 's'}`}
                    </span>
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline dark:text-blue-400"
                    >
                      Read <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p className="mt-8 text-[11px] text-slate-500">
          A story is marked <em>verified</em> when ≥2 distinct outlets carry it; <em>disputed</em> when a published fact-check rates it false/misleading.
          For outbreak information always use <a href="https://www.epid.gov.lk" target="_blank" rel="noopener noreferrer" className="underline">the Epidemiology Unit</a> and the <a href="https://www.health.gov.lk" target="_blank" rel="noopener noreferrer" className="underline">Ministry of Health</a>.
        </p>
      </section>

      <PublicFooter />
    </div>
  );
}
