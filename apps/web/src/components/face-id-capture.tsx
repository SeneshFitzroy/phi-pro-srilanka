'use client';

// Live selfie capture with on-device face detection.
//
// Pragmatic design — we *guide* the user (position → hold → optional turns)
// but the Capture button is ALWAYS available while streaming so the user can
// snap at any time. Auto-snap fires after ~3.5s of a stable, centred face
// (or 5s on browsers without FaceDetector) so the user doesn't have to do
// anything if they don't want to.
//
// Native Shape Detection API where available (Chrome/Edge/Android); Safari
// + Firefox fall back to manual capture with the same UI.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export type FaceIdItem = { url: string } | null;

interface Props {
  item: FaceIdItem;
  onCapture: (file: File) => void;
  onClear: () => void;
  heading?: string;
}

type Hint =
  | 'positionFace'
  | 'holdStill'
  | 'readyAuto'
  | 'noFace';

const HINT_COPY: Record<Hint, { title: string; sub: string; cls: string }> = {
  positionFace: { title: 'Position your face in the ring',  sub: 'Centre inside the green oval',                 cls: 'border-amber-300/70 animate-pulse' },
  holdStill:    { title: 'Hold still — face detected',       sub: 'Tap Capture, or wait for auto-snap',          cls: 'border-emerald-400/80' },
  readyAuto:    { title: 'Capturing in a moment…',          sub: 'Keep your face inside the ring',              cls: 'border-emerald-500/90' },
  noFace:       { title: 'No face detected yet',            sub: 'Move closer + face the camera',               cls: 'border-amber-300/70 animate-pulse' },
};

