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
    { name: 'Occupational Health Inspection', fee: 'LKR 5,000', duration: 'Per visit' },
  ]},
  { category: 'Environmental', items: [
    { name: 'Building Plan Approval (Health)', fee: 'LKR 3,000', duration: 'One-time' },
    { name: 'Trade License Health Clearance', fee: 'LKR 2,000', duration: '1 year' },
  ]},
  { category: 'Certificates & Copies', items: [
    { name: 'Certified Copy of Report', fee: 'LKR 500', duration: '-' },
    { name: 'Food Handler Medical Certificate', fee: 'LKR 1,000', duration: '6 months' },
  ]},
];

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">