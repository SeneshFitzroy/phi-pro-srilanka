'use client';

// ============================================================================
// FormScanner — AI-powered H800 paper form digitization
// Uses: Claude 3.5 Haiku → POST /api/ai/scan-form
// On success: calls onScanned(sections) to populate the inspection form
// ============================================================================

import { useState, useRef } from 'react';
import { ScanLine, Upload, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface ScanResult {
  sections: Record<string, Record<string, number>>;
  premisesName?: string;
  ownerName?: string;
  address?: string;
  confidence: number;
  unreadableFields: string[];
  model: string;
  scannedAt: string;
}

interface FormScannerProps {
  onScanned: (result: ScanResult) => void;
  className?: string;
}

export function FormScanner({ onScanned, className }: FormScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLastResult(null);

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Scan
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/ai/scan-form', { method: 'POST', body: formData });
      const data = await res.json() as ScanResult & { error?: string };

      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Scan failed');
      }

      setLastResult(data);
      onScanned(data);

      const confidencePct = Math.round(data.confidence * 100);
      toast.success(
        `Form scanned — ${confidencePct}% confidence (${data.model}). Review scores before submitting.`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      toast.error(`Scan failed: ${msg}`);
    } finally {
      setScanning(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Card className={`border-dashed border-2 border-blue-200 bg-blue-50/30 ${className ?? ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 rounded-lg bg-[#0066cc]/10 p-2">
            <ScanLine className="h-5 w-5 text-[#0066cc]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">
              AI Form Scanner — Claude 3.5 Haiku
            </p>
            <p className="text-xs text-muted-foreground">
              Upload a photo of a handwritten H800 form to auto-populate scores
            </p>

            {/* Upload button */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={scanning}
                onClick={() => fileRef.current?.click()}
                className="gap-2 border-[#0066cc] text-[#0066cc] hover:bg-[#0066cc]/10"
              >
                {scanning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {scanning ? 'Scanning with AI…' : 'Upload H800 Photo'}
              </Button>
              <span className="text-[10px] text-slate-400">JPEG · PNG · WebP · max 10MB</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Error */}
            {error && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success result */}
            {lastResult && !scanning && (
              <div className="mt-2 rounded-lg bg-green-50 p-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Extracted with {Math.round(lastResult.confidence * 100)}% confidence
                  <span className="ml-auto text-green-600">{lastResult.model}</span>
                </div>
                {lastResult.unreadableFields.length > 0 && (
                  <p className="mt-1 text-amber-600">
                    Unreadable: {lastResult.unreadableFields.join(', ')}
                  </p>
                )}
                <p className="mt-1 text-green-600">
                  Scores auto-filled — please verify all values
                </p>
              </div>
            )}
          </div>

          {/* Preview thumbnail */}
          {preview && (
            <div className="relative flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Form preview"
                className="h-16 w-16 rounded-lg object-cover border border-slate-200"
              />
              <button
                onClick={() => { setPreview(null); setLastResult(null); }}
                className="absolute -right-1 -top-1 rounded-full bg-slate-800/70 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
