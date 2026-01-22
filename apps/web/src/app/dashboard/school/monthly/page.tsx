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