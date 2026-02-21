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