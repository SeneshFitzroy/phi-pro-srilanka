'use client';

// ZKP Certificate generation modal — embedded into the Food Safety
// inspections table. Opens for an Approved Grade-A row, auto-binds that
// row's hidden score into the secp256k1 engine (no manual entry), and
// renders the Pedersen commitment + Schnorr proof + range proof, plus a
// scannable QR the establishment can show to prove "Grade A (≥75)" WITHOUT
// revealing the exact number.

import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { ShieldCheck, Loader2, CheckCircle2, XCircle, Lock, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/modal';
import { generateProof, hexSlice, type ZKProof } from '@/lib/zkp';

interface Props {
  open: boolean;
  onClose: () => void;
  establishment: { id: string; name: string; score: number; grade: string } | null;
}

export function ZKPModal({ open, onClose, establishment }: Props) {
  const [proof, setProof] = useState<ZKProof | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-generate the moment the modal opens for a row — the score is bound
  // automatically from the selected inspection, never typed by the user.
  useEffect(() => {
    if (!open || !establishment) { setProof(null); return; }
    setRunning(true);
    const t = setTimeout(() => {
      try { setProof(generateProof(establishment.score)); }
      finally { setRunning(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [open, establishment]);

  const verifyUrl = establishment
    ? `https://phipro.lk/public/verify?ref=${encodeURIComponent(establishment.id)}`
    : '';

  const copyProof = async () => {
    if (!proof) return;
    try {
      await navigator.clipboard.writeText(
        `PHI-PRO ZKP Certificate\nEstablishment: ${establishment?.name}\nClaim: Grade A (hygiene score ≥ 75)\nCommitment C: ${proof.C}\nVerified: ${proof.verified}\nVerify: ${verifyUrl}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Zero-Knowledge Grade Proof"
      subtitle={establishment ? `${establishment.name} · ${establishment.id}` : undefined}
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50/60 p-3 text-xs text-violet-900 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-200">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            The hygiene score is committed as <strong>C = score·G + r·H</strong> on secp256k1. A Schnorr Σ-protocol
            proves the officer knows the score behind C, and a range proof proves <strong>score ≥ 75 (Grade A)</strong> —
            without ever revealing the exact number. All cryptography runs in your browser.
          </p>
        </div>

        {running && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-violet-600" /> Generating secp256k1 proof…
          </div>
        )}

        {!running && proof && (
          <>
            {/* Verified banner */}
            <div className={`flex items-center gap-3 rounded-xl border-2 p-4 ${proof.verified && proof.deltaValid ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20' : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20'}`}>
              {proof.verified && proof.deltaValid
                ? <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" />
                : <XCircle className="h-8 w-8 shrink-0 text-red-600" />}
              <div>
                <p className={`font-bold ${proof.verified && proof.deltaValid ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>
                  {proof.verified && proof.deltaValid ? 'Certificate Verified — Grade A proven' : 'Proof failed verification'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {proof.verified && proof.deltaValid
                    ? 'The establishment can prove Grade A (score ≥ 75) without revealing the exact score.'
                    : 'This inspection does not satisfy the Grade-A range claim.'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              {/* Crypto outputs */}
              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] dark:border-slate-700 dark:bg-slate-900/60">
                <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-400">Cryptographic outputs</p>
                <Row label="Pedersen C" value={hexSlice(proof.C, 28)} />
                <Row label="Schnorr R" value={hexSlice(proof.R, 28)} />
                <Row label="Challenge e" value={hexSlice(proof.e.toString(16), 24)} />
                <Row label="Response s_v" value={hexSlice(proof.s_v.toString(16), 24)} />
                <Row label="Response s_r" value={hexSlice(proof.s_r.toString(16), 24)} />
                <Row label="Range D (≥75)" value={proof.D === '—' ? '—' : hexSlice(proof.D, 28)} />
              </div>

              {/* QR */}
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                <div className="rounded-md border border-slate-200 bg-white p-1.5 dark:border-slate-700">
                  <QRCodeCanvas value={verifyUrl} size={120} level="M" marginSize={1} fgColor="#0f172a" bgColor="#ffffff" />
                </div>
                <p className="text-center text-[10px] text-muted-foreground">Public proof QR<br />scan to verify Grade A</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" /> secp256k1 · score never disclosed
              </span>
              <Button type="button" variant="outline" size="sm" onClick={copyProof}>
                {copied ? <><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Copied</> : <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy proof</>}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}
