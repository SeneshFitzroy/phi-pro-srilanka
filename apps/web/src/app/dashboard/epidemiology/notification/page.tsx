'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Bell, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const notifiableDiseases = [
  'Dengue Fever', 'Dengue Haemorrhagic Fever', 'Typhoid', 'Paratyphoid',
  'Chickenpox', 'Measles', 'Mumps', 'Rubella',
  'Leptospirosis', 'Hepatitis A', 'Hepatitis B', 'Hepatitis C',
  'Food Poisoning', 'Dysentery', 'Diarrhoeal Disease', 'Cholera',
  'Tuberculosis', 'Malaria', 'COVID-19', 'Influenza-like Illness',
  'Rabies (Human)', 'Animal Bite', 'Leishmaniasis', 'Filariasis',
  'Japanese Encephalitis', 'Meningitis', 'Encephalitis',
  'Whooping Cough', 'Diphtheria', 'Tetanus', 'Acute Flaccid Paralysis',
  'Sexually Transmitted Infection', 'Other Notifiable Disease',
];

export default function DiseaseNotificationPage() {
  const [disease, setDisease] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/epidemiology"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6 text-orange-500" />Disease Notification (Health 160)</h1>
            <p className="text-sm text-muted-foreground">Immediate notification — 48-hour investigation mandate</p>
          </div>
        </div>
        <Button className="bg-epidemiology hover:bg-epidemiology/90"><Save className="mr-2 h-4 w-4" />Submit Notification</Button>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="flex items-center gap-2 font-semibold"><Clock className="h-4 w-4" /> 48-Hour Investigation Mandate</div>
        <p className="mt-1">All notifiable disease cases must be investigated within 48 hours of notification. Failure to investigate is a reportable compliance issue.</p>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader><CardTitle className="text-base">Patient Information</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2"><Label>Patient Name *</Label><Input placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Age *</Label><Input type="number" placeholder="Age" /></div>
            <div className="space-y-2">
              <Label>Gender *</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="M">Male</option><option value="F">Female</option>
              </select>
            </div>
            <div className="space-y-2"><Label>NIC Number</Label><Input placeholder="National ID" /></div>
            <div className="space-y-2"><Label>Address *</Label><Input placeholder="Full address" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input type="tel" placeholder="+94..." /></div>
            <div className="space-y-2"><Label>GN Division *</Label><Input placeholder="GN division code/name" /></div>
            <div className="space-y-2"><Label>Occupation</Label><Input placeholder="Occupation" /></div>
          </div>
        </CardContent>
      </Card>

      {/* Disease Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Disease Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Notifiable Disease *</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={disease} onChange={(e) => setDisease(e.target.value)}>
                <option value="">Select disease...</option>
                {notifiableDiseases.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Date of Onset *</Label><Input type="date" /></div>
            <div className="space-y-2"><Label>Date Notified</Label><Input type="date" /></div>
            <div className="space-y-2"><Label>Notified By</Label><Input placeholder="Hospital / Doctor name" /></div>
            <div className="space-y-2">
              <Label>Patient Status</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Hospitalized</option><option>Home Care</option><option>Recovered</option><option>Deceased</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Hospital (if admitted)</Label><Input placeholder="Hospital name" /></div>
            <div className="space-y-2"><Label>Ward / BHT No.</Label><Input placeholder="Ward & BHT" /></div>
            <div className="space-y-2">
              <Label>Lab Confirmation</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Pending</option><option>Confirmed</option><option>Negative</option><option>Not Tested</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" />Location & GPS</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2"><Label>Latitude</Label><Input placeholder="e.g. 6.9271" /></div>
            <div className="space-y-2"><Label>Longitude</Label><Input placeholder="e.g. 79.8612" /></div>
            <div className="flex items-end"><Button variant="outline" className="w-full"><MapPin className="mr-2 h-4 w-4" />Capture GPS</Button></div>
          </div>
        </CardContent>
      </Card>

      {/* Symptoms & Notes */}
      <Card>
        <CardHeader><CardTitle className="text-base">Symptoms & Initial Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Presenting Symptoms</Label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Describe symptoms..." />
          </div>
          <div className="space-y-2">
            <Label>PHI Notes</Label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Additional observations..." />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
