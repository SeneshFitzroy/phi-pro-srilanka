'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileCheck, Check, X, Eye } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';
import { UserRole } from '@phi-pro/shared';
import { Card, CardContent } from '@/components/ui/card';
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
  return (
    <AuthGuard allowedRoles={[UserRole.SPHI, UserRole.MOH_ADMIN]}>
      <ApprovalsContent />
    </AuthGuard>
  );
}

function ApprovalsContent() {
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
              {filtered.map(s => (
                <tr key={s.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                  <td className="px-4 py-3 font-medium">{s.officer}</td>
                  <td className="px-4 py-3">{s.form}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[140px] truncate">{s.establishment}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.area}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.date}</td>
                  <td className="px-4 py-3 text-xs">{s.grade}</td>
                  <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColor(s.status)}`}>{s.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                      {s.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600"><Check className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600"><X className="h-3.5 w-3.5" /></Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No submissions found</div>}
        </CardContent>
      </Card>
    </div>
  );
}
