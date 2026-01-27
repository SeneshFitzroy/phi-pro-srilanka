'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Syringe, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VaccineRecord {
  id: number;
  studentName: string;
  grade: string;
  age: string;
  gender: string;
  vaccine: string;
  doseNumber: string;
  batchNo: string;
  site: string;
  reaction: string;
  consent: boolean;
}

export default function SchoolVaccinePage() {
  const [records, setRecords] = useState<VaccineRecord[]>([
    { id: 1, studentName: '', grade: '6', age: '', gender: 'F', vaccine: 'HPV', doseNumber: '1', batchNo: '', site: 'Left Deltoid', reaction: 'None', consent: true },
  ]);

  const addRecord = () => {
    setRecords(prev => [...prev, { id: prev.length + 1, studentName: '', grade: '6', age: '', gender: 'F', vaccine: 'HPV', doseNumber: '1', batchNo: '', site: 'Left Deltoid', reaction: 'None', consent: true }]);
  };

  const removeRecord = (id: number) => setRecords(prev => prev.filter(r => r.id !== id));

  const updateRecord = (id: number, field: keyof VaccineRecord, value: string | boolean) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const hpvCount = records.filter(r => r.vaccine === 'HPV').length;
  const apdtCount = records.filter(r => r.vaccine === 'aPdT').length;

  return (