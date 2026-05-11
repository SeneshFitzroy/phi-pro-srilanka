// ============================================================================
// /api/payments/notify — PayHere server-to-server settlement webhook.
// PayHere POSTs (application/x-www-form-urlencoded) after a payment; we verify
// the signature, then mark the matching payment_records doc completed / failed.
//
// NOTE: writing back to Firestore from a server route should use the Firebase
// Admin SDK + a service account in production (the client SDK used elsewhere has
// no privileged auth). This route validates the signature and is structured for
// that wiring; install `firebase-admin` and replace the marked block to enable it.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

const MERCHANT_ID = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || '';
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || '';
const md5Upper = (s: string) => crypto.createHash('md5').update(s, 'utf8').digest('hex').toUpperCase();

// PayHere status codes: 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = chargedback
const STATUS_MAP: Record<string, string> = { '2': 'completed', '0': 'pending_verification', '-1': 'cancelled', '-2': 'failed', '-3': 'chargedback' };

export async function POST(req: NextRequest) {
  if (!MERCHANT_ID || !MERCHANT_SECRET) return NextResponse.json({ ok: false, reason: 'gateway not configured' }, { status: 503 });

  const form = await req.formData();
  const get = (k: string) => String(form.get(k) ?? '');
  const merchant_id = get('merchant_id');
  const order_id = get('order_id');
  const amount = get('payhere_amount');
  const currency = get('payhere_currency');
  const status_code = get('status_code');
  const sig = get('md5sig').toUpperCase();

  const expected = md5Upper(merchant_id + order_id + amount + currency + status_code + md5Upper(MERCHANT_SECRET));
  if (merchant_id !== MERCHANT_ID || sig !== expected) {
    return NextResponse.json({ ok: false, reason: 'signature mismatch' }, { status: 400 });
  }

  const newStatus = STATUS_MAP[status_code] ?? 'unknown';

  // ── PRODUCTION: update payment_records (by paymentRef == order_id) and advance
  //    the linked permit stage. Requires firebase-admin + a service account:
  //
  //    import { getFirestore } from 'firebase-admin/firestore';
  //    const snap = await db.collection('payment_records').where('paymentRef','==',order_id).limit(1).get();
  //    if (!snap.empty) await snap.docs[0].ref.update({ status: newStatus, paidAt: new Date().toISOString(), gatewayPayload: { status_code, amount, currency } });
  //
  // ───────────────────────────────────────────────────────────────────────────

  return NextResponse.json({ ok: true, order_id, status: newStatus });
}

export const runtime = 'nodejs';
