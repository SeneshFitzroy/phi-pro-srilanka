'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Users, Plus, Trash2, Camera, IdCard, ScanEye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FACTORY_NAMES } from '@/data/colombo-factories';

interface WorkerRecord {
  id: number;
  name: string;
  age: string;
  gender: string;
  section: string;
  yearsEmployed: string;
  healthIssues: string;
  ppeCompliant: boolean;
  lastMedical: string;
  nic: string;
  photo?: string;
  nicPhoto?: string;
  eyeScan?: string;
}

const blankWorker = (id: number): WorkerRecord => ({ id, name: '', age: '', gender: 'M', section: '', yearsEmployed: '', healthIssues: '', ppeCompliant: true, lastMedical: '', nic: '' });

export default function WorkerSurveyPage() {
  const [records, setRecords] = useState<WorkerRecord[]>([blankWorker(1)]);

  const addRecord = () => setRecords(prev => [...prev, blankWorker(Date.now())]);
  const removeRecord = (id: number) => setRecords(prev => prev.filter(r => r.id !== id));
  const updateRecord = (id: number, field: keyof WorkerRecord, value: string | boolean) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };
  const setMedia = (id: number, key: 'photo' | 'nicPhoto' | 'eyeScan', file: File) =>
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [key]: URL.createObjectURL(file) } : r));
  const save = () => {
    const named = records.filter((r) => r.name.trim());
    if (named.length === 0) { toast.error('Add at least one worker with a name.'); return; }
    toast.success(`Saved ${named.length} worker health record${named.length === 1 ? '' : 's'}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/occupational"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-orange-500" />Worker Health Survey (H1205)</h1>
            <p className="text-sm text-muted-foreground">Individual worker health assessment records</p>
          </div>
        </div>
        <Button className="bg-occupational hover:bg-occupational/90" onClick={save}><Save className="mr-2 h-4 w-4" />Save Survey</Button>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Factory Name *</Label>
            <Input list="ws-factory-list" placeholder="Select or type a factory…" />
            <datalist id="ws-factory-list">{FACTORY_NAMES.map((n) => <option key={n} value={n} />)}</datalist>
          </div>
          <div className="space-y-2"><Label>Survey Date</Label><Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          <div className="space-y-2"><Label>PHI Officer</Label><Input placeholder="Your name" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Worker Records ({records.length})</CardTitle>
          <Button size="sm" onClick={addRecord}><Plus className="mr-1 h-4 w-4" />Add Worker</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((r, idx) => (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Worker #{idx + 1}</span>
                  {records.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeRecord(r.id)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1"><Label className="text-xs">Worker Name</Label><Input value={r.name} onChange={(e) => updateRecord(r.id, 'name', e.target.value)} placeholder="Full name" /></div>
                  <div className="space-y-1"><Label className="text-xs">Age</Label><Input type="number" value={r.age} onChange={(e) => updateRecord(r.id, 'age', e.target.value)} /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">Gender</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.gender} onChange={(e) => updateRecord(r.id, 'gender', e.target.value)}><option value="M">Male</option><option value="F">Female</option></select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Section / Department</Label><Input value={r.section} onChange={(e) => updateRecord(r.id, 'section', e.target.value)} placeholder="e.g. Assembly" /></div>
                  <div className="space-y-1"><Label className="text-xs">Years Employed</Label><Input type="number" value={r.yearsEmployed} onChange={(e) => updateRecord(r.id, 'yearsEmployed', e.target.value)} /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">Health Issues</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.healthIssues} onChange={(e) => updateRecord(r.id, 'healthIssues', e.target.value)}>
                      <option value="">None</option><option>Respiratory</option><option>Skin Condition</option><option>Hearing Loss</option><option>Musculoskeletal</option><option>Eye Strain</option><option>Chemical Exposure</option><option>Fatigue/Stress</option><option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">PPE Compliant</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.ppeCompliant ? 'yes' : 'no'} onChange={(e) => updateRecord(r.id, 'ppeCompliant', e.target.value === 'yes')}>
                      <option value="yes">Yes</option><option value="no">No</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Last Medical Exam</Label><Input type="date" value={r.lastMedical} onChange={(e) => updateRecord(r.id, 'lastMedical', e.target.value)} /></div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1"><Label className="text-xs">NIC Number</Label><Input value={r.nic} onChange={(e) => updateRecord(r.id, 'nic', e.target.value.toUpperCase())} placeholder="e.g. 199012345678" /></div>
                  <MediaCapture label="Worker photo" icon={<Camera className="h-3 w-3" />} value={r.photo} facing="user" onPick={(f) => setMedia(r.id, 'photo', f)} />
                  <MediaCapture label="NIC card photo" icon={<IdCard className="h-3 w-3" />} value={r.nicPhoto} facing="environment" onPick={(f) => setMedia(r.id, 'nicPhoto', f)} />
                  <MediaCapture label="Eye / iris scan" icon={<ScanEye className="h-3 w-3" />} value={r.eyeScan} facing="user" onPick={(f) => setMedia(r.id, 'eyeScan', f)} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MediaCapture({ label, icon, value, facing, onPick }: { label: string; icon: React.ReactNode; value?: string; facing: 'user' | 'environment'; onPick: (f: File) => void }) {
  return (
    <div className="space-y-1">
      <Label className="flex items-center gap-1 text-xs">{icon} {label}</Label>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob: preview
        <img src={value} alt={label} className="h-16 w-full rounded border border-slate-200 object-cover dark:border-slate-700" />
      ) : (
        <label className="flex h-16 cursor-pointer items-center justify-center rounded border border-dashed border-slate-300 text-[11px] text-slate-400 hover:bg-accent dark:border-slate-700">
          Capture
          <input type="file" accept="image/*" capture={facing} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ''; }} />
        </label>
      )}
    </div>
  );
}