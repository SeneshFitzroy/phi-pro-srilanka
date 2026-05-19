'use client';

// Shop verification bundle for the public payments page — the citizen must
// produce the same proof-of-identity package that the complaints flow already
// requires, plus a short live video and photos of the shop. Each capture is
// either taken on-device (camera) or uploaded from the gallery, and the
// composite result is reported back through `onChange`.

import { useEffect, useRef, useState } from 'react';
import { Camera, IdCard, ShieldCheck, Trash2, Upload, Video, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FaceIdCapture } from '@/components/face-id-capture';
import { checkPhotoLooksReal } from '@/lib/image-sanity';

export interface ShopVerificationData {
  shopVideo: { name: string; sizeMb: string; url: string; file: File } | null;
  shopPhotos: { id: string; name: string; sizeMb: string; url: string; file: File }[];
  nicPhoto: { id: string; name: string; sizeMb: string; url: string; file: File } | null;
  selfie:   { id: string; name: string; sizeMb: string; url: string; file: File } | null;
}

const EMPTY: ShopVerificationData = { shopVideo: null, shopPhotos: [], nicPhoto: null, selfie: null };
const MAX_PHOTOS = 4;
const MAX_VIDEO_MB = 25;
const MAX_PHOTO_MB = 8;

type Media = ShopVerificationData['shopPhotos'][number];

function fileToMedia(file: File): Media {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    sizeMb: (file.size / (1024 * 1024)).toFixed(1),
    url: URL.createObjectURL(file),
    file,
  };
}

