'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [values, setValues] = useState<Record<string, Record<string, { male: string; female: string }>>>({});

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/school"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">Monthly Summary Report (H1214)</h1>
            <p className="text-sm text-muted-foreground">Summarize student health findings for the month</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button className="bg-school hover:bg-school/90"><Save className="mr-2 h-4 w-4" />Submit</Button>
        </div>
      </div>

      {/* Header Info */}
      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2"><Label>School Name *</Label><Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Enter school name" /></div>
          <div className="space-y-2"><Label>Month / Year</Label><Input type="month" /></div>
          <div className="space-y-2">
            <Label>Grades Inspected</Label>
            <div className="flex gap-2">
              {['1', '4', '7', '10'].map(g => (
                <label key={g} className="flex items-center gap-1 text-sm"><input type="checkbox" className="rounded" /><span>Grade {g}</span></label>
              ))}
            </div>
          </div>
          <div className="space-y-2"><Label>Students Examined</Label><Input type="number" placeholder="Total count" /></div>
        </CardContent>
      </Card>

      {/* Defect Categories */}
      {defectCategories.map((cat) => {
        const totals = getCategoryTotal(cat.id);
        return (
          <Card key={cat.id}>