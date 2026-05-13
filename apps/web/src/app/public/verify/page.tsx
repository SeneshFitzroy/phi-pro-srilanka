'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, QrCode, Search, CheckCircle, XCircle, ShieldCheck,
  Loader2, AlertCircle, Clock, Zap, History,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  collection, getDocs, query, where, limit,
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

const DEMO: Record<string, CertResult> = {
  'FP-20250001': { valid: true, type: 'Food Premises Registration', holder: 'Golden Dragon Restaurant', issued: '2024-06-15', expires: '2025-06-14', grade: 'A', area: 'Colombo MOH Area', status: 'Active', issuedBy: 'PHI Colombo North' },
  'FP-20250002': { valid: true, type: 'Food Premises Registration', holder: 'Fresh Bakery & Cafe', issued: '2024-09-01', expires: '2025-08-31', grade: 'A', area: 'Dehiwala MOH Area', status: 'Active', issuedBy: 'PHI Dehiwala' },
  'FC-20250001': { valid: true, type: 'Factory Health Certificate', holder: 'Lanka Garments Ltd.', issued: '2024-07-20', expires: '2025-07-19', area: 'Kaduwela MOH Area', status: 'Active', issuedBy: 'SPHI Kaduwela' },
  'TL-20250001': { valid: true, type: 'Trade License Health Clearance', holder: 'ABC Processing Ltd.', issued: '2024-01-15', expires: '2025-01-14', area: 'Homagama MOH Area', status: 'Expired', issuedBy: 'PHI Homagama' },
};

const QUICK_DEMOS = ['FP-20250001', 'FP-20250002', 'FC-20250001', 'TL-20250001'] as const;
const SESSION_KEY = 'phipro_recent_lookups';

function daysUntil(dateStr: string): number {
  try {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  } catch {
    return 0;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

function loadRecent(): string[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(code: string, current: string[]): string[] {
  const filtered = current.filter(c => c !== code);
  const next = [code, ...filtered].slice(0, 3);
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* */ }
  return next;
}

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CertResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentLookups, setRecentLookups] = useState<string[]>([]);

  useEffect(() => {
    setRecentLookups(loadRecent());
  }, []);

  const doVerify = useCallback(async (searchCode: string) => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setSearched(false);
    setResult(null);

    const normalised = searchCode.trim().toUpperCase();

    try {
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
        setResult(DEMO[normalised]);
      } else if (normalised.startsWith('CMP-')) {
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
      setResult(DEMO[normalised] ?? null);
    } finally {
      setLoading(false);
      setSearched(true);
      setRecentLookups(prev => saveRecent(normalised, prev));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doVerify(code);
  };

  const handleDemo = async (demo: string) => {
    setCode(demo);
    await doVerify(demo);
  };

  const handleRecent = async (rc: string) => {
    setCode(rc);
    await doVerify(rc);
  };

  const statusColor = (s?: string) => {
    if (!s) return 'text-muted-foreground';
    if (s.toLowerCase() === 'active') return 'text-green-600 font-semibold';
    if (s.toLowerCase() === 'expired') return 'text-red-600 font-semibold';
    return 'text-amber-600 font-semibold';
  };

  const isExpired = result && result.expires !== 'N/A' && daysUntil(result.expires) < 0;
  const daysLeft = result && result.expires !== 'N/A' ? daysUntil(result.expires) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-lg space-y-6 px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/">
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
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-50 ring-4 ring-teal-100 dark:bg-teal-950/30 dark:ring-teal-900">
                <QrCode className="h-10 w-10 text-teal-600/60" />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Scan the QR code on the physical certificate, or enter the reference number below
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Certificate / Reference Number</Label>
                <div className="flex gap-2">
                  <Input
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FP-20250001 or CMP-12345678"
                    className="font-mono"
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

        {/* Quick Demo section */}
        <Card className="shadow-sm border-dashed">
          <CardContent className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-teal-500" />Quick Demo — click to verify
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_DEMOS.map(demo => (
                <button
                  key={demo}
                  onClick={() => handleDemo(demo)}
                  disabled={loading}
                  className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 font-mono text-xs font-semibold text-teal-700 transition-all hover:bg-teal-100 hover:border-teal-300 disabled:opacity-50 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-400"
                >
                  {demo}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent lookups */}
        {recentLookups.length > 0 && (
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <History className="h-3.5 w-3.5" />Recent Lookups
              </p>
              <div className="flex flex-wrap gap-2">
                {recentLookups.map(rc => (
                  <button
                    key={rc}
                    onClick={() => handleRecent(rc)}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700 transition-all hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {rc}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {searched && !loading && (
          result ? (
            <div className="space-y-3">
              {/* Expired warning banner */}
              {isExpired && (
                <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-600 px-5 py-3.5 shadow-md">
                  <AlertCircle className="h-5 w-5 text-white shrink-0" />
                  <p className="text-sm font-bold text-white">EXPIRED — This certificate is no longer valid</p>
                </div>
              )}

              <Card className={`overflow-hidden shadow-sm ${isExpired ? 'border-red-300 dark:border-red-800' : 'border-green-300 dark:border-green-800'}`}>
                <CardContent className="p-0">
                  {/* Verified stamp header */}
                  <div className={`flex items-center gap-4 p-5 ${isExpired ? 'bg-red-50 dark:bg-red-950/10' : 'bg-green-50 dark:bg-green-950/10'}`}>
                    {/* Visual stamp */}
                    <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 shadow-md ${
                      isExpired
                        ? 'border-red-500 bg-red-100 dark:bg-red-900/40'
                        : 'border-green-500 bg-green-100 dark:bg-green-900/40'
                    }`}>
                      {isExpired
                        ? <XCircle className="h-8 w-8 text-red-600" />
                        : <CheckCircle className="h-8 w-8 text-green-600" />
                      }
                      {!isExpired && (
                        <svg className="absolute -bottom-1.5 -right-1.5 h-6 w-6" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="#16a34a" />
                          <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`font-bold ${isExpired ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
                        {isExpired ? 'Certificate Expired' : 'Verified — Authentic Certificate'}
                      </p>
                      <p className="text-xs text-muted-foreground">Issued by the PHI-PRO Digital Health Enforcement System</p>
                      {daysLeft !== null && !isExpired && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400">
                          <Clock className="h-3 w-3" />
                          Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { label: 'Certificate Type', value: result.type },
                      { label: 'Issued To', value: result.holder },
                      { label: 'Date Issued', value: formatDate(result.issued) },
                      { label: 'Valid Until', value: result.expires !== 'N/A' ? formatDate(result.expires) : 'N/A' },
                      ...(result.grade ? [{ label: 'Hygiene Grade', value: `Grade ${result.grade}` }] : []),
                      ...(result.area ? [{ label: 'MOH Area', value: result.area }] : []),
                      ...(result.issuedBy ? [{ label: 'Issued By', value: result.issuedBy }] : []),
                      ...(result.valid ? [{ label: 'Authorising Signature', value: 'On file' }] : []),
                      { label: 'Status', value: result.status ?? 'Active', isStatus: true },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between gap-2 px-5 py-3 text-sm">
                        <span className="text-muted-foreground shrink-0">{row.label}</span>
                        <span className={`text-right font-medium ${'isStatus' in row && row.isStatus ? statusColor(result.status) : ''}`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-red-200 bg-red-50 shadow-sm dark:border-red-900 dark:bg-red-950/10">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                  <XCircle className="h-8 w-8 text-red-600" />
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
        <Card className="border-0 bg-slate-50 shadow-sm dark:bg-slate-900/50">
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
