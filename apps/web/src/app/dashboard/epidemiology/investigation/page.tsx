'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Search, MapPin, Users, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const investigationSections = [
  {
    title: 'Case Identification',
    fields: [
      { id: 'case_ref', label: 'Case Reference No.', type: 'text' },
      { id: 'notification_ref', label: 'Notification (H160) Ref.', type: 'text' },
      { id: 'patient_name', label: 'Patient Name', type: 'text' },
      { id: 'age', label: 'Age', type: 'number' },
      { id: 'address', label: 'Address', type: 'text' },
      { id: 'gn_division', label: 'GN Division', type: 'text' },
    ]
  },
  {
    title: 'Investigation Details',
    fields: [
      { id: 'date_notified', label: 'Date Notified', type: 'date' },
      { id: 'date_investigated', label: 'Date Investigated', type: 'date' },
      { id: 'within_48hrs', label: 'Within 48 hours?', type: 'select', options: ['Yes', 'No - Explain Below'] },
      { id: 'investigation_type', label: 'Investigation Type', type: 'select', options: ['Individual', 'Cluster (≥3 cases within 150m)', 'Outbreak'] },
    ]
  },
  {
    title: 'Clinical & Epidemiological',
    fields: [
      { id: 'disease', label: 'Confirmed Disease', type: 'text' },
      { id: 'onset_date', label: 'Date of Symptom Onset', type: 'date' },
      { id: 'symptoms', label: 'Primary Symptoms', type: 'text' },
      { id: 'lab_result', label: 'Lab Result', type: 'select', options: ['Positive', 'Negative', 'Pending', 'Not Tested'] },
      { id: 'outcome', label: 'Patient Outcome', type: 'select', options: ['Recovered', 'Under Treatment', 'Hospitalized', 'Deceased'] },
    ]
  },
  {
    title: 'Contact Tracing',
    fields: [
      { id: 'household_contacts', label: 'Household contacts identified', type: 'number' },
      { id: 'symptomatic_contacts', label: 'Contacts with symptoms', type: 'number' },
      { id: 'contacts_referred', label: 'Contacts referred for testing', type: 'number' },
      { id: 'radius_searched', label: 'Search radius (meters)', type: 'number' },
      { id: 'nearby_cases', label: 'Similar cases within 150m', type: 'number' },
    ]
  },
  {
    title: 'Environmental Assessment',
    fields: [
      { id: 'water_source', label: 'Water source', type: 'select', options: ['Pipe-borne', 'Well', 'Tube Well', 'Other'] },
      { id: 'sanitation', label: 'Sanitation type', type: 'select', options: ['Water-sealed', 'Pit Latrine', 'Open Defecation', 'Other'] },
      { id: 'breeding_sites', label: 'Mosquito breeding sites found?', type: 'select', options: ['Yes - Destroyed', 'Yes - Pending', 'No'] },
      { id: 'food_source', label: 'suspected food source (if food-borne)', type: 'text' },
    ]
  },
];

export default function CaseInvestigationPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const update = (id: string, val: string) => setValues(prev => ({ ...prev, [id]: val }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/epidemiology"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Search className="h-6 w-6 text-amber-600" />Case Investigation (SIV Form)</h1>
            <p className="text-sm text-muted-foreground">Single case or cluster investigation — 48hr mandate</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button className="bg-epidemiology hover:bg-epidemiology/90"><Save className="mr-2 h-4 w-4" />Submit</Button>
        </div>