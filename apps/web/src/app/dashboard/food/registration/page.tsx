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