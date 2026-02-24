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