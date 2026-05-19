'use client';

// ============================================================================
// Public Verify — confirms a PHI-PRO issued reference is genuine.
//   • Camera-based QR scanner (getUserMedia + jsQR decoding loop)
//   • Reference QR generator (qrcode.react) so an officer / business can hand
//     a printable QR to a citizen
//   • Manual reference-number entry as a fallback
// Looks up the reference in Firestore: `permits`, then `public_complaints`
// for CMP- prefixes.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import jsQR from 'jsqr';
import {
  ArrowLeft, QrCode, Search, CheckCircle, XCircle, ShieldCheck,
  Loader2, AlertCircle, Clock, Camera, X, Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CertResult {
  valid: boolean;
  type: string;
  holder: string;
  issued: string;
  expires: string;
  grade?: string;
  area?: string;
  status?: string;
  issuedBy?: string;
}

function daysUntil(d: string): number {
  try { return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000); }
  catch { return 0; }
}
function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return iso; }
}
/**
 * Normalise whatever the scanner returned. Accepts:
 *   - PHI-PRO URLs like https://phipro.lk/public/verify?ref=FP-2025-001
 *   - Bare references like FP-2025-001 or CMP-12345678
 *   - Pure numeric codes (e.g. 8901234567890)
 *   - Free-text QR payloads (returned as-is, upper-cased + trimmed)
 *
 * The lookup step further down treats anything it doesn't recognise as
 * "Not found in registry — raw payload shown for cross-reference."
 */
