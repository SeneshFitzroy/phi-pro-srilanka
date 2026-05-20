'use client';

/**
 * QrGenerator — render a printable / shareable high-contrast QR for any text,
 * number, URL or PHI-PRO reference. Used on the PHI side (Food Inspection) so
 * officers can generate a QR for a permit / certificate / premises reference.
 */

import { useRef, useState } from 'react';
import { QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function QrGenerator() {
  const [ref, setRef] = useState('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // Accept ANY non-empty input — numbers, letters, free text or a full URL.
  const trimmed = ref.trim();
  const hasContent = trimmed.length > 0;

  // A PHI-PRO reference (alpha-prefix + dash + digits) is wrapped in a verify
  // URL so scanning lands on the matching lookup. Anything else is verbatim.
  const isPhiRef = /^[A-Za-z]{2,4}-\d{4,12}$/.test(trimmed);
  const encodedValue = isPhiRef
    ? `https://phipro.lk/public/verify?ref=${encodeURIComponent(trimmed.toUpperCase())}`
    : trimmed;

  const download = () => {
    const canvas = wrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    const safe = trimmed.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 32) || 'qr-code';
    link.download = `${safe}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
            <QrCode className="h-3.5 w-3.5" /> Generate a printable QR
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste any text, number, URL or PHI-PRO reference — we&apos;ll render a high-contrast QR you can save or print.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="Type anything — e.g. FP-20250001, 8901234567, https://…"
            className="font-mono"
          />
          <Button type="button" disabled={!hasContent} onClick={download} className="shrink-0">
            <Download className="mr-1.5 h-4 w-4" /> PNG
          </Button>
        </div>

        <div ref={wrapperRef} className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40">
          {hasContent ? (
            <>
              <QRCodeCanvas
                value={encodedValue}
                size={180}
                marginSize={2}
                level="H"
                fgColor="#0f172a"
                bgColor="#ffffff"
              />
              <p className="mt-1 break-all text-center font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{trimmed}</p>
              <p className="break-all text-center text-[10px] text-muted-foreground">
                {isPhiRef
                  ? <>Lands on <span className="font-mono">phipro.lk/public/verify?ref={trimmed.toUpperCase()}</span></>
                  : <>Encodes the text above exactly as-is</>}
              </p>
            </>
          ) : (
            <p className="py-10 text-center text-xs text-muted-foreground">
              Type any text, number or URL above and a QR will appear here instantly.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
