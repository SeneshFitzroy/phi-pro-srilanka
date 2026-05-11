// ============================================================================
// /api/payments/payhere-hash — server-side computation of the PayHere checkout
// hash (must use the merchant SECRET, which never leaves the server).
// hash = MD5( merchant_id + order_id + amount + currency + MD5(secret).toUpper() ).toUpper()
// Returns 503 if PAYHERE_MERCHANT_SECRET is not configured (→ caller uses sandbox sim).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

const MERCHANT_ID = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || '';
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || '';

const md5Upper = (s: string) => crypto.createHash('md5').update(s, 'utf8').digest('hex').toUpperCase();

export async function POST(req: NextRequest) {
  if (!MERCHANT_ID || !MERCHANT_SECRET) {
    return NextResponse.json({ error: 'PayHere not configured' }, { status: 503 });
  }
  try {
    const { orderId, amount, currency = 'LKR' } = (await req.json()) as { orderId: string; amount: number; currency?: string };
    if (!orderId || !amount) return NextResponse.json({ error: 'orderId and amount required' }, { status: 400 });
    const amt = Number(amount).toFixed(2);
    const hash = md5Upper(MERCHANT_ID + orderId + amt + currency + md5Upper(MERCHANT_SECRET));
    return NextResponse.json({ hash, merchant_id: MERCHANT_ID });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

export const runtime = 'nodejs';
