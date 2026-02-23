'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileCheck, Check, X, Eye, Filter, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SUBMISSIONS = [
  { id: 'SUB-001', officer: 'K. Perera', form: 'H800 Food Inspection', establishment: 'Golden Dragon Restaurant', area: 'Colombo North', date: '2025-02-10', status: 'pending', grade: 'A (92%)' },
  { id: 'SUB-002', officer: 'M. Silva', form: 'H399 Weekly Return', establishment: '-', area: 'Kaduwela East', date: '2025-02-10', status: 'pending', grade: '-' },
  { id: 'SUB-003', officer: 'S. Jayawardena', form: 'SIV Case Investigation', establishment: 'Case #DEN-2025-034', area: 'Moratuwa', date: '2025-02-09', status: 'pending', grade: '-' },
  { id: 'SUB-004', officer: 'R. Fernando', form: 'PHI-1 Monthly Report', establishment: '-', area: 'Dehiwala West', date: '2025-02-09', status: 'approved', grade: '-' },
  { id: 'SUB-005', officer: 'A. Bandara', form: 'H1203 Factory Health', establishment: 'Lanka Garments Ltd.', area: 'Homagama', date: '2025-02-08', status: 'approved', grade: 'PASS (85%)' },
  { id: 'SUB-006', officer: 'N. Rathnayake', form: 'H801 Registration', establishment: 'ABC Bakery', area: 'Piliyandala', date: '2025-02-08', status: 'rejected', grade: '-' },
  { id: 'SUB-007', officer: 'K. Perera', form: 'H1204 Safety Inspection', establishment: 'Steel Works Co.', area: 'Colombo North', date: '2025-02-07', status: 'pending', grade: 'WARN (62%)' },
  { id: 'SUB-008', officer: 'T. Wijesinghe', form: 'Health 160 Notification', establishment: 'Case #TYP-2025-008', area: 'Kottawa', date: '2025-02-07', status: 'pending', grade: '-' },
];

const statusColor = (s: string) => s === 'approved' ? 'bg-green-100 text-green-700' : s === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

export default function ApprovalsPage() {
  const [filter, setFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  const filtered = SUBMISSIONS.filter(s => {
    const matchStatus = filter === 'all' || s.status === filter;
    const matchSearch = !searchQ || s.officer.toLowerCase().includes(searchQ.toLowerCase()) || s.form.toLowerCase().includes(searchQ.toLowerCase()) || s.establishment.toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = SUBMISSIONS.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><FileCheck className="h-6 w-6 text-orange-500" />Approvals</h1>
            <p className="text-sm text-muted-foreground">{pendingCount} submissions pending review</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-green-600" onClick={() => {}}><Check className="mr-1 h-4 w-4" />Approve All Pending</Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input className="sm:max-w-xs" placeholder="Search by officer, form, establishment..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize text-xs">
              {f === 'all' ? 'All' : f} {f === 'pending' ? `(${pendingCount})` : ''}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="overflow-auto p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50"><th className="px-4 py-3 text-left text-xs">ID</th><th className="px-4 py-3 text-left text-xs">Officer</th><th className="px-4 py-3 text-left text-xs">Form</th><th className="px-4 py-3 text-left text-xs">Subject</th><th className="px-4 py-3 text-left text-xs">Area</th><th className="px-4 py-3 text-left text-xs">Date</th><th className="px-4 py-3 text-left text-xs">Result</th><th className="px-4 py-3 text-left text-xs">Status</th><th className="px-4 py-3 text-left text-xs">Actions</th></tr></thead>
            <tbody>