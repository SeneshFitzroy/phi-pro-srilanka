'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, Plus, FileCheck, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AuthGuard } from '@/components/auth-guard';
import { UserRole } from '@phi-pro/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Permit {
  id: string;
  type: string;
  holder: string;
  address: string;
  issued: string;
  expires: string;
  status: string;
  grade: string;
  isLive?: boolean;
}

const SEED: Permit[] = [
  { id: 'PRM-2025-001', type: 'Food Premises',   holder: 'Golden Dragon Restaurant',  address: '45 Main St, Colombo 07',      issued: '2024-06-15', expires: '2025-06-14', status: 'active',   grade: 'A' },
  { id: 'PRM-2025-002', type: 'Food Premises',   holder: 'Fresh Bakery & Cafe',        address: '12 Galle Rd, Dehiwala',       issued: '2024-09-01', expires: '2025-08-31', status: 'active',   grade: 'A' },
  { id: 'PRM-2025-003', type: 'Factory Health',  holder: 'Lanka Garments Ltd.',        address: '50 Industrial Zone, Kaduwela',issued: '2024-07-20', expires: '2025-07-19', status: 'active',   grade: '-' },
  { id: 'PRM-2025-004', type: 'Food Premises',   holder: 'Corner Deli',                address: '5 Temple Rd, Nugegoda',       issued: '2024-03-10', expires: '2025-03-09', status: 'expiring', grade: 'C' },
  { id: 'PRM-2025-005', type: 'Trade License',   holder: 'ABC Processing',             address: '100 Factory Rd, Homagama',    issued: '2024-01-15', expires: '2025-01-14', status: 'expired',  grade: '-' },
  { id: 'PRM-2025-006', type: 'Food Premises',   holder: 'Sunrise Hotel',              address: '200 Beach Rd, Mt. Lavinia',   issued: '2025-02-01', expires: '2026-01-31', status: 'active',   grade: 'A' },
  { id: 'PRM-2025-007', type: 'Building Health', holder: 'New Commercial Center',      address: '300 Main Rd, Piliyandala',    issued: '2025-01-10', expires: 'N/A',        status: 'pending',  grade: '-' },
];

const PERMIT_TYPES = ['Food Premises', 'Factory Health', 'Trade License', 'Building Health'];

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    active: 'bg-green-100 text-green-700', expiring: 'bg-yellow-100 text-yellow-700',
    expired: 'bg-red-100 text-red-700',    pending:  'bg-blue-100 text-blue-700',
    suspended: 'bg-gray-100 text-gray-600',
  };
  return m[s] || 'bg-gray-100 text-gray-600';
};

export default function PermitsPage() {
  return (
    <AuthGuard allowedRoles={[UserRole.SPHI, UserRole.MOH_ADMIN]}>
      <PermitsContent />
    </AuthGuard>
  );
}

