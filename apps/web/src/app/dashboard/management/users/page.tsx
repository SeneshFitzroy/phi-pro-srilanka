'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, UserPlus, Edit, Trash2, Search, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const USERS = [
  { id: 1, name: 'K. Perera', email: 'k.perera@health.gov.lk', phone: '071-1234567', role: 'PHI', area: 'Colombo North', status: 'active', lastLogin: '2025-02-10' },
  { id: 2, name: 'M. Silva', email: 'm.silva@health.gov.lk', phone: '077-2345678', role: 'PHI', area: 'Kaduwela East', status: 'active', lastLogin: '2025-02-10' },
  { id: 3, name: 'R. Fernando', email: 'r.fernando@health.gov.lk', phone: '076-3456789', role: 'PHI', area: 'Dehiwala West', status: 'active', lastLogin: '2025-02-09' },
  { id: 4, name: 'S. Jayawardena', email: 's.jayawardena@health.gov.lk', phone: '070-4567890', role: 'PHI', area: 'Moratuwa', status: 'inactive', lastLogin: '2025-01-20' },
  { id: 5, name: 'A. Bandara', email: 'a.bandara@health.gov.lk', phone: '075-5678901', role: 'PHI', area: 'Homagama', status: 'active', lastLogin: '2025-02-08' },
  { id: 6, name: 'Dr. N. Wickrama', email: 'n.wickrama@health.gov.lk', phone: '071-6789012', role: 'SPHI', area: 'Western Province', status: 'active', lastLogin: '2025-02-10' },
  { id: 7, name: 'Dr. T. Gunasekara', email: 't.gunasekara@health.gov.lk', phone: '077-7890123', role: 'MOH', area: 'Colombo MOH', status: 'active', lastLogin: '2025-02-10' },
];

const roleColor = (r: string) => r === 'MOH' ? 'bg-purple-100 text-purple-700' : r === 'SPHI' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
const statusColor = (s: string) => s === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';

export default function UserManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = USERS.filter(u => {
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchSearch = !searchQ || u.name.toLowerCase().includes(searchQ.toLowerCase()) || u.email.toLowerCase().includes(searchQ.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-blue-500" />User Management</h1>
            <p className="text-sm text-muted-foreground">{USERS.length} users across {USERS.filter(u => u.role === 'PHI').length} PHI areas</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><UserPlus className="mr-2 h-4 w-4" />{showForm ? 'Cancel' : 'Add User'}</Button>
      </div>

      {showForm && (
        <Card className="border-blue-200">
          <CardHeader><CardTitle className="text-base">Create New User</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2"><Label>Full Name *</Label><Input placeholder="Full name" /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="email@health.gov.lk" /></div>
              <div className="space-y-2"><Label>Phone</Label><Input type="tel" placeholder="07x xxx xxxx" /></div>
              <div className="space-y-2"><Label>Role *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>PHI</option><option>SPHI</option><option>MOH</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Assigned Area *</Label><Input placeholder="Area name" /></div>
              <div className="space-y-2"><Label>Temporary Password *</Label><Input type="password" placeholder="Min 8 characters" /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={() => setShowForm(false)}>Create User</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search users..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['All', 'PHI', 'SPHI', 'MOH'].map(r => (
            <Button key={r} size="sm" variant={roleFilter === r ? 'default' : 'outline'} onClick={() => setRoleFilter(r)} className="text-xs">{r}</Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="overflow-auto p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50"><th className="px-4 py-3 text-left text-xs">Name</th><th className="px-4 py-3 text-left text-xs">Contact</th><th className="px-4 py-3 text-left text-xs">Role</th><th className="px-4 py-3 text-left text-xs">Area</th><th className="px-4 py-3 text-left text-xs">Status</th><th className="px-4 py-3 text-left text-xs">Last Login</th><th className="px-4 py-3 text-left text-xs">Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3"><div className="flex flex-col text-xs text-muted-foreground"><span className="flex items-center gap-1"><Mail className="h-3 w-3" />{u.email}</span><span className="flex items-center gap-1"><Phone className="h-3 w-3" />{u.phone}</span></div></td>
                  <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${roleColor(u.role)}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.area}</td>
                  <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColor(u.status)}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{u.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