export function ShopVerificationBundle({ onChange }: { onChange: (data: ShopVerificationData) => void }) {
  const [data, setData] = useState<ShopVerificationData>(EMPTY);
  const [error, setError] = useState('');

  // Bubble every state change up to the parent
  useEffect(() => { onChange(data); }, [data, onChange]);

  // Revoke all object URLs on unmount to avoid leaks
  useEffect(() => () => {
    if (data.shopVideo) URL.revokeObjectURL(data.shopVideo.url);
    data.shopPhotos.forEach((p) => URL.revokeObjectURL(p.url));
    if (data.nicPhoto) URL.revokeObjectURL(data.nicPhoto.url);
    if (data.selfie) URL.revokeObjectURL(data.selfie.url);
    // intentionally empty deps — only run on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shop video
  const onVideo = (file: File | null) => {
    setError('');
    if (!file) return;
    const mb = file.size / (1024 * 1024);
    if (mb > MAX_VIDEO_MB) { setError(`Video exceeds ${MAX_VIDEO_MB} MB limit.`); return; }
    if (!file.type.startsWith('video/')) { setError('Please choose a video file.'); return; }
    setData((d) => {
      if (d.shopVideo) URL.revokeObjectURL(d.shopVideo.url);
      return { ...d, shopVideo: fileToMedia(file) };
    });
  };
  const clearVideo = () => setData((d) => {
    if (d.shopVideo) URL.revokeObjectURL(d.shopVideo.url);
    return { ...d, shopVideo: null };
  });

  // Shop photos
  const onPhotos = (files: FileList | null) => {
    setError('');
    if (!files) return;
    const toAdd: Media[] = [];
    for (const f of Array.from(files)) {
      if (data.shopPhotos.length + toAdd.length >= MAX_PHOTOS) break;
      const mb = f.size / (1024 * 1024);
      if (mb > MAX_PHOTO_MB) { setError(`${f.name} exceeds ${MAX_PHOTO_MB} MB photo limit.`); continue; }
      if (!f.type.startsWith('image/')) { setError(`${f.name} is not an image.`); continue; }
      toAdd.push(fileToMedia(f));
    }
    setData((d) => ({ ...d, shopPhotos: [...d.shopPhotos, ...toAdd] }));
  };
  const removePhoto = (id: string) => setData((d) => {
    const target = d.shopPhotos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.url);
    return { ...d, shopPhotos: d.shopPhotos.filter((p) => p.id !== id) };
  });

  // NIC photo — runs a client-side sanity check before accepting it so we
  // don't capture a blank / black / single-colour frame.
  const onNic = async (file: File | null) => {
    if (!file) return;
    const v = await checkPhotoLooksReal(file);
    if (!v.ok) { setError(v.reason ?? 'Please retake the NIC card photo.'); return; }
    setError('');
    setData((d) => {
      if (d.nicPhoto) URL.revokeObjectURL(d.nicPhoto.url);
      return { ...d, nicPhoto: fileToMedia(file) };
    });
  };
  const clearNic = () => setData((d) => {
    if (d.nicPhoto) URL.revokeObjectURL(d.nicPhoto.url);
    return { ...d, nicPhoto: null };
  });

  // Selfie via live camera
  const onSelfie = (file: File) => {
    setData((d) => {
      if (d.selfie) URL.revokeObjectURL(d.selfie.url);
      return { ...d, selfie: fileToMedia(file) };
    });
  };
  const clearSelfie = () => setData((d) => {
    if (d.selfie) URL.revokeObjectURL(d.selfie.url);
    return { ...d, selfie: null };
  });

  const complete = Boolean(data.shopVideo && data.shopPhotos.length > 0 && data.nicPhoto && data.selfie);

  return (
    <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" /> Shop &amp; identity verification
        </p>
        {complete && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Check className="h-3 w-3" /> Verified bundle ready
          </span>
        )}
      </div>
      <p className="text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-200/80">
        To prevent payment fraud and verify the premises is real, please attach:
        (1) a short walk-through video of the shop, (2) photos of the fixed shop front,
        (3) the owner&apos;s NIC card, (4) a live selfie of the owner. The bundle is encrypted in
        transit and only opened by the receiving MOH office.
      </p>

      {/* 1. SHOP VIDEO */}
      <ShopVideoCapture item={data.shopVideo} onCapture={onVideo} onClear={clearVideo} />

      {/* 2. SHOP PHOTOS */}
      <ShopPhotosCapture items={data.shopPhotos} onAdd={onPhotos} onRemove={removePhoto} />

      {/* 3. NIC + 4. Selfie (Apple-style multi-step face verification) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <NicPhotoCapture item={data.nicPhoto} onCapture={onNic} onClear={clearNic} />
        <FaceIdCapture
          heading="4. Live owner selfie"
          item={data.selfie}
          onCapture={onSelfie}
          onClear={clearSelfie}
        />
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

/* ─── shop video ─────────────────────────────────────────────────────── */

function ShopVideoCapture({ item, onCapture, onClear }: {
  item: ShopVerificationData['shopVideo'];
  onCapture: (f: File | null) => void;
  onClear: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const captureRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="rounded-md border border-emerald-200 bg-white p-3 dark:border-emerald-900 dark:bg-slate-900">
      <Label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        <Video className="h-3.5 w-3.5" /> 1. Fixed shop walk-through video <span className="text-red-500">*</span>
      </Label>
      <p className="mt-1 text-[11px] text-muted-foreground">A 5–15s clip showing the actual shop front + interior. Max {MAX_VIDEO_MB} MB.</p>
      <div className="mt-2 aspect-video w-full overflow-hidden rounded border border-dashed border-slate-300 bg-slate-900 dark:border-slate-700">
        {item ? <video src={item.url} controls className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[11px] text-slate-300">No shop video yet</div>}
      </div>
      <input ref={fileRef}    type="file" accept="video/*"                    className="hidden" onChange={(e) => { onCapture(e.target.files?.[0] ?? null); e.target.value = ''; }} />
      <input ref={captureRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={(e) => { onCapture(e.target.files?.[0] ?? null); e.target.value = ''; }} />
      <div className="mt-2 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload className="mr-1.5 h-3.5 w-3.5" /> {item ? 'Replace' : 'Upload video'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => captureRef.current?.click()}>
          <Video className="mr-1.5 h-3.5 w-3.5" /> Record now
        </Button>
        {item && (
          <Button type="button" variant="outline" size="sm" onClick={onClear} title="Remove">
            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
          </Button>
        )}
        {item && <span className="text-[11px] text-slate-500">{item.name} · {item.sizeMb} MB</span>}
      </div>
    </div>
  );
}

/* ─── shop photos ────────────────────────────────────────────────────── */

function ShopPhotosCapture({ items, onAdd, onRemove }: {
  items: ShopVerificationData['shopPhotos'];
  onAdd: (files: FileList | null) => void;
  onRemove: (id: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const captureRef = useRef<HTMLInputElement | null>(null);
  const remaining = MAX_PHOTOS - items.length;
  return (
    <div className="rounded-md border border-emerald-200 bg-white p-3 dark:border-emerald-900 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          <Camera className="h-3.5 w-3.5" /> 2. Shop front / interior photos <span className="text-red-500">*</span>
        </Label>
        <span className="text-[11px] text-slate-500">{items.length}/{MAX_PHOTOS} · ≤ {MAX_PHOTO_MB} MB each</span>
      </div>
      <input ref={fileRef}    type="file" accept="image/*" multiple                       className="hidden" onChange={(e) => { onAdd(e.target.files); e.target.value = ''; }} />
      <input ref={captureRef} type="file" accept="image/*"          capture="environment" className="hidden" onChange={(e) => { onAdd(e.target.files); e.target.value = ''; }} />
      <div className="mt-2 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={remaining <= 0} onClick={() => fileRef.current?.click()}>
          <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload photos
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={remaining <= 0} onClick={() => captureRef.current?.click()}>
          <Camera className="mr-1.5 h-3.5 w-3.5" /> Capture with camera
        </Button>
      </div>
      {items.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded border border-slate-200 dark:border-slate-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.name} className="h-20 w-full object-cover" />
              <button type="button" onClick={() => onRemove(p.id)} aria-label={`Remove ${p.name}`} className="absolute right-1 top-1 rounded-full bg-slate-900/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── NIC card (camera or upload) ────────────────────────────────────── */

function NicPhotoCapture({ item, onCapture, onClear }: {
  item: ShopVerificationData['nicPhoto'];
  onCapture: (file: File | null) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-3 dark:border-emerald-900 dark:bg-slate-900">
      <Label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        <IdCard className="h-3.5 w-3.5" /> 3. Owner&apos;s NIC card photo <span className="text-red-500">*</span>
      </Label>
      <div className="mt-2 aspect-[1.6/1] w-full overflow-hidden rounded border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        {item ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="NIC card" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-slate-400">No card photo yet</div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { onCapture(e.target.files?.[0] ?? null); e.target.value = ''; }} />
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

