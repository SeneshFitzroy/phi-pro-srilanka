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
        <div className="flex items-center gap-3">
          <Link href="/public"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6 text-emerald-600" />Fees & Payments</h1>
            <p className="text-sm text-muted-foreground">Fee schedule and payment information for PHI services</p>
          </div>
        </div>

        <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/10">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-800 dark:text-emerald-200">Payment Methods</p>
              <p className="text-muted-foreground mt-1">Payments can be made at the MOH Office during working hours (8:30 AM – 4:15 PM, Mon–Fri). Online payments via GovPay will be available soon.</p>
            </div>
          </CardContent>
        </Card>