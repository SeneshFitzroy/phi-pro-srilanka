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