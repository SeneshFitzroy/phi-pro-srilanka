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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/public"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6 text-blue-700" />Fees & Payments</h1>
            <p className="text-sm text-muted-foreground">Fee schedule and payment information for PHI services</p>
          </div>
        </div>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/10">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-800 dark:text-blue-200">Payment Methods</p>
              <p className="text-muted-foreground mt-1">Payments can be made at the MOH Office during working hours (8:30 AM – 4:15 PM, Mon–Fri). Online payments via GovPay will be available soon.</p>
            </div>
          </CardContent>
        </Card>

        {FEES.map(section => (
          <Card key={section.category}>
            <CardHeader className="bg-muted/50"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />{section.category}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="px-4 py-2 text-left">Service</th><th className="px-4 py-2 text-right">Fee</th><th className="px-4 py-2 text-right">Validity</th></tr></thead>
                <tbody>
                  {section.items.map(item => (
                    <tr key={item.name} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3 text-right font-semibold">{item.fee}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground flex items-center justify-end gap-1"><Clock className="h-3 w-3" />{item.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" />MOH Office Locations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'MOH Office — Colombo', addr: '123 Hospital Rd, Colombo 08', phone: '011-2345678' },
              { name: 'MOH Office — Kaduwela', addr: '45 MOH Lane, Kaduwela', phone: '011-9876543' },
              { name: 'MOH Office — Dehiwala', addr: '78 Health St, Dehiwala', phone: '011-5551234' },
            ].map(office => (
              <div key={office.name} className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className="font-medium text-sm">{office.name}</p>
                  <p className="text-xs text-muted-foreground">{office.addr}</p>
                  <p className="text-xs text-muted-foreground">{office.phone}</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs"><ExternalLink className="mr-1 h-3 w-3" />Directions</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}