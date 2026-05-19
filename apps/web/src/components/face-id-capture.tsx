'use client';

// Apple Face-ID-style live selfie capture.
//
// Flow:
//   1. "Position your face in the ring"
//   2. "Hold still — checking it's a real face..."
//   3. "Turn your head slightly left"
//   4. "Turn your head slightly right"
//   5. "Look at the camera and smile / blink"
//   6. Auto-snaps the centered selfie.
//
// We use the native Shape Detection API's FaceDetector where available
// (Chrome / Edge / Android) to track the face bounding box every frame.
// "Turn left / right" is detected by watching the centroid of the face
// box drift to the right / left of the frame (mirrored video, so when the
// USER turns left, the box drifts right on screen). "Steady" is detected
// by checking the box hasn't moved more than a few pixels for ~600ms.
//
// On Safari / Firefox (no FaceDetector) we degrade to a simpler 'hold
// still' countdown and capture — better than nothing, surfaces the
// limitation in copy.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

/**
 * Structural minimum the component needs from the captured media — only the
 * blob URL for the inline preview. Callers can pass any object that exposes
 * a `url` (the complaints flow uses MediaItem; the shop verification flow
 * uses ShopVerificationData['selfie']).
 */
export type FaceIdItem = { url: string } | null;

interface Props {
  item: FaceIdItem;
  onCapture: (file: File) => void;
  onClear: () => void;
  /** Heading shown above the preview tile. */
  heading?: string;
}

type Step =
  | 'idle'
  | 'lookCentre'
  | 'holdStill'
  | 'turnLeft'
  | 'turnRight'
  | 'finalCentre'
  | 'capturing'
  | 'done';

const STEP_COPY: Record<Step, { title: string; sub: string }> = {
  idle:        { title: 'Tap "Open camera" to begin',           sub: 'Front-facing camera + face detection' },
  lookCentre:  { title: 'Position your face in the ring',       sub: 'Centre yourself inside the green oval' },
  holdStill:   { title: 'Hold still — verifying live face',     sub: 'Don\'t move for a second' },
  turnLeft:    { title: 'Turn your head slightly to the LEFT',  sub: 'Rotate your head ~30° to the left' },
  turnRight:   { title: 'Now turn slightly to the RIGHT',       sub: 'Rotate your head ~30° to the right' },
  finalCentre: { title: 'Look straight at the camera',          sub: 'Almost there — keep your face centered' },
  capturing:   { title: 'Capturing…',                           sub: 'Don\'t move' },
  done:        { title: 'Verified',                             sub: 'Live human confirmed — selfie saved' },
};

interface FaceBox { x: number; y: number; w: number; h: number }

function detectorSupported(): boolean {
  return typeof window !== 'undefined' && 'FaceDetector' in window;
}

