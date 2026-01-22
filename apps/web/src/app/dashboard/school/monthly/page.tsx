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