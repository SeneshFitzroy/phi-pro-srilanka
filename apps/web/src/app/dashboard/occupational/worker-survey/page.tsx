'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Users, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WorkerRecord {
  id: number;
  name: string;
  age: string;
  gender: string;
  section: string;
  yearsEmployed: string;
  healthIssues: string;
  ppeCompliant: boolean;
  lastMedical: string;
}

export default function WorkerSurveyPage() {
  const [records, setRecords] = useState<WorkerRecord[]>([
    { id: 1, name: '', age: '', gender: 'M', section: '', yearsEmployed: '', healthIssues: '', ppeCompliant: true, lastMedical: '' },
  ]);

  const addRecord = () => {
    setRecords(prev => [...prev, { id: Date.now(), name: '', age: '', gender: 'M', section: '', yearsEmployed: '', healthIssues: '', ppeCompliant: true, lastMedical: '' }]);
  };
  const removeRecord = (id: number) => setRecords(prev => prev.filter(r => r.id !== id));
  const updateRecord = (id: number, field: keyof WorkerRecord, value: string | boolean) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));