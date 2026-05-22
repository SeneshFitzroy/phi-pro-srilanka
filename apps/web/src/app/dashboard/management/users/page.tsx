'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, UserPlus, Trash2, Search, Mail, Phone, ShieldOff, ShieldCheck } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AuthGuard } from '@/components/auth-guard';
import { UserRole } from '@phi-pro/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface OfficerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  area: string;
  status: string;
  lastLogin: string;
  isLive?: boolean;
}

const SEED: OfficerUser[] = [
  { id: 's1', name: 'K. Perera',       email: 'k.perera@health.gov.lk',       phone: '071-1234567', role: 'PHI',       area: 'Colombo North',    status: 'active',   lastLogin: '2025-02-10' },
  { id: 's2', name: 'M. Silva',        email: 'm.silva@health.gov.lk',        phone: '077-2345678', role: 'PHI',       area: 'Kaduwela East',    status: 'active',   lastLogin: '2025-02-10' },
  { id: 's3', name: 'R. Fernando',     email: 'r.fernando@health.gov.lk',     phone: '076-3456789', role: 'PHI',       area: 'Dehiwala West',    status: 'active',   lastLogin: '2025-02-09' },
  { id: 's4', name: 'S. Jayawardena',  email: 's.jayawardena@health.gov.lk',  phone: '070-4567890', role: 'PHI',       area: 'Moratuwa',         status: 'inactive', lastLogin: '2025-01-20' },
  { id: 's5', name: 'A. Bandara',      email: 'a.bandara@health.gov.lk',      phone: '075-5678901', role: 'PHI',       area: 'Homagama',         status: 'active',   lastLogin: '2025-02-08' },
  { id: 's6', name: 'Dr. N. Wickrama', email: 'n.wickrama@health.gov.lk',     phone: '071-6789012', role: 'SPHI',      area: 'Western Province', status: 'active',   lastLogin: '2025-02-10' },
  { id: 's7', name: 'Dr. T. Gunasekara',email: 't.gunasekara@health.gov.lk', phone: '077-7890123', role: 'MOH_ADMIN', area: 'Colombo MOH',      status: 'active',   lastLogin: '2025-02-10' },
];

const roleColor = (r: string) =>
  r === 'MOH_ADMIN' || r === 'MOH' ? 'bg-purple-100 text-purple-700' : r === 'SPHI' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';

const statusColor = (s: string) =>
  s === 'active' ? 'bg-green-100 text-green-700' : s === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600';

export default function UserManagementPage() {
  return (
    <AuthGuard allowedRoles={[UserRole.SPHI, UserRole.MOH_ADMIN]}>
      <UserManagementContent />
    </AuthGuard>
  );
}

