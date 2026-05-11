'use client';

// ============================================================================
// PremisesPhotoAnalyzer — in-browser computer-vision hazard check for inspections
//
// The PHI photographs a premises area / food item; a CLIP zero-shot image
// classifier (Xenova/clip-vit-base-patch32, runs entirely in the browser via
// onnxruntime-web — no server, works offline once the ~weights are cached)
// scores the image against a set of public-health hazard descriptions and
// surfaces the likely findings, each mapped to the relevant H800 checklist item.
//
// ⚠️  Output is an AI *suggestion*. The PHI must visually confirm and is solely
//     responsible for the recorded score — see the on-screen disclaimer.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Upload, Loader2, ScanSearch, AlertTriangle, CheckCircle2, X, Sparkles, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/** A hazard description fed to CLIP, plus the H800 checklist item it maps to. */
interface HazardClass {
  /** Natural-language description used as the CLIP candidate label. */
  prompt: string;
  /** Short label shown to the PHI. */
  label: string;
  /** H800 section id (matches SCORING_SECTIONS in the inspection form), or null = no flag. */
  section: string | null;
  /** H800 item id within that section, or null. */
  item: string | null;
  good?: boolean;
}

const HAZARD_CLASSES: HazardClass[] = [
  { prompt: 'cockroaches, rats, mice, flies or other pests in a food premises', label: 'Pest activity / poor pest-proofing', section: 'premises', item: 'pestProofing' },
  { prompt: 'mould, mildew or fungal growth on food or surfaces', label: 'Mould / fungal growth', section: 'foodHandling', item: 'crossContamination' },
  { prompt: 'uncovered food left exposed to contamination', label: 'Uncovered / exposed food', section: 'foodHandling', item: 'rawCookedSeparation' },
  { prompt: 'raw meat or fish stored next to cooked or ready-to-eat food', label: 'Raw food near cooked food', section: 'foodHandling', item: 'crossContamination' },
  { prompt: 'accumulated rubbish, garbage or food waste', label: 'Waste / refuse accumulation', section: 'wasteSanitation', item: 'disposal' },
  { prompt: 'stagnant or dirty standing water and blocked drains', label: 'Stagnant water / blocked drainage', section: 'wasteSanitation', item: 'drainage' },
  { prompt: 'a dirty, cracked, damaged or mouldy wall or ceiling', label: 'Damaged / dirty walls or ceiling', section: 'premises', item: 'walls' },
  { prompt: 'a dirty, broken or unhygienic floor', label: 'Dirty / damaged floor', section: 'premises', item: 'floors' },
  { prompt: 'rusty, dirty, greasy or broken kitchen equipment and utensils', label: 'Equipment in poor / rusty condition', section: 'equipment', item: 'rustFree' },
  { prompt: 'a dirty toilet, washroom or hand-washing area', label: 'Dirty toilet / wash area', section: 'wasteSanitation', item: 'toilets' },
  { prompt: 'an open, uncovered or overflowing waste bin', label: 'Uncovered / overflowing bin', section: 'wasteSanitation', item: 'bins' },
  { prompt: 'a clean, tidy and well-maintained food preparation area', label: 'Area appears clean — no obvious hazard', section: null, item: null, good: true },
];

interface Finding extends HazardClass { score: number }

type ModelState = 'idle' | 'loading' | 'ready' | 'error';

interface Props {
  /** Called when the PHI clicks "Mark deficient" on a finding mapped to an H800 item. */
  onApplyDeficiency?: (sectionId: string, itemId: string, label: string) => void;
  /** 'h800' shows the "Mark deficient" actions; 'generic' hides them (e.g. factory page). */
  variant?: 'h800' | 'generic';
  className?: string;
}