export function FaceIdCapture({ item, onCapture, onClear, heading = 'Live selfie' }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const holdMsRef = useRef(0);

  const [streaming, setStreaming] = useState(false);
  const [hint, setHint] = useState<Hint>('positionFace');
  const [hasFace, setHasFace] = useState(false);
  const [err, setErr] = useState('');
  const [supportsFace, setSupportsFace] = useState(false);

  /* ── camera lifecycle ──────────────────────────────────────────────── */

  const start = useCallback(async () => {
    setErr('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
        setHint('positionFace');
        holdMsRef.current = 0;
      }
    } catch (e) {
      setErr(`Camera unavailable: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  const stop = useCallback(() => {
    const v = videoRef.current;
    if (v?.srcObject) (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    if (v) v.srcObject = null;
    setStreaming(false);
    setHasFace(false);
    setHint('positionFace');
    holdMsRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── snap ───────────────────────────────────────────────────────────── */

  const snap = useCallback(() => {
    const v = videoRef.current; const c = canvasRef.current;
    if (!v || !c || v.videoWidth === 0) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d'); if (!ctx) return;
    // Mirror the saved selfie so it matches what the user saw on screen.
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob((blob) => {
      if (!blob) return;
      onCapture(new File([blob], `live-selfie-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      stop();
    }, 'image/jpeg', 0.88);
  }, [onCapture, stop]);

  /* ── frame loop ─────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!streaming) return;
    const FaceDetectorCtor = (window as unknown as { FaceDetector?: new (opts?: object) => { detect: (src: HTMLVideoElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>> } }).FaceDetector;
    setSupportsFace(!!FaceDetectorCtor);

    let cancelled = false;
    let lastT = performance.now();

    // No FaceDetector — straight 5-second hold then auto-snap.
    if (!FaceDetectorCtor) {
      setHint('positionFace');
      const fallbackTimer = setTimeout(() => {
        if (!cancelled) { setHint('readyAuto'); setTimeout(snap, 400); }
      }, 5000);
      return () => { cancelled = true; clearTimeout(fallbackTimer); };
    }

    const detector = new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 1 });

    const draw = (b: DOMRectReadOnly | null, color: string) => {
      const o = overlayRef.current; const v = videoRef.current;
      if (!o || !v) return;
      o.width = v.videoWidth; o.height = v.videoHeight;
      const ctx = o.getContext('2d'); if (!ctx) return;
      ctx.clearRect(0, 0, o.width, o.height);
      if (!b) return;
      const x = o.width - b.x - b.width; // mirror to match CSS-flipped video
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(o.width / 160, 3);
      const r = 22;
      ctx.beginPath();
      ctx.moveTo(x + r, b.y);
      ctx.arcTo(x + b.width, b.y, x + b.width, b.y + r, r);
      ctx.lineTo(x + b.width, b.y + b.height - r);
      ctx.arcTo(x + b.width, b.y + b.height, x + b.width - r, b.y + b.height, r);
      ctx.lineTo(x + r, b.y + b.height);
      ctx.arcTo(x, b.y + b.height, x, b.y + b.height - r, r);
      ctx.lineTo(x, b.y + r);
      ctx.arcTo(x, b.y, x + r, b.y, r);
      ctx.stroke();
    };

    const tick = async () => {
      if (cancelled) return;
      const now = performance.now();
      const dt = now - lastT;
      lastT = now;

      const v = videoRef.current;
      if (v && v.readyState === v.HAVE_ENOUGH_DATA) {
        try {
          const faces = await detector.detect(v);
          if (faces.length > 0) {
            const f = faces[0].boundingBox;
            setHasFace(true);
            // Centroid check — face roughly centred in frame
            const cx = f.x + f.width / 2;
            const frameCx = v.videoWidth / 2;
            const offX = Math.abs(cx - frameCx) / (v.videoWidth / 2); // 0..1
            const bigEnough = f.width > v.videoWidth * 0.15;
            const centred = offX < 0.28;

            if (bigEnough && centred) {
              holdMsRef.current += dt;
              if (holdMsRef.current >= 3500) {
                setHint('readyAuto');
                draw(f, '#10b981');
                // Auto-snap on next frame
                setTimeout(() => { if (!cancelled) snap(); }, 200);
                cancelled = true; // freeze loop
                return;
              } else {
                setHint('holdStill');
                draw(f, '#10b981');
              }
            } else {
              holdMsRef.current = 0;
              setHint('positionFace');
              draw(f, '#fbbf24');
            }
          } else {
            setHasFace(false);
            holdMsRef.current = 0;
            setHint('noFace');
            draw(null, '#fbbf24');
          }
        } catch { /* per-frame failure ignored */ }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [streaming, snap]);

  useEffect(() => () => stop(), [stop]);

  /* ── render ────────────────────────────────────────────────────────── */

  const copy = HINT_COPY[hint];
  const canManualSnap = streaming && (!supportsFace || hasFace);

  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-3 dark:border-emerald-900 dark:bg-slate-900">
      <Label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        <Camera className="h-3.5 w-3.5" /> {heading} <span className="text-red-500">*</span>
      </Label>

      <div className="relative mt-2 aspect-[1.6/1] w-full overflow-hidden rounded border border-dashed border-slate-300 bg-slate-900 dark:border-slate-700">
        {item && !streaming && (
          // eslint-disable-next-line @next/next/no-img-element -- blob preview
          <img src={item.url} alt="Selfie" className="h-full w-full object-cover" />
        )}
        <video ref={videoRef} className={`h-full w-full object-cover [transform:scaleX(-1)] ${streaming ? 'block' : 'hidden'}`} playsInline muted />
        {streaming && (
          <canvas ref={overlayRef} className="pointer-events-none absolute inset-0 h-full w-full" />
        )}
        {!item && !streaming && (
          <div className="flex h-full items-center justify-center text-[11px] text-slate-300">No selfie captured</div>
        )}

        {/* Guidance ring */}
        {streaming && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className={`h-[78%] w-[58%] rounded-[50%] border-[3px] transition-colors ${copy.cls}`} />
          </div>
        )}

        {/* Status pill */}
        {streaming && (
          <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2">
            <div className="inline-flex flex-col items-start gap-0.5 rounded-md bg-black/65 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              <span className="inline-flex items-center gap-1.5">
                {hint === 'holdStill' || hint === 'readyAuto'
                  ? <Check className="h-3 w-3 text-emerald-300" />
                  : <Camera className="h-3 w-3" />}
                {copy.title}
              </span>
              <span className="text-[10px] font-normal text-white/85">{copy.sub}</span>
            </div>
            {supportsFace && hasFace && (
              <div className="rounded-md bg-emerald-500/90 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                Face locked
              </div>
            )}
          </div>
        )}
      </div>

      {err && <p className="mt-1 text-[11px] text-rose-600">{err}</p>}
      {streaming && !supportsFace && (
        <p className="mt-1 text-[10px] text-slate-500">Your browser doesn&apos;t support face detection — tap Capture when ready, or we&apos;ll auto-snap in 5 seconds.</p>
      )}

      <div className="mt-2 flex gap-2">
        {!streaming && (
          <Button type="button" variant="outline" size="sm" onClick={start} className="flex-1">
            <Camera className="mr-1.5 h-3.5 w-3.5" /> {item ? 'Retake selfie' : 'Open camera'}
          </Button>
        )}
        {streaming && (
          <>
            <Button
              type="button"
              size="sm"
              onClick={snap}
              disabled={!canManualSnap}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400"
            >
              <Camera className="mr-1.5 h-3.5 w-3.5" /> Capture now
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={stop}>
              Cancel
            </Button>
          </>
        )}
        {item && !streaming && (
          <Button type="button" variant="outline" size="sm" onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
          </Button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
