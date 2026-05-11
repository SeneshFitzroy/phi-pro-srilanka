'use client';

// ============================================================================
// SignaturePad — a small touch/mouse signature canvas. Emits a PNG data URL on
// each completed stroke (or null when cleared). HiDPI-aware. No dependencies.
// Used at the end of field forms (H800, H1203) to capture the inspecting
// officer's signature, which is stored with the submission.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, PenLine } from 'lucide-react';

interface Props {
  onChange: (dataUrl: string | null) => void;
  height?: number;
  penColor?: string;
  className?: string;
  label?: string;
}

export function SignaturePad({ onChange, height = 160, penColor = '#0f172a', className, label = 'Sign in the box below' }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = penColor;
    }
  }, [height, penColor]);

  useEffect(() => {
    setup();
    const ro = new ResizeObserver(() => setup());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [setup]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    const p = pos(e);
    if (ctx && last.current) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    last.current = p;
    if (!hasInk) setHasInk(true);
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    if (hasInk) onChange(canvasRef.current?.toDataURL('image/png') ?? null);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  };

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><PenLine className="h-3.5 w-3.5" />{label}</span>
        <button type="button" onClick={clear} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Eraser className="h-3 w-3" /> Clear</button>
      </div>
      <div ref={wrapRef} className="relative rounded-md border border-input bg-white">
        <canvas
          ref={canvasRef}
          className="block touch-none rounded-md"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-300">— sign here —</span>
        )}
      </div>
    </div>
  );
}
