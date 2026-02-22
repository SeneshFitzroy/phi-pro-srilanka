'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileCheck, Check, X, Eye, Filter, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SUBMISSIONS = [
  { id: 'SUB-001', officer: 'K. Perera', form: 'H800 Food Inspection', establishment: 'Golden Dragon Restaurant', area: 'Colombo North', date: '2025-02-10', status: 'pending', grade: 'A (92%)' },
  { id: 'SUB-002', officer: 'M. Silva', form: 'H399 Weekly Return', establishment: '-', area: 'Kaduwela East', date: '2025-02-10', status: 'pending', grade: '-' },
  { id: 'SUB-003', officer: 'S. Jayawardena', form: 'SIV Case Investigation', establishment: 'Case #DEN-2025-034', area: 'Moratuwa', date: '2025-02-09', status: 'pending', grade: '-' },
  { id: 'SUB-004', officer: 'R. Fernando', form: 'PHI-1 Monthly Report', establishment: '-', area: 'Dehiwala West', date: '2025-02-09', status: 'approved', grade: '-' },
  { id: 'SUB-005', officer: 'A. Bandara', form: 'H1203 Factory Health', establishment: 'Lanka Garments Ltd.', area: 'Homagama', date: '2025-02-08', status: 'approved', grade: 'PASS (85%)' },
  { id: 'SUB-006', officer: 'N. Rathnayake', form: 'H801 Registration', establishment: 'ABC Bakery', area: 'Piliyandala', date: '2025-02-08', status: 'rejected', grade: '-' },
  { id: 'SUB-007', officer: 'K. Perera', form: 'H1204 Safety Inspection', establishment: 'Steel Works Co.', area: 'Colombo North', date: '2025-02-07', status: 'pending', grade: 'WARN (62%)' },