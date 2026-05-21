'use client';

import { useState } from 'react';
import { Save, Syringe, Plus, Trash2, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubpageHeader } from '@/components/dashboard-subpage-header';
import { toast } from 'sonner';
import { SCHOOL_NAMES } from '@/data/colombo-schools';

interface VaccineRecord {
  id: number;
  studentName: string;
  grade: string;
  age: string;
  gender: string;
  vaccine: string;
  doseNumber: string;
  batchNo: string;
  site: string;
  reaction: string;
  consent: boolean;
  consentPhoto?: string;
}

export default function SchoolVaccinePage() {
  const [records, setRecords] = useState<VaccineRecord[]>([
    { id: 1, studentName: '', grade: '6', age: '', gender: 'F', vaccine: 'HPV', doseNumber: '1', batchNo: '', site: 'Left Deltoid', reaction: 'None', consent: true },
  ]);

  const addRecord = () => {
    setRecords(prev => [...prev, { id: prev.length + 1, studentName: '', grade: '6', age: '', gender: 'F', vaccine: 'HPV', doseNumber: '1', batchNo: '', site: 'Left Deltoid', reaction: 'None', consent: true }]);
  };

  const removeRecord = (id: number) => setRecords(prev => prev.filter(r => r.id !== id));

  const updateRecord = (id: number, field: keyof VaccineRecord, value: string | boolean) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const setConsentPhoto = (id: number, file: File) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, consentPhoto: URL.createObjectURL(file) } : r)));
  };

  return (
    <div className="space-y-6">
      <SubpageHeader
        backHref="/dashboard/school"
        module="Module 04 · School Health"
        code="H1247"
        icon={Syringe}
        title="Vaccination program"
        subtitle="HPV (Grade 6 girls · 2 doses) and aP / dT (Grade 7 · 1 dose) campaign tracker"
        tone="purple"
        actions={
          <Button className="bg-purple-700 hover:bg-purple-800" onClick={() => toast.success(`Saved ${records.length} vaccination record${records.length === 1 ? '' : 's'}.`)}><Save className="mr-2 h-4 w-4" />Save records</Button>
        }
      />

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>School Name *</Label>
            <Input list="vaccine-school-list" placeholder="Select or type a school…" />
            <datalist id="vaccine-school-list">{SCHOOL_NAMES.map((n) => <option key={n} value={n} />)}</datalist>
          </div>
          <div className="space-y-2"><Label>Date</Label><Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          <div className="space-y-2"><Label>Vaccinator Name</Label><Input placeholder="Name" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Vaccination Records ({records.length})</CardTitle>
          <Button size="sm" onClick={addRecord}><Plus className="mr-1 h-4 w-4" />Add Record</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((r, idx) => (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Record #{idx + 1}</span>
                  {records.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeRecord(r.id)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1"><Label className="text-xs">Student Name</Label><Input value={r.studentName} onChange={(e) => updateRecord(r.id, 'studentName', e.target.value)} placeholder="Full name" /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">Vaccine</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.vaccine} onChange={(e) => updateRecord(r.id, 'vaccine', e.target.value)}>
                      <option value="HPV">HPV</option><option value="aPdT">aP/dT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Grade</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.grade} onChange={(e) => updateRecord(r.id, 'grade', e.target.value)}>
                      <option value="6">Grade 6</option><option value="7">Grade 7</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Gender</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.gender} onChange={(e) => updateRecord(r.id, 'gender', e.target.value)}>
                      <option value="F">Female</option><option value="M">Male</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Age</Label><Input type="number" value={r.age} onChange={(e) => updateRecord(r.id, 'age', e.target.value)} /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">Dose Number</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.doseNumber} onChange={(e) => updateRecord(r.id, 'doseNumber', e.target.value)}>
                      <option value="1">Dose 1</option><option value="2">Dose 2</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Batch Number</Label><Input value={r.batchNo} onChange={(e) => updateRecord(r.id, 'batchNo', e.target.value)} placeholder="Vaccine batch" /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">Injection Site</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.site} onChange={(e) => updateRecord(r.id, 'site', e.target.value)}>
                      <option>Left Deltoid</option><option>Right Deltoid</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">Adverse Reaction</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={r.reaction} onChange={(e) => updateRecord(r.id, 'reaction', e.target.value)}>
                      <option>None</option><option>Mild - Local Pain</option><option>Mild - Fever</option><option>Moderate</option><option>Severe - Refer</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm mt-5"><input type="checkbox" className="rounded" checked={r.consent} onChange={(e) => updateRecord(r.id, 'consent', e.target.checked)} /> Parental consent obtained</label>
                  <div className="mt-2 space-y-1">
                    <Label className="flex items-center gap-1 text-xs"><Camera className="h-3 w-3" /> Consent form photo</Label>
                    <div className="flex items-center gap-2">
                      <input type="file" accept="image/*" capture="environment" onChange={(e) => { const f = e.target.files?.[0]; if (f) setConsentPhoto(r.id, f); e.target.value = ''; }} className="text-xs" />
                      {r.consentPhoto && (
                        // eslint-disable-next-line @next/next/no-img-element -- blob: preview
                        <img src={r.consentPhoto} alt="Consent form" className="h-9 w-12 rounded border border-slate-200 object-cover dark:border-slate-700" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
