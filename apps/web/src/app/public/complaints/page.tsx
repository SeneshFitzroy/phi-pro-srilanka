'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, AlertTriangle, CheckCircle, Loader2, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COMPLAINT_TYPES = [
  'Food Safety Concern',
  'Unsanitary Food Premises',
  'Mosquito / Dengue Breeding Site',
  'Water Contamination',
  'Garbage / Waste Dumping',
  'Sewage / Drain Blockage',
  'Stray Animals',
  'Suspected Disease Outbreak',
  'Factory Emission / Waste',
  'Noise / Air Pollution',
  'Illegal Food Vendor',
  'Other',
];

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
];

interface FormState {
  type: string;
  description: string;
  location: string;
  district: string;
  gnDivision: string;
  contactName: string;
  contactInfo: string;
}

const EMPTY: FormState = {
  type: '', description: '', location: '', district: '', gnDivision: '', contactName: '', contactInfo: '',
};

export default function ComplaintsPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [trackId, setTrackId] = useState('');
  const [error, setError] = useState('');

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.description || !form.location || !form.district) return;
    setSubmitting(true);
    setError('');

    try {
      const trackingId = 'CMP-' + Date.now().toString().slice(-8);
      await addDoc(collection(db, 'public_complaints'), {
        trackingId,
        type: form.type,
        description: form.description,
        location: form.location,
        district: form.district,
        gnDivision: form.gnDivision || null,
        contactName: form.contactName || null,
        contactInfo: form.contactInfo || null,
        status: 'pending',
        assignedTo: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setTrackId(trackingId);
    } catch (err) {
      console.error('Complaint submit error:', err);
      setError('Failed to submit complaint. Please try again or call the hotline below.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ── */
  if (trackId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4 dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="space-y-5 p-8 text-center">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complaint Submitted</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your complaint has been recorded and will be assigned to the relevant PHI officer.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking Reference</p>
              <p className="mt-1 font-mono text-3xl font-black text-slate-900 dark:text-white">{trackId}</p>
              <p className="mt-2 text-xs text-muted-foreground">Screenshot this reference to track your complaint status</p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
              Expected response within <strong>48 hours</strong>. PHI officers will investigate and follow up if contact was provided.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setTrackId(''); setForm(EMPTY); }}>
                Submit Another
              </Button>
              <Link href="/#services" className="flex-1">
                <Button className="w-full">Back to Portal</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto max-w-2xl space-y-5 px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/#services">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <AlertTriangle className="h-6 w-6 text-orange-500" />Submit a Complaint
            </h1>
            <p className="text-sm text-muted-foreground">Report public health or environmental concerns to your local PHI</p>
          </div>
        </div>

        {/* Emergency notice */}
        <Card className="border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <Phone className="h-5 w-5 shrink-0 text-red-600" />
            <div className="text-sm">
              <strong className="text-red-800 dark:text-red-300">Emergency?</strong>
              <span className="ml-1 text-red-700 dark:text-red-400">
                For disease outbreaks or acute poisoning call <strong>1390</strong> immediately. This form is for non-emergency complaints.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Form card */}
        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="space-y-1.5">
                <Label>Complaint Type <span className="text-red-500">*</span></Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.type} onChange={set('type')} required
                >
                  <option value="">Select type…</option>
                  {COMPLAINT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Description <span className="text-red-500">*</span></Label>
                <textarea
                  className="flex min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Describe the issue in as much detail as possible — what you saw, when it started, how serious it is…"
                  value={form.description} onChange={set('description')} required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Street Address / Location <span className="text-red-500">*</span></Label>
                  <Input placeholder="Street, building, or landmark" value={form.location} onChange={set('location')} required />
                </div>
                <div className="space-y-1.5">
                  <Label>District <span className="text-red-500">*</span></Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.district} onChange={set('district')} required
                  >
                    <option value="">Select district…</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>GN Division <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input placeholder="Grama Niladhari Division, if known" value={form.gnDivision} onChange={set('gnDivision')} />
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Your Contact (Optional — Anonymous submissions accepted)
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Your Name</Label>
                    <Input placeholder="Optional" value={form.contactName} onChange={set('contactName')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone or Email</Label>
                    <Input placeholder="For PHI follow-up" value={form.contactInfo} onChange={set('contactInfo')} />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Link href="/#services">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={submitting || !form.type || !form.description || !form.location || !form.district}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" />Submit Complaint</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
