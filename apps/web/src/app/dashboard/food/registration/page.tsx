'use client';

import { useState } from 'react';
import { Plus, Search, Building2, CheckCircle, Clock, Phone, MapPin, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubpageHeader } from '@/components/dashboard-subpage-header';

interface RegisteredPremises {
  id: string; name: string; owner: string; type: string; risk: 'HIGH' | 'MEDIUM' | 'LOW';
  grade: 'A' | 'B' | 'C'; regDate: string; expiry: string; status: string;
  phone: string; address: string;
}

const registeredPremises: RegisteredPremises[] = [
  { id: 'H801-001', name: 'Saman Hotel',       owner: 'K. Perera',     type: 'Restaurant', risk: 'HIGH',   grade: 'A', regDate: '2025-06-15', expiry: '2026-06-15', status: 'Active',        phone: '+94 11 234 5678', address: '12 Galle Rd, Colombo 03' },
  { id: 'H801-002', name: 'City Bakery',       owner: 'M. Silva',      type: 'Bakery',     risk: 'HIGH',   grade: 'B', regDate: '2025-08-20', expiry: '2026-08-20', status: 'Active',        phone: '+94 11 587 1212', address: '89 High Level Rd, Nugegoda' },
  { id: 'H801-003', name: 'Fresh Mart',        owner: 'A. Fernando',   type: 'Grocery',    risk: 'MEDIUM', grade: 'A', regDate: '2025-04-10', expiry: '2026-04-10', status: 'Active',        phone: '+94 33 222 3456', address: '17 Negombo Rd, Gampaha' },
  { id: 'H801-004', name: 'Lanka Restaurant',  owner: 'S. Jayasinghe', type: 'Restaurant', risk: 'HIGH',   grade: 'C', regDate: '2025-09-01', expiry: '2026-03-01', status: 'Expiring Soon', phone: '+94 91 222 4567', address: '4 Lighthouse St, Galle Fort' },
  { id: 'H801-005', name: 'Rasa Bojun',        owner: 'D. Bandara',    type: 'Restaurant', risk: 'HIGH',   grade: 'C', regDate: '2025-07-12', expiry: '2026-07-12', status: 'Active',        phone: '+94 81 222 9090', address: '23 D.S. Senanayake Veediya, Kandy' },
];

const riskTone = {
  HIGH:   'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  LOW:    'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
} as const;

const gradeTone = {
  A: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  B: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  C: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
} as const;

export default function FoodRegistrationPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = registeredPremises.filter((p) =>
    [p.name, p.owner, p.id, p.type, p.address].some((f) => f.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <SubpageHeader
        backHref="/dashboard/food"
        module="Module 02 · Food Safety"
        code="H801"
        icon={FileText}
        title="Food premises registration"
        subtitle="Register, manage and renew food-establishment certificates"
        tone="emerald"
        actions={
          <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" /> Register new
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3 p-4"><Building2 className="h-8 w-8 text-emerald-700" /><div><p className="text-2xl font-bold">48</p><p className="text-xs text-muted-foreground">Total registered</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">42</p><p className="text-xs text-muted-foreground">Active</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><Clock className="h-8 w-8 text-amber-500" /><div><p className="text-2xl font-bold">4</p><p className="text-xs text-muted-foreground">Expiring soon</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><Building2 className="h-8 w-8 text-red-500" /><div><p className="text-2xl font-bold">2</p><p className="text-xs text-muted-foreground">Expired</p></div></CardContent></Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New registration</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2"><Label>Premises name *</Label><Input placeholder="Business name" /></div>
              <div className="space-y-2"><Label>Owner name *</Label><Input placeholder="Full name" /></div>
              <div className="space-y-2"><Label>Owner NIC *</Label><Input placeholder="National ID" /></div>
              <div className="space-y-2"><Label>Phone</Label><Input type="tel" placeholder="+94..." /></div>
              <div className="space-y-2"><Label>Address *</Label><Input placeholder="Full address" /></div>
              <div className="space-y-2"><Label>GN Division</Label><Input placeholder="GN code" /></div>
              <div className="space-y-2">
                <Label>Food type</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option>Restaurant</option><option>Bakery</option><option>Grocery</option><option>Meat/Fish</option><option>Tea Shop</option><option>Street Vendor</option></select>
              </div>
              <div className="space-y-2">
                <Label>Risk level</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="HIGH">High (Quarterly)</option><option value="MEDIUM">Medium (Biannual)</option><option value="LOW">Low (Annual)</option></select>
              </div>
              <div className="flex items-end"><Button className="w-full bg-emerald-700 hover:bg-emerald-800">Register &amp; issue certificate</Button></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registry Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registered premises</CardTitle>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, owner, address…" className="w-72 pl-9" /></div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4 font-semibold">Reg. No.</th>
                  <th className="pb-3 pr-4 font-semibold">Premises</th>
                  <th className="pb-3 pr-4 font-semibold">Owner</th>
                  <th className="pb-3 pr-4 font-semibold">Type</th>
                  <th className="pb-3 pr-4 font-semibold">Risk</th>
                  <th className="pb-3 pr-4 font-semibold">Grade</th>
                  <th className="pb-3 pr-4 font-semibold">Expiry</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${p.address}, Sri Lanka`)}`;
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-accent/50">
                      <td className="py-3 pr-4 font-mono text-xs">{p.id}</td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">{p.address}</p>
                      </td>
                      <td className="py-3 pr-4">{p.owner}</td>
                      <td className="py-3 pr-4">{p.type}</td>
                      <td className="py-3 pr-4"><span className={`rounded px-2 py-0.5 text-[11px] font-bold ${riskTone[p.risk]}`}>{p.risk}</span></td>
                      <td className="py-3 pr-4"><span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold ${gradeTone[p.grade]}`}>{p.grade}</span></td>
                      <td className="py-3 pr-4 text-muted-foreground">{p.expiry}</td>
                      <td className="py-3 pr-4"><span className={`text-[11px] font-bold ${p.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>{p.status}</span></td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <a
                            href={`tel:${p.phone.replace(/\s/g, '')}`}
                            aria-label={`Call ${p.name}`}
                            title={p.phone}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={mapsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${p.name} in Google Maps`}
                            title="Open in Google Maps"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
