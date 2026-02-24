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