function UserManagementContent() {
  const [users, setUsers]         = useState<OfficerUser[]>(SEED);
  const [showForm, setShowForm]   = useState(false);
  const [searchQ, setSearchQ]     = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [saving, setSaving]       = useState(false);

  // Form state
  const [newName,  setNewName]  = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole,  setNewRole]  = useState('PHI');
  const [newArea,  setNewArea]  = useState('');
  const [newPass,  setNewPass]  = useState('');

  // Real-time Firestore listener for `users` collection
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const live: OfficerUser[] = snap.docs
        .map((d) => {
          const x = d.data();
          // Only show officer accounts (not public users)
          if (x.role === UserRole.PUBLIC || x.role === 'public') return null;
          return {
            id:        d.id,
            name:      x.displayName || x.name || '—',
            email:     x.email       || '—',
            phone:     x.phone       || '—',
            role:      x.role        || 'PHI',
            area:      x.area        || x.assignedArea || '—',
            status:    x.status      || 'active',
            lastLogin: x.lastLoginAt ? new Date(x.lastLoginAt).toISOString().slice(0, 10) : '—',
            isLive:    true,
          } as OfficerUser;
        })
        .filter((u): u is OfficerUser => u !== null);
      if (live.length > 0) setUsers(live);
    }, () => { /* keep seed */ });
    return () => unsub();
  }, []);

  const filtered = users.filter((u) => {
    const matchRole   = roleFilter === 'All' || u.role === roleFilter || (roleFilter === 'MOH' && (u.role === 'MOH_ADMIN' || u.role === 'MOH'));
    const matchSearch = !searchQ || u.name.toLowerCase().includes(searchQ.toLowerCase()) || u.email.toLowerCase().includes(searchQ.toLowerCase());
    return matchRole && matchSearch;
  });

  const setUserStatus = async (u: OfficerUser, status: string) => {
    if (u.isLive) {
      try {
        await updateDoc(doc(db, 'users', u.id), { status, updatedAt: new Date().toISOString() });
        toast.success(`User ${status === 'active' ? 'unfrozen' : status}`);
      } catch { toast.error('Update failed'); }
    } else {
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, status } : x));
      toast.success(`User ${status === 'active' ? 'unfrozen' : status}`);
    }
  };

  const deleteUser = async (u: OfficerUser) => {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    if (u.isLive) {
      try {
        await deleteDoc(doc(db, 'users', u.id));
        toast.success('User deleted');
      } catch { toast.error('Delete failed'); }
    } else {
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      toast.success('User deleted');
    }
  };

  const createUser = async () => {
    if (!newName.trim() || !newEmail.trim() || newPass.length < 8) {
      toast.error('Name, email and password (≥ 8 chars) are required');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'users'), {
        displayName:  newName.trim(),
        email:        newEmail.trim(),
        phone:        newPhone.trim(),
        role:         newRole,
        area:         newArea.trim(),
        status:       'active',
        createdAt:    serverTimestamp(),
        updatedAt:    serverTimestamp(),
      });
      toast.success('User created');
      setShowForm(false);
      setNewName(''); setNewEmail(''); setNewPhone(''); setNewRole('PHI'); setNewArea(''); setNewPass('');
    } catch { toast.error('Failed to create user'); }
    finally { setSaving(false); }
  };

  const phiCount = users.filter((u) => u.role === 'PHI').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-blue-500" />Officer Management</h1>
            <p className="text-sm text-muted-foreground">{users.length} officers — {phiCount} PHIs</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><UserPlus className="mr-2 h-4 w-4" />{showForm ? 'Cancel' : 'Add Officer'}</Button>
      </div>

      {showForm && (
        <Card className="border-blue-200">
          <CardHeader><CardTitle className="text-base">Create New Officer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2"><Label>Full Name *</Label><Input placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="email@health.gov.lk" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input type="tel" placeholder="07x xxx xxxx" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                  <option value="PHI">PHI</option><option value="SPHI">SPHI</option><option value="MOH_ADMIN">MOH Admin</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Assigned Area *</Label><Input placeholder="Area name" value={newArea} onChange={(e) => setNewArea(e.target.value)} /></div>
              <div className="space-y-2"><Label>Temporary Password *</Label><Input type="password" placeholder="Min 8 characters" value={newPass} onChange={(e) => setNewPass(e.target.value)} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={createUser} disabled={saving}>{saving ? 'Creating…' : 'Create Officer'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search officers…" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['All', 'PHI', 'SPHI', 'MOH'].map((r) => (
            <Button key={r} size="sm" variant={roleFilter === r ? 'default' : 'outline'} onClick={() => setRoleFilter(r)} className="text-xs">{r}</Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="overflow-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {['Name', 'Contact', 'Role', 'Area', 'Status', 'Last Login', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{u.email}</span>
                      {u.phone && u.phone !== '—' && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{u.phone}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${roleColor(u.role)}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.area}</td>
                  <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${statusColor(u.status)}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{u.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.status === 'active' ? (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" title="Block user" onClick={() => setUserStatus(u, 'blocked')}>
                          <ShieldOff className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" title="Unfreeze user" onClick={() => setUserStatus(u, 'active')}>
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" title="Delete user" onClick={() => deleteUser(u)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No officers found</div>}
        </CardContent>
      </Card>
    </div>
  );
}
