// ============================================================================
// Payment gateway integration (PayHere — Sri Lanka's standard gateway).
//
// Production: set NEXT_PUBLIC_PAYHERE_MERCHANT_ID (client) and PAYHERE_MERCHANT_SECRET
// (server-only) — payments redirect to PayHere's hosted checkout and the
// /api/payments/notify webhook confirms settlement.
// Without those: a sandbox simulation runs so the flow is fully demonstrable.
// ============================================================================

export const PAYHERE_MERCHANT_ID = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || '';
export const PAYHERE_SANDBOX = (process.env.NEXT_PUBLIC_PAYHERE_SANDBOX ?? 'true') !== 'false';
export const PAYHERE_CHECKOUT_URL = PAYHERE_SANDBOX
  ? 'https://sandbox.payhere.lk/pay/checkout'
  : 'https://www.payhere.lk/pay/checkout';

export const isGatewayConfigured = (): boolean => !!PAYHERE_MERCHANT_ID;

export interface PaymentOrder {
  orderId: string;       // = paymentRef
  amount: number;        // LKR
  currency?: string;     // default LKR
  itemName: string;      // service description
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
}

/** The hidden form fields PayHere expects on its checkout POST. `hash` is filled in separately (server-computed). */
export function payHereFormFields(order: PaymentOrder, returnOrigin: string): Record<string, string> {
  const amount = order.amount.toFixed(2);
  return {
    merchant_id: PAYHERE_MERCHANT_ID,
    return_url: `${returnOrigin}/public/payments?status=success&order=${encodeURIComponent(order.orderId)}`,
    cancel_url: `${returnOrigin}/public/payments?status=cancelled`,
    notify_url: `${returnOrigin}/api/payments/notify`,
    order_id: order.orderId,
    items: order.itemName,
    currency: order.currency ?? 'LKR',
    amount,
    first_name: order.firstName,
    last_name: order.lastName ?? '',
    email: order.email ?? '',
    phone: order.phone,
    address: '',
    city: 'Colombo',
    country: 'Sri Lanka',
  };
}
