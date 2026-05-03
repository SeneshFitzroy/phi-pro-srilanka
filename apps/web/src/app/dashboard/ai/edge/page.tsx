'use client';

// ============================================================================
// Edge AI — In-Browser Food Safety Classifier
// @xenova/transformers: DistilBERT SST-2 ONNX model runs entirely in browser
// No server round-trip · WASM inference · Works offline after first load
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { Cpu, Loader2, CheckCircle2, AlertTriangle, Info, BarChart2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface ClassifyResult {
  label: string;
  score: number;
  risk: RiskLevel;
  description: string;
  processingMs: number;
}

const SAMPLE_TEXTS = [
  'Food stored at correct temperature, clean surfaces, staff wearing gloves and hairnets',
  'Raw meat stored above ready-to-eat food, no handwashing facilities visible near prep area',
  'Expired products on shelf, pest droppings found near storage, hygiene logs missing',
  'Regular cleaning schedule followed, temperature logs up to date, valid health certificate displayed',
  'Cockroach sighting in kitchen, blocked drainage, chef handling food without washing hands',
  'Good ventilation, HACCP plan displayed, allergen notices clearly marked at point of service',
];

function mapLabelToRisk(label: string, score: number): { risk: RiskLevel; description: string } {
  // DistilBERT SST-2: POSITIVE = good conditions, NEGATIVE = violations
  if (label === 'POSITIVE' && score > 0.8) return { risk: 'LOW', description: 'Good food safety practices detected — low violation risk' };
  if (label === 'POSITIVE') return { risk: 'MEDIUM', description: 'Mostly compliant with minor concerns — medium risk' };
  if (label === 'NEGATIVE' && score > 0.8) return { risk: 'HIGH', description: 'Serious food safety violations indicated — high risk, inspection required' };
  return { risk: 'MEDIUM', description: 'Mixed signals — further inspection recommended' };
}

const RISK_CFG: Record<RiskLevel, { bg: string; badge: string; icon: React.ElementType; border: string }> = {
  LOW:    { bg: 'bg-green-50 dark:bg-green-950/10', badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle2, border: 'border-green-300 dark:border-green-800' },
  MEDIUM: { bg: 'bg-amber-50 dark:bg-amber-950/10',  badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',  icon: AlertTriangle, border: 'border-amber-300 dark:border-amber-800' },
  HIGH:   { bg: 'bg-red-50 dark:bg-red-950/10',    badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',    icon: AlertTriangle, border: 'border-red-300 dark:border-red-800' },
};

export default function EdgeAIPage() {
  const [modelStatus, setModelStatus] = useState<ModelStatus>('idle');
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStage, setLoadStage]   = useState('');
  const [text, setText]             = useState(SAMPLE_TEXTS[0]);
  const [result, setResult]         = useState<ClassifyResult | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [history, setHistory]       = useState<ClassifyResult[]>([]);
  const pipelineRef                 = useRef<((text: string) => Promise<{ label: string; score: number }[]>) | null>(null);
  const [online, setOnline]         = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline  = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const loadModel = useCallback(async () => {
    setModelStatus('loading');
    setLoadProgress(0);
    setLoadStage('Initialising ONNX runtime…');
    try {
      // Dynamic import so it never runs on server
      const { pipeline, env } = await import('@xenova/transformers');

      // Force CDN fetch (no local model cache on server)
      env.allowLocalModels   = false;
      env.useBrowserCache    = true;
      env.backends.onnx.wasm.numThreads = 1; // avoid SharedArrayBuffer requirement

      setLoadStage('Downloading model (DistilBERT-SST2, ~30 MB)…');

      const classifier = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
        {
          progress_callback: (prog: { status: string; progress?: number; file?: string }) => {
            if (prog.status === 'progress' && prog.progress != null) {
              setLoadProgress(Math.round(prog.progress));
              setLoadStage(`Downloading: ${prog.file ?? 'model'} (${Math.round(prog.progress)}%)`);
            } else if (prog.status === 'done') {
              setLoadStage('Model loaded — cached for offline use');
            }
          },
        }
      );

      pipelineRef.current = async (input: string) => {
        const out = await classifier(input);
        return Array.isArray(out) ? out as { label: string; score: number }[] : [out as { label: string; score: number }];
      };

      setModelStatus('ready');
      setLoadProgress(100);
      setLoadStage('ONNX model ready');
    } catch (err) {
      console.error('Model load error:', err);
      setModelStatus('error');
      setLoadStage('Failed to load model');
    }
  }, []);

  const classify = useCallback(async () => {
    if (!pipelineRef.current || !text.trim()) return;
    setClassifying(true);
    const t0 = performance.now();
    try {
      const [{ label, score }] = await pipelineRef.current(text);
      const processingMs = Math.round(performance.now() - t0);
      const { risk, description } = mapLabelToRisk(label, score);
      const res: ClassifyResult = { label, score, risk, description, processingMs };
      setResult(res);
      setHistory(h => [res, ...h.slice(0, 9)]);
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setClassifying(false);
    }
  }, [text]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edge AI Food Safety Classifier</h1>
            <p className="text-xs text-slate-500">@xenova/transformers · DistilBERT ONNX · Inference runs entirely in browser</p>
          </div>
        </div>
        <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', online ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
          {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {online ? 'Online' : 'Offline (cached model still works)'}
        </span>
      </div>

      {/* Architecture note */}
      <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-xs text-orange-800 dark:border-orange-800/30 dark:bg-orange-950/10 dark:text-orange-200">
        <p className="font-semibold">How Edge AI works in PHI-PRO:</p>
        <p className="mt-1">DistilBERT (a transformer neural network) is quantised to ONNX format and runs directly in the browser via <strong>ONNX Runtime WebAssembly</strong>. The 30 MB model downloads once, then persists in IndexedDB — all subsequent inference is <strong>fully offline</strong>. Classifies food safety inspection notes into: <strong>LOW / MEDIUM / HIGH risk</strong>. No data ever sent to a server.</p>
      </div>

      {/* Model loader */}
      {modelStatus !== 'ready' && (
        <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">ONNX Model Status</p>
          {modelStatus === 'idle' && (
            <button onClick={loadModel} className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-600">
              <Cpu className="h-4 w-4" />Load Model into Browser
            </button>
          )}
          {modelStatus === 'loading' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                <span>{loadStage}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-orange-500 transition-all duration-300" style={{ width: `${loadProgress}%` }} />
              </div>
              <p className="text-xs text-slate-400">{loadProgress}% downloaded · Cached in IndexedDB after first load</p>
            </div>
          )}
          {modelStatus === 'error' && (
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-600">{loadStage}</span>
              <button onClick={loadModel} className="ml-auto flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">
                <RefreshCw className="h-3.5 w-3.5" />Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Classifier UI */}
      <div className={cn('rounded-xl border bg-white p-5 shadow-sm transition-opacity dark:border-slate-700 dark:bg-slate-900', modelStatus !== 'ready' && 'opacity-50 pointer-events-none')}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Inspection Notes — PHI Risk Assessment
          </p>
          {modelStatus === 'ready' && (
            <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />Model ready
            </span>
          )}
        </div>

        {/* Sample buttons */}
        <div className="mb-3 flex flex-wrap gap-2">
          {SAMPLE_TEXTS.map((s, i) => (
            <button key={i} onClick={() => setText(s)}
              className={cn('rounded-full border px-3 py-1 text-[11px] transition-colors', text === s ? 'border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-950/30' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800')}>
              Sample {i + 1}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          placeholder="Enter food inspection notes…"
          className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />

        <button
          onClick={classify}
          disabled={classifying || modelStatus !== 'ready' || !text.trim()}
          className="mt-3 flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-50">
          {classifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
          {classifying ? 'Running ONNX inference…' : 'Classify Risk Level'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={cn('rounded-xl border p-5 shadow-sm', RISK_CFG[result.risk].bg, RISK_CFG[result.risk].border)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {(() => { const Icon = RISK_CFG[result.risk].icon; return <Icon className={cn('h-7 w-7', result.risk === 'LOW' ? 'text-green-600' : result.risk === 'MEDIUM' ? 'text-amber-500' : 'text-red-500')} />; })()}
              <div>
                <span className={cn('rounded-full px-3 py-1 text-sm font-bold', RISK_CFG[result.risk].badge)}>
                  {result.risk} RISK
                </span>
                <p className="mt-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">{result.description}</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
              <p>Model confidence: <strong>{(result.score * 100).toFixed(1)}%</strong></p>
              <p>Inference time: <strong>{result.processingMs} ms</strong></p>
              <p>Raw label: <span className="font-mono">{result.label}</span></p>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[11px] text-slate-500">
              <span>Model confidence</span><span>{(result.score * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/60 dark:bg-slate-800">
              <div
                className={cn('h-full rounded-full transition-all', result.risk === 'LOW' ? 'bg-green-500' : result.risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-red-500')}
                style={{ width: `${result.score * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="rounded-xl border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-2 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Inference History</p>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {history.slice(0, 8).map((h, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className={cn('h-2 w-2 rounded-full shrink-0', h.risk === 'LOW' ? 'bg-green-500' : h.risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-red-500')} />
                <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold shrink-0', RISK_CFG[h.risk].badge)}>{h.risk}</span>
                <span className="flex-1 truncate text-xs text-slate-500 dark:text-slate-400">{SAMPLE_TEXTS.find(s => s === text) ? `Sample input` : `Custom input`}</span>
                <span className="shrink-0 font-mono text-[10px] text-slate-400">{h.processingMs}ms · {(h.score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
          <p className="text-xs text-slate-500">
            Model: <strong>Xenova/distilbert-base-uncased-finetuned-sst-2-english</strong> — ONNX quantised (~30 MB). Inference: ONNX Runtime WebAssembly (single-threaded, no COEP/COOP headers required). First load: CDN download + IndexedDB cache. Subsequent loads: instant from browser cache. In production: fine-tune on PHI-PRO inspection data for domain accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}
