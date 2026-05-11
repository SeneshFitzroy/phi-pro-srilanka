'use client';

// ============================================================================
// CameraCapture — a live-camera modal that actually opens the camera (via
// getUserMedia) on both desktop and mobile, instead of the OS file picker that
// `<input capture>` falls back to on desktop. Captures a frame to a JPEG data
// URL. Falls back to a file picker if the camera is unavailable or denied.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, ImageUp, AlertTriangle, Aperture } from 'lucide-react';

interface Props {
  open: boolean;
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  facingMode?: 'environment' | 'user';
}

export function CameraCapture({ open, onCapture, onClose, facingMode = 'environment' }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [facing, setFacing] = useState<'environment' | 'user'>(facingMode);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  const startStream = useCallback(async (mode: 'environment' | 'user') => {
    setError(null);
    setReady(false);
    stop();
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not expose a camera API. Use “Choose a file” instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setReady(true);
    } catch (e) {
      const name = e instanceof DOMException ? e.name : '';
      setError(
        name === 'NotAllowedError' ? 'Camera permission was denied. Allow it in the browser, or choose a file.'
        : name === 'NotFoundError' ? 'No camera found on this device. Choose a file instead.'
        : 'Could not start the camera. Choose a file instead.',
      );
    }
  }, [stop]);

  useEffect(() => {
    if (open) void startStream(facing);
    else stop();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, facing]);

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', 0.85);
    stop();
    onCapture(dataUrl);
    onClose();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => { stop(); onCapture(ev.target?.result as string); onClose(); };
    r.readAsDataURL(f);
  };

  const close = () => { stop(); onClose(); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="flex items-center gap-2 text-sm font-semibold"><Camera className="h-4 w-4" /> Camera</span>
        <button onClick={close} aria-label="Close camera" className="rounded-md p-2 hover:bg-white/10"><X className="h-5 w-5" /></button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video ref={videoRef} playsInline muted className="max-h-full max-w-full object-contain" />
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">Starting camera…</div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
            <p className="max-w-xs text-sm">{error}</p>
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900"><ImageUp className="h-4 w-4" /> Choose a file</button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 px-4 py-5">
        <button onClick={() => fileRef.current?.click()} title="Choose a file instead" className="rounded-full p-3 text-white hover:bg-white/10"><ImageUp className="h-6 w-6" /></button>
        <button
          onClick={capture}
          disabled={!ready}
          aria-label="Take photo"
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 text-white transition-transform active:scale-95 disabled:opacity-40"
        >
          <Aperture className="h-7 w-7" />
        </button>
        <button onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))} title="Switch camera" className="rounded-full p-3 text-white hover:bg-white/10"><RefreshCw className="h-6 w-6" /></button>
      </div>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
    </div>
  );
}
