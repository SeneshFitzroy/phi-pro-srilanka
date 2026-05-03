'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, Search, CheckCircle, XCircle, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  collection, getDocs, query, where, orderBy, limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CertResult {
  valid: boolean;
  type: string;
  holder: string;
  issued: string;
  expires: string;
  grade?: string;
  area?: string;
  status?: string;
  issuedBy?: string;
}

/* Fallback local lookup for demo certificates */
const DEMO: Record<string, CertResult> = {
  'FP-20250001': { valid: true, type: 'Food Premises Registration', holder: 'Golden Dragon Restaurant', issued: '2024-06-15', expires: '2025-06-14', grade: 'A', area: 'Colombo MOH Area', status: 'Active', issuedBy: 'PHI Colombo North' },
  'FP-20250002': { valid: true, type: 'Food Premises Registration', holder: 'Fresh Bakery & Cafe', issued: '2024-09-01', expires: '2025-08-31', grade: 'A', area: 'Dehiwala MOH Area', status: 'Active', issuedBy: 'PHI Dehiwala' },
  'FC-20250001': { valid: true, type: 'Factory Health Certificate', holder: 'Lanka Garments Ltd.', issued: '2024-07-20', expires: '2025-07-19', area: 'Kaduwela MOH Area', status: 'Active', issuedBy: 'SPHI Kaduwela' },
  'TL-20250001': { valid: true, type: 'Trade License Health Clearance', holder: 'ABC Processing Ltd.', issued: '2024-01-15', expires: '2025-01-14', area: 'Homagama MOH Area', status: 'Expired', issuedBy: 'PHI Homagama' },
};

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CertResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setSearched(false);

    const normalised = code.trim().toUpperCase();

    try {
      /* 1 — Try Firestore permits collection first */
      const snap = await getDocs(
        query(
          collection(db, 'permits'),
          where('permitId', '==', normalised),
          limit(1),
        )
      );

      if (!snap.empty) {
        const d = snap.docs[0].data();
        setResult({
          valid: true,
          type: d.type ?? 'Health Permit',
          holder: d.holder ?? d.holderName ?? 'N/A',
          issued: d.issued ?? d.issuedDate ?? 'N/A',
          expires: d.expires ?? d.expiryDate ?? 'N/A',
          grade: d.grade,
          area: d.area ?? d.mohArea,
          status: d.status ?? 'Active',
          issuedBy: d.issuedBy ?? d.officerName,
        });
      } else if (DEMO[normalised]) {
        /* 2 — Fall back to demo data */
        setResult(DEMO[normalised]);
      } else if (normalised.startsWith('CMP-')) {
        /* 3 — Try public_complaints for CMP- tracking codes */
        const cmpSnap = await getDocs(
            query(
              collection(db, 'public_complaints'),
              where('trackingId', '==', normalised),
              limit(1),
            )
          );
        if (!cmpSnap.empty) {
          const d = cmpSnap.docs[0].data();
          setResult({
            valid: true,
            type: 'Complaint Reference',
            holder: d.contactName ?? 'Anonymous',
            issued: (d.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0]) ?? 'N/A',
            expires: 'N/A',
            area: `${d.district ?? ''} — ${d.location ?? ''}`.trim(),
            status: d.status ?? 'Pending',
          });
        } else {
          setResult(null);
        }
      } else {
        setResult(null);
      }
    } catch {
      /* Firestore error — try demo fallback */
      setResult(DEMO[normalised] ?? null);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const statusColor = (s?: string) => {
    if (!s) return 'text-muted-foreground';
    if (s.toLowerCase() === 'active') return 'text-green-600 font-semibold';
    if (s.toLowerCase() === 'expired') return 'text-red-600 font-semibold';
    return 'text-amber-600 font-semibold';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto max-w-lg space-y-6 px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/#services">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <ShieldCheck className="h-6 w-6 text-teal-600" />Verify Certificate
            </h1>
            <p className="text-sm text-muted-foreground">
              Instantly verify any PHI-PRO issued permit or certificate
            </p>
          </div>
        </div>

        {/* Verify form */}
        <Card className="shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/30">
                <QrCode className="h-10 w-10 text-teal-600/50" />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Scan the QR code on the physical certificate, or enter the reference number below
            </p>

            <form onSubmit={handleVerify} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Certificate / Reference Number</Label>
                <div className="flex gap-2">
                  <Input
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="e.g. FP-20250001 or CMP-12345678"
                    className="font-mono uppercase"
                    required
                  />
                  <Button type="submit" disabled={loading || !code.trim()} className="shrink-0 bg-teal-600 hover:bg-teal-700">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </form>

            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Supported prefixes:</p>
              <p><span className="font-mono font-medium text-teal-700 dark:text-teal-400">FP-</span> Food Premises Registration</p>
              <p><span className="font-mono font-medium text-teal-700 dark:text-teal-400">FC-</span> Factory Health Certificate</p>
              <p><span className="font-mono font-medium text-teal-700 dark:text-teal-400">TL-</span> Trade License Clearance</p>
              <p><span className="font-mono font-medium text-teal-700 dark:text-teal-400">CMP-</span> Complaint Tracking Reference</p>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {searched && !loading && (
          result ? (
            <Card className="border-green-300 bg-green-50 shadow-sm dark:border-green-800 dark:bg-green-950/10">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-green-800 dark:text-green-200">Verified — Authentic Certificate</p>
                    <p className="text-sm text-muted-foreground">Issued by the PHI-PRO Digital Health Enforcement System</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 rounded-xl border bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
                  {[
                    { label: 'Certificate Type', value: result.type },
                    { label: 'Issued To', value: result.holder },
                    { label: 'Date Issued', value: result.issued },
                    { label: 'Valid Until', value: result.expires },
                    ...(result.grade ? [{ label: 'Hygiene Grade', value: `Grade ${result.grade}` }] : []),
                    ...(result.area ? [{ label: 'MOH Area', value: result.area }] : []),
                    ...(result.issuedBy ? [{ label: 'Issued By', value: result.issuedBy }] : []),
                    { label: 'Status', value: result.status ?? 'Active', colorClass: statusColor(result.status) },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between px-4 py-2.5 text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={'colorClass' in row ? row.colorClass : 'font-medium'}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-red-200 bg-red-50 shadow-sm dark:border-red-900 dark:bg-red-950/10">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                  <XCircle className="h-7 w-7 text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-red-800 dark:text-red-200">Certificate Not Found</p>
                  <p className="text-sm text-muted-foreground">
                    No certificate found for <span className="font-mono font-medium">&quot;{code.toUpperCase()}&quot;</span>. Check the number and try again.
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {/* Info note */}
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-xs text-muted-foreground">
              If a certificate appears invalid but you believe it is genuine, contact the issuing MOH office directly.
              Certificate numbers are printed on all PHI-PRO issued permits and QR codes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
