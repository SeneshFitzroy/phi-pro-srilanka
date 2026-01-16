'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, FlaskConical, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const samples = [
  { id: 'S-2025-001', premises: 'Saman Hotel', type: 'Cooked Rice', collectedDate: '2025-02-01', sentToMRI: '2025-02-02', result: 'PASS', status: 'Completed' },
  { id: 'S-2025-002', premises: 'City Bakery', type: 'Bread', collectedDate: '2025-02-05', sentToMRI: '2025-02-06', result: 'FAIL', status: 'Action Required' },
  { id: 'S-2025-003', premises: 'Fresh Mart', type: 'Milk', collectedDate: '2025-02-10', sentToMRI: '2025-02-11', result: 'Pending', status: 'Awaiting Results' },
  { id: 'S-2025-004', premises: 'Lanka Restaurant', type: 'Curry Paste', collectedDate: '2025-02-12', sentToMRI: '2025-02-13', result: 'PASS', status: 'Completed' },
  { id: 'S-2025-005', premises: 'Street Vendor #12', type: 'Fried Rice', collectedDate: '2025-02-14', sentToMRI: '—', result: '—', status: 'Pending MRI Submission' },
];