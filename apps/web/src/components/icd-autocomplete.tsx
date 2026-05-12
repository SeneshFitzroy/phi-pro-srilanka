'use client';

// ============================================================================
// IcdAutocomplete — type a disease name, pick its ICD-11 code. Backed by the
// WHO ICD-11 API (or a built-in indicative list) via /api/icd. Emits { code, title }.
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { Search, Loader2, Check, X } from 'lucide-react';

interface IcdResult { code: string; title: string; indicative?: boolean }
interface Props {
  onSelect: (r: IcdResult | null) => void;
  initialQuery?: string;
  placeholder?: string;
}

export function IcdAutocomplete({ onSelect, initialQuery = '', placeholder = 'Type a disease… (ICD-11)' }: Props) {
  const [q, setQ] = useState(initialQuery);
  const [results, setResults] = useState<IcdResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<IcdResult | null>(null);
  const [source, setSource] = useState<string>('');
  const boxRef = useRef<HTMLDivElement | null>(null);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (tRef.current) clearTimeout(tRef.current);
    if (picked && q === `${picked.code} · ${picked.title}`) return; // don't re-search after a pick
    if (q.trim().length < 2) { setResults([]); return; }
    tRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/icd?q=${encodeURIComponent(q.trim())}`);
        const data = (await res.json()) as { results: IcdResult[]; source: string };
        setResults(data.results ?? []);
        setSource(data.source ?? '');
        setOpen(true);
      } catch { setResults([]); } finally { setLoading(false); }
    }, 280);
    return () => { if (tRef.current) clearTimeout(tRef.current); };
  }, [q, picked]);

  const choose = (r: IcdResult) => { setPicked(r); setQ(`${r.code} · ${r.title}`); setOpen(false); onSelect(r); };
  const clear = () => { setPicked(null); setQ(''); setResults([]); onSelect(null); };

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); if (picked) { setPicked(null); onSelect(null); } }}
          onFocus={() => { if (results.length) setOpen(true); }}
          placeholder={placeholder}
          className={`flex h-10 w-full rounded-md border bg-background pl-8 pr-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${picked ? 'border-emerald-300' : 'border-input'}`}
        />
        {loading ? <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-slate-400" />
          : picked ? <button type="button" onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-3.5 w-3.5" /></button>
          : null}
      </div>
      {picked && <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600"><Check className="h-3 w-3" /> ICD-11 {picked.code}{picked.indicative ? ' (indicative — confirm via WHO ICD-11)' : ''}</p>}
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {results.map((r) => (
            <button key={r.code + r.title} type="button" onClick={() => choose(r)} className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{r.code}</span>
              <span className="flex-1">{r.title}{r.indicative && <span className="ml-1 text-[10px] text-amber-600">indicative</span>}</span>
            </button>
          ))}
          <p className="border-t border-slate-100 px-3 py-1.5 text-[10px] text-muted-foreground dark:border-slate-800">{source === 'who' ? 'WHO ICD-11 API · live' : 'built-in indicative list (set ICD_API_CLIENT_ID for live WHO lookup)'}</p>
        </div>
      )}
    </div>
  );
}
