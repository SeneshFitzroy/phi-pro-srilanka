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