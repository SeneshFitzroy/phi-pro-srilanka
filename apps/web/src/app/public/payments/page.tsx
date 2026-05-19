'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowLeft, CreditCard, FileText, Clock, Building2,
  Info, Send, CheckCircle, Loader2, ChevronDown, ChevronUp,
  Calculator, HelpCircle, Layers, Download, Wallet, ShieldCheck, X,
  Phone, MapPin, AlertTriangle, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { downloadPaymentReceipt, type ReceiptData } from '@/components/payment-receipt';
import { isGatewayConfigured, PAYHERE_CHECKOUT_URL, payHereFormFields } from '@/lib/payments';
import { ShopVerificationBundle, type ShopVerificationData } from '@/components/shop-verification-bundle';
import { findKnownBusiness, SERVICE_DEFAULT_FEE, ESTABLISHMENT_FEE_RANGE, KNOWN_BUSINESSES, type ServiceType } from '@/data/known-businesses';
import { MOH_OFFICES } from '@/data/moh-offices';

// Map renders Google tiles when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set,
// otherwise falls back to the Leaflet OSM stack. Dynamic-import so Leaflet
// never reaches the server bundle.
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), { ssr: false });

const FEES: {
  category: string;
  items: { name: string; fee: string; duration: string; processing: string }[];
}[] = [
  {
    category: 'Food Premises Registration',
    items: [
      { name: 'New Registration — Small (< 10 seats)', fee: 'LKR 5,000', duration: '1 year', processing: '2 working days' },
      { name: 'New Registration — Medium (10–50 seats)', fee: 'LKR 10,000', duration: '1 year', processing: '2 working days' },
      { name: 'New Registration — Large (> 50 seats)', fee: 'LKR 25,000', duration: '1 year', processing: '3 working days' },
      { name: 'Annual Renewal', fee: 'LKR 3,000 – 15,000', duration: '1 year', processing: '1 working day' },
      { name: 'Re-inspection Fee', fee: 'LKR 2,000', duration: 'Per visit', processing: 'Same day' },
    ],
  },
  {
    category: 'Factory / Workplace Health',
    items: [
      { name: 'Factory Health Certificate', fee: 'LKR 10,000', duration: '1 year', processing: '3 working days' },
      { name: 'Occupational Health Inspection', fee: 'LKR 5,000', duration: 'Per visit', processing: '2 working days' },
    ],
  },
  {
    category: 'Environmental & Trade',
    items: [
      { name: 'Building Plan Approval (Health)', fee: 'LKR 3,000', duration: 'One-time', processing: '5 working days' },
      { name: 'Trade License Health Clearance', fee: 'LKR 2,000', duration: '1 year', processing: '1 working day' },
    ],
  },
  {
    category: 'Certificates & Documents',
    items: [
      { name: 'Certified Copy of Inspection Report', fee: 'LKR 500', duration: '-', processing: 'Same day' },
      { name: 'Food Handler Medical Certificate', fee: 'LKR 1,000', duration: '6 months', processing: 'Same day' },
    ],
  },
];

// All service types the citizen-facing payment form accepts. Each maps to a
// default fee in SERVICE_DEFAULT_FEE which the form prefills on selection.
const SERVICE_TYPES: ServiceType[] = (Object.keys(SERVICE_DEFAULT_FEE) as ServiceType[]);

// Full establishment catalogue for the Fee Estimator dropdown — covers
// every premises category H801 issues a permit for, not just restaurants.
const FEE_ESTIMATOR = ESTABLISHMENT_FEE_RANGE;

const FAQS = [
  {
    q: 'How do I confirm my payment was received?',
    a: 'After submitting your payment details, you will receive a payment reference number. A PHI officer will contact you within 2 working days to confirm receipt and schedule your inspection or issue your certificate.',
  },
  {
    q: 'Can I pay in cash at the MOH office?',
    a: 'Yes. Physical payments are accepted at all MOH offices Monday to Friday, 8:30 AM to 4:15 PM. Please bring your business registration documents and any relevant permit references.',
  },
  {
    q: 'What happens if my payment is rejected?',
    a: 'If there is an issue with your payment submission, a PHI officer will contact you using the phone number or email you provided. Ensure your contact details are correct when submitting.',
  },
];

