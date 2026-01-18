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
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3 p-4"><FlaskConical className="h-8 w-8 text-food" /><div><p className="text-2xl font-bold">24</p><p className="text-xs text-muted-foreground">Total Samples</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">18</p><p className="text-xs text-muted-foreground">Passed</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><AlertTriangle className="h-8 w-8 text-red-500" /><div><p className="text-2xl font-bold">3</p><p className="text-xs text-muted-foreground">Failed</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><Clock className="h-8 w-8 text-amber-500" /><div><p className="text-2xl font-bold">3</p><p className="text-xs text-muted-foreground">Pending</p></div></CardContent></Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Food Sample Collection</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2"><Label>Premises *</Label><Input placeholder="Where was the sample collected?" /></div>
              <div className="space-y-2"><Label>Food Item *</Label><Input placeholder="e.g. Cooked Rice, Milk, Bread" /></div>
              <div className="space-y-2"><Label>Sample Quantity</Label><Input placeholder="e.g. 500g" /></div>
              <div className="space-y-2"><Label>Collection Date</Label><Input type="date" /></div>
              <div className="space-y-2"><Label>Collection Time</Label><Input type="time" /></div>
              <div className="space-y-2"><Label>Storage Temp (°C)</Label><Input type="number" placeholder="Temperature at collection" /></div>
              <div className="space-y-2">
                <Label>Reason for Sampling</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Routine Surveillance</option><option>Complaint Investigation</option><option>Re-sampling (Failed)</option><option>Special Campaign</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Input placeholder="Additional observations" /></div>
              <div className="flex items-end gap-2">
                <Button className="bg-food hover:bg-food-dark flex-1">Save Sample</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sample Records</CardTitle>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search samples..." className="pl-9 w-64" /></div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">Sample ID</th><th className="pb-3 pr-4 font-medium">Premises</th><th className="pb-3 pr-4 font-medium">Food Item</th><th className="pb-3 pr-4 font-medium">Collected</th><th className="pb-3 pr-4 font-medium">Sent to MRI</th><th className="pb-3 pr-4 font-medium">Result</th><th className="pb-3 font-medium">Status</th></tr></thead>
              <tbody>
                {samples.filter(s => s.premises.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase())).map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-accent/50">
                    <td className="py-3 pr-4 font-mono text-xs">{s.id}</td>
                    <td className="py-3 pr-4 font-medium">{s.premises}</td>