export function PremisesPhotoAnalyzer({ onApplyDeficiency, variant = 'h800', className }: Props) {
  const [modelState, setModelState] = useState<ModelState>('idle');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [online, setOnline] = useState(true);
  const classifierRef = useRef<((img: string, labels: string[], opts: Record<string, unknown>) => Promise<{ labels: string[]; scores: number[] }>) | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const loadModel = useCallback(async () => {
    if (classifierRef.current) return classifierRef.current;
    setModelState('loading');
    setProgress(0);
    setStage('Initialising on-device vision runtime…');
    try {
      const { pipeline, env } = await import('@xenova/transformers');
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      env.backends.onnx.wasm.numThreads = 1;
      setStage('Downloading vision model (CLIP, first use only)…');
      const clip = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
        progress_callback: (p: { status: string; progress?: number; file?: string }) => {
          if (p.status === 'progress' && p.progress != null) {
            setProgress(Math.round(p.progress));
            setStage(`Downloading ${p.file ?? 'model'} — ${Math.round(p.progress)}%`);
          } else if (p.status === 'done') {
            setStage('Vision model ready (cached for offline use)');
          }
        },
      });
      classifierRef.current = clip as unknown as typeof classifierRef.current;
      setModelState('ready');
      setProgress(100);
      return classifierRef.current;
    } catch (err) {
      console.error('CLIP load failed:', err);
      setModelState('error');
      setStage(navigator.onLine ? 'Failed to load the vision model.' : 'Offline — model not yet cached on this device.');
      return null;
    }
  }, []);

  const analyse = useCallback(async (dataUrl: string) => {
    setAnalysing(true);
    setFindings(null);
    try {
      const clip = await loadModel();
      if (!clip) { toast.error('Vision model unavailable.'); return; }
      const labels = HAZARD_CLASSES.map((h) => h.prompt);
      const out = await clip(dataUrl, labels, { hypothesis_template: 'This is a photo of {}.' });
      // out: { labels: string[]; scores: number[] } sorted desc
      const ranked: Finding[] = out.labels.map((lbl, i) => {
        const cls = HAZARD_CLASSES.find((h) => h.prompt === lbl)!;
        return { ...cls, score: out.scores[i] };
      });
      setFindings(ranked);
      const top = ranked[0];
      if (top.good) toast.success('No obvious hazard detected — proceed with manual inspection.');
      else toast.warning(`Possible: ${top.label} (${Math.round(top.score * 100)}%). Verify on site.`);
    } catch (err) {
      console.error('Analysis failed:', err);
      toast.error('Image analysis failed.');
    } finally {
      setAnalysing(false);
    }
  }, [loadModel]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPreview(url);
      void analyse(url);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [analyse]);

  const reset = () => { setPreview(null); setFindings(null); };

  // Show findings above a confidence floor (and always at least the top one).
  const shown = findings ? findings.filter((f, i) => i === 0 || f.score >= 0.12).slice(0, 4) : [];

  return (
    <Card className={`border-2 border-dashed border-violet-200 bg-violet-50/30 dark:border-violet-900/50 dark:bg-violet-950/10 ${className ?? ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-lg bg-violet-600/10 p-2"><ScanSearch className="h-5 w-5 text-violet-600" /></div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" /> Photo Hazard Check — on-device AI
            </p>
            <p className="text-xs text-muted-foreground">
              Photograph a premises area or food item; the model suggests likely public-health hazards and the matching checklist item. Runs in your browser.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" disabled={analysing} onClick={() => cameraRef.current?.click()} className="gap-2 border-violet-400 text-violet-700 hover:bg-violet-100 dark:text-violet-300">
                {analysing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Take Photo
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={analysing} onClick={() => fileRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" /> Upload Image
              </Button>
              {!online && <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600"><WifiOff className="h-3 w-3" /> offline — needs model cached</span>}
            </div>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />

            {/* Model download progress */}
            {modelState === 'loading' && (
              <div className="mt-3 rounded-lg bg-white/70 p-2 dark:bg-slate-900/40">
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300"><span>{stage}</span><span>{progress}%</span></div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {modelState === 'error' && (
              <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{stage}</p>
            )}

            {/* Findings */}
            {analysing && (
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" /> Analysing image…</p>
            )}
            {findings && !analysing && (
              <div className="mt-3 space-y-1.5">
                {shown.map((f) => (
                  <div key={f.prompt} className={`flex items-center gap-2 rounded-lg border p-2 text-xs ${f.good ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20' : 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20'}`}>
                    {f.good ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />}
                    <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{f.label}</span>
                    <span className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:bg-slate-800">{Math.round(f.score * 100)}%</span>
                    {variant === 'h800' && !f.good && f.section && f.item && onApplyDeficiency && (
                      <button
                        type="button"
                        onClick={() => { onApplyDeficiency(f.section!, f.item!, f.label); toast.message(`Marked "${f.label}" deficient — review the score.`); }}
                        className="rounded bg-amber-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-amber-700"
                      >
                        Mark deficient
                      </button>
                    )}
                  </div>
                ))}
                <p className="pt-1 text-[10px] text-slate-400">
                  AI suggestion only — the PHI must visually confirm each item. Confidence scores are relative across the listed hazards.
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          {preview && (
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Inspection photo" className="h-20 w-20 rounded-lg border border-slate-200 object-cover" />
              <button onClick={reset} className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-800/80 p-0.5 text-white"><X className="h-3 w-3" /></button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
