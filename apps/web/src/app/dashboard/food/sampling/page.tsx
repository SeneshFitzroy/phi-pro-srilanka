'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, FlaskConical, Clock, CheckCircle, AlertTriangle, MapPin, Phone, Camera, Video, X, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { KNOWN_PREMISES, type KnownPremises } from '@/data/food-premises';

interface SampleRow {
  id: string;
  premises: string;
  address: string;
  phone: string;
  type: string;
  collectedDate: string;
  sentToMRI: string;
  result: 'PASS' | 'FAIL' | 'Pending' | '—';
  status: string;
  media?: number;
}

const initialSamples: SampleRow[] = [
  { id: 'S-2026-001', premises: 'Cinnamon Grand Colombo',  address: '77 Galle Rd, Colombo 03',           phone: '+94 11 243 7437', type: 'Cooked Rice',  collectedDate: '2026-02-25', sentToMRI: '2026-02-26', result: 'PASS',    status: 'Completed' },
  { id: 'S-2026-002', premises: 'Perera & Sons Bakery',    address: '356 Galle Rd, Colombo 03',          phone: '+94 11 250 0500', type: 'Bread',        collectedDate: '2026-02-22', sentToMRI: '2026-02-23', result: 'FAIL',    status: 'Action Required' },
  { id: 'S-2026-003', premises: 'Cargills Food City',      address: '110 High Level Rd, Nugegoda',       phone: '+94 11 244 8888', type: 'Milk',         collectedDate: '2026-02-20', sentToMRI: '2026-02-21', result: 'Pending', status: 'Awaiting Results' },
  { id: 'S-2026-004', premises: 'Pedlar\'s Inn Cafe',      address: 'Pedlar St, Galle Fort',             phone: '+94 91 222 5333', type: 'Curry Paste',  collectedDate: '2026-02-18', sentToMRI: '2026-02-19', result: 'PASS',    status: 'Completed' },
  { id: 'S-2026-005', premises: 'Pilawoos Express',        address: '417 Galle Rd, Colombo 04',          phone: '+94 11 250 5050', type: 'Fried Rice',   collectedDate: '2026-02-14', sentToMRI: '—',          result: '—',       status: 'Pending MRI Submission' },
];

