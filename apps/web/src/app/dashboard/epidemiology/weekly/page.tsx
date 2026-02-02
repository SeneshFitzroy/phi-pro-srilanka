'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const diseases = [
  'Dengue Fever', 'Dengue Haemorrhagic Fever', 'Typhoid', 'Paratyphoid',
  'Chickenpox', 'Measles', 'Mumps', 'Rubella',
  'Leptospirosis', 'Hepatitis A', 'Hepatitis B', 'Hepatitis C',
  'Food Poisoning', 'Dysentery', 'Diarrhoeal Disease', 'Cholera',
  'Tuberculosis (Pulmonary)', 'Tuberculosis (Extra-pulmonary)',
  'Malaria (P. vivax)', 'Malaria (P. falciparum)',
  'COVID-19', 'Influenza-like Illness',
  'Rabies (Human)', 'Animal Bite (Dog)', 'Animal Bite (Other)',
  'Leishmaniasis', 'Filariasis', 'Japanese Encephalitis',
  'Meningitis', 'Encephalitis',
  'Whooping Cough', 'Diphtheria', 'Tetanus (Neonatal)', 'Tetanus (Other)',
  'Acute Flaccid Paralysis', 'Sexually Transmitted Infections',
];

export default function EpidemiologyWeeklyPage() {
  const [values, setValues] = useState<Record<string, { cases: string; deaths: string }>>({});
  const updateValue = (disease: string, field: 'cases' | 'deaths', val: string) => {
    setValues(prev => ({ ...prev, [disease]: { ...(prev[disease] || { cases: '', deaths: '' }), [field]: val } }));
  };

  const totalCases = Object.values(values).reduce((s, v) => s + (parseInt(v.cases) || 0), 0);
  const totalDeaths = Object.values(values).reduce((s, v) => s + (parseInt(v.deaths) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/epidemiology"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">Weekly Communicable Disease Return (H399)</h1>
            <p className="text-sm text-muted-foreground">Report all notifiable diseases for the epidemiological week</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button className="bg-epidemiology hover:bg-epidemiology/90"><Save className="mr-2 h-4 w-4" />Submit</Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2"><Label>MOH Area</Label><Input placeholder="Area name" /></div>
          <div className="space-y-2"><Label>PHI Area</Label><Input placeholder="Sub-area" /></div>
          <div className="space-y-2"><Label>Epi Week Number</Label><Input type="number" min="1" max="53" placeholder="1-53" /></div>
          <div className="space-y-2"><Label>Week Ending Date</Label><Input type="date" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Disease Cases & Deaths</CardTitle>
            <div className="flex gap-4 text-sm">
              <span className="font-medium">Total Cases: <strong className="text-epidemiology">{totalCases}</strong></span>
              <span className="font-medium">Total Deaths: <strong className="text-red-600">{totalDeaths}</strong></span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr,90px,90px] gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
              <span>Disease</span><span className="text-center">Cases</span><span className="text-center">Deaths</span>
            </div>
            {diseases.map((disease) => (
              <div key={disease} className="grid grid-cols-[1fr,90px,90px] gap-2 items-center py-1 hover:bg-accent/30 rounded">
                <span className="text-sm">{disease}</span>
                <Input type="number" min="0" className="h-8 text-center text-sm" value={values[disease]?.cases || ''} onChange={(e) => updateValue(disease, 'cases', e.target.value)} />
                <Input type="number" min="0" className="h-8 text-center text-sm" value={values[disease]?.deaths || ''} onChange={(e) => updateValue(disease, 'deaths', e.target.value)} />
              </div>