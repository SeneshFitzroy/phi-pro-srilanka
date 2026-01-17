'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, FlaskConical, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const samples = [
  { id: 'S-2025-001', premises: 'Saman Hotel', type: 'Cooked Rice', collectedDate: '2025-02-01', sentToMRI: '2025-02-02', result: 'PASS', status: 'Completed' },
  { id: 'S-2025-002', premises: 'City Bakery', type: 'Bread', collectedDate: '2025-02-05', sentToMRI: '2025-02-06', result: 'FAIL', status: 'Action Required' },
  { id: 'S-2025-003', premises: 'Fresh Mart', type: 'Milk', collectedDate: '2025-02-10', sentToMRI: '2025-02-11', result: 'Pending', status: 'Awaiting Results' },
  { id: 'S-2025-004', premises: 'Lanka Restaurant', type: 'Curry Paste', collectedDate: '2025-02-12', sentToMRI: '2025-02-13', result: 'PASS', status: 'Completed' },
  { id: 'S-2025-005', premises: 'Street Vendor #12', type: 'Fried Rice', collectedDate: '2025-02-14', sentToMRI: '—', result: '—', status: 'Pending MRI Submission' },
];

export default function FoodSamplingPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/food"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">Food Sampling (H802)</h1>
            <p className="text-sm text-muted-foreground">Collect food samples and track MRI lab results</p>
          </div>
        </div>
        <Button className="bg-food hover:bg-food-dark" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> New Sample