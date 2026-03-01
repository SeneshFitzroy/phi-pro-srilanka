'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Search, Clock, MapPin, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const COMPLAINTS = [
  { id: 'CMP-10234521', type: 'Food Safety Concern', desc: 'Cockroaches observed in kitchen area of restaurant. Unhygienic food handling practices.', location: '45 Main St, Colombo 07', area: 'Colombo North', reporter: 'Anonymous', date: '2025-02-10', status: 'new', priority: 'high', assigned: '-' },
  { id: 'CMP-10234520', type: 'Mosquito Breeding', desc: 'Stagnant water in abandoned construction site, many mosquito larvae visible.', location: '78 Temple Rd, Nugegoda', area: 'Nugegoda', reporter: 'R. Silva — 077-1234567', date: '2025-02-09', status: 'assigned', priority: 'high', assigned: 'K. Perera' },
  { id: 'CMP-10234519', type: 'Garbage Dumping', desc: 'Illegal garbage dumping near canal. Attracting rats and producing foul smell.', location: 'Canal Rd, Dehiwala', area: 'Dehiwala West', reporter: 'M. Fernando — m.f@email.com', date: '2025-02-09', status: 'investigating', priority: 'medium', assigned: 'R. Fernando' },
  { id: 'CMP-10234518', type: 'Water Contamination', desc: 'Well water has unusual color and smell after nearby factory started operations.', location: '23 Factory Ln, Homagama', area: 'Homagama', reporter: 'A. Bandara — 070-9876543', date: '2025-02-08', status: 'investigating', priority: 'high', assigned: 'A. Bandara' },
  { id: 'CMP-10234517', type: 'Unsanitary Premises', desc: 'Public toilet near bus stand in very poor condition. No water supply, broken doors.', location: 'Bus Stand, Moratuwa', area: 'Moratuwa', reporter: 'Anonymous', date: '2025-02-07', status: 'resolved', priority: 'low', assigned: 'S. Jayawardena' },
];

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  assigned: 'bg-yellow-100 text-yellow-700',
  investigating: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

export default function ComplaintsManagementPage() {
  const [filter, setFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  const filtered = COMPLAINTS.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter;
    const matchSearch = !searchQ || c.desc.toLowerCase().includes(searchQ.toLowerCase()) || c.id.toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-orange-500" />Complaints Management</h1>
            <p className="text-sm text-muted-foreground">{COMPLAINTS.length} total complaints</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'New', count: COMPLAINTS.filter(c => c.status === 'new').length, color: 'text-blue-500' },
          { label: 'Assigned', count: COMPLAINTS.filter(c => c.status === 'assigned').length, color: 'text-yellow-500' },
          { label: 'Investigating', count: COMPLAINTS.filter(c => c.status === 'investigating').length, color: 'text-purple-500' },
          { label: 'Resolved', count: COMPLAINTS.filter(c => c.status === 'resolved').length, color: 'text-green-500' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4"><p className={`text-xl font-bold ${s.color}`}>{s.count}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search complaints..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'new', 'assigned', 'investigating', 'resolved'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize text-xs">{f}</Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(complaint => (
          <Card key={complaint.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{complaint.id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[complaint.status]}`}>{complaint.status}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[complaint.priority]}`}>{complaint.priority}</span>
                  </div>
                  <p className="font-medium text-sm">{complaint.type}</p>
                  <p className="text-sm text-muted-foreground">{complaint.desc}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{complaint.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{complaint.date}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm"><Eye className="mr-1 h-3 w-3" />View</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}