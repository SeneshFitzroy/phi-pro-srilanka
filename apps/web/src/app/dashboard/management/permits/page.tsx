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