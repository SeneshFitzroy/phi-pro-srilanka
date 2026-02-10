'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Factory, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button className="bg-occupational hover:bg-occupational/90"><Save className="mr-2 h-4 w-4" />Submit</Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2"><Label>Factory Name *</Label><Input placeholder="Factory name" /></div>
          <div className="space-y-2"><Label>Registration No.</Label><Input placeholder="Reg number" /></div>
          <div className="space-y-2">
            <Label>Factory Scale</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="SMALL">Small (&lt;50 workers)</option><option value="MEDIUM">Medium (50-250)</option><option value="LARGE">Large (250+)</option>
            </select>
          </div>
          <div className="space-y-2"><Label>Total Workers</Label><Input type="number" placeholder="Count" /></div>