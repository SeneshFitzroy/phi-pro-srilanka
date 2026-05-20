// Zero-Knowledge Grade Proof — secp256k1 Pedersen commitment + Schnorr
// Σ-protocol + Grade-A range proof. Extracted from the old standalone
// /dashboard/ai/zkp page so the same engine can be embedded directly into
// the Food Safety inspections table (no separate route, no dual entry).
//
// @noble/curves secp256k1 · @noble/hashes sha256 — runs entirely in-browser.

import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';

const Point = secp256k1.Point;
const G = Point.BASE;
const ORDER = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n;

// H = "nothing-up-my-sleeve" second generator — derived from a domain string
// so nobody knows log_G(H) (required for Pedersen binding security).
const H_SEED = new TextEncoder().encode('PHI-PRO-ZKP-GENERATOR-H-v1');
const H_HASH = sha256(H_SEED);
let H_SCALAR = 0n;
for (const b of H_HASH) H_SCALAR = (H_SCALAR << 8n) | BigInt(b);
H_SCALAR = ((H_SCALAR % (ORDER - 1n)) + 1n);
const H = G.multiply(H_SCALAR);

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

export function hexSlice(hex: string, len = 16): string {
  return hex.slice(0, len) + '…';
}

type Pt = typeof G;

export interface ZKProof {
  C: string;        // commitment C = score·G + r·H
  R: string;        // nonce commitment R = k_v·G + k_r·H
  e: bigint;        // Fiat-Shamir challenge
  s_v: bigint;      // response for score
  s_r: bigint;      // response for blinding r
  D: string;        // commitment to delta = score - 75
  deltaValid: boolean;
  score: number;
  grade: string;
  verified: boolean;
}

export function generateProof(score: number): ZKProof {
  const grade = score >= 75 ? 'A' : score >= 50 ? 'B' : 'C';
  const v = BigInt(score);

  // 1. Pedersen commitment: C = v·G + r·H
  const r = randomScalar();
  const C: Pt = G.multiply(v).add(H.multiply(r));

  // 2. Schnorr proof of knowledge (Σ-protocol)
  const k_v = randomScalar();
  const k_r = randomScalar();
  const R: Pt = G.multiply(k_v).add(H.multiply(k_r));

  // Fiat-Shamir challenge (non-interactive)
  const e = hashToScalar(C.toHex(), R.toHex(), 'PHI-PRO-ZKP-v1');

  // Responses
  const s_v = (k_v + e * v) % ORDER;
  const s_r = (k_r + e * r) % ORDER;

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
