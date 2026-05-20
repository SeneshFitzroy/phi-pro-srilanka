'use client';

// ============================================================================
// Public Complaints — five-step flow
//   1. Type        — pick a category
//   2. Location    — address + browser geolocation + interactive map pin
//   3. Details     — voice-input-friendly description + photo + video evidence
//   4. Identity    — NIC number (old or new), NIC photo, live selfie capture
//   5. Submit      — review & file
//
// The identity step is a *presence + format* gate, not biometric matching:
//   - NIC number is validated against the two official Sri Lankan formats
//     (9 digits + V/X for pre-2016, 12 digits for new-format)
//   - The user must capture both an NIC card photo and a live selfie via the
//     device camera. The selfie is taken from a live MediaStream so a static
//     stored image can't be uploaded as a bypass on the same code path.
//   - Real face matching needs a server-side ML model (Azure Face, AWS
//     Rekognition, etc.) — this front-end captures the evidence package that
//     such a service would consume.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import type { LeafletMarker } from '@/components/leaflet-map';
import {
  ArrowLeft, Send, AlertTriangle, CheckCircle, Loader2, Phone, MapPin, FileText,
  User, Check, Camera, Upload, Crosshair, Video, X, ShieldCheck, IdCard, Trash2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VoiceInput } from '@/components/voice-input';
import { FaceIdCapture } from '@/components/face-id-capture';
import { checkPhotoLooksReal } from '@/lib/image-sanity';
import { toast } from 'sonner';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

/* ── reference data ─────────────────────────────────────────────────────── */

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
] as const;

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
] as const;

const MAX_DESC = 500;
const MIN_DESC = 20;
const MAX_PHOTOS = 5;
const MAX_VIDEOS = 2;
const MAX_PHOTO_MB = 10;
const MAX_VIDEO_MB = 50;

/** Old (9 digits + V/X, e.g. 953412345V) or new (12 digits) Sri Lankan NIC. */
const NIC_REGEX = /^(?:\d{9}[VXvx]|\d{12})$/;

const SL_CENTER = { lat: 7.8731, lng: 80.7718, zoom: 7 };

/** Leaflet map rendered client-side only (Leaflet touches `window`). */
const LeafletMap = dynamicImport(() => import('@/components/leaflet-map'), { ssr: false });

/* ── types ──────────────────────────────────────────────────────────────── */

interface MediaItem {
  id: string;
  file: File;
  url: string;
  kind: 'photo' | 'video';
  sizeMb: number;
}

interface FormState {
  type: string;
  description: string;
  location: string;
  district: string;
  gnDivision: string;
  contactName: string;
  contactInfo: string;
  pin: { lat: number; lng: number } | null;
  nicNumber: string;
  nicPhoto: MediaItem | null;
  selfie: MediaItem | null;
  photos: MediaItem[];
  videos: MediaItem[];
}

const EMPTY: FormState = {
  type: '', description: '', location: '', district: '', gnDivision: '',
  contactName: '', contactInfo: '',
  pin: null, nicNumber: '', nicPhoto: null, selfie: null,
  photos: [], videos: [],
};

type Step = 1 | 2 | 3 | 4 | 5;
const STEPS: { step: Step; label: string; icon: React.ElementType }[] = [
  { step: 1, label: 'Type',      icon: FileText },
  { step: 2, label: 'Location',  icon: MapPin },
  { step: 3, label: 'Details',   icon: FileText },
  { step: 4, label: 'Identity',  icon: ShieldCheck },
  { step: 5, label: 'Submit',    icon: Send },
];

/* ── helpers ───────────────────────────────────────────────────────────── */

const mkId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

function fileToMedia(file: File, kind: 'photo' | 'video'): MediaItem {
  return {
    id: mkId(),
    file,
    url: URL.createObjectURL(file),
    kind,
    sizeMb: Math.round((file.size / (1024 * 1024)) * 10) / 10,
  };
}

function FieldCheck({ valid }: { valid: boolean }) {
  return valid ? <Check className="h-4 w-4 shrink-0 text-emerald-500" /> : null;
}

/* ════════════════════════════════════════════════════════════════════════ */

