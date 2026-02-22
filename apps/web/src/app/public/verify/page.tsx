'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, Search, CheckCircle, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type VerifyResult = { valid: boolean; type: string; holder: string; issued: string; expires: string; grade?: string; area?: string; } | null;

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<VerifyResult>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    // Simulated verification
    if (code.toUpperCase().startsWith('FP-')) {
      setResult({ valid: true, type: 'Food Premises Registration', holder: 'Golden Dragon Restaurant', issued: '2024-06-15', expires: '2025-06-14', grade: 'A', area: 'Colombo MOH Area' });
    } else if (code.toUpperCase().startsWith('FC-')) {
      setResult({ valid: true, type: 'Factory Health Certificate', holder: 'Lanka Garments Ltd.', issued: '2024-09-01', expires: '2025-08-31', area: 'Kaduwela MOH Area' });
    } else if (code.toUpperCase().startsWith('CMP-')) {
      setResult({ valid: true, type: 'Complaint Reference', holder: 'Public Complaint', issued: '2025-01-20', expires: 'N/A', area: 'Nugegoda PHI Area' });
    } else {
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto max-w-lg px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/public"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-purple-600" />Verify Certificate</h1>
            <p className="text-sm text-muted-foreground">Verify authenticity of PHI-PRO issued certificates</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-center"><QrCode className="h-20 w-20 text-muted-foreground/30" /></div>
            <p className="text-sm text-center text-muted-foreground">Scan the QR code on the certificate or enter the reference number below</p>
            <form onSubmit={handleVerify} className="space-y-3">
              <div className="space-y-2">
                <Label>Certificate / Reference Number</Label>
                <div className="flex gap-2">
                  <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. FP-20250001 or CMP-12345678" required />
                  <Button type="submit"><Search className="mr-1 h-4 w-4" />Verify</Button>
                </div>
              </div>
            </form>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Supported codes:</strong></p>
              <p>FP-xxxxx — Food Premises Registration</p>
              <p>FC-xxxxx — Factory Health Certificate</p>
              <p>CMP-xxxxx — Complaint Reference</p>
            </div>
          </CardContent>
        </Card>

        {searched && (
          result ? (
            <Card className="border-green-300 bg-green-50 dark:bg-green-950/10">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                  <div>
                    <p className="font-bold text-green-800 dark:text-green-200">Valid Certificate</p>
                    <p className="text-sm text-muted-foreground">This document is authentic and issued by PHI-PRO System</p>
                  </div>
                </div>
                <div className="rounded-lg bg-white dark:bg-gray-900 border p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span className="font-medium">{result.type}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Issued To</span><span className="font-medium">{result.holder}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date Issued</span><span>{result.issued}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Valid Until</span><span>{result.expires}</span></div>
                  {result.grade && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Hygiene Grade</span><span className="font-bold text-green-700">Grade {result.grade}</span></div>}
                  {result.area && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Area</span><span>{result.area}</span></div>}
                </div>
              </CardContent>
            </Card>