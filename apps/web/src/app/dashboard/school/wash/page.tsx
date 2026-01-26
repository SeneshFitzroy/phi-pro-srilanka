'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Droplets, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const washSections = [
  {
    title: 'Water Supply',
    items: [
      { id: 'water_source', label: 'Primary water source', options: ['Pipe-borne (NWS&DB)', 'Well', 'Tube Well', 'Rain Harvest', 'Other'] },
      { id: 'water_safe', label: 'Water treated / safe to drink?', options: ['Yes', 'No', 'Unknown'] },
      { id: 'water_points', label: 'Number of drinking water points', type: 'number' },
      { id: 'water_functional', label: 'All water points functional?', options: ['Yes', 'No - Specify'] },
      { id: 'water_test', label: 'Last water quality test', type: 'date' },
    ]
  },
  {
    title: 'Sanitation Facilities',
    items: [
      { id: 'toilet_count', label: 'Total toilet cubicles', type: 'number' },
      { id: 'toilet_boys', label: 'Toilets for boys', type: 'number' },
      { id: 'toilet_girls', label: 'Toilets for girls', type: 'number' },
      { id: 'toilet_disabled', label: 'Disabled-accessible toilets', type: 'number' },
      { id: 'toilet_clean', label: 'Cleanliness standard', options: ['Good', 'Satisfactory', 'Poor'] },
      { id: 'toilet_water', label: 'Water available in all toilets?', options: ['Yes', 'No'] },
      { id: 'toilet_soap', label: 'Soap available?', options: ['Yes', 'No'] },
    ]
  },
  {
    title: 'Handwashing Facilities',
    items: [
      { id: 'hw_stations', label: 'Number of handwashing stations', type: 'number' },
      { id: 'hw_soap', label: 'Soap available at stations?', options: ['Yes - All', 'Yes - Some', 'No'] },
      { id: 'hw_functional', label: 'All stations functional?', options: ['Yes', 'No'] },
      { id: 'hw_near_toilet', label: 'Stations near toilets?', options: ['Yes', 'No'] },
    ]
  },
  {
    title: 'Waste Management',
    items: [
      { id: 'waste_bins', label: 'Waste bins available?', options: ['Yes - Segregated', 'Yes - Mixed', 'No'] },
      { id: 'waste_disposal', label: 'Disposal method', options: ['Municipal Collection', 'Burning', 'Composting', 'Open Dumping'] },
      { id: 'waste_frequency', label: 'Collection frequency', options: ['Daily', 'Twice/week', 'Weekly', 'Irregular'] },
    ]
  },
  {
    title: 'Menstrual Hygiene Management',
    items: [
      { id: 'mhm_facilities', label: 'Separate MHM facilities (girls)?', options: ['Yes', 'No'] },
      { id: 'mhm_bins', label: 'Sanitary disposal bins in girls toilets?', options: ['Yes', 'No'] },
      { id: 'mhm_education', label: 'MHM education conducted?', options: ['Yes', 'No'] },
    ]
  },
];

export default function SchoolWASHPage() {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const update = (id: string, val: string) => setFormData(prev => ({ ...prev, [id]: val }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/school"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Droplets className="h-6 w-6 text-cyan-500" />WASH Survey (H1015)</h1>
            <p className="text-sm text-muted-foreground">Water, Sanitation & Hygiene assessment for schools</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button className="bg-school hover:bg-school/90"><Save className="mr-2 h-4 w-4" />Submit Survey</Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2"><Label>School Name *</Label><Input placeholder="Enter school name" /></div>
          <div className="space-y-2"><Label>Survey Date</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Total Students</Label><Input type="number" placeholder="Enrollment" /></div>
          <div className="space-y-2"><Label>PHI Officer</Label><Input placeholder="Your name" /></div>
        </CardContent>
      </Card>

      {washSections.map((section) => (
        <Card key={section.title}>
          <CardHeader><CardTitle className="text-base">{section.title}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">