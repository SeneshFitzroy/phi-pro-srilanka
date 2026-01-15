'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Building2, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const registeredPremises = [
  { id: 'H801-001', name: 'Saman Hotel', owner: 'K. Perera', type: 'Restaurant', risk: 'HIGH', grade: 'A', regDate: '2025-06-15', expiry: '2026-06-15', status: 'Active' },
  { id: 'H801-002', name: 'City Bakery', owner: 'M. Silva', type: 'Bakery', risk: 'HIGH', grade: 'B', regDate: '2025-08-20', expiry: '2026-08-20', status: 'Active' },
  { id: 'H801-003', name: 'Fresh Mart', owner: 'A. Fernando', type: 'Grocery', risk: 'MEDIUM', grade: 'A', regDate: '2025-04-10', expiry: '2026-04-10', status: 'Active' },
  { id: 'H801-004', name: 'Lanka Restaurant', owner: 'S. Jayasinghe', type: 'Restaurant', risk: 'HIGH', grade: 'C', regDate: '2025-09-01', expiry: '2026-03-01', status: 'Expiring Soon' },
  { id: 'H801-005', name: 'Rasa Bojun', owner: 'D. Bandara', type: 'Restaurant', risk: 'HIGH', grade: 'C', regDate: '2025-07-12', expiry: '2026-07-12', status: 'Active' },
];

export default function FoodRegistrationPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/food"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">Food Premises Registration (H801)</h1>
            <p className="text-sm text-muted-foreground">Register, manage, and renew food establishment certificates</p>
          </div>
        </div>
        <Button className="bg-food hover:bg-food-dark" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> Register New
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3 p-4"><Building2 className="h-8 w-8 text-food" /><div><p className="text-2xl font-bold">48</p><p className="text-xs text-muted-foreground">Total Registered</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">42</p><p className="text-xs text-muted-foreground">Active</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><Clock className="h-8 w-8 text-amber-500" /><div><p className="text-2xl font-bold">4</p><p className="text-xs text-muted-foreground">Expiring Soon</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><Building2 className="h-8 w-8 text-red-500" /><div><p className="text-2xl font-bold">2</p><p className="text-xs text-muted-foreground">Expired</p></div></CardContent></Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Registration</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2"><Label>Premises Name *</Label><Input placeholder="Business name" /></div>
              <div className="space-y-2"><Label>Owner Name *</Label><Input placeholder="Full name" /></div>
              <div className="space-y-2"><Label>Owner NIC *</Label><Input placeholder="National ID" /></div>
              <div className="space-y-2"><Label>Phone</Label><Input type="tel" placeholder="+94..." /></div>
              <div className="space-y-2"><Label>Address *</Label><Input placeholder="Full address" /></div>
              <div className="space-y-2"><Label>GN Division</Label><Input placeholder="GN code" /></div>
              <div className="space-y-2">
                <Label>Food Type</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option>Restaurant</option><option>Bakery</option><option>Grocery</option><option>Meat/Fish</option><option>Tea Shop</option><option>Street Vendor</option></select>
              </div>
              <div className="space-y-2">
                <Label>Risk Level</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="HIGH">High (Quarterly)</option><option value="MEDIUM">Medium (Biannual)</option><option value="LOW">Low (Annual)</option></select>
              </div>
              <div className="flex items-end"><Button className="bg-food hover:bg-food-dark w-full">Register & Issue Certificate</Button></div>
            </div>
          </CardContent>
        </Card>