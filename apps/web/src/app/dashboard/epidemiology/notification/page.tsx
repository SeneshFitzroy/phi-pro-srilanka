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
