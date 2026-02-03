'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const sections = [
  {
    title: 'Disease Control Activities',
    items: [
      { id: 'houses_visited', label: 'Houses visited', type: 'number' },
      { id: 'premises_inspected', label: 'Premises inspected', type: 'number' },
      { id: 'breeding_sites', label: 'Breeding sites detected', type: 'number' },
      { id: 'breeding_destroyed', label: 'Breeding sites destroyed', type: 'number' },
      { id: 'fogging_ops', label: 'Fogging operations conducted', type: 'number' },
      { id: 'larvicide_area', label: 'Area treated with larvicide (sq.m)', type: 'number' },
    ]
  },
  {
    title: 'Case Detection & Investigation',
    items: [
      { id: 'cases_reported', label: 'Cases reported from hospitals', type: 'number' },
      { id: 'cases_field', label: 'Cases detected in field', type: 'number' },
      { id: 'cases_investigated', label: 'Cases investigated (within 48hrs)', type: 'number' },
      { id: 'cases_late', label: 'Cases investigated (after 48hrs)', type: 'number' },
      { id: 'contacts_traced', label: 'Contacts traced', type: 'number' },
      { id: 'clusters_identified', label: 'Clusters identified (150m radius)', type: 'number' },
    ]
  },
  {
    title: 'Health Education',
    items: [
      { id: 'he_sessions', label: 'Health education sessions', type: 'number' },
      { id: 'he_participants', label: 'Total participants', type: 'number' },
      { id: 'leaflets_distributed', label: 'Leaflets distributed', type: 'number' },
      { id: 'home_visits', label: 'Home visits for health education', type: 'number' },
    ]
  },
  {
    title: 'Environmental Health',
    items: [
      { id: 'water_sources_tested', label: 'Water sources tested', type: 'number' },
      { id: 'water_unsafe', label: 'Unsafe water sources found', type: 'number' },
      { id: 'chlorination', label: 'Wells chlorinated', type: 'number' },
      { id: 'sanitary_surveys', label: 'Sanitary surveys done', type: 'number' },
    ]
  },
];

export default function EpidemiologyMonthlyPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const update = (id: string, val: string) => setValues(prev => ({ ...prev, [id]: val }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/epidemiology"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">Monthly Epidemiology Return (H411)</h1>
            <p className="text-sm text-muted-foreground">Monthly summary of disease control and surveillance activities</p>
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
          <div className="space-y-2"><Label>Month / Year</Label><Input type="month" /></div>
          <div className="space-y-2"><Label>PHI Name</Label><Input placeholder="Your name" /></div>
        </CardContent>
      </Card>

      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader><CardTitle className="text-base">{section.title}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr,120px] gap-3 items-center">
                  <Label className="text-sm">{item.label}</Label>
                  <Input type="number" min="0" className="text-center" value={values[item.id] || ''} onChange={(e) => update(item.id, e.target.value)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader><CardTitle className="text-base">Significant Outbreaks / Events</CardTitle></CardHeader>
        <CardContent>
          <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px]" placeholder="Describe any notable outbreaks, clusters, or control measures taken during the month..." />
        </CardContent>
      </Card>
    </div>
  );
}
