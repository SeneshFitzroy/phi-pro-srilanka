'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StudentRecord {
  id: number;
  name: string;
  grade: string;
  age: string;
  gender: string;
  defects: string;
  action: string;
  referred: boolean;
}

export default function SchoolDefectsPage() {
  const [records, setRecords] = useState<StudentRecord[]>([
    { id: 1, name: '', grade: '1', age: '', gender: 'M', defects: '', action: '', referred: false },
  ]);

  const addRecord = () => {
    setRecords(prev => [...prev, { id: prev.length + 1, name: '', grade: '1', age: '', gender: 'M', defects: '', action: '', referred: false }]);
  };

  const removeRecord = (id: number) => { setRecords(prev => prev.filter(r => r.id !== id)); };

  const updateRecord = (id: number, field: keyof StudentRecord, value: string | boolean) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/school"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>