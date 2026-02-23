'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, UserPlus, Edit, Trash2, Shield, Search, Mail, Phone } from 'lucide-react';
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