export default function FoodSamplingPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [samples, setSamples] = useState<SampleRow[]>(initialSamples);
  const [media, setMedia] = useState<{ id: string; url: string; kind: 'photo' | 'video' }[]>([]);
  const photoInput = useRef<HTMLInputElement | null>(null);
  const videoInput = useRef<HTMLInputElement | null>(null);

  const addMedia = (files: FileList | null, kind: 'photo' | 'video') => {
    if (!files) return;
    const items = Array.from(files).map((f) => ({ id: `${Date.now()}-${Math.random()}`, url: URL.createObjectURL(f), kind }));
    setMedia((prev) => [...prev, ...items]);
  };
  const removeMedia = (id: string) => setMedia((prev) => { const m = prev.find((x) => x.id === id); if (m) URL.revokeObjectURL(m.url); return prev.filter((x) => x.id !== id); });

  const [form, setForm] = useState({
    premises: '',
    address: '',
    phone: '',
    foodItem: '',
    quantity: '',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    temp: '',
    reason: 'Routine Surveillance',
    notes: '',
  });

  const applyKnownPremises = useCallback((p: KnownPremises) => {
    setForm((prev) => ({ ...prev, premises: p.premisesName, address: p.address, phone: p.phone }));
    toast.success(`Auto-filled from registry: ${p.premisesName}`);
  }, []);

  const onPremisesChange = (value: string) => {
    setForm((prev) => ({ ...prev, premises: value }));
    const exact = KNOWN_PREMISES.find((p) => p.premisesName === value);
    if (exact) applyKnownPremises(exact);
  };

  const onSave = () => {
    if (!form.premises.trim() || !form.foodItem.trim()) {
      toast.error('Premises and food item are required');
      return;
    }
    const nextId = `S-${new Date().getFullYear()}-${String(samples.length + 1).padStart(3, '0')}`;
    const newRow: SampleRow = {
      id: nextId,
      premises: form.premises,
      address: form.address || '—',
      phone: form.phone || '—',
      type: form.foodItem,
      collectedDate: form.date,
      sentToMRI: '—',
      result: 'Pending',
      status: 'Pending MRI Submission',
      media: media.length,
    };
    setSamples((prev) => [newRow, ...prev]);
    toast.success(`Sample ${nextId} saved${media.length ? ` with ${media.length} attachment${media.length === 1 ? '' : 's'}` : ''} — sync to MRI when online`);
    setShowForm(false);
    media.forEach((m) => URL.revokeObjectURL(m.url));
    setMedia([]);
    setForm((prev) => ({ ...prev, premises: '', address: '', phone: '', foodItem: '', quantity: '', temp: '', notes: '' }));
  };

  const filtered = samples.filter((s) =>
    [s.id, s.premises, s.type].some((f) => f.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/food"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">Food Sampling (H802)</h1>
            <p className="text-sm text-muted-foreground">Collect food samples and track MRI lab results</p>
          </div>
        </div>
        <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> New Sample
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3 p-4"><FlaskConical className="h-8 w-8 text-emerald-700" /><div><p className="text-2xl font-bold">{samples.length}</p><p className="text-xs text-muted-foreground">Total samples</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{samples.filter(s => s.result === 'PASS').length}</p><p className="text-xs text-muted-foreground">Passed</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><AlertTriangle className="h-8 w-8 text-red-500" /><div><p className="text-2xl font-bold">{samples.filter(s => s.result === 'FAIL').length}</p><p className="text-xs text-muted-foreground">Failed</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><Clock className="h-8 w-8 text-amber-500" /><div><p className="text-2xl font-bold">{samples.filter(s => s.result === 'Pending' || s.result === '—').length}</p><p className="text-xs text-muted-foreground">Pending</p></div></CardContent></Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New food sample collection</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="samp-premises">
                  Premises *
                  <span className="ml-2 text-[10px] font-normal text-muted-foreground">type to search</span>
                </Label>
                <Input
                  id="samp-premises"
                  list="known-premises-list-samp"
                  value={form.premises}
                  onChange={(e) => onPremisesChange(e.target.value)}
                  placeholder="e.g., Cinnamon Grand Colombo"
                />
                <datalist id="known-premises-list-samp">
                  {KNOWN_PREMISES.map((p) => (
                    <option key={p.registrationNo} value={p.premisesName}>{p.address}</option>
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Auto-filled from premises" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Auto-filled from premises" />
              </div>
              <div className="space-y-2">
                <Label>Food item *</Label>
                <Input value={form.foodItem} onChange={(e) => setForm((f) => ({ ...f, foodItem: e.target.value }))} placeholder="e.g., Cooked rice, Milk, Bread" />
              </div>
              <div className="space-y-2">
                <Label>Sample quantity</Label>
                <Input value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} placeholder="e.g., 500 g" />
              </div>
              <div className="space-y-2">
                <Label>Storage temp (°C)</Label>
                <Input type="number" value={form.temp} onChange={(e) => setForm((f) => ({ ...f, temp: e.target.value }))} placeholder="Temperature at collection" />
              </div>
              <div className="space-y-2">
                <Label>Collection date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Collection time</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Reason for sampling</Label>
                <select
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>Routine Surveillance</option>
                  <option>Complaint Investigation</option>
                  <option>Re-sampling (Failed)</option>
                  <option>Special Campaign</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Additional observations" />
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label>Sample photos / videos <span className="text-[10px] font-normal text-muted-foreground">capture live or upload</span></Label>
                <div className="rounded-lg border-2 border-dashed border-slate-200 p-3 dark:border-slate-700">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => photoInput.current?.click()}><Camera className="mr-1.5 h-3.5 w-3.5" /> Photo</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => videoInput.current?.click()}><Video className="mr-1.5 h-3.5 w-3.5" /> Video</Button>
                    <input ref={photoInput} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => { addMedia(e.target.files, 'photo'); e.target.value = ''; }} />
                    <input ref={videoInput} type="file" accept="video/*" capture="environment" className="hidden" onChange={(e) => { addMedia(e.target.files, 'video'); e.target.value = ''; }} />
                  </div>
                  {media.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {media.map((m) => (
                        <div key={m.id} className="group relative overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
                          {m.kind === 'photo'
                            // eslint-disable-next-line @next/next/no-img-element -- blob: preview
                            ? <img src={m.url} alt="sample" className="h-20 w-full object-cover" />
                            : <video src={m.url} className="h-20 w-full object-cover" muted />}
                          <button type="button" onClick={() => removeMedia(m.id)} className="absolute right-1 top-1 rounded-full bg-slate-900/80 p-1 text-white"><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-end gap-2 lg:col-span-3">
                <Button className="bg-emerald-700 hover:bg-emerald-800 flex-1" onClick={onSave}>Save sample</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sample records</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search samples…" className="w-64 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4 font-semibold">Sample ID</th>
                  <th className="pb-3 pr-4 font-semibold">Premises</th>
                  <th className="pb-3 pr-4 font-semibold">Food item</th>
                  <th className="pb-3 pr-4 font-semibold">Collected</th>
                  <th className="pb-3 pr-4 font-semibold">Sent to MRI</th>
                  <th className="pb-3 pr-4 font-semibold">Result</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.premises}, ${s.address}, Sri Lanka`)}`;
                  return (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-accent/50">
                      <td className="py-3 pr-4 font-mono text-xs">{s.id}</td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{s.premises}</p>
                        <p className="text-[11px] text-muted-foreground">{s.address}</p>
                      </td>
                      <td className="py-3 pr-4">{s.type}{s.media ? <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"><ImageIcon className="h-2.5 w-2.5" />{s.media}</span> : null}</td>
                      <td className="py-3 pr-4">{s.collectedDate}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{s.sentToMRI}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded px-2 py-0.5 text-xs font-bold ${s.result === 'PASS' ? 'bg-green-100 text-green-700' : s.result === 'FAIL' ? 'bg-red-100 text-red-700' : 'text-muted-foreground'}`}>{s.result}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-[11px] font-bold ${s.status === 'Completed' ? 'text-green-600' : s.status === 'Action Required' ? 'text-red-600' : 'text-amber-600'}`}>{s.status}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          {s.phone !== '—' && (
                            <a href={`tel:${s.phone.replace(/\s/g, '')}`} title={s.phone} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300">
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <a href={mapsHref} target="_blank" rel="noopener noreferrer" title="Open in Google Maps" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300">
                            <MapPin className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
