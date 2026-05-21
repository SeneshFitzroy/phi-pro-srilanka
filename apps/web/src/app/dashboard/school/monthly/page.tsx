'use client';

import { useState } from 'react';
import { Save, Printer, FileText, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubpageHeader } from '@/components/dashboard-subpage-header';
import { toast } from 'sonner';
import { COLOMBO_SCHOOLS, SCHOOL_NAMES } from '@/data/colombo-schools';

// H1214 — School Health Monthly Summary
const defectCategories = [
  { id: 'vision', label: 'Vision Defects', subItems: ['Myopia', 'Hyperopia', 'Squint', 'Other Eye'] },
  { id: 'hearing', label: 'Hearing Defects', subItems: ['Partial Hearing Loss', 'Total Hearing Loss', 'Ear Infections'] },
  { id: 'dental', label: 'Dental Defects', subItems: ['Dental Caries', 'Malocclusion', 'Gum Disease'] },
  { id: 'skin', label: 'Skin Conditions', subItems: ['Scabies', 'Ringworm', 'Pediculosis', 'Other Skin'] },
  { id: 'nutrition', label: 'Nutritional Status', subItems: ['Underweight', 'Stunting', 'Overweight/Obese', 'Anemia'] },
  { id: 'ortho', label: 'Orthopedic', subItems: ['Scoliosis', 'Flat Feet', 'Other Ortho'] },
  { id: 'ent', label: 'ENT', subItems: ['Tonsillitis', 'Sinusitis', 'Allergic Rhinitis'] },
  { id: 'other', label: 'Other Conditions', subItems: ['Asthma', 'Epilepsy', 'Heart Conditions', 'Other Medical'] },
];

export default function SchoolMonthlyPage() {
  const [schoolName, setSchoolName] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [examined, setExamined] = useState('');
  const [values, setValues] = useState<Record<string, Record<string, { male: string; female: string }>>>({});

  const onSchoolChange = (name: string) => {
    setSchoolName(name);
    const match = COLOMBO_SCHOOLS.find((s) => s.name === name);
    if (match && !examined) setExamined(String(match.students));
  };

  const updateValue = (catId: string, sub: string, gender: 'male' | 'female', val: string) => {
    setValues(prev => ({
      ...prev,
      [catId]: {
        ...(prev[catId] || {}),
        [sub]: { ...(prev[catId]?.[sub] || { male: '', female: '' }), [gender]: val }
      }
    }));
  };

  const getCategoryTotal = (catId: string) => {
    const cat = values[catId];
    if (!cat) return { male: 0, female: 0 };
    let male = 0, female = 0;
    Object.values(cat).forEach(v => { male += parseInt(v.male) || 0; female += parseInt(v.female) || 0; });
    return { male, female };
  };

  return (
    <div className="space-y-6">
      <SubpageHeader
        backHref="/dashboard/school"
        module="Module 04 · School Health"
        code="H1214"
        icon={FileText}
        title="Monthly summary report"
        subtitle="Aggregate student-health findings across all schools visited this month"
        tone="blue"
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print PDF</Button>
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => { if (!schoolName.trim()) { toast.error('Select a school first.'); return; } toast.success(`H1214 summary submitted for ${schoolName}.`); }}><Save className="mr-2 h-4 w-4" />Submit</Button>
          </>
        }
      />

      {/* Header Info */}
      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>School Name *</Label>
            <div className="relative">
              <Input list="colombo-school-list" value={schoolName} onChange={(e) => onSchoolChange(e.target.value)} placeholder="Select or type a school…" />
              {schoolName && <button type="button" aria-label="Clear school" onClick={() => setSchoolName('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-rose-600"><X className="h-3.5 w-3.5" /></button>}
            </div>
            <datalist id="colombo-school-list">
              {SCHOOL_NAMES.map((n) => <option key={n} value={n} />)}
            </datalist>
          </div>
          <div className="space-y-2"><Label>Month / Year</Label><Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Grades Inspected</Label>
            <div className="flex gap-2">
              {['1', '4', '7', '10'].map(g => (
                <label key={g} className="flex items-center gap-1 text-sm"><input type="checkbox" className="rounded" /><span>Grade {g}</span></label>
              ))}
            </div>
          </div>
          <div className="space-y-2"><Label>Students Examined</Label><Input type="number" value={examined} onChange={(e) => setExamined(e.target.value)} placeholder="Total count" /></div>
        </CardContent>
      </Card>

      {/* Defect Categories */}
      {defectCategories.map((cat) => {
        const totals = getCategoryTotal(cat.id);
        return (
          <Card key={cat.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{cat.label}</CardTitle>
                <div className="flex gap-4 text-xs">
                  <span className="text-blue-600 font-medium">M: {totals.male}</span>
                  <span className="text-pink-600 font-medium">F: {totals.female}</span>
                  <span className="font-bold">T: {totals.male + totals.female}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr,80px,80px] gap-2 text-xs font-medium text-muted-foreground">
                  <span>Condition</span><span className="text-center text-blue-600">Male</span><span className="text-center text-pink-600">Female</span>
                </div>
                {cat.subItems.map(sub => (
                  <div key={sub} className="grid grid-cols-[1fr,80px,80px] gap-2 items-center">
                    <span className="text-sm">{sub}</span>
                    <Input type="number" min="0" className="h-8 text-center text-sm" value={values[cat.id]?.[sub]?.male || ''} onChange={(e) => updateValue(cat.id, sub, 'male', e.target.value)} />
                    <Input type="number" min="0" className="h-8 text-center text-sm" value={values[cat.id]?.[sub]?.female || ''} onChange={(e) => updateValue(cat.id, sub, 'female', e.target.value)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}