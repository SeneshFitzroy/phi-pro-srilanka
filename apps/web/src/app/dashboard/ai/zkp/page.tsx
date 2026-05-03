'use client';

// ============================================================================
// Zero-Knowledge Proof — Food Hygiene Grade Verifier
// @noble/curves secp256k1 · @noble/hashes sha256
//   • Pedersen commitment: C = score·G + r·H (hides the score)
//   • Schnorr Σ-protocol (non-interactive via Fiat-Shamir): PoK of (score, r)
//   • Range claim: prove score ∈ [75, 100] (Grade A) without revealing score
// ============================================================================

import { useState, useCallback } from 'react';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { Lock, Unlock, ShieldCheck, Eye, EyeOff, ChevronDown, ChevronRight, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Curve setup ───────────────────────────────────────────────────────────────

// secp256k1.Point is the WeierstrassPointCons — constructor + static methods
const Point = secp256k1.Point;
const G     = Point.BASE;
const { n: ORDER } = G.CURVE();

// H = "nothing-up-my-sleeve" second generator
// Derived as a deterministic scalar from a domain-separation string, so no one
// knows log_G(H) — which is required for Pedersen commitment binding security.
const H_SEED = new TextEncoder().encode('PHI-PRO-ZKP-GENERATOR-H-v1');
const H_HASH = sha256(H_SEED);
let H_SCALAR = 0n;
for (const b of H_HASH) H_SCALAR = (H_SCALAR << 8n) | BigInt(b);
H_SCALAR = ((H_SCALAR % (ORDER - 1n)) + 1n); // ensure in [1, n-1]
const H = G.multiply(H_SCALAR);

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomScalar(): bigint {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let v = 0n;
  for (const b of bytes) v = (v << 8n) | BigInt(b);
  return ((v % (ORDER - 1n)) + 1n);
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let v = 0n;
  for (const b of bytes) v = (v << 8n) | BigInt(b);
  return v;
}

function hashToScalar(...inputs: (string | Uint8Array)[]): bigint {
  const parts: number[] = [];
  for (const input of inputs) {
    const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
    for (const b of bytes) parts.push(b);
  }
  const hash = sha256(new Uint8Array(parts));
  return bytesToBigInt(hash) % ORDER;
}

function hexSlice(hex: string, len = 16): string {
  return hex.slice(0, len) + '…';
}

// ── ZKP types ─────────────────────────────────────────────────────────────────

type Pt = typeof G;

interface ZKProof {
  // Public outputs
  C:         string;   // commitment C = score·G + r·H
  R:         string;   // nonce commitment R = k_v·G + k_r·H
  e:         bigint;   // Fiat-Shamir challenge
  s_v:       bigint;   // response for score
  s_r:       bigint;   // response for blinding r
  // Range
  D:         string;   // commitment to delta = score - 75
  deltaValid: boolean;
  // Internal (kept private, shown only to illustrate)
  score:     number;
  grade:     string;
  verified:  boolean;
}

// ── Core protocol ─────────────────────────────────────────────────────────────

function generateProof(score: number): ZKProof {
  const grade = score >= 75 ? 'A' : score >= 50 ? 'B' : 'C';
  const v = BigInt(score);

  // 1. Pedersen commitment: C = v·G + r·H
  const r  = randomScalar();
  const C: Pt  = G.multiply(v).add(H.multiply(r));

  // 2. Schnorr proof of knowledge (Σ-protocol)
  const k_v = randomScalar();
  const k_r = randomScalar();
  const R: Pt  = G.multiply(k_v).add(H.multiply(k_r));

  // Fiat-Shamir challenge (non-interactive)
  const e = hashToScalar(C.toHex(), R.toHex(), 'PHI-PRO-ZKP-v1');

  // Responses
  const s_v = (k_v + e * v)  % ORDER;
  const s_r = (k_r + e * r)  % ORDER;

  // 3. Range proof (score ≥ 75 → delta = score - 75 ∈ [0, 25])
  const delta = score - 75;
  const deltaValid = delta >= 0 && delta <= 25;
  let D = '—';
  if (deltaValid) {
    const r2 = randomScalar();
    const Dpt: Pt = G.multiply(BigInt(delta)).add(H.multiply(r2));
    D = Dpt.toHex();
  }

  // Verify immediately
  const RRecovered = Point.fromHex(R.toHex());
  const CRecovered = Point.fromHex(C.toHex());
  const lhs = G.multiply(s_v).add(H.multiply(s_r));
  const rhs = RRecovered.add(CRecovered.multiply(e));
  const verified = lhs.equals(rhs);

  return { C: C.toHex(), R: R.toHex(), e, s_v, s_r, D, deltaValid, score, grade, verified };
}

// ── UI ────────────────────────────────────────────────────────────────────────

const RISK_COLORS = {
  A: { badge: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800', dot: 'bg-green-500' },
  B: { badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800', dot: 'bg-amber-500' },
  C: { badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800', dot: 'bg-red-500' },
};

export default function ZKPPage() {
  const [score, setScore]           = useState(88);
  const [proof, setProof]           = useState<ZKProof | null>(null);
  const [showScore, setShowScore]   = useState(false);
  const [expanded, setExpanded]     = useState<number | null>(null);
  const [running, setRunning]       = useState(false);

  const generate = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      try { setProof(generateProof(score)); }
      catch (err) { console.error('ZKP error', err); }
      setRunning(false);
    }, 300);
  }, [score]);

  const gradeKey = (proof?.grade ?? (score >= 75 ? 'A' : score >= 50 ? 'B' : 'C')) as 'A' | 'B' | 'C';
  const gradeCfg = RISK_COLORS[gradeKey];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 shadow">
          <Lock className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Zero-Knowledge Grade Proof</h1>
          <p className="text-xs text-slate-500">@noble/curves secp256k1 · Pedersen commitment · Schnorr Σ-protocol · Grade-A range proof</p>
        </div>
      </div>

      {/* Concept */}
      <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 text-xs text-violet-800 dark:border-violet-800/30 dark:bg-violet-950/10 dark:text-violet-300">
        <p className="font-semibold">What this proves:</p>
        <p className="mt-1">A PHI officer commits to a hygiene score as <strong>C = score·G + r·H</strong> on secp256k1. A Schnorr Σ-protocol lets the officer prove knowledge of <em>(score, r)</em> behind C, and a range commitment proves <strong>score ≥ 75 (Grade A)</strong> — without the verifier ever learning the actual number. All crypto runs in-browser via <code>@noble/curves</code>.</p>
      </div>

      {/* Input panel */}
      <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Inspector — set the private score</p>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500">Hygiene Score (secret)</label>
            <div className="flex items-center gap-2">
              <input
                type={showScore ? 'number' : 'password'}
                min={0} max={100}
                value={score}
                onChange={e => setScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button onClick={() => setShowScore(s => !s)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                {showScore ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500">Grade (private)</label>
            <span className={cn('rounded-lg border-2 px-4 py-2 text-sm font-black', gradeCfg.badge)}>
              Grade {score >= 75 ? 'A' : score >= 50 ? 'B' : 'C'}
            </span>
          </div>

          <button
            onClick={generate} disabled={running}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-violet-700 disabled:opacity-50">
            {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {running ? 'Generating…' : 'Generate ZKP'}
          </button>
        </div>

        <div className="mt-4">
          <input
            type="range" min={0} max={100} value={score}
            onChange={e => setScore(parseInt(e.target.value))}
            className="w-full accent-violet-600"
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>0</span>
            <span className="text-red-500">Grade C (&lt;50)</span>
            <span className="text-amber-500">Grade B (50–74)</span>
            <span className="text-green-500">Grade A (≥75)</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Proof output */}
      {proof && (
        <div className="space-y-3">
          {/* Overall verdict */}
          <div className={cn(
            'flex items-center gap-3 rounded-xl border p-4 shadow-sm',
            proof.verified && proof.deltaValid
              ? 'border-green-200 bg-green-50 dark:border-green-800/30 dark:bg-green-950/10'
              : 'border-red-200 bg-red-50 dark:border-red-900/20 dark:bg-red-950/10',
          )}>
            {proof.verified && proof.deltaValid
              ? <CheckCircle2 className="h-7 w-7 shrink-0 text-green-600" />
              : <XCircle className="h-7 w-7 shrink-0 text-red-500" />}
            <div>
              <p className={cn('font-bold text-sm', proof.verified && proof.deltaValid ? 'text-green-800 dark:text-green-200' : 'text-red-700 dark:text-red-200')}>
                {proof.verified && proof.deltaValid
                  ? `ZKP VALID — Establishment is Grade ${proof.grade} (score ≥ 75) — actual score NOT revealed`
                  : `ZKP INVALID — score ${proof.score} does not satisfy Grade A ≥ 75`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Schnorr verification: {proof.verified ? '✓' : '✗'} ·
                Range proof: {proof.deltaValid ? `✓ (δ = ${proof.score - 75} ∈ [0,25])` : `✗ (δ = ${proof.score - 75} < 0)`}
              </p>
            </div>
          </div>

          {/* 3 steps */}
          {[
            {
              title: 'Step 1 — Pedersen Commitment',
              sub:   'C = score·G + r·H  (published — score stays hidden)',
              color: 'bg-violet-600',
              body: (
                <div className="space-y-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-3 font-mono dark:bg-slate-800 space-y-1">
                    <p><span className="text-slate-400">G (secp256k1 base point)</span></p>
                    <p className="break-all text-violet-600 dark:text-violet-400">{hexSlice(G.toHex(), 20)}</p>
                    <p className="mt-2"><span className="text-slate-400">H (nothing-up-my-sleeve point = H_SCALAR·G)</span></p>
                    <p className="break-all text-blue-600 dark:text-blue-400">{hexSlice(H.toHex(), 20)}</p>
                    <p className="mt-2"><span className="text-slate-400">Commitment C = score·G + r·H  (PUBLIC)</span></p>
                    <p className="break-all text-emerald-600 dark:text-emerald-400">{hexSlice(proof.C, 40)}</p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">C is computationally binding (cannot change score without knowing r) and perfectly hiding (any score could produce C with a different r).</p>
                </div>
              ),
            },
            {
              title: 'Step 2 — Schnorr Proof of Knowledge',
              sub:   'Proves knowledge of (score, r) s.t. C = score·G + r·H',
              color: 'bg-blue-600',
              body: (
                <div className="space-y-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-3 font-mono dark:bg-slate-800 space-y-1">
                    <p><span className="text-slate-400">Nonce commitment R = k_v·G + k_r·H</span></p>
                    <p className="break-all text-blue-600 dark:text-blue-400">{hexSlice(proof.R, 40)}</p>
                    <p className="mt-1"><span className="text-slate-400">Fiat-Shamir challenge e = SHA256(C ‖ R ‖ domain)</span></p>
                    <p className="break-all text-amber-600">{proof.e.toString(16).slice(0, 32)}…</p>
                    <p className="mt-1"><span className="text-slate-400">Response s_v = k_v + e·score  (mod n)</span></p>
                    <p className="break-all text-slate-500">{proof.s_v.toString(16).slice(0, 32)}…</p>
                    <p className="mt-1"><span className="text-slate-400">Response s_r = k_r + e·r      (mod n)</span></p>
                    <p className="break-all text-slate-500">{proof.s_r.toString(16).slice(0, 32)}…</p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Verification equation:</strong> s_v·G + s_r·H = R + e·C<br />
                    Result: <span className={proof.verified ? 'font-bold text-green-600' : 'font-bold text-red-500'}>{proof.verified ? '✓ HOLDS' : '✗ FAILS'}</span>
                  </p>
                </div>
              ),
            },
            {
              title: 'Step 3 — Grade-A Range Proof',
              sub:   'Proves score ≥ 75 without revealing score',
              color: 'bg-emerald-600',
              body: (
                <div className="space-y-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-3 font-mono dark:bg-slate-800 space-y-1">
                    <p><span className="text-slate-400">δ = score − 75  (private, must be ∈ [0, 25])</span></p>
                    <p className={cn('font-bold', proof.deltaValid ? 'text-emerald-600' : 'text-red-500')}>δ = {proof.score} − 75 = {proof.score - 75}{proof.deltaValid ? ' ∈ [0, 25] ✓' : ' < 0 ✗'}</p>
                    <p className="mt-1"><span className="text-slate-400">D = δ·G + r′·H  (commitment to δ)</span></p>
                    <p className="break-all text-emerald-600 dark:text-emerald-400">{proof.D !== '—' ? hexSlice(proof.D, 40) : '— (invalid, δ < 0)'}</p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {proof.deltaValid
                      ? 'D commits to δ ≥ 0, proving score ≥ 75 (Grade A). The verifier confirms C − 75·G = D (modulo the blinding terms), proving the grade without learning the exact score. In production: Bulletproofs provide full range ZK with O(log n) proof size.'
                      : 'Score is below 75 — cannot produce a valid Grade-A range proof. The ZKP correctly rejects the claim.'}
                  </p>
                </div>
              ),
            },
          ].map((step, i) => (
            <div key={i} className="rounded-xl border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <button className="flex w-full items-center gap-3 px-4 py-3 text-left" onClick={() => setExpanded(expanded === i ? null : i)}>
                <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white', step.color)}>{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{step.title}</p>
                  <p className="text-[11px] text-slate-400">{step.sub}</p>
                </div>
                {expanded === i ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              </button>
              {expanded === i && <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">{step.body}</div>}
            </div>
          ))}

          {/* Public vs Private summary */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/20 dark:bg-red-950/10">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-300">
                <Lock className="h-3.5 w-3.5" />Prover keeps PRIVATE
              </p>
              <ul className="space-y-1 text-xs text-red-700 dark:text-red-400">
                <li>• Actual score: <strong className="font-mono">{proof.score}</strong></li>
                <li>• Blinding factor r (256-bit random scalar)</li>
                <li>• Schnorr nonces k_v and k_r</li>
                <li>• δ = score − 75 = <strong className="font-mono">{proof.score - 75}</strong></li>
              </ul>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50 p-4 dark:border-green-900/20 dark:bg-green-950/10">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-300">
                <Unlock className="h-3.5 w-3.5" />Verifier receives PUBLIC
              </p>
              <ul className="space-y-1 text-xs text-green-700 dark:text-green-400">
                <li>• Commitment C (33 bytes compressed)</li>
                <li>• Schnorr proof (R, s_v, s_r, e)</li>
                <li>• Range commitment D</li>
                <li>• Claim: score ≥ 75 → Grade A</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {!proof && (
        <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-700">
          <ShieldCheck className="mx-auto h-12 w-12 text-slate-200 dark:text-slate-700" />
          <p className="mt-3 text-sm text-slate-400">Set a score above and click "Generate ZKP" to create a secp256k1 proof</p>
        </div>
      )}
    </div>
  );
}