function PermitsContent() {
  const [permits, setPermits]       = useState<Permit[]>(SEED);
  const [filter, setFilter]         = useState('all');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showIssue, setShowIssue]   = useState(false);
  const [searchQ, setSearchQ]       = useState('');
  const [saving, setSaving]         = useState(false);

  // Form fields
  const [newType,    setNewType]    = useState('Food Premises');
  const [newHolder,  setNewHolder]  = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newIssued,  setNewIssued]  = useState('');
  const [newExpires, setNewExpires] = useState('');
  const [newFee,     setNewFee]     = useState('');

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, 'permits'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const live: Permit[] = snap.docs.map((d) => {
        const x = d.data();
        return {
          id:      d.id,
          type:    x.type    || 'Permit',
          holder:  x.holder  || '—',
          address: x.address || '—',
          issued:  x.issued  || '—',
          expires: x.expires || '—',
          status:  x.status  || 'pending',
          grade:   x.grade   || '-',
          isLive:  true,
        };
      });
      setPermits(live);
    }, () => { /* keep seed on error */ });
    return () => unsub();
  }, []);

  const issuePermit = async () => {
    if (!newHolder.trim() || !newAddress.trim() || !newIssued) {
      toast.error('Holder name, address and issue date are required');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'permits'), {
        type:      newType,
        holder:    newHolder.trim(),
        address:   newAddress.trim(),
        issued:    newIssued,
        expires:   newExpires || 'N/A',
        status:    'active',
        grade:     '-',
        feePaid:   newFee ? Number(newFee) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Permit issued');
      setShowIssue(false);
      setNewHolder(''); setNewAddress(''); setNewIssued(''); setNewExpires(''); setNewFee('');
    } catch {
      toast.error('Failed to issue permit');
    } finally {
      setSaving(false);
    }
  };

  const suspend = async (permit: Permit) => {
    if (permit.isLive) {
      try {
        await updateDoc(doc(db, 'permits', permit.id), { status: 'suspended', updatedAt: new Date().toISOString() });
        toast.success('Permit suspended');
      } catch { toast.error('Update failed'); }
    } else {
      setPermits((prev) => prev.map((p) => p.id === permit.id ? { ...p, status: 'suspended' } : p));
    }
  };

  const filtered = permits.filter((p) => {
    const matchStatus = filter === 'all' || p.status === filter;
    const matchType   = typeFilter === 'All' || p.type === typeFilter;
    const matchSearch = !searchQ || p.holder.toLowerCase().includes(searchQ.toLowerCase()) || p.id.toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const counts = {
    active:   permits.filter((p) => p.status === 'active').length,
    expiring: permits.filter((p) => p.status === 'expiring').length,
    expired:  permits.filter((p) => p.status === 'expired').length,
    pending:  permits.filter((p) => p.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/management"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="h-6 w-6 text-green-500" />Permits &amp; Licenses</h1>
            <p className="text-sm text-muted-foreground">{permits.length} total — {counts.expiring} expiring soon</p>
          </div>
        </div>
        <Button onClick={() => setShowIssue(!showIssue)}><Plus className="mr-2 h-4 w-4" />{showIssue ? 'Cancel' : 'Issue Permit'}</Button>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active',   count: counts.active,   icon: CheckCircle, color: 'text-green-500' },
          { label: 'Expiring', count: counts.expiring,  icon: Clock,       color: 'text-yellow-500' },
          { label: 'Expired',  count: counts.expired,   icon: AlertCircle, color: 'text-red-500' },
          { label: 'Pending',  count: counts.pending,   icon: FileCheck,   color: 'text-blue-500' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`h-6 w-6 ${s.color}`} />
              <div><p className="text-xl font-bold">{s.count}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showIssue && (
        <Card className="border-green-200">
          <CardHeader><CardTitle className="text-base">Issue New Permit</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Permit Type *</Label>
                <select value={newType} onChange={(e) => setNewType(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {PERMIT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Holder Name *</Label><Input placeholder="Business / person name" value={newHolder}  onChange={(e) => setNewHolder(e.target.value)} /></div>
              <div className="space-y-2"><Label>Address *</Label>      <Input placeholder="Full address"          value={newAddress} onChange={(e) => setNewAddress(e.target.value)} /></div>
              <div className="space-y-2"><Label>Issue Date *</Label>   <Input type="date"                          value={newIssued}  onChange={(e) => setNewIssued(e.target.value)} /></div>
              <div className="space-y-2"><Label>Expiry Date</Label>    <Input type="date"                          value={newExpires} onChange={(e) => setNewExpires(e.target.value)} /></div>
              <div className="space-y-2"><Label>Fee Paid (LKR)</Label> <Input type="number" placeholder="Amount"  value={newFee}     onChange={(e) => setNewFee(e.target.value)} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowIssue(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={issuePermit} disabled={saving}>
                {saving ? 'Issuing…' : 'Issue Permit'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input className="sm:max-w-xs" placeholder="Search permits…" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option>All</option>{PERMIT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'expiring', 'expired', 'pending'].map((f) => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize text-xs">{f}</Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="overflow-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {['ID', 'Type', 'Holder', 'Issued', 'Expires', 'Grade', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                  <td className="px-4 py-3 text-xs">{p.type}</td>
                  <td className="px-4 py-3 text-xs font-medium">{p.holder}</td>
                  <td className="px-4 py-3 text-xs">{p.issued}</td>
                  <td className="px-4 py-3 text-xs">{p.expires}</td>
                  <td className="px-4 py-3 text-xs font-bold">{p.grade}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(p.status)}`}>{p.status}</span></td>
                  <td className="px-4 py-3">
                    {p.status !== 'suspended' && p.status !== 'expired' && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={() => suspend(p)}>Suspend</Button>
                    )}
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