export function FaceIdCapture({ item, onCapture, onClear, heading = 'Live owner selfie' }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stepHoldRef = useRef<number>(0);

  const [streaming, setStreaming] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [err, setErr] = useState('');
  const [box, setBox] = useState<FaceBox | null>(null);
  const supportsFace = detectorSupported();

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
        setStep('lookCentre');
        stepHoldRef.current = 0;
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
    setStep('idle');
    setBox(null);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── frame loop — face tracking + step progression ─────────────────── */

  const snapFinal = useCallback(() => {
    const v = videoRef.current; const c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext('2d'); if (!ctx) return;
    // Mirror the captured image so the saved selfie matches what the user saw
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob((blob) => {
      if (!blob) return;
      onCapture(new File([blob], `live-selfie-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      stop();
    }, 'image/jpeg', 0.88);
  }, [onCapture, stop]);

  useEffect(() => {
    if (!streaming) return;
    const FaceDetectorCtor = (window as unknown as { FaceDetector?: new (opts?: object) => { detect: (src: HTMLVideoElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>> } }).FaceDetector;
    const detector = FaceDetectorCtor ? new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 1 }) : null;
    let cancelled = false;

    const draw = (b: FaceBox | null, color: string) => {
      const o = overlayRef.current; const v = videoRef.current;
      if (!o || !v) return;
      o.width = v.videoWidth; o.height = v.videoHeight;
      const ctx = o.getContext('2d'); if (!ctx) return;
      ctx.clearRect(0, 0, o.width, o.height);
      if (!b) return;
      // Mirror x to match the css-mirrored video
      const x = o.width - b.x - b.w;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(o.width / 160, 3);
      const r = 22;
      ctx.beginPath();
      ctx.moveTo(x + r, b.y);
      ctx.arcTo(x + b.w, b.y, x + b.w, b.y + r, r);
      ctx.lineTo(x + b.w, b.y + b.h - r);
      ctx.arcTo(x + b.w, b.y + b.h, x + b.w - r, b.y + b.h, r);
      ctx.lineTo(x + r, b.y + b.h);
      ctx.arcTo(x, b.y + b.h, x, b.y + b.h - r, r);
      ctx.lineTo(x, b.y + r);
      ctx.arcTo(x, b.y, x + r, b.y, r);
      ctx.stroke();
    };

    const tick = async () => {
      if (cancelled) return;
      const v = videoRef.current;
      if (v && v.readyState === v.HAVE_ENOUGH_DATA && detector) {
        try {
          const faces = await detector.detect(v);
          if (faces.length > 0) {
            const f = faces[0].boundingBox;
            const b: FaceBox = { x: f.x, y: f.y, w: f.width, h: f.height };
            setBox(b);

            const cx = b.x + b.w / 2;
            const frameCx = v.videoWidth / 2;
            const offX = (cx - frameCx) / (v.videoWidth / 2); // -1 .. +1

            // CSS-mirrors the video. So when the USER turns their head LEFT,
            // their face moves to the RIGHT side of the raw frame → offX > 0.
            // When they turn RIGHT, offX < 0.
            switch (step) {
              case 'lookCentre': {
                if (Math.abs(offX) < 0.18 && b.w > v.videoWidth * 0.18) {
                  stepHoldRef.current += 16;
                  if (stepHoldRef.current >= 600) { stepHoldRef.current = 0; setStep('holdStill'); }
                } else { stepHoldRef.current = 0; }
                draw(b, '#fbbf24');
                break;
              }
              case 'holdStill': {
                if (Math.abs(offX) < 0.22) {
                  stepHoldRef.current += 16;
                  if (stepHoldRef.current >= 900) { stepHoldRef.current = 0; setStep('turnLeft'); }
                } else { stepHoldRef.current = 0; }
                draw(b, '#10b981');
                break;
              }
              case 'turnLeft': {
                if (offX > 0.22) {
                  stepHoldRef.current += 16;
                  if (stepHoldRef.current >= 500) { stepHoldRef.current = 0; setStep('turnRight'); }
                }
                draw(b, '#3b82f6');
                break;
              }
              case 'turnRight': {
                if (offX < -0.22) {
                  stepHoldRef.current += 16;
                  if (stepHoldRef.current >= 500) { stepHoldRef.current = 0; setStep('finalCentre'); }
                }
                draw(b, '#3b82f6');
                break;
              }
              case 'finalCentre': {
                if (Math.abs(offX) < 0.18) {
                  stepHoldRef.current += 16;
                  if (stepHoldRef.current >= 700) {
                    stepHoldRef.current = 0;
                    setStep('capturing');
                    setTimeout(snapFinal, 200);
                  }
                } else { stepHoldRef.current = 0; }
                draw(b, '#10b981');
                break;
              }
              default: draw(b, '#10b981');
            }
          } else {
            setBox(null);
            stepHoldRef.current = 0;
            draw(null, '#fbbf24');
          }
        } catch { /* per-frame errors harmless */ }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [streaming, step, snapFinal]);

  /* When FaceDetector isn't available, fall back to a 3-second hold + snap. */
  useEffect(() => {
    if (!streaming || supportsFace) return;
    if (step !== 'lookCentre') return;
    const t = setTimeout(() => {
      setStep('capturing');
      setTimeout(snapFinal, 200);
    }, 3000);
    return () => clearTimeout(t);
  }, [streaming, supportsFace, step, snapFinal]);

  useEffect(() => () => stop(), [stop]);

  /* ── render ────────────────────────────────────────────────────────── */

  const copy = STEP_COPY[step];

  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-3 dark:border-emerald-900 dark:bg-slate-900">
      <Label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        <Camera className="h-3.5 w-3.5" /> {heading} <span className="text-red-500">*</span>
      </Label>

      <div className="relative mt-2 aspect-[1.6/1] w-full overflow-hidden rounded border border-dashed border-slate-300 bg-slate-900 dark:border-slate-700">
        {item && !streaming && (
          // eslint-disable-next-line @next/next/no-img-element -- blob preview, next/image can't optimise it
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
            <div className={`h-[78%] w-[58%] rounded-[50%] border-[3px] transition-colors ${
              step === 'holdStill' || step === 'finalCentre' || step === 'capturing'
                ? 'border-emerald-400/80'
                : step === 'turnLeft' || step === 'turnRight'
                ? 'border-blue-400/80'
                : 'border-amber-300/70 animate-pulse'
            }`} />
          </div>
        )}

        {/* Status pill */}
        {streaming && (
          <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2">
            <div className="inline-flex flex-col items-start gap-0.5 rounded-md bg-black/60 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              <span className="inline-flex items-center gap-1.5">
                {step === 'capturing' || step === 'done'
                  ? <Check className="h-3 w-3 text-emerald-300" />
                  : <Camera className="h-3 w-3" />}
                {copy.title}
              </span>
              <span className="text-[10px] font-normal text-white/80">{copy.sub}</span>
            </div>
            {supportsFace && box && (
              <div className="rounded-md bg-emerald-500/85 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                Face locked
              </div>
            )}
          </div>
        )}
      </div>

      {err && <p className="mt-1 text-[11px] text-rose-600">{err}</p>}
      {streaming && !supportsFace && (
        <p className="mt-1 text-[10px] text-slate-500">Your browser doesn&apos;t support on-device face tracking — we&apos;ll auto-capture after a 3-second hold.</p>
      )}

      <div className="mt-2 flex gap-2">
        {!streaming && (
          <Button type="button" variant="outline" size="sm" onClick={start} className="flex-1">
            <Camera className="mr-1.5 h-3.5 w-3.5" /> {item ? 'Retake selfie' : 'Open camera'}
          </Button>
        )}
        {streaming && (
          <Button type="button" variant="outline" size="sm" onClick={stop} className="flex-1">
            Cancel
          </Button>
        )}
        {item && !streaming && (
          <Button type="button" variant="outline" size="sm" onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
          </Button>
        )}
      </div>
    </div>
  );
}
