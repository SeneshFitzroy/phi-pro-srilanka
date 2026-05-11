'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, CreditCard, FileText, Clock, Building2,
  Info, Send, CheckCircle, Loader2, ChevronDown, ChevronUp,
  Calculator, HelpCircle, Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

const SERVICE_TYPES = [
  'Food Premises — New Registration (Small)',
  'Food Premises — New Registration (Medium)',
  'Food Premises — New Registration (Large)',
  'Food Premises — Annual Renewal',
  'Food Premises — Re-inspection Fee',
  'Factory Health Certificate',
  'Occupational Health Inspection',
  'Building Plan Approval',
  'Trade License Health Clearance',
  'Certified Copy of Report',
  'Food Handler Medical Certificate',
  'Compliance Fine — Outstanding Notice',
  'Other',
];

const FEE_ESTIMATOR: Record<string, string> = {
  'Small Restaurant / Cafe (< 10 seats)': 'LKR 5,000 – 7,000',
  'Medium Restaurant (10–50 seats)': 'LKR 10,000 – 12,000',
  'Large Restaurant / Hotel (> 50 seats)': 'LKR 25,000 – 30,000',
  'Bakery / Pastry Shop': 'LKR 5,000 – 8,000',
  'Food Court Stall': 'LKR 4,000 – 6,000',
  'Factory / Workplace': 'LKR 10,000 – 15,000',
  'Trade Business': 'LKR 2,000 – 3,000',
  'Other / Unsure': 'Contact MOH office for assessment',
};

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
  payerName: string;
  phone: string;
  email: string;
  amount: string;
}

const EMPTY_FORM: PayForm = {
  serviceType: '', referenceId: '', payerName: '', phone: '', email: '', amount: '',
};

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

  const set = (field: keyof PayForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceType || !form.payerName || !form.phone || !form.amount) return;
    setSubmitting(true);
    setError('');
    try {
      const ref = 'PAY-' + Date.now().toString().slice(-9);
      await addDoc(collection(db, 'payment_records'), {
        paymentRef: ref,
        serviceType: form.serviceType,
        referenceId: form.referenceId || null,
        payerName: form.payerName,
        phone: form.phone,
        email: form.email || null,
        amount: parseFloat(form.amount) || 0,
        currency: 'LKR',
        status: 'pending_verification',
        channel: 'online_portal',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setPayRef(ref);
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
              <div className="flex h-22 w-22 items-center justify-center rounded-full bg-amber-100 ring-8 ring-amber-50 dark:bg-amber-950/40 dark:ring-amber-950">
                <CheckCircle className="h-12 w-12 text-amber-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">Payment Recorded</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your payment request has been submitted to the MOH office for verification.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Reference</p>
              <p className="mt-1 font-mono text-3xl font-black text-slate-900 dark:text-white">{payRef}</p>
              <p className="mt-2 text-xs text-muted-foreground">Present this reference at the MOH office to confirm payment</p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
              <strong>Next steps:</strong> A PHI officer will contact you within 2 working days to confirm receipt and issue your certificate.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setPayRef(''); setForm(EMPTY_FORM); setShowForm(false); }}>
                New Payment
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full">Back to Portal</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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
                      value={form.serviceType} onChange={set('serviceType')} required
                    >
                      <option value="">Select service…</option>
                      {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Certificate / Permit Reference</Label>
                    <Input placeholder="e.g. FP-20250001 (if renewing)" value={form.referenceId} onChange={set('referenceId')} className="font-mono uppercase" />
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

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button
                    type="submit"
                    disabled={submitting || !form.serviceType || !form.payerName || !form.phone || !form.amount}
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

        {/* MOH offices */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Building2 className="h-5 w-5 text-amber-600" />MOH Office Locations
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { name: 'MOH Office — Colombo', addr: '123 Hospital Rd, Colombo 08', phone: '011-2345678' },
              { name: 'MOH Office — Kaduwela', addr: '45 MOH Lane, Kaduwela', phone: '011-9876543' },
              { name: 'MOH Office — Dehiwala', addr: '78 Health St, Dehiwala', phone: '011-5551234' },
            ].map(office => (
              <Card key={office.name} className="shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold">{office.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{office.addr}</p>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">{office.phone}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Mon–Fri, 8:30 AM – 4:15 PM</p>
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
