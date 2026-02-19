'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Map, Printer, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DISEASE_COLORS: Record<string, string> = {
  Dengue: '#ef4444',
  Typhoid: '#f97316',
  Dysentery: '#eab308',
  'Food Poisoning': '#22c55e',
  Leptospirosis: '#3b82f6',
  Tuberculosis: '#8b5cf6',
  Chickenpox: '#ec4899',
  Hepatitis: '#14b8a6',
  Rabies: '#6b7280',
  Other: '#a3a3a3',
};

interface Pin {
  id: number;
  disease: string;
  gnDivision: string;
  latitude: string;
  longitude: string;
  date: string;
  patientAge: string;
  patientGender: string;
  notes: string;
}

export default function SpotMapPage() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedDisease, setSelectedDisease] = useState('Dengue');

  const addPin = () => setPins(prev => [...prev, {
    id: Date.now(), disease: selectedDisease, gnDivision: '', latitude: '', longitude: '', date: new Date().toISOString().split('T')[0], patientAge: '', patientGender: '', notes: '',
  }]);

  const removePin = (id: number) => setPins(prev => prev.filter(p => p.id !== id));
  const updatePin = (id: number, field: keyof Pin, val: string) => setPins(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));

  const diseaseCounts = Object.keys(DISEASE_COLORS).reduce((acc, d) => {
    acc[d] = pins.filter(p => p.disease === d).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">