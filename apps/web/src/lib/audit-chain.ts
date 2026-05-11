// ============================================================================
// PHI-PRO Tamper-Evident Audit Chain
//
// Every high-value action (e.g. an H800 inspection submission, a certificate
// issue, a permit approval) appends an entry to the `audit_chain` Firestore
// collection. Each entry stores:
//   - index      : sequential position (0 = genesis)
//   - prevHash   : entryHash of the previous entry  (genesis: 64 zeros)
//   - payloadHash: SHA-256 of the canonicalised action payload
//   - entryHash  : SHA-256 of the canonicalised entry header (links the chain)
// Because every entry's hash depends on the previous entry's hash, altering or
// deleting any past record breaks every later hash — making tampering evident.
// Firestore rules make the collection append-only (no update / no delete).
//
// `verifyChain()` re-walks the whole chain and re-computes every hash to confirm
// integrity. The public page /public/audit lets anyone do the same.
//
// Optional public anchoring (Polygon Amoy testnet) is intentionally left as a
// configuration hook — see anchorHeadOnChain() — so no funded key ships in the repo.
// ============================================================================

import { collection, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const GENESIS_PREV_HASH = '0'.repeat(64);
export const AUDIT_CHAIN_COLLECTION = 'audit_chain';

export interface AuditEntry {
  id?: string;
  index: number;
  prevHash: string;
  payloadHash: string;
  entryHash: string;
  action: string;          // e.g. 'INSPECTION_SUBMITTED'
  refCollection: string;   // Firestore collection of the referenced document
  refDocId: string;        // referenced document id
  actorUid: string;
  ts: string;              // ISO timestamp
  summary: string;         // short human-readable description
}

// ── Hashing helpers ─────────────────────────────────────────────────────────

/** Stable JSON: object keys sorted recursively so the same data → the same string. */
export function canonicalize(value: unknown): string {
  const seen = new WeakSet();
  const norm = (v: unknown): unknown => {
    if (v === null || typeof v !== 'object') return v;
    if (seen.has(v as object)) return null;
    seen.add(v as object);
    if (Array.isArray(v)) return v.map(norm);
    return Object.keys(v as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = norm((v as Record<string, unknown>)[k]);
        return acc;
      }, {});
  };
  return JSON.stringify(norm(value));
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Re-compute the hash that links an entry into the chain. */
export async function computeEntryHash(e: Pick<AuditEntry, 'index' | 'prevHash' | 'payloadHash' | 'action' | 'refCollection' | 'refDocId' | 'actorUid' | 'ts'>): Promise<string> {
  return sha256Hex(canonicalize({
    index: e.index,
    prevHash: e.prevHash,
    payloadHash: e.payloadHash,
    action: e.action,
    refCollection: e.refCollection,
    refDocId: e.refDocId,
    actorUid: e.actorUid,
    ts: e.ts,
  }));
}

// ── Read ────────────────────────────────────────────────────────────────────

export async function getChain(): Promise<AuditEntry[]> {
  const snap = await getDocs(query(collection(db, AUDIT_CHAIN_COLLECTION), orderBy('index', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditEntry, 'id'>) }));
}

export async function getChainHead(): Promise<AuditEntry | null> {
  const chain = await getChain();
  return chain.length ? chain[chain.length - 1] : null;
}

// ── Append ──────────────────────────────────────────────────────────────────

export interface AppendInput {
  action: string;
  refCollection: string;
  refDocId: string;
  actorUid: string;
  /** Arbitrary action payload — only its SHA-256 is stored, not the raw data. */
  payload: unknown;
  summary: string;
}

/**
 * Append an entry to the audit chain. Non-transactional read-then-write — fine
 * for single-writer field use; under heavy concurrency promote to a Firestore
 * transaction over an `audit_meta/head` doc (left as a hardening note).
 */
export async function appendAuditEntry(input: AppendInput): Promise<AuditEntry> {
  const head = await getChainHead();
  const index = head ? head.index + 1 : 0;
  const prevHash = head ? head.entryHash : GENESIS_PREV_HASH;
  const ts = new Date().toISOString();
  const payloadHash = await sha256Hex(canonicalize(input.payload));
  const base = {
    index,
    prevHash,
    payloadHash,
    action: input.action,
    refCollection: input.refCollection,
    refDocId: input.refDocId,
    actorUid: input.actorUid,
    ts,
  };
  const entryHash = await computeEntryHash(base);
  const entry: AuditEntry = { ...base, entryHash, summary: input.summary };
  const ref = doc(collection(db, AUDIT_CHAIN_COLLECTION)); // pre-generated id
  await setDoc(ref, entry);
  return { ...entry, id: ref.id };
}

// ── Verify ──────────────────────────────────────────────────────────────────

export interface VerifyResult {
  valid: boolean;
  length: number;
  headHash: string | null;
  brokenAt: number | null;        // index of the first invalid entry
  reason: string | null;
}

export async function verifyChain(entries?: AuditEntry[]): Promise<VerifyResult> {
  const chain = entries ?? (await getChain());
  if (chain.length === 0) return { valid: true, length: 0, headHash: null, brokenAt: null, reason: 'Chain is empty.' };

  let expectedPrev = GENESIS_PREV_HASH;
  for (let i = 0; i < chain.length; i++) {
    const e = chain[i];
    if (e.index !== i) return fail(i, `Index out of sequence (expected ${i}, got ${e.index}).`, chain);
    if (e.prevHash !== expectedPrev) return fail(i, 'Broken link — prevHash does not match the previous entry.', chain);
    const recomputed = await computeEntryHash(e);
    if (recomputed !== e.entryHash) return fail(i, 'Entry has been altered — recomputed hash does not match.', chain);
    expectedPrev = e.entryHash;
  }
  return { valid: true, length: chain.length, headHash: chain[chain.length - 1].entryHash, brokenAt: null, reason: null };
}

function fail(i: number, reason: string, chain: AuditEntry[]): VerifyResult {
  return { valid: false, length: chain.length, headHash: chain.length ? chain[chain.length - 1].entryHash : null, brokenAt: i, reason };
}

/** Confirm a single supplied payload matches the payloadHash recorded at `entryId`. */
export async function verifyPayloadAgainstEntry(entry: AuditEntry, payload: unknown): Promise<boolean> {
  return (await sha256Hex(canonicalize(payload))) === entry.payloadHash;
}

// ── Optional on-chain anchor (configuration hook only) ──────────────────────

/**
 * Publish the current head hash to a public blockchain (Polygon Amoy testnet).
 * Disabled unless NEXT_PUBLIC_AUDIT_ANCHOR_RPC and a signer are configured —
 * a funded private key must never be committed. Returns the tx hash or null.
 */
export async function anchorHeadOnChain(_headHash: string): Promise<string | null> {
  // Intentionally a no-op in this build. To enable: install `ethers`, read
  // NEXT_PUBLIC_AUDIT_ANCHOR_RPC + a server-side signer key, send a tx whose
  // calldata is `headHash`, and store the returned tx hash on the head entry.
  return null;
}
