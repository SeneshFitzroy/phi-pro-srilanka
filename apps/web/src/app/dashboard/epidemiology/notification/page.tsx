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
