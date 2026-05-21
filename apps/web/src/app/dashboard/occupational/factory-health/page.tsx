'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Factory, Printer, Volume2, Thermometer, Wind } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PremisesPhotoAnalyzer } from '@/components/premises-photo-analyzer';
import { SignaturePad } from '@/components/signature-pad';
import { toast } from 'sonner';
import { COLOMBO_FACTORIES, FACTORY_NAMES } from '@/data/colombo-factories';

// Live workplace environment readings — simulated sensor stream (updates live).
function LiveReadings() {
  const [r, setR] = useState({ noise: 82, temp: 31, dust: 0.4 });
  useEffect(() => {
    const t = setInterval(() => setR({
      noise: Math.round((78 + Math.random() * 12) * 10) / 10,
      temp: Math.round((29 + Math.random() * 5) * 10) / 10,
      dust: Math.round((0.2 + Math.random() * 0.8) * 100) / 100,
    }), 3000);
    return () => clearInterval(t);
  }, []);
  const cell = (icon: React.ReactNode, label: string, value: string, danger: boolean) => (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${danger ? 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
      {icon}
      <div><p className={`text-lg font-bold ${danger ? 'text-red-600' : ''}`}>{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>
    </div>
  );
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Live workplace readings</CardTitle><span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> live</span></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        {cell(<Volume2 className="h-7 w-7 text-amber-500" />, 'Noise level', `${r.noise} dB`, r.noise > 90)}
        {cell(<Thermometer className="h-7 w-7 text-orange-500" />, 'Temperature', `${r.temp} °C`, r.temp > 33)}
        {cell(<Wind className="h-7 w-7 text-slate-500" />, 'Respirable dust', `${r.dust} mg/m³`, r.dust > 0.8)}
      </CardContent>
    </Card>
  );
}

const healthSections = [
  {
    title: 'General Environment',
    items: [
      { id: 'ventilation', label: 'Ventilation adequate?', options: ['Good', 'Fair', 'Poor'] },
      { id: 'lighting', label: 'Lighting sufficient?', options: ['Good', 'Fair', 'Poor'] },
      { id: 'noise_level', label: 'Noise level', options: ['<85dB (Safe)', '85-90dB (Risk)', '>90dB (Hazardous)'] },
      { id: 'temperature', label: 'Temperature comfort', options: ['Acceptable', 'Hot', 'Very Hot'] },
      { id: 'dust', label: 'Dust/Fume exposure', options: ['None', 'Mild', 'Moderate', 'Severe'] },
    ]
  },
  {
    title: 'Sanitary Facilities',
    items: [
      { id: 'toilets_count', label: 'Number of toilets', type: 'number' },
      { id: 'toilets_clean', label: 'Toilet cleanliness', options: ['Good', 'Fair', 'Poor'] },
      { id: 'washing_facilities', label: 'Hand washing facilities', options: ['Adequate', 'Inadequate'] },
      { id: 'drinking_water', label: 'Drinking water supply', options: ['Safe & Adequate', 'Safe but Limited', 'Unsafe'] },
      { id: 'canteen', label: 'Canteen/Eating area', options: ['Good', 'Fair', 'Poor', 'None'] },
      { id: 'changing_rooms', label: 'Changing rooms available?', options: ['Yes', 'No'] },
    ]
  },
  {
    title: 'Hazardous Substances',
    items: [
      { id: 'chemicals_used', label: 'Chemicals used?', options: ['Yes', 'No'] },
      { id: 'msds_available', label: 'MSDS available?', options: ['Yes', 'No', 'N/A'] },
      { id: 'storage_proper', label: 'Chemical storage proper?', options: ['Yes', 'No', 'N/A'] },
      { id: 'spill_kits', label: 'Spill kits available?', options: ['Yes', 'No', 'N/A'] },
      { id: 'exposure_monitoring', label: 'Exposure monitoring done?', options: ['Regular', 'Irregular', 'Never'] },
    ]
  },
  {
    title: 'Medical Surveillance',
    items: [
      { id: 'pre_employment', label: 'Pre-employment medicals?', options: ['Yes', 'No'] },
      { id: 'periodic_medicals', label: 'Periodic medical exams?', options: ['Annual', 'Biannual', 'None'] },
      { id: 'first_aid_room', label: 'First aid room?', options: ['Yes - Equipped', 'Yes - Basic', 'No'] },
      { id: 'first_aiders', label: 'Trained first-aiders', type: 'number' },
      { id: 'occupational_diseases', label: 'Occupational diseases reported', type: 'number' },
      { id: 'injuries_year', label: 'Work injuries this year', type: 'number' },
    ]
  },
];

export default function FactoryHealthPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const update = (id: string, val: string) => setValues(prev => ({ ...prev, [id]: val }));
  const [signature, setSignature] = useState<string | null>(null);
  const [fac, setFac] = useState({ name: '', reg: '', scale: 'MEDIUM', workers: '', type: '', address: '' });
  const onFactory = (name: string) => {
    const m = COLOMBO_FACTORIES.find((x) => x.name === name);
    setFac((p) => ({ name, reg: m?.id ?? p.reg, scale: m?.scale ?? p.scale, workers: m ? String(m.workers) : p.workers, type: m?.type ?? p.type, address: m?.address ?? p.address }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/occupational"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Factory className="h-6 w-6 text-occupational" />Factory Health Inspection (H1203)</h1>
            <p className="text-sm text-muted-foreground">Assess workplace health conditions and worker welfare</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button className="bg-occupational hover:bg-occupational/90" onClick={() => { if (!fac.name.trim()) { toast.error('Select the factory.'); return; } toast.success(`H1203 inspection saved for ${fac.name}.`); }}><Save className="mr-2 h-4 w-4" />Submit</Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Factory Name *</Label>
            <Input list="factory-name-list" value={fac.name} onChange={(e) => onFactory(e.target.value)} placeholder="Select or type a factory…" />
            <datalist id="factory-name-list">{FACTORY_NAMES.map((n) => <option key={n} value={n} />)}</datalist>
          </div>
          <div className="space-y-2"><Label>Registration No.</Label><Input value={fac.reg} onChange={(e) => setFac({ ...fac, reg: e.target.value })} placeholder="Reg number" /></div>
          <div className="space-y-2">
            <Label>Factory Scale</Label>
            <select value={fac.scale} onChange={(e) => setFac({ ...fac, scale: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="SMALL">Small (&lt;50 workers)</option><option value="MEDIUM">Medium (50-250)</option><option value="LARGE">Large (250+)</option>
            </select>
          </div>
          <div className="space-y-2"><Label>Total Workers</Label><Input type="number" value={fac.workers} onChange={(e) => setFac({ ...fac, workers: e.target.value })} placeholder="Count" /></div>
          <div className="space-y-2"><Label>Industry Type</Label><Input value={fac.type} onChange={(e) => setFac({ ...fac, type: e.target.value })} placeholder="e.g. Textile, Chemical" /></div>
          <div className="space-y-2"><Label>Inspection Date</Label><Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          <div className="space-y-2"><Label>Address</Label><Input value={fac.address} onChange={(e) => setFac({ ...fac, address: e.target.value })} placeholder="Factory address" /></div>
          <div className="space-y-2"><Label>Contact Person</Label><Input placeholder="Manager name" /></div>
        </CardContent>
      </Card>

      <LiveReadings />

      <PremisesPhotoAnalyzer variant="generic" />

      {healthSections.map((section) => (
        <Card key={section.title}>
          <CardHeader><CardTitle className="text-base">{section.title}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.id} className="grid gap-2 sm:grid-cols-[1fr,200px] items-center">
                  <Label className="text-sm">{item.label}</Label>
                  {'options' in item && item.options ? (
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={values[item.id] || ''} onChange={(e) => update(item.id, e.target.value)}>
                      <option value="">Select...</option>
                      {item.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <Input type={item.type || 'text'} value={values[item.id] || ''} onChange={(e) => update(item.id, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader><CardTitle className="text-base">Recommendations & Follow-up</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Violations / Issues Found</Label><textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="List health violations..." /></div>
          <div className="space-y-2"><Label>Recommendations</Label><textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Improvement actions..." /></div>
          <div className="space-y-2"><Label>Follow-up Date</Label><Input type="date" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Inspecting Officer&apos;s Signature</CardTitle></CardHeader>
        <CardContent>
          <SignaturePad onChange={setSignature} className="max-w-md" />
          <p className="mt-2 text-xs text-muted-foreground">{signature ? 'Signature captured.' : 'Sign before submitting the H1203 report.'}</p>
        </CardContent>
      </Card>
    </div>
  );
}