export default function ComplaintsPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [trackId, setTrackId] = useState('');
  const [error, setError] = useState('');
  const [geoState, setGeoState] = useState<'idle' | 'locating' | 'denied' | 'unavailable'>('idle');
  const [voiceWarning, setVoiceWarning] = useState('');

  /* ── object-URL cleanup on unmount ── */
  useEffect(() => {
    return () => {
      [...form.photos, ...form.videos, form.nicPhoto, form.selfie]
        .filter((m): m is MediaItem => Boolean(m))
        .forEach((m) => URL.revokeObjectURL(m.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof FormState>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value } as FormState));
    };

  const descLen = form.description.length;
  const nicValid = NIC_REGEX.test(form.nicNumber.trim());
  const identityComplete = nicValid && Boolean(form.nicPhoto) && Boolean(form.selfie);

  const currentStep: Step = useMemo(() => {
    if (!form.type) return 1;
    if (!form.location || !form.district) return 2;
    if (descLen < MIN_DESC) return 3;
    if (!identityComplete) return 4;
    return 5;
  }, [form.type, form.location, form.district, descLen, identityComplete]);

  const stepDone = (s: Step): boolean => {
    if (s === 1) return Boolean(form.type);
    if (s === 2) return Boolean(form.location) && Boolean(form.district);
    if (s === 3) return descLen >= MIN_DESC;
    if (s === 4) return identityComplete;
    return false;
  };

  /* ── geolocation ─────────────────────────────────────────────────────── */

  const useMyLocation = useCallback(() => {
    if (!('geolocation' in navigator)) { setGeoState('unavailable'); return; }
    setGeoState('locating');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setForm((p) => ({ ...p, pin: { lat, lng } }));
        // Reverse geocode via OSM Nominatim (free, attribution-only). We
        // fill EVERY locatable field: street address, district, and GN
        // (Grama Niladhari) division if Nominatim has the suburb/neighbour
        // hood. Failures are non-fatal — the pin still drops.
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
            { headers: { Accept: 'application/json' } },
          );
          const j = await res.json() as { display_name?: string; address?: Record<string, string> };
          if (j) {
            const a = j.address ?? {};
            // Compact street address — number + road + suburb + city
            const parts = [
              a.house_number,
              a.road || a.pedestrian || a.footway,
              a.suburb || a.neighbourhood || a.village || a.hamlet,
              a.city || a.town,
            ].filter(Boolean);
            const niceLocation = parts.length > 0 ? parts.join(', ') : j.display_name;

            // Sri Lanka district detection — Nominatim labels it in
            // state_district / county / region depending on the area.
            const districtRaw = (a.county || a.state_district || a.region || a.city_district || '').toLowerCase();
            const matchedDistrict = DISTRICTS.find((d) => districtRaw.includes(d.toLowerCase()));

            // GN division hint from suburb / neighbourhood / village
            const gnHint = a.suburb || a.neighbourhood || a.village || '';

            setForm((p) => ({
              ...p,
              location: niceLocation ?? p.location,
              district: matchedDistrict ?? p.district,
              gnDivision: p.gnDivision || gnHint,
            }));
          }
        } catch { /* reverse geocode failure is non-fatal */ }
        setGeoState('idle');
      },
      (err) => setGeoState(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  /* ── media upload ────────────────────────────────────────────────────── */

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    setError('');
    const toAdd: MediaItem[] = [];
    Array.from(files).forEach((f) => {
      if (form.photos.length + toAdd.length >= MAX_PHOTOS) return;
      const mb = f.size / (1024 * 1024);
      if (mb > MAX_PHOTO_MB) { setError(`${f.name} exceeds ${MAX_PHOTO_MB} MB photo limit.`); return; }
      if (!f.type.startsWith('image/')) { setError(`${f.name} is not an image.`); return; }
      toAdd.push(fileToMedia(f, 'photo'));
    });
    setForm((p) => ({ ...p, photos: [...p.photos, ...toAdd] }));
  };

  const addVideos = (files: FileList | null) => {
    if (!files) return;
    setError('');
    const toAdd: MediaItem[] = [];
    Array.from(files).forEach((f) => {
      if (form.videos.length + toAdd.length >= MAX_VIDEOS) return;
      const mb = f.size / (1024 * 1024);
      if (mb > MAX_VIDEO_MB) { setError(`${f.name} exceeds ${MAX_VIDEO_MB} MB video limit.`); return; }
      if (!f.type.startsWith('video/')) { setError(`${f.name} is not a video.`); return; }
      toAdd.push(fileToMedia(f, 'video'));
    });
    setForm((p) => ({ ...p, videos: [...p.videos, ...toAdd] }));
  };

  const removeMedia = (kind: 'photo' | 'video', id: string) => {
    setForm((p) => {
      const list = kind === 'photo' ? p.photos : p.videos;
      const removed = list.find((m) => m.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return kind === 'photo'
        ? { ...p, photos: p.photos.filter((m) => m.id !== id) }
        : { ...p, videos: p.videos.filter((m) => m.id !== id) };
    });
  };

  /* ── submit ──────────────────────────────────────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 5) return;
    setSubmitting(true);
    setError('');

    // Toxicity / spam screening
    let moderation: { source: string; scores: Record<string, number>; flagged: string[] } | null = null;
    try {
      const res = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${form.type} ${form.location} ${form.description}` }),
      });
      const v = (await res.json()) as { allowed: boolean; reason: string | null; source: string; scores: Record<string, number>; flagged: string[] };
      if (!v.allowed) {
        setError(v.reason ?? "Your report contains language we can't accept — please rephrase it factually.");
        setSubmitting(false);
        return;
      }
      moderation = { source: v.source, scores: v.scores, flagged: v.flagged };
    } catch { /* moderation unavailable — fail open */ }

    try {
      const trackingId = 'CMP-' + Date.now().toString().slice(-8);

      // Upload evidence + identity media to Firebase Storage so the receiving
      // PHI office can actually SEE the photos/selfie/NIC card. Each upload is
      // resilient — a failure (e.g. Storage rules) must never block filing, so
      // we keep going and persist whatever URLs we managed to get.
      const ext = (f: File) => (f.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const upload = async (item: MediaItem | null, name: string): Promise<string | null> => {
        if (!item) return null;
        try {
          const r = storageRef(storage, `complaints/${trackingId}/${name}.${ext(item.file)}`);
          await uploadBytes(r, item.file);
          return await getDownloadURL(r);
        } catch (uErr) {
          console.warn('[complaint] media upload failed (non-fatal):', name, uErr);
          return null;
        }
      };

      const [nicPhotoUrl, selfieUrl, photoUrls, videoUrls] = await Promise.all([
        upload(form.nicPhoto, 'nic-card'),
        upload(form.selfie, 'selfie'),
        Promise.all(form.photos.map((m, i) => upload(m, `photo-${i + 1}`))),
        Promise.all(form.videos.map((m, i) => upload(m, `video-${i + 1}`))),
      ]);

      await addDoc(collection(db, 'public_complaints'), {
        trackingId,
        type: form.type,
        description: form.description,
        location: form.location,
        district: form.district,
        gnDivision: form.gnDivision || null,
        pin: form.pin,
        contactName: form.contactName || null,
        contactInfo: form.contactInfo || null,
        identity: {
          nicNumber: form.nicNumber.trim().toUpperCase(),
          nicPhotoName: form.nicPhoto?.file.name ?? null,
          nicPhotoUrl,
          selfieUrl,
          selfieCaptured: Boolean(form.selfie),
        },
        media: {
          photoCount: form.photos.length,
          videoCount: form.videos.length,
          photoNames: form.photos.map((m) => m.file.name),
          videoNames: form.videos.map((m) => m.file.name),
          photoUrls: photoUrls.filter((u): u is string => Boolean(u)),
          videoUrls: videoUrls.filter((u): u is string => Boolean(u)),
        },
        status: 'pending',
        assignedTo: null,
        moderation,
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

  /* ── success screen ─────────────────────────────────────────────────── */
  if (trackId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4 dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="space-y-5 p-8 text-center">
            <div className="flex justify-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-green-500 bg-green-50 shadow-lg dark:bg-green-950/40">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div className="absolute -bottom-1 -right-1 rounded-full bg-green-600 px-2 py-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Filed</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complaint submitted</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your complaint has been recorded and will be assigned to the relevant PHI officer.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking Reference</p>
              <p className="mt-1 font-mono text-3xl font-black text-slate-900 dark:text-white">{trackId}</p>
              <p className="mt-2 text-xs text-muted-foreground">Screenshot this reference to track your complaint</p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
              Expected response within <strong>48 hours</strong>. PHI officers will investigate and follow up if contact was provided.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setTrackId(''); setForm(EMPTY); }}>
                Submit Another
              </Button>
              <Link href="/" className="flex-1"><Button className="w-full">Back to Portal</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── form ───────────────────────────────────────────────────────────── */
  const mapCentre = form.pin ?? SL_CENTER;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-3xl space-y-5 px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/public/portal"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <AlertTriangle className="h-6 w-6 text-orange-500" />Submit a Complaint
            </h1>
            <p className="text-sm text-muted-foreground">Report public health or environmental concerns to your local PHI</p>
          </div>
        </div>

        {/* Step indicator */}
        <Card className="overflow-hidden shadow-sm">
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${((currentStep - 1) / 4) * 100}%` }} />
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {STEPS.map(({ step, label, icon: Icon }) => {
                const done = stepDone(step);
                const active = currentStep === step;
                return (
                  <div key={step} className="flex flex-1 flex-col items-center gap-1">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                      done ? 'border-orange-500 bg-orange-500 text-white'
                           : active ? 'border-orange-400 bg-orange-50 text-orange-600 dark:bg-orange-950/30'
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

        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Complaint Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">

              {/* 1 ── Type ────────────────────────────────────────────── */}
              <section>
                <div className="flex items-center justify-between">
                  <Label>Complaint Type <span className="text-red-500">*</span></Label>
                  <FieldCheck valid={!!form.type} />
                </div>
                <select
                  className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.type} onChange={set('type')} required
                >
                  <option value="">Select type…</option>
                  {COMPLAINT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </section>

              {/* 2 ── Location ────────────────────────────────────────── */}
              <section className="space-y-4 rounded-lg border border-blue-100 bg-blue-50/40 p-4 dark:border-blue-900 dark:bg-blue-950/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                    <MapPin className="h-3.5 w-3.5" />Location Details
                  </p>
                  <Button
                    type="button" variant="outline" size="sm"
                    onClick={useMyLocation} disabled={geoState === 'locating'}
                    className="h-8 gap-1.5"
                  >
                    {geoState === 'locating' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
                    {geoState === 'locating' ? 'Locating…' : 'Use my location'}
                  </Button>
                </div>

                {geoState === 'denied' && (
                  <p className="text-xs text-red-600">
                    Location permission denied — enable it in your browser settings or type the address manually.
                  </p>
                )}
                {geoState === 'unavailable' && (
                  <p className="text-xs text-red-600">Couldn&apos;t read your location — type it manually below.</p>
                )}

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
                      {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>GN Division <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input placeholder="Grama Niladhari Division, if known" value={form.gnDivision} onChange={set('gnDivision')} />
                </div>

                {/* Interactive map — click to place pin */}
                <div className="space-y-1.5">
                  <Label className="flex items-center justify-between">
                    <span>Drop a pin on the map</span>
                    {form.pin && (
                      <button type="button" onClick={() => setForm((p) => ({ ...p, pin: null }))}
                        className="text-[11px] font-semibold text-rose-600 hover:underline">
                        Clear pin
                      </button>
                    )}
                  </Label>
                  <LeafletMap
                    height="18rem"
                    centre={mapCentre}
                    zoom={form.pin ? 16 : SL_CENTER.zoom}
                    onMapClick={(pos) => setForm((p) => ({ ...p, pin: pos }))}
                    markers={
                      form.pin
                        ? ([
                            {
                              id: 'complaint-pin',
                              position: form.pin,
                              color: 'rose',
                              draggable: true,
                              onDragEnd: (pos) => setForm((p) => ({ ...p, pin: pos })),
                            },
                          ] satisfies LeafletMarker[])
                        : []
                    }
                  />
                  {form.pin && (
                    <p className="text-[11px] text-slate-500">
                      Pinned at {form.pin.lat.toFixed(5)}, {form.pin.lng.toFixed(5)} · drag the pin to refine.
                    </p>
                  )}
                </div>
              </section>

              {/* 3 ── Details ─────────────────────────────────────────── */}
              <section className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Description <span className="text-red-500">*</span></Label>
                    <div className="flex items-center gap-2">
                      <VoiceInput
                        title="Dictate your complaint"
                        onTranscript={(t) => {
                          setVoiceWarning('');
                          setForm((prev) => ({ ...prev, description: `${prev.description ? prev.description + ' ' : ''}${t}`.slice(0, MAX_DESC) }));
                        }}
                      />
                      <FieldCheck valid={descLen >= MIN_DESC} />
                      <span className={`text-xs font-medium ${descLen > MAX_DESC ? 'text-red-500' : descLen >= MIN_DESC ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {descLen}/{MAX_DESC}
                      </span>
                    </div>
                  </div>
                  <textarea
                    className="flex min-h-[120px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Describe the issue in as much detail as possible — what you saw, when it started, how serious it is…"
                    value={form.description} onChange={set('description')} maxLength={MAX_DESC} required
                  />
                  {descLen > 0 && descLen < MIN_DESC && (
                    <p className="text-xs text-amber-600">Please describe in at least {MIN_DESC} characters ({MIN_DESC - descLen} more needed)</p>
                  )}
                  {voiceWarning && (
                    <p className="flex items-center gap-1 text-xs text-amber-700">
                      <RefreshCw className="h-3 w-3" /> {voiceWarning}
                    </p>
                  )}
                </div>

                {/* Photo evidence */}
                <MediaUploader
                  kind="photo"
                  accept="image/*"
                  max={MAX_PHOTOS}
                  items={form.photos}
                  onAdd={addPhotos}
                  onRemove={(id) => removeMedia('photo', id)}
                  maxMb={MAX_PHOTO_MB}
                />

                {/* Video evidence */}
                <MediaUploader
                  kind="video"
                  accept="video/*"
                  max={MAX_VIDEOS}
                  items={form.videos}
                  onAdd={addVideos}
                  onRemove={(id) => removeMedia('video', id)}
                  maxMb={MAX_VIDEO_MB}
                />
              </section>

              {/* 4 ── Identity (NIC + selfie) ─────────────────────────── */}
              <section className="space-y-4 rounded-lg border-2 border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900 dark:bg-emerald-950/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" />Identity Verification (required)
                  </p>
                  {identityComplete && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Check className="h-3 w-3" /> Verified package ready
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
                  To prevent abuse of the complaints portal we collect your Sri Lankan NIC number, a photo of the
                  card and a live selfie. Your identity details are encrypted in transit and only seen by the
                  receiving PHI office — never shown to the public.
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>NIC Number <span className="text-red-500">*</span></Label>
                    <FieldCheck valid={nicValid} />
                  </div>
                  <Input
                    placeholder="e.g. 953412345V  or  200012345678"
                    value={form.nicNumber}
                    onChange={(e) => setForm((p) => ({ ...p, nicNumber: e.target.value.toUpperCase() }))}
                    aria-invalid={form.nicNumber.length > 0 && !nicValid}
                    className={`${form.nicNumber.length > 0 && !nicValid ? 'border-red-300' : ''}`}
                  />
                  {form.nicNumber.length > 0 && !nicValid && (
                    <p className="text-xs text-rose-600">Use the old format (9 digits + V/X) or the new 12-digit format.</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <NicPhotoCapture
                    item={form.nicPhoto}
                    onCapture={async (file) => {
                      // Client-side sanity check before we accept the upload.
                      // Catches blank canvas / all-black / single-colour fills /
                      // tiny screenshots. The receiving PHI office still does
                      // a manual review, but this stops the worst rubbish.
                      const v = await checkPhotoLooksReal(file);
                      if (!v.ok) {
                        toast.error(v.reason ?? 'Please retake the NIC photo.');
                        return;
                      }
                      if (form.nicPhoto) URL.revokeObjectURL(form.nicPhoto.url);
                      setForm((p) => ({ ...p, nicPhoto: fileToMedia(file, 'photo') }));
                      toast.success('NIC card photo accepted.');
                    }}
                    onClear={() => {
                      if (form.nicPhoto) URL.revokeObjectURL(form.nicPhoto.url);
                      setForm((p) => ({ ...p, nicPhoto: null }));
                    }}
                  />
                  <FaceIdCapture
                    heading="Live selfie (Face-ID style)"
                    item={form.selfie}
                    onCapture={(file) => {
                      if (form.selfie) URL.revokeObjectURL(form.selfie.url);
                      setForm((p) => ({ ...p, selfie: fileToMedia(file, 'photo') }));
                    }}
                    onClear={() => {
                      if (form.selfie) URL.revokeObjectURL(form.selfie.url);
                      setForm((p) => ({ ...p, selfie: null }));
                    }}
                  />
                </div>
              </section>

              {/* 5 ── Optional public contact ─────────────────────────── */}
              <section className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <User className="h-3.5 w-3.5" />Optional follow-up contact
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
              </section>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <Link href="/public/portal"><Button variant="outline" type="button">Cancel</Button></Link>
                <Button
                  type="submit"
                  disabled={submitting || currentStep !== 5}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {submitting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
                    : <><Send className="mr-2 h-4 w-4" />Submit Complaint</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

/* ──────────────── Sub-components ──────────────── */

function MediaUploader({
  kind, accept, max, items, onAdd, onRemove, maxMb,
}: {
  kind: 'photo' | 'video';
  accept: string;
  max: number;
  items: MediaItem[];
  onAdd: (files: FileList | null) => void;
  onRemove: (id: string) => void;
  maxMb: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const captureRef = useRef<HTMLInputElement | null>(null);
  const Icon = kind === 'photo' ? Camera : Video;
  const heading = kind === 'photo' ? 'Photo evidence' : 'Video evidence';
  const remaining = max - items.length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{heading} <span className="text-xs text-muted-foreground">(optional, up to {max})</span></Label>
        <span className="text-[11px] text-slate-500">{items.length}/{max} · ≤ {maxMb} MB each</span>
      </div>
      <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={remaining <= 0} onClick={() => inputRef.current?.click()}>
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload {kind}{kind === 'photo' ? 's' : ''}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={remaining <= 0} onClick={() => captureRef.current?.click()}>
            <Icon className="mr-1.5 h-3.5 w-3.5" /> Capture with camera
          </Button>
        </div>
        <input
          ref={inputRef} type="file" accept={accept} multiple className="hidden"
          onChange={(e) => { onAdd(e.target.files); e.target.value = ''; }}
        />
        <input
          ref={captureRef} type="file" accept={accept} capture="environment" className="hidden"
          onChange={(e) => { onAdd(e.target.files); e.target.value = ''; }}
        />

        {items.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((m) => (
              <div key={m.id} className="group relative overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                {m.kind === 'photo'
                  // eslint-disable-next-line @next/next/no-img-element -- blob: preview, next/image can't optimize it
                  ? <img src={m.url} alt={m.file.name} className="h-24 w-full object-cover" />
                  : <video src={m.url} className="h-24 w-full object-cover" muted />}
                <button
                  type="button" onClick={() => onRemove(m.id)}
                  aria-label="Remove"
                  className="absolute right-1 top-1 rounded-full bg-slate-900/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="truncate px-2 py-1 text-[10px] text-slate-600 dark:text-slate-300">
                  {m.file.name} · {m.sizeMb} MB
                </div>
              </div>
            ))}
          </div>
        )}
        {items.length === 0 && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {kind === 'photo' ? 'Photos help the PHI identify the premises faster.' : 'Short clips show ongoing issues that photos can\'t capture.'}
          </p>
        )}
      </div>
    </div>
  );
}

function NicPhotoCapture({ item, onCapture, onClear }: {
  item: MediaItem | null;
  onCapture: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-3 dark:border-emerald-900 dark:bg-slate-900">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        <IdCard className="h-3.5 w-3.5" /> NIC card photo
      </p>
      <div className="mt-2 aspect-[1.6/1] w-full overflow-hidden rounded border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        {item ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob: preview, next/image can't optimize it
          <img src={item.url} alt="NIC card" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-slate-400">No card photo yet</div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onCapture(f); e.target.value = ''; }} />
      <div className="mt-2 flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="flex-1">
          <Camera className="mr-1.5 h-3.5 w-3.5" /> {item ? 'Retake' : 'Capture card'}
        </Button>
        {item && (
          <Button type="button" variant="outline" size="sm" onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
          </Button>
        )}
      </div>
    </div>
  );
}

