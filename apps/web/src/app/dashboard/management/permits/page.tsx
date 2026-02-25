'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, Plus, Search, FileCheck, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PERMITS = [
  { id: 'PRM-2025-001', type: 'Food Premises', holder: 'Golden Dragon Restaurant', address: '45 Main St, Colombo 07', issued: '2024-06-15', expires: '2025-06-14', status: 'active', grade: 'A' },
  { id: 'PRM-2025-002', type: 'Food Premises', holder: 'Fresh Bakery & Cafe', address: '12 Galle Rd, Dehiwala', issued: '2024-09-01', expires: '2025-08-31', status: 'active', grade: 'A' },
  { id: 'PRM-2025-003', type: 'Factory Health', holder: 'Lanka Garments Ltd.', address: '50 Industrial Zone, Kaduwela', issued: '2024-07-20', expires: '2025-07-19', status: 'active', grade: '-' },
  { id: 'PRM-2025-004', type: 'Food Premises', holder: 'Corner Deli', address: '5 Temple Rd, Nugegoda', issued: '2024-03-10', expires: '2025-03-09', status: 'expiring', grade: 'C' },
  { id: 'PRM-2025-005', type: 'Trade License', holder: 'ABC Processing', address: '100 Factory Rd, Homagama', issued: '2024-01-15', expires: '2025-01-14', status: 'expired', grade: '-' },
  { id: 'PRM-2025-006', type: 'Food Premises', holder: 'Sunrise Hotel', address: '200 Beach Rd, Mt. Lavinia', issued: '2025-02-01', expires: '2026-01-31', status: 'active', grade: 'A' },
  { id: 'PRM-2025-007', type: 'Building Health', holder: 'New Commercial Center', address: '300 Main Rd, Piliyandala', issued: '2025-01-10', expires: 'N/A', status: 'pending', grade: '-' },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = { active: 'bg-green-100 text-green-700', expiring: 'bg-yellow-100 text-yellow-700', expired: 'bg-red-100 text-red-700', pending: 'bg-blue-100 text-blue-700', suspended: 'bg-gray-100 text-gray-600' };
  return map[s] || 'bg-gray-100 text-gray-600';
};

export default function PermitsPage() {
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showIssue, setShowIssue] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const filtered = PERMITS.filter(p => {
    const matchStatus = filter === 'all' || p.status === filter;
    const matchType = typeFilter === 'All' || p.type === typeFilter;
    const matchSearch = !searchQ || p.holder.toLowerCase().includes(searchQ.toLowerCase()) || p.id.toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="h-6 w-6 text-green-500" />Permits & Licenses</h1>
            <p className="text-sm text-muted-foreground">{PERMITS.length} total — {PERMITS.filter(p => p.status === 'expiring').length} expiring soon</p>
          </div>
        </div>
        <Button onClick={() => setShowIssue(!showIssue)}><Plus className="mr-2 h-4 w-4" />{showIssue ? 'Cancel' : 'Issue Permit'}</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active', count: PERMITS.filter(p => p.status === 'active').length, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Expiring', count: PERMITS.filter(p => p.status === 'expiring').length, icon: Clock, color: 'text-yellow-500' },
          { label: 'Expired', count: PERMITS.filter(p => p.status === 'expired').length, icon: AlertCircle, color: 'text-red-500' },
          { label: 'Pending', count: PERMITS.filter(p => p.status === 'pending').length, icon: FileCheck, color: 'text-blue-500' },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4"><s.icon className={`h-6 w-6 ${s.color}`} /><div><p className="text-xl font-bold">{s.count}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></CardContent></Card>
        ))}
      </div>

      {showIssue && (
        <Card className="border-green-200">
          <CardHeader><CardTitle className="text-base">Issue New Permit</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2"><Label>Permit Type *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Food Premises</option><option>Factory Health</option><option>Trade License</option><option>Building Health</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Holder Name *</Label><Input placeholder="Business / person name" /></div>
              <div className="space-y-2"><Label>Address *</Label><Input placeholder="Full address" /></div>
              <div className="space-y-2"><Label>Issue Date *</Label><Input type="date" /></div>
              <div className="space-y-2"><Label>Expiry Date *</Label><Input type="date" /></div>
              <div className="space-y-2"><Label>Fee Paid (LKR)</Label><Input type="number" placeholder="Amount" /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowIssue(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowIssue(false)}>Issue Permit</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input className="sm:max-w-xs" placeholder="Search permits..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option>All</option><option>Food Premises</option><option>Factory Health</option><option>Trade License</option><option>Building Health</option>
        </select>
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'expiring', 'expired', 'pending'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize text-xs">{f}</Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="overflow-auto p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50"><th className="px-4 py-3 text-left text-xs">ID</th><th className="px-4 py-3 text-left text-xs">Type</th><th className="px-4 py-3 text-left text-xs">Holder</th><th className="px-4 py-3 text-left text-xs">Issued</th><th className="px-4 py-3 text-left text-xs">Expires</th><th className="px-4 py-3 text-left text-xs">Grade</th><th className="px-4 py-3 text-left text-xs">Status</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className={`border-b hover:bg-muted/30 ${p.status === 'expired' ? 'bg-red-50/50 dark:bg-red-950/5' : p.status === 'expiring' ? 'bg-yellow-50/50 dark:bg-yellow-950/5' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                  <td className="px-4 py-3">{p.type}</td>
                  <td className="px-4 py-3"><div><p className="font-medium">{p.holder}</p><p className="text-xs text-muted-foreground">{p.address}</p></div></td>
                  <td className="px-4 py-3 text-muted-foreground">{p.issued}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.expires}</td>
                  <td className="px-4 py-3 font-medium">{p.grade}</td>
                  <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(p.status)}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
