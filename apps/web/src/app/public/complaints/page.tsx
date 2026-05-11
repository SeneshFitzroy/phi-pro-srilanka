'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Send, AlertTriangle, CheckCircle, Loader2,
  Phone, MapPin, FileText, User, Check, Upload, Camera,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VoiceInput } from '@/components/voice-input';
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

const MAX_DESC = 500;
const MIN_DESC = 20;

type Step = 1 | 2 | 3 | 4;

const STEPS: { step: Step; label: string; icon: React.ElementType }[] = [
  { step: 1, label: 'Type', icon: FileText },
  { step: 2, label: 'Location', icon: MapPin },
  { step: 3, label: 'Details', icon: FileText },
  { step: 4, label: 'Submit', icon: Send },
];

function FieldCheck({ valid }: { valid: boolean }) {
  if (!valid) return null;
  return <Check className="h-4 w-4 text-green-500 shrink-0" />;
}

export default function ComplaintsPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [trackId, setTrackId] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Set<keyof FormState>>(new Set());

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      setTouched(prev => new Set(prev).add(field));
    };

  const descLen = form.description.length;

  const currentStep: Step = useMemo(() => {
    if (!form.type) return 1;
    if (!form.location || !form.district) return 2;
    if (!form.description || descLen < MIN_DESC) return 3;
    return 4;
  }, [form.type, form.location, form.district, form.description, descLen]);

  const completedStep = (s: Step): boolean => {
    if (s === 1) return !!form.type;
    if (s === 2) return !!form.location && !!form.district;
    if (s === 3) return descLen >= MIN_DESC;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.description || !form.location || !form.district) return;
    if (descLen < MIN_DESC) return;
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
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="space-y-5 p-8 text-center">
            {/* Verified stamp graphic */}
            <div className="flex justify-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-green-500 bg-green-50 shadow-lg dark:bg-green-950/40">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div className="absolute -bottom-1 -right-1 rounded-full bg-green-600 px-2 py-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Filed</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complaint Submitted!</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your complaint has been recorded and will be assigned to the relevant PHI officer.
              </p>
            </div>

            {/* Tracking ID with QR placeholder */}
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking Reference</p>
              <p className="mt-1 font-mono text-3xl font-black text-slate-900 dark:text-white">{trackId}</p>
              {/* QR placeholder */}
              <div className="mx-auto mt-3 flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white dark:bg-slate-700">
                <div className="grid grid-cols-3 gap-0.5 opacity-50">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={`h-6 w-6 rounded-sm ${[0, 2, 6, 8, 4].includes(i) ? 'bg-slate-800 dark:bg-slate-200' : 'bg-transparent'}`} />
                  ))}
                </div>
                <p className="mt-1 text-[9px] text-muted-foreground">QR Code</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Screenshot this reference to track your complaint</p>
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
              Expected response within <strong>48 hours</strong>. PHI officers will investigate and follow up if contact was provided.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setTrackId(''); setForm(EMPTY); setTouched(new Set()); }}>
                Submit Another
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

  /* ── Form ── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-2xl space-y-5 px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <AlertTriangle className="h-6 w-6 text-orange-500" />Submit a Complaint
            </h1>
            <p className="text-sm text-muted-foreground">Report public health or environmental concerns to your local PHI</p>
          </div>
        </div>

        {/* 4-Step progress indicator */}
        <Card className="shadow-sm overflow-hidden">
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-orange-500 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {STEPS.map(({ step, label, icon: Icon }) => {
                const done = completedStep(step);
                const active = currentStep === step;
                return (
                  <div key={step} className="flex flex-1 flex-col items-center gap-1">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                      done
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : active
                        ? 'border-orange-400 bg-orange-50 text-orange-600 dark:bg-orange-950/30'
                        : 'border-slate-200 bg-slate-50 text-muted-foreground dark:border-slate-700 dark:bg-slate-800'
                    }`}>
                      {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`hidden text-[11px] font-medium sm:block ${active ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
            <CardContent className="space-y-5">

              {/* Step 1: Type */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Complaint Type <span className="text-red-500">*</span></Label>
                  <FieldCheck valid={!!form.type} />
                </div>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.type} onChange={set('type')} required
                >
                  <option value="">Select type…</option>
                  {COMPLAINT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Step 2: Location */}
              <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4 space-y-4 dark:border-blue-900 dark:bg-blue-950/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />Location Details
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>Street Address / Location <span className="text-red-500">*</span></Label>
                      <FieldCheck valid={!!form.location} />
                    </div>
                    <Input placeholder="Street, building, or landmark" value={form.location} onChange={set('location')} required />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>District <span className="text-red-500">*</span></Label>
                      <FieldCheck valid={!!form.district} />
                    </div>
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
              </div>

              {/* Step 3: Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Description <span className="text-red-500">*</span></Label>
                  <div className="flex items-center gap-2">
                    <VoiceInput
                      title="Dictate your complaint"
                      onTranscript={(t) =>
                        setForm((prev) => ({ ...prev, description: `${prev.description ? prev.description + ' ' : ''}${t}`.slice(0, MAX_DESC) }))
                      }
                    />
                    <FieldCheck valid={descLen >= MIN_DESC} />
                    <span className={`text-xs font-medium ${descLen > MAX_DESC ? 'text-red-500' : descLen >= MIN_DESC ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {descLen}/{MAX_DESC}
                    </span>
                  </div>
                </div>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder="Describe the issue in as much detail as possible — what you saw, when it started, how serious it is…"
                  value={form.description}
                  onChange={set('description')}
                  maxLength={MAX_DESC}
                  required
                />
                {touched.has('description') && descLen > 0 && descLen < MIN_DESC && (
                  <p className="text-xs text-amber-600">Please describe in at least {MIN_DESC} characters ({MIN_DESC - descLen} more needed)</p>
                )}
              </div>

              {/* Photo upload (UI only) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Photo Evidence</Label>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">Coming Soon</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
                  <div className="flex items-center gap-2 text-muted-foreground/50">
                    <Camera className="h-6 w-6" />
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Photo upload coming in next update</p>
                  <p className="text-xs text-muted-foreground/70">You will be able to attach up to 3 photos of the issue</p>
                </div>
              </div>

              {/* Step 4: Contact */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <User className="h-3.5 w-3.5" />Your Contact (Optional — Anonymous submissions accepted)
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
                <Link href="/">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={submitting || !form.type || descLen < MIN_DESC || descLen > MAX_DESC || !form.location || !form.district}
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