interface PayForm {
  serviceType: string;
  referenceId: string;
  brNumber: string;        // PV / GS / BR business registration
  businessName: string;
  businessAddress: string;
  payerName: string;
  phone: string;
  email: string;
  amount: string;
}

const EMPTY_FORM: PayForm = {
  serviceType: '', referenceId: '', brNumber: '', businessName: '', businessAddress: '',
  payerName: '', phone: '', email: '', amount: '',
};

/**
 * Validate Sri Lankan business registration numbers. Accepts the common
 * formats issued by the Department of the Registrar of Companies:
 *   PV-12345 / PB-12345 / GS-12345 / SP-12345 (5–7 digit suffix)
 */
const BR_REGEX = /^(PV|PB|GS|SP)[-\s]?\d{4,7}$/i;

const totalFeeItems = FEES.reduce((acc, s) => acc + s.items.length, 0);

export default function PaymentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PayForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [payRef, setPayRef] = useState('');
  const [error, setError] = useState('');
  const [expandedCat, setExpandedCat] = useState<string | null>('Food Premises Registration');
  const [estimatorType, setEstimatorType] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [order, setOrder] = useState<ReceiptData | null>(null);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [verification, setVerification] = useState<ShopVerificationData>({ shopVideo: null, shopPhotos: [], nicPhoto: null, selfie: null });
  const [autofillNote, setAutofillNote] = useState<string | null>(null);
  const gatewayLive = isGatewayConfigured();

  const verificationComplete = Boolean(
    verification.shopVideo &&
    verification.shopPhotos.length > 0 &&
    verification.nicPhoto &&
    verification.selfie,
  );

  // ── BR auto-fill: when the citizen enters a registered BR, fill business
  //    name + address + phone + suggested service + the correct fee/fine. ──
  const handleBrChange = useCallback((raw: string) => {
    const upper = raw.toUpperCase();
    setForm((p) => ({ ...p, brNumber: upper }));
    const match = findKnownBusiness(upper);
    if (match) {
      setForm((p) => ({
        ...p,
        brNumber: match.brNumber,
        businessName: match.name,
        businessAddress: match.address,
        payerName: p.payerName || match.ownerName,
        phone: p.phone || match.phone,
        serviceType: match.suggestedService,
        amount: String(match.outstandingFine),
      }));
      setAutofillNote(`Matched ${match.name} (${match.district}). Suggested service and fee filled.${match.reason ? ' ' + match.reason : ''}`);
    } else {
      setAutofillNote(null);
    }
  }, []);

  // When service type changes (manually), prefill the default fee.
  const handleServiceChange = useCallback((value: string) => {
    setForm((p) => {
      const next = { ...p, serviceType: value };
      const fee = SERVICE_DEFAULT_FEE[value as ServiceType];
      if (fee !== undefined && (!p.amount || Number(p.amount) === 0)) next.amount = String(fee);
      return next;
    });
  }, []);

  // Demo BR pickers — one-click fill for citizens trying the flow
  const demoBrs = useMemo(() => KNOWN_BUSINESSES.slice(0, 4), []);

  const redirectToPayHere = async (rec: ReceiptData) => {
    try {
      const res = await fetch('/api/payments/payhere-hash', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: rec.paymentRef, amount: rec.amount, currency: rec.currency }),
      });
      if (!res.ok) throw new Error('hash');
      const { hash } = (await res.json()) as { hash: string };
      const fields = {
        ...payHereFormFields(
          { orderId: rec.paymentRef, amount: rec.amount, currency: rec.currency, itemName: rec.serviceType, firstName: rec.payerName.split(' ')[0] || rec.payerName, lastName: rec.payerName.split(' ').slice(1).join(' '), email: rec.email ?? '', phone: rec.phone },
          window.location.origin,
        ),
        hash,
      };
      const f = document.createElement('form');
      f.method = 'POST'; f.action = PAYHERE_CHECKOUT_URL;
      Object.entries(fields).forEach(([k, v]) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = String(v); f.appendChild(i); });
      document.body.appendChild(f); f.submit();
    } catch {
      setSandboxOpen(true); // gateway hash unavailable → fall back to sandbox sim
    }
  };

  const runSandbox = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setPaid(true); setSandboxOpen(false); }, 1600);
  };

  const getReceipt = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      await downloadPaymentReceipt({ ...order, status: paid ? 'completed' : order.status, channel: paid ? 'payhere_sandbox' : order.channel });
    } finally { setDownloading(false); }
  };

  const set = (field: keyof PayForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceType || !form.payerName || !form.phone || !form.amount) return;
    if (!form.brNumber || !BR_REGEX.test(form.brNumber.trim())) {
      setError('A valid Sri Lankan BR number is required (PV / PB / GS / SP prefix).');
      return;
    }
    if (!form.businessName || !form.businessAddress) {
      setError('Please fill in your business name and address.');
      return;
    }
    if (!verificationComplete) {
      setError('Shop verification bundle is incomplete: please attach a shop video, at least one shop photo, the owner\'s NIC card photo, and a live selfie.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const ref = 'PAY-' + Date.now().toString().slice(-9);
      await addDoc(collection(db, 'payment_records'), {
        paymentRef: ref,
        serviceType: form.serviceType,
        referenceId: form.referenceId || null,
        // Business details — the MOH office uses these to match the payment
        // to the correct premises file and dispatch the inspector.
        business: {
          brNumber: form.brNumber.trim().toUpperCase(),
          name: form.businessName,
          address: form.businessAddress,
        },
        payerName: form.payerName,
        phone: form.phone,
        email: form.email || null,
        amount: parseFloat(form.amount) || 0,
        currency: 'LKR',
        status: 'pending_verification',
        channel: 'online_portal',
        // Triggers a Cloud Function (deployed separately) that notifies the
        // assigned MOH office for accept / decline.
        notifyOnAcceptance: true,
        // Shop + identity verification metadata. The actual media blobs are
        // staged client-side and a separate worker uploads them to a signed
        // bucket — what we record here is the filename + MB so the receiving
        // PHI office can spot incomplete bundles before review.
        verification: {
          hasShopVideo: !!verification.shopVideo,
          shopVideoName: verification.shopVideo?.name ?? null,
          shopVideoMb:   verification.shopVideo?.sizeMb ?? null,
          shopPhotoCount: verification.shopPhotos.length,
          shopPhotoNames: verification.shopPhotos.map((p) => p.name),
          hasNicPhoto: !!verification.nicPhoto,
          nicPhotoName: verification.nicPhoto?.name ?? null,
          hasSelfie: !!verification.selfie,
          selfieName: verification.selfie?.name ?? null,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const rec: ReceiptData = {
        paymentRef: ref, serviceType: form.serviceType, referenceId: form.referenceId || null,
        payerName: form.payerName, phone: form.phone, email: form.email || null,
        amount: parseFloat(form.amount) || 0, currency: 'LKR', channel: 'online_portal',
        status: 'pending_verification', dateISO: new Date().toISOString(),
      };
      setOrder(rec);
      setPayRef(ref);
      if (gatewayLive) { void redirectToPayHere(rec); }
    } catch (err) {
      console.error('Payment submit error:', err);
      setError('Could not record payment. Please try again or visit the MOH office.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ── */
  if (payRef) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 to-white p-4 dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="space-y-5 p-8 text-center">
            <div className="flex justify-center">
              <div className={`flex h-20 w-20 items-center justify-center rounded-full ring-8 ${paid ? 'bg-green-100 ring-green-50 dark:bg-green-950/40 dark:ring-green-950' : 'bg-amber-100 ring-amber-50 dark:bg-amber-950/40 dark:ring-amber-950'}`}>
                <CheckCircle className={`h-12 w-12 ${paid ? 'text-green-600' : 'text-amber-600'}`} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{paid ? 'Payment Successful' : 'Payment Recorded'}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {paid ? 'Your fee has been paid (PayHere sandbox). Download your receipt below.' : 'Your payment request has been submitted to the MOH office for verification.'}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Reference</p>
              <p className="mt-1 font-mono text-3xl font-black text-slate-900 dark:text-white">{payRef}</p>
              {order && <p className="mt-1 text-sm font-semibold">LKR {order.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })} · {order.serviceType}</p>}
              <p className="mt-2 text-xs text-muted-foreground">Keep this reference — it confirms your payment.</p>
            </div>

            {/* Gateway / receipt actions */}
            {!paid && !gatewayLive && (
              <Button onClick={() => setSandboxOpen(true)} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Wallet className="h-4 w-4" /> Pay {order ? `LKR ${order.amount.toLocaleString('en-LK')}` : ''} with PayHere (Sandbox)
              </Button>
            )}
            {!paid && gatewayLive && order && (
              <Button onClick={() => void redirectToPayHere(order)} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Wallet className="h-4 w-4" /> Proceed to PayHere
              </Button>
            )}
            <Button variant="outline" onClick={() => void getReceipt()} disabled={downloading} className="w-full gap-2">
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download Receipt (PDF)
            </Button>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
              <strong>Next steps:</strong> {paid ? 'A PHI officer will proceed with your inspection / certificate using this reference.' : 'A PHI officer will contact you within 2 working days to confirm receipt and issue your certificate.'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setPayRef(''); setForm(EMPTY_FORM); setShowForm(false); setPaid(false); setOrder(null); }}>
                New Payment
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full">Back to Portal</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* PayHere sandbox modal */}
        {sandboxOpen && order && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold"><span className="rounded bg-emerald-600 px-1.5 py-0.5 text-xs text-white">PayHere</span> <span className="text-xs text-muted-foreground">Sandbox</span></span>
                <button onClick={() => setSandboxOpen(false)} disabled={processing}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Order <span className="font-mono">{order.paymentRef}</span></p>
              <p className="text-2xl font-extrabold">LKR {order.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</p>
              <div className="mt-4 space-y-2">
                <div className="rounded-md border border-input bg-slate-50 px-3 py-2 text-sm text-muted-foreground dark:bg-slate-800">Card 4242 4242 4242 4242 · 12/29 · 123 (test)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-input bg-slate-50 px-3 py-2 text-xs text-muted-foreground dark:bg-slate-800">Exp 12/29</div>
                  <div className="rounded-md border border-input bg-slate-50 px-3 py-2 text-xs text-muted-foreground dark:bg-slate-800">CVC •••</div>
                </div>
              </div>
              <Button onClick={runSandbox} disabled={processing} className="mt-4 w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <><ShieldCheck className="h-4 w-4" /> Pay LKR {order.amount.toLocaleString('en-LK')}</>}
              </Button>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">Sandbox simulation — no real card is charged. Set NEXT_PUBLIC_PAYHERE_MERCHANT_ID for live checkout.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <CreditCard className="h-6 w-6 text-amber-600" />Fees &amp; Payments
            </h1>
            <p className="text-sm text-muted-foreground">
              Official PHI service fees and online payment submission
            </p>
          </div>
        </div>

        {/* Info banner */}
        <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-3 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300">Payment Information</p>
              <p className="mt-0.5 text-muted-foreground">
                Submit your payment details below to register a payment. A PHI officer will verify
                receipt and issue your certificate within 2 working days. Physical payments accepted
                at all MOH offices Monday–Friday, 8:30 AM–4:15 PM.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fee Estimator */}
        <Card className="shadow-sm border-amber-100 dark:border-amber-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4 text-amber-600" />Fee Estimator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Select your establishment type to get an estimated fee range.</p>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={estimatorType}
              onChange={e => setEstimatorType(e.target.value)}
            >
              <option value="">Select establishment type…</option>
              {Object.keys(FEE_ESTIMATOR).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            {estimatorType && (
              <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                <CreditCard className="h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Fee Range</p>
                  <p className="text-lg font-bold text-amber-800 dark:text-amber-300">{FEE_ESTIMATOR[estimatorType]}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Make payment CTA */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {showForm ? 'Hide Payment Form' : 'Submit Payment Details'}
          </Button>
        </div>

        {/* Payment form */}
        {showForm && (
          <form onSubmit={handlePay}>
            <Card className="border-amber-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Service Type <span className="text-red-500">*</span></Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.serviceType}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      required
                    >
                      <option value="">Select service…</option>
                      {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <p className="text-[11px] text-muted-foreground">Selecting a service prefills the standard fee. You can override it below if the MOH office quoted a different amount.</p>
                  </div>
                </div>

                {/* Business details — BR + shop lookup */}
                <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900 dark:bg-amber-950/10">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                    <Building2 className="h-3.5 w-3.5" /> Business details
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>
                        Business Registration (BR) No. <span className="text-red-500">*</span>
                        <span className="ml-2 text-[10px] font-normal text-muted-foreground">type to auto-fill the rest</span>
                      </Label>
                      <Input
                        list="known-br-list"
                        placeholder="PV-12345 / PB-12345 / GS-12345"
                        value={form.brNumber}
                        onChange={(e) => handleBrChange(e.target.value)}
                        aria-invalid={form.brNumber.length > 0 && !BR_REGEX.test(form.brNumber.trim())}
                        className="font-mono"
                      />
                      <datalist id="known-br-list">
                        {KNOWN_BUSINESSES.map((b) => (
                          <option key={b.brNumber} value={b.brNumber}>{b.name} — {b.district}</option>
                        ))}
                      </datalist>
                      {form.brNumber.length > 0 && !BR_REGEX.test(form.brNumber.trim()) && (
                        <p className="text-[11px] text-rose-600">Use the RoC format: PV-12345, PB-12345, GS-12345 or SP-12345.</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Try:</span>
                        {demoBrs.map((b) => (
                          <button
                            key={b.brNumber}
                            type="button"
                            onClick={() => handleBrChange(b.brNumber)}
                            className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
                          >
                            {b.brNumber}
                          </button>
                        ))}
                      </div>
                      {autofillNote && (
                        <p className="flex items-start gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] leading-snug text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                          <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>{autofillNote}</span>
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Business / Shop Name <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="As shown on the BR certificate"
                        value={form.businessName}
                        onChange={set('businessName')}
                        required
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Business / Shop Address <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="No., street, district"
                        value={form.businessAddress}
                        onChange={set('businessAddress')}
                        required
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    The submitted BR is matched against your PHI&apos;s register. Once payment is captured the assigned
                    MOH office is notified to accept / verify / dispatch the permit — you&apos;ll see the live status here.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Certificate / Permit Reference <span className="text-xs text-muted-foreground">(if renewing)</span></Label>
                    <Input placeholder="e.g. FP-20250001" value={form.referenceId} onChange={set('referenceId')} className="font-mono uppercase" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Amount (LKR) <span className="text-red-500">*</span></Label>
                    <Input type="number" min="0" placeholder="e.g. 5000" value={form.amount} onChange={set('amount')} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Full Name <span className="text-red-500">*</span></Label>
                    <Input placeholder="Name of payee / business owner" value={form.payerName} onChange={set('payerName')} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone Number <span className="text-red-500">*</span></Label>
                    <Input type="tel" placeholder="07x xxx xxxx" value={form.phone} onChange={set('phone')} required />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Email Address <span className="text-xs text-muted-foreground">(optional)</span></Label>
                    <Input type="email" placeholder="For confirmation email" value={form.email} onChange={set('email')} />
                  </div>
                </div>

                {/* ── Shop + identity verification (required) ── */}
                <ShopVerificationBundle onChange={setVerification} />

                {/* Status pipeline (visual reassurance) */}
                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Payment status pipeline
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    {[
                      { k: 'Submitted',  color: 'bg-slate-300' },
                      { k: 'Charging',   color: 'bg-amber-400' },
                      { k: 'Captured',   color: 'bg-blue-500' },
                      { k: 'PHI accepted', color: 'bg-emerald-500' },
                      { k: 'Certificate ready', color: 'bg-emerald-600' },
                    ].map((s, i, arr) => (
                      <div key={s.k} className="flex flex-1 items-center">
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-white ${s.color}`}>
                          {i + 1}
                        </span>
                        <span className="ml-1.5 truncate text-slate-700 dark:text-slate-300">{s.k}</span>
                        {i < arr.length - 1 && <span className="mx-2 h-px flex-1 bg-slate-200 dark:bg-slate-700" />}
                      </div>
                    ))}
                  </div>
                </div>

                {!verificationComplete && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>Submit is locked until the shop video, at least one shop photo, the NIC card photo and a live selfie are attached above.</span>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button
                    type="submit"
                    disabled={
                      submitting ||
                      !form.serviceType || !form.payerName || !form.phone || !form.amount ||
                      !form.brNumber || !BR_REGEX.test(form.brNumber.trim()) ||
                      !form.businessName || !form.businessAddress ||
                      !verificationComplete
                    }
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {submitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Submit Payment</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Fee schedule */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <FileText className="h-5 w-5 text-amber-600" />Fee Schedule
            </h2>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 dark:bg-amber-950/20 dark:border-amber-800">
              <Layers className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{totalFeeItems} fee categories</span>
            </div>
          </div>

          {FEES.map((section, sIdx) => {
            const open = expandedCat === section.category;
            return (
              <Card key={section.category} className="overflow-hidden shadow-sm">
                <button
                  type="button"
                  className="flex w-full items-center justify-between bg-slate-50 px-5 py-3.5 text-left hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setExpandedCat(open ? null : section.category)}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                      {sIdx + 1}
                    </span>
                    <span className="text-sm font-semibold">{section.category}</span>
                    <span className="text-xs text-muted-foreground">({section.items.length} fees)</span>
                  </div>
                  {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {open && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-t border-b bg-muted/30 text-xs text-muted-foreground">
                          <th className="px-5 py-2 text-left font-medium">Service</th>
                          <th className="px-5 py-2 text-right font-medium">Fee</th>
                          <th className="px-5 py-2 text-right font-medium">Validity</th>
                          <th className="px-5 py-2 text-right font-medium">Processing</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.map((item, idx) => (
                          <tr key={item.name} className={`border-b last:border-0 hover:bg-muted/20 ${idx % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-900/30'}`}>
                            <td className="px-5 py-3">{item.name}</td>
                            <td className="px-5 py-3 text-right font-semibold text-amber-700 dark:text-amber-400">{item.fee}</td>
                            <td className="px-5 py-3 text-right text-muted-foreground">
                              <span className="flex items-center justify-end gap-1">
                                <Clock className="h-3 w-3" />{item.duration}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                                {item.processing}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* MOH offices — live Google map with every counter pinned, plus a
            click-to-call / open-in-Maps list. */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Building2 className="h-5 w-5 text-amber-600" />MOH Office Locations
            </h2>
            <Link href="/public/find-phi" className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-white px-2.5 py-1 text-xs font-bold text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:bg-slate-900 dark:text-amber-300">
              See all 74 offices <MapPin className="h-3 w-3" />
            </Link>
          </div>
          <Card className="overflow-hidden shadow-sm">
            <LeafletMap
              fitToMarkers
              height="22rem"
              markers={MOH_OFFICES.map((o, i) => ({
                id: `moh-${i}`,
                position: { lat: o.lat, lng: o.lng },
                color: 'amber',
                popup: (
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900">{o.name}</p>
                    <p className="text-slate-600">{o.addr}</p>
                    <div className="mt-1 flex gap-1.5">
                      <a href={`tel:${o.phone.replace(/[^\d+]/g, '')}`} className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Call</a>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${o.name}, ${o.addr}`)}`} target="_blank" rel="noopener noreferrer" className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">Open in Maps</a>
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {MOH_OFFICES.map((office) => (
              <Card key={office.name} className="shadow-sm">
                <CardContent className="p-3">
                  <p className="text-xs font-semibold leading-tight">{office.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{office.addr}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <a href={`tel:${office.phone.replace(/[^\d+]/g, '')}`} title={office.phone} className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-slate-900">
                      <Phone className="h-2.5 w-2.5" /> {office.phone}
                    </a>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${office.name}, ${office.addr}, Sri Lanka`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:bg-slate-900">
                      <MapPin className="h-2.5 w-2.5" /> Maps
                    </a>
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">Mon–Fri, 8:30 AM – 4:15 PM</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <HelpCircle className="h-5 w-5 text-amber-600" />Commonly Asked Questions
          </h2>
          {FAQS.map((faq, idx) => {
            const open = expandedFaq === idx;
            return (
              <Card key={idx} className="overflow-hidden shadow-sm">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => setExpandedFaq(open ? null : idx)}
                >
                  <span className="text-sm font-semibold leading-snug">{faq.q}</span>
                  {open
                    ? <ChevronUp className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                  }
                </button>
                {open && (
                  <div className="border-t bg-slate-50/60 px-5 py-4 dark:bg-slate-900/40">
                    <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
