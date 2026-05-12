'use client';

// ============================================================================
// LiveObjectDetector — real-time object detection in the camera feed using
// TensorFlow.js + COCO-SSD (lite MobileNet v2), running entirely in the browser.
// Useful during inspections to document a scene and count people / kitchen
// equipment / food containers. EXPERIMENTAL: COCO's 80 classes don't include
// pests or PPE specifics — treat detections as scene context, not compliance.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, X, ScanEye, Loader2, AlertTriangle, Pause, Play } from 'lucide-react';

interface Detection { class: string; score: number; bbox: [number, number, number, number] }
// Minimal types for the lazily-imported model (avoids pulling tfjs types eagerly).
interface CocoModel { detect: (input: HTMLVideoElement | HTMLCanvasElement, maxNumBoxes?: number) => Promise<Detection[]>; dispose?: () => void }

const RELEVANT: Record<string, string> = {
  person: 'People (PPE / hygiene)', bottle: 'Containers', cup: 'Containers', bowl: 'Containers',
  'wine glass': 'Containers', knife: 'Utensils', spoon: 'Utensils', fork: 'Utensils',
  refrigerator: 'Cold storage', oven: 'Equipment', microwave: 'Equipment', sink: 'Wash facilities', toaster: 'Equipment',
  'dining table': 'Surfaces', chair: 'Furniture', 'cell phone': 'Devices', laptop: 'Devices',
  backpack: 'Bags', handbag: 'Bags', banana: 'Food', apple: 'Food', orange: 'Food', sandwich: 'Food', pizza: 'Food', cake: 'Food', 'hot dog': 'Food', donut: 'Food', carrot: 'Food', broccoli: 'Food',
  cat: 'Animal on premises', dog: 'Animal on premises', bird: 'Animal on premises',
};
const boxColor = (cls: string) => (cls === 'person' ? '#22c55e' : cls in RELEVANT ? '#2563eb' : '#94a3b8');

interface Props { open: boolean; onClose: () => void; title?: string }

export function LiveObjectDetector({ open, onClose, title = 'Live Object Detection' }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<CocoModel | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRun = useRef(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [stage, setStage] = useState('Starting…');
  const [paused, setPaused] = useState(false);
  const [dets, setDets] = useState<Detection[]>([]);

  const stopAll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    try { modelRef.current?.dispose?.(); } catch { /* */ }
    modelRef.current = null;
  }, []);

  const drawBoxes = useCallback((preds: Detection[]) => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    if (c.width !== v.videoWidth || c.height !== v.videoHeight) { c.width = v.videoWidth; c.height = v.videoHeight; }
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineWidth = Math.max(2, c.width / 320);
    ctx.font = `${Math.max(12, c.width / 38)}px sans-serif`;
    for (const p of preds) {
      const [x, y, w, h] = p.bbox;
      const col = boxColor(p.class);
      ctx.strokeStyle = col;
      ctx.strokeRect(x, y, w, h);
      const label = `${p.class} ${(p.score * 100) | 0}%`;
      const tw = ctx.measureText(label).width + 8;
      ctx.fillStyle = col;
      ctx.fillRect(x, Math.max(0, y - 18), tw, 18);
      ctx.fillStyle = '#fff';
      ctx.fillText(label, x + 4, Math.max(12, y - 4));
    }
  }, []);

  const loop = useCallback(async () => {
    const v = videoRef.current, m = modelRef.current;
    if (!v || !m) return;
    const now = performance.now();
    if (!paused && now - lastRun.current > 140 && v.readyState >= 2) {
      lastRun.current = now;
      try { const preds = await m.detect(v, 12); setDets(preds); drawBoxes(preds); } catch { /* skip frame */ }
    }
    rafRef.current = requestAnimationFrame(() => { void loop(); });
  }, [paused, drawBoxes]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setStatus('loading'); setStage('Requesting camera…');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
        setStage('Loading detection model (TF.js · COCO-SSD)…');
        const tf = await import('@tensorflow/tfjs');
        await tf.ready();
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        if (cancelled) { return; }
        modelRef.current = model as unknown as CocoModel;
        setStatus('ready'); setStage('Detecting…');
        rafRef.current = requestAnimationFrame(() => { void loop(); });
      } catch (e) {
        if (cancelled) return;
        const name = e instanceof DOMException ? e.name : '';
        setStatus('error');
        setStage(name === 'NotAllowedError' ? 'Camera permission denied.' : navigator.onLine ? 'Could not start detection (camera or model load failed).' : 'Offline — the detection model needs to download once.');
      }
    })();
    return () => { cancelled = true; stopAll(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // restart the RAF loop when paused toggles (loop captures `paused`)
  useEffect(() => {
    if (status !== 'ready') return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => { void loop(); });
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [paused, status, loop]);

  if (!open) return null;

  const relevant = dets.filter((d) => d.class in RELEVANT);
  const people = dets.filter((d) => d.class === 'person').length;
  const groups = relevant.reduce<Record<string, number>>((acc, d) => { const g = RELEVANT[d.class]; acc[g] = (acc[g] ?? 0) + 1; return acc; }, {});

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="flex items-center gap-2 text-sm font-semibold"><ScanEye className="h-4 w-4" /> {title} <span className="rounded bg-amber-500/80 px-1.5 py-0.5 text-[10px] font-bold">EXPERIMENTAL</span></span>
        <div className="flex items-center gap-2">
          {status === 'ready' && <button onClick={() => setPaused((p) => !p)} className="rounded-md p-2 hover:bg-white/10">{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>}
          <button onClick={() => { stopAll(); onClose(); }} aria-label="Close" className="rounded-md p-2 hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <div className="relative max-h-full max-w-full">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} playsInline muted className="max-h-[70vh] max-w-full" />
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
        </div>
        {status !== 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 text-white">
            {status === 'loading' ? <Loader2 className="h-7 w-7 animate-spin" /> : <AlertTriangle className="h-7 w-7 text-amber-400" />}
            <p className="max-w-xs text-center text-sm">{stage}</p>
          </div>
        )}
      </div>

      {/* Detection summary */}
      <div className="border-t border-white/10 bg-black/80 px-4 py-3 text-white">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5"><Camera className="h-4 w-4 text-emerald-400" /> <strong>{people}</strong> person{people === 1 ? '' : 's'} in frame</span>
          {Object.entries(groups).filter(([g]) => g !== 'People (PPE / hygiene)').map(([g, n]) => <span key={g} className="text-white/80"><strong>{n}</strong> {g}</span>)}
          <span className="ml-auto text-xs text-white/50">{dets.length} objects · COCO-80</span>
        </div>
        <p className="mt-1 text-[11px] text-white/50">Scene context only — COCO classes don&apos;t cover pests or PPE detail. The PHI records the actual checklist scores.</p>
      </div>
    </div>
  );
}
