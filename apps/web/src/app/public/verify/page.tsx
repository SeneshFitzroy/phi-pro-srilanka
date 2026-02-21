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