function extractReference(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  // Try URL — query param `ref`/`code`, else last path segment
  try {
    const url = new URL(trimmed);
    const ref = url.searchParams.get('ref') || url.searchParams.get('code') || url.searchParams.get('q');
    if (ref) return ref.toUpperCase();
    const last = url.pathname.split('/').filter(Boolean).pop();
    if (last) return last.toUpperCase();
  } catch { /* not a URL */ }
  // Leave pure-numeric codes alone (don't upper-case digits), upper-case the
  // rest for case-insensitive matching against the registry.
  if (/^\d+$/.test(trimmed)) return trimmed;
  return trimmed.toUpperCase();
}

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CertResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  /* If the page is opened via a scanned URL like /public/verify?ref=XXX,
     auto-run the lookup so the citizen doesn't have to retype anything. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const refFromUrl = params.get('ref') || params.get('code');
    if (refFromUrl) {
      const normalised = extractReference(refFromUrl);
      setCode(normalised);
      void doVerify(normalised);
    }
    // intentionally not depending on doVerify — run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── lookup ─────────────────────────────────────────────────────── */
  const doVerify = useCallback(async (raw: string) => {
    const ref = extractReference(raw);
    if (!ref) return;
    setLoading(true); setSearched(false); setResult(null);

    try {
      const snap = await getDocs(query(collection(db, 'permits'), where('permitId', '==', ref), limit(1)));
      if (!snap.empty) {
        const d = snap.docs[0].data() as Record<string, unknown>;
        setResult({
          valid: true,
          type:     (d.type as string)        ?? 'Health Permit',
          holder:   (d.holder as string)      ?? (d.holderName as string) ?? 'N/A',
          issued:   (d.issued as string)      ?? (d.issuedDate as string) ?? 'N/A',
          expires:  (d.expires as string)     ?? (d.expiryDate as string) ?? 'N/A',
          grade:    d.grade as string | undefined,
          area:     (d.area as string)        ?? (d.mohArea as string) ?? undefined,
          status:   (d.status as string)      ?? 'Active',
          issuedBy: (d.issuedBy as string)    ?? (d.officerName as string) ?? undefined,
        });
      } else if (ref.startsWith('CMP-')) {
        const cmpSnap = await getDocs(query(collection(db, 'public_complaints'), where('trackingId', '==', ref), limit(1)));
        if (!cmpSnap.empty) {
          const d = cmpSnap.docs[0].data() as Record<string, unknown>;
          const createdAt = d.createdAt as { toDate?: () => Date } | undefined;
          setResult({
            valid: true,
            type: 'Complaint Reference',
            holder: (d.contactName as string) ?? 'Anonymous',
            issued: createdAt?.toDate ? createdAt.toDate().toISOString().split('T')[0] : 'N/A',
            expires: 'N/A',
            area: `${(d.district as string) ?? ''} — ${(d.location as string) ?? ''}`.trim(),
            status: (d.status as string) ?? 'Pending',
          });
        } else { setResult(null); }
      } else { setResult(null); }
    } catch {
      setResult(null);
    } finally {
      setLoading(false); setSearched(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await doVerify(code); };

  /* ── QR scanner ─────────────────────────────────────────────────── */
  const [scanOpen, setScanOpen] = useState(false);

  const handleScanned = useCallback(async (text: string) => {
    const ref = extractReference(text);
    setCode(ref);
    setScanOpen(false);
    await doVerify(ref);
  }, [doVerify]);

  const isExpired = result && result.expires !== 'N/A' && daysUntil(result.expires) < 0;
  const daysLeft  = result && result.expires !== 'N/A' ? daysUntil(result.expires) : null;
  const statusColor = (s?: string) => {
    const t = (s ?? '').toLowerCase();
    if (t === 'active') return 'text-green-600 font-semibold';
    if (t === 'expired') return 'text-red-600 font-semibold';
    if (t) return 'text-amber-600 font-semibold';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-lg space-y-6 px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/public/portal"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <ShieldCheck className="h-6 w-6 text-teal-600" />Verify Certificate
            </h1>
            <p className="text-sm text-muted-foreground">
              Instantly verify any PHI-PRO issued permit or certificate
            </p>
          </div>
        </div>

        {/* Verify form */}
        <Card className="shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-50 ring-4 ring-teal-100 dark:bg-teal-950/30 dark:ring-teal-900">
                <QrCode className="h-10 w-10 text-teal-600/60" />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Scan the QR code on the physical certificate, or enter the reference number below.
            </p>

            <Button type="button" onClick={() => setScanOpen(true)} className="w-full bg-teal-600 hover:bg-teal-700">
              <Camera className="mr-2 h-4 w-4" /> Open camera & scan QR
            </Button>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Certificate / Reference Number</Label>
                <div className="flex gap-2">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FP-20250001 or CMP-12345678"
                    className="font-mono"
                  />
                  <Button type="submit" disabled={loading || !code.trim()} className="shrink-0 bg-teal-600 hover:bg-teal-700">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </form>

            <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs text-muted-foreground dark:bg-slate-800/50">
              <p className="font-semibold text-foreground">Supported prefixes:</p>
              <p><span className="font-mono font-medium text-teal-700 dark:text-teal-400">FP-</span> Food Premises Registration</p>
              <p><span className="font-mono font-medium text-teal-700 dark:text-teal-400">FC-</span> Factory Health Certificate</p>
              <p><span className="font-mono font-medium text-teal-700 dark:text-teal-400">TL-</span> Trade License Clearance</p>
              <p><span className="font-mono font-medium text-teal-700 dark:text-teal-400">CMP-</span> Complaint Tracking Reference</p>
            </div>
          </CardContent>
        </Card>

        {/* QR generator — make a printable QR for any reference */}
        <ReferenceQrGenerator />

        {/* Recent lookups block removed per design — keeps the page focused
            on the scan + manual reference lookup. */}

        {/* Result */}
        {searched && !loading && (result ? (
          <div className="space-y-3">
            {isExpired && (
              <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-600 px-5 py-3.5 shadow-md">
                <AlertCircle className="h-5 w-5 shrink-0 text-white" />
                <p className="text-sm font-bold text-white">EXPIRED — This certificate is no longer valid</p>
              </div>
            )}
            <Card className={`overflow-hidden shadow-sm ${isExpired ? 'border-red-300 dark:border-red-800' : 'border-green-300 dark:border-green-800'}`}>
              <CardContent className="p-0">
                <div className={`flex items-center gap-4 p-5 ${isExpired ? 'bg-red-50 dark:bg-red-950/10' : 'bg-green-50 dark:bg-green-950/10'}`}>
                  <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 shadow-md ${
                    isExpired ? 'border-red-500 bg-red-100 dark:bg-red-900/40' : 'border-green-500 bg-green-100 dark:bg-green-900/40'
                  }`}>
                    {isExpired ? <XCircle className="h-8 w-8 text-red-600" /> : <CheckCircle className="h-8 w-8 text-green-600" />}
                  </div>
                  <div>
                    <p className={`font-bold ${isExpired ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
                      {isExpired ? 'Certificate Expired' : 'Verified — Authentic Certificate'}
                    </p>
                    <p className="text-xs text-muted-foreground">Issued by the PHI-PRO Digital Health Enforcement System</p>
                    {daysLeft !== null && !isExpired && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400">
                        <Clock className="h-3 w-3" />Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { label: 'Certificate Type', value: result.type },
                    { label: 'Issued To', value: result.holder },
                    { label: 'Date Issued', value: formatDate(result.issued) },
                    { label: 'Valid Until', value: result.expires !== 'N/A' ? formatDate(result.expires) : 'N/A' },
                    ...(result.grade ? [{ label: 'Hygiene Grade', value: `Grade ${result.grade}` }] : []),
                    ...(result.area  ? [{ label: 'MOH Area',     value: result.area }] : []),
                    ...(result.issuedBy ? [{ label: 'Issued By', value: result.issuedBy }] : []),
                    { label: 'Status', value: result.status ?? 'Active', isStatus: true },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between gap-2 px-5 py-3 text-sm">
                      <span className="shrink-0 text-muted-foreground">{row.label}</span>
                      <span className={`text-right font-medium ${'isStatus' in row && row.isStatus ? statusColor(result.status) : ''}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-amber-200 bg-amber-50 shadow-sm dark:border-amber-900 dark:bg-amber-950/10">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-amber-900 dark:text-amber-200">No matching PHI-PRO certificate</p>
                <p className="text-sm text-muted-foreground">
                  Scanned payload:{' '}
                  <span className="break-all font-mono font-medium text-slate-800 dark:text-slate-200">&quot;{code}&quot;</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  This QR code is not registered in the PHI-PRO permit / complaint ledger. It may be a third-party QR,
                  a product barcode, or a typo. If you believe it is genuine, contact the issuing MOH office and quote
                  the payload above.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-0 bg-slate-50 shadow-sm dark:bg-slate-900/50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-xs text-muted-foreground">
              If a certificate appears invalid but you believe it is genuine, contact the issuing MOH office directly.
              Certificate numbers are printed on all PHI-PRO issued permits and QR codes.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scanner modal */}
      {scanOpen && <QrScannerModal onClose={() => setScanOpen(false)} onResult={handleScanned} />}
    </div>
  );
}

/* ──────────────── QR scanner modal (jsQR + getUserMedia) ───────────────── */

function QrScannerModal({ onClose, onResult }: { onClose: () => void; onResult: (text: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let stopped = false;
    let stream: MediaStream | null = null;

    const tick = () => {
      if (stopped) return;
      const v = videoRef.current; const c = canvasRef.current;
      if (v && c && v.readyState === v.HAVE_ENOUGH_DATA) {
        c.width = v.videoWidth; c.height = v.videoHeight;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(v, 0, 0, c.width, c.height);
          const img = ctx.getImageData(0, 0, c.width, c.height);
          const found = jsQR(img.data, img.width, img.height, { inversionAttempts: 'attemptBoth' });
          if (found?.data) {
            stopped = true;
            onResult(found.data);
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          rafRef.current = requestAnimationFrame(tick);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(`Camera unavailable: ${msg}`);
      }
    })();

    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Camera className="h-4 w-4 text-teal-600" /> Scan certificate QR
          </p>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative aspect-square w-full bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-56 w-56 rounded-2xl border-4 border-teal-400/80 shadow-[0_0_0_999px_rgba(0,0,0,0.45)]" />
          </div>
          {err && (
            <div className="absolute inset-x-4 bottom-4 rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white">
              {err}
            </div>
          )}
        </div>
        <div className="border-t border-slate-200 px-4 py-3 text-center text-xs text-muted-foreground dark:border-slate-700">
          Point your camera at a PHI-PRO QR code. It will verify automatically.
        </div>
      </div>
    </div>
  );
}

/* ──────────────── QR generator (printable / shareable) ─────────────────── */

function ReferenceQrGenerator() {
  const [ref, setRef] = useState('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // Accept ANY non-empty input — numbers, letters, free text or even a full
  // URL the user wants to encode. Only requirement: at least one character.
  const trimmed = ref.trim();
  const hasContent = trimmed.length > 0;

  // If the input is a PHI-PRO reference (alpha-prefix + dash + digits) we wrap
  // it in a phipro.lk verify URL so scanning lands the citizen on the
  // matching lookup. Anything else gets encoded verbatim.
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
