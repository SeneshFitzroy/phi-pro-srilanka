'use client';

// Edge AI risk copilot — embedded inside the H800 inspection form. As the
// officer types observations, the quantised DistilBERT ONNX model
// (@xenova/transformers, ONNX Runtime WebAssembly, ~30 MB) silently
// classifies the note text into LOW / MEDIUM / HIGH violation risk, entirely
// in-browser (zero server calls, works offline after first load).
//
// Replaces the old standalone /dashboard/ai/edge page — the engine now runs
// where the officer already works.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Cpu, Loader2, CheckCircle2, AlertTriangle, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface Props {
  /** Live text from the inspection notes / remarks textarea. */
  text: string;
  /** Optional callback so the form can react to the risk (e.g. suggest a grade). */
  onRisk?: (risk: RiskLevel | null, suggestedGrade: 'A' | 'B' | 'C' | null) => void;
}

function mapLabelToRisk(label: string, score: number): { risk: RiskLevel; description: string; grade: 'A' | 'B' | 'C' } {
  if (label === 'POSITIVE' && score > 0.8) return { risk: 'LOW', description: 'Good practices detected — low violation risk', grade: 'A' };
  if (label === 'POSITIVE') return { risk: 'MEDIUM', description: 'Mostly compliant with minor concerns', grade: 'B' };
  if (label === 'NEGATIVE' && score > 0.8) return { risk: 'HIGH', description: 'Serious violations indicated — inspection required', grade: 'C' };
  return { risk: 'MEDIUM', description: 'Mixed signals — review recommended', grade: 'B' };
}

const RISK_CFG: Record<RiskLevel, { badge: string; bar: string }> = {
  LOW:    { badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', bar: 'bg-green-500' },
  MEDIUM: { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', bar: 'bg-amber-500' },
  HIGH:   { badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', bar: 'bg-red-500' },
};

export function EdgeRiskCopilot({ text, onRisk }: Props) {
  const [status, setStatus] = useState<ModelStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [risk, setRisk] = useState<RiskLevel | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState<'A' | 'B' | 'C' | null>(null);
  const [online, setOnline] = useState(true);
  const pipelineRef = useRef<((t: string) => Promise<{ label: string; score: number }[]>) | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Auto-load the model once when the component mounts. */
  const loadModel = useCallback(async () => {
    setStatus('loading');
    setProgress(0);
    try {
      const { pipeline, env } = await import('@xenova/transformers');
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      env.backends.onnx.wasm.numThreads = 1;
      const classifier = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
        {
          progress_callback: (p: { status: string; progress?: number }) => {
            if (p.status === 'progress' && p.progress != null) setProgress(Math.round(p.progress));
          },
        },
      );
      pipelineRef.current = async (input: string) => {
        const out = await classifier(input);
        return Array.isArray(out) ? out as { label: string; score: number }[] : [out as { label: string; score: number }];
      };
      setStatus('ready');
      setProgress(100);
    } catch (err) {
      console.warn('[edge-risk] model load failed:', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    void loadModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Debounced inference whenever the text changes + model is ready. */
  useEffect(() => {
    if (status !== 'ready' || !pipelineRef.current) return;
    const trimmed = text.trim();
    if (trimmed.length < 8) {
      setRisk(null); setGrade(null); onRisk?.(null, null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const [{ label, score }] = await pipelineRef.current!(trimmed.slice(0, 512));
        const { risk: r, description: d, grade: g } = mapLabelToRisk(label, score);
        setRisk(r); setConfidence(score); setDescription(d); setGrade(g);
        onRisk?.(r, g);
      } catch { /* per-keystroke inference failure is harmless */ }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, status]);

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-3 dark:border-orange-900/40 dark:bg-orange-950/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300">
          <Cpu className="h-3.5 w-3.5" /> Edge AI risk copilot
        </span>
        {status === 'loading' && (
          <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading model… {progress}%
          </span>
        )}
        {status === 'ready' && (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" /> AI ready{!online && <span className="ml-1 inline-flex items-center gap-0.5"><WifiOff className="h-2.5 w-2.5" /> offline</span>}
          </span>
        )}
        {status === 'error' && (
          <button type="button" onClick={() => void loadModel()} className="flex items-center gap-1 text-[10px] font-semibold text-red-600 underline">
            <AlertTriangle className="h-3 w-3" /> Model unavailable — retry
          </button>
        )}
      </div>

      <p className="mt-1 text-[10px] leading-relaxed text-orange-800/70 dark:text-orange-200/60">
        DistilBERT runs in your browser (ONNX/WASM). Type observations below — risk is classified live, fully offline. No data leaves the device.
      </p>

      {risk && (
        <div className="mt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold', RISK_CFG[risk].badge)}>{risk} RISK</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-300">{description}</span>
            {grade && (
              <span className="ml-auto rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Suggested grade: <span className={grade === 'A' ? 'text-green-600' : grade === 'B' ? 'text-amber-600' : 'text-red-600'}>{grade}</span>
              </span>
            )}
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/70 dark:bg-slate-800">
            <div className={cn('h-full rounded-full transition-all', RISK_CFG[risk].bar)} style={{ width: `${confidence * 100}%` }} />
          </div>
          <p className="mt-0.5 text-right text-[9px] text-slate-400">model confidence {(confidence * 100).toFixed(0)}%</p>
        </div>
      )}
    </div>
  );
}
