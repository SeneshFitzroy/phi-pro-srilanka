'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, MessageSquare, Search, Clock, MapPin, Eye, Check, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const COMPLAINTS = [
  { id: 'CMP-10234521', type: 'Food Safety Concern', desc: 'Cockroaches observed in kitchen area of restaurant. Unhygienic food handling practices.', location: '45 Main St, Colombo 07', area: 'Colombo North', reporter: 'Anonymous', date: '2025-02-10', status: 'new', priority: 'high', assigned: '-' },
  { id: 'CMP-10234520', type: 'Mosquito Breeding', desc: 'Stagnant water in abandoned construction site, many mosquito larvae visible.', location: '78 Temple Rd, Nugegoda', area: 'Nugegoda', reporter: 'R. Silva — 077-1234567', date: '2025-02-09', status: 'assigned', priority: 'high', assigned: 'K. Perera' },
  { id: 'CMP-10234519', type: 'Garbage Dumping', desc: 'Illegal garbage dumping near canal. Attracting rats and producing foul smell.', location: 'Canal Rd, Dehiwala', area: 'Dehiwala West', reporter: 'M. Fernando — m.f@email.com', date: '2025-02-09', status: 'investigating', priority: 'medium', assigned: 'R. Fernando' },
  { id: 'CMP-10234518', type: 'Water Contamination', desc: 'Well water has unusual color and smell after nearby factory started operations.', location: '23 Factory Ln, Homagama', area: 'Homagama', reporter: 'A. Bandara — 070-9876543', date: '2025-02-08', status: 'investigating', priority: 'high', assigned: 'A. Bandara' },
  { id: 'CMP-10234517', type: 'Unsanitary Premises', desc: 'Public toilet near bus stand in very poor condition. No water supply, broken doors.', location: 'Bus Stand, Moratuwa', area: 'Moratuwa', reporter: 'Anonymous', date: '2025-02-07', status: 'resolved', priority: 'low', assigned: 'S. Jayawardena' },
  { id: 'CMP-10234516', type: 'Factory Emission', desc: 'Chemical smell from garment factory causing headaches for nearby residents.', location: '50 Industrial Zone, Kaduwela', area: 'Kaduwela East', reporter: 'Community Leader — 071-5551234', date: '2025-02-06', status: 'assigned', priority: 'medium', assigned: 'M. Silva' },
];

const statusColor = (s: string) => {
  const map: Record<string, string> = { new: 'bg-red-100 text-red-700', assigned: 'bg-yellow-100 text-yellow-700', investigating: 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-600' };
  return map[s] || 'bg-gray-100 text-gray-600';
};
const priorityColor = (p: string) => p === 'high' ? 'text-red-600 font-semibold' : p === 'medium' ? 'text-yellow-600' : 'text-gray-500';

export default function ComplaintsManagementPage() {
  const [filter, setFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  const filtered = COMPLAINTS.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter;
    const matchSearch = !searchQ || c.type.toLowerCase().includes(searchQ.toLowerCase()) || c.desc.toLowerCase().includes(searchQ.toLowerCase()) || c.id.toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6 text-red-500" />Complaints Management</h1>
          <p className="text-sm text-muted-foreground">{COMPLAINTS.filter(c => c.status === 'new').length} new, {COMPLAINTS.filter(c => c.status !== 'resolved' && c.status !== 'closed').length} open</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input className="sm:max-w-xs" placeholder="Search complaints..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {['all', 'new', 'assigned', 'investigating', 'resolved'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize text-xs">{f}</Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <Card key={c.id} className={c.status === 'new' ? 'border-red-200 bg-red-50/30 dark:bg-red-950/5' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColor(c.status)}`}>{c.status}</span>
                    <span className={`text-xs ${priorityColor(c.priority)}`}>{c.priority} priority</span>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs">{c.type}</span>
                  </div>
                  <p className="text-sm">{c.desc}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.date}</span>
                    <span>Reporter: {c.reporter}</span>
                    {c.assigned !== '-' && <span>Assigned: <strong>{c.assigned}</strong></span>}
                  </div>