'use client';

import Link from 'next/link';
import { ArrowLeft, CreditCard, FileText, ExternalLink, Clock, Building2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FEES = [
  { category: 'Food Premises Registration', items: [
    { name: 'New Registration (Small)', fee: 'LKR 5,000', duration: '1 year' },
    { name: 'New Registration (Medium)', fee: 'LKR 10,000', duration: '1 year' },
    { name: 'New Registration (Large)', fee: 'LKR 25,000', duration: '1 year' },
    { name: 'Renewal', fee: 'LKR 3,000 – 15,000', duration: '1 year' },
    { name: 'Re-inspection Fee', fee: 'LKR 2,000', duration: '-' },
  ]},
  { category: 'Factory / Workplace', items: [
    { name: 'Factory Health Certificate', fee: 'LKR 10,000', duration: '1 year' },