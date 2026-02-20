'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, AlertTriangle, MapPin, Camera, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const COMPLAINT_TYPES = [
  'Food Safety Concern',
  'Unsanitary Premises',
  'Mosquito Breeding',
  'Water Contamination',
  'Garbage / Waste Dumping',
  'Noise / Air Pollution',
  'Stray Animals',
  'Disease Outbreak',
  'Factory Emission/Waste',
  'Drain Blockage',
  'Other',
];

export default function ComplaintsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [trackId, setTrackId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = 'CMP-' + Date.now().toString().slice(-8);
    setTrackId(ref);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">Complaint Submitted</h2>
            <p className="text-sm text-muted-foreground">Your complaint has been recorded and assigned to the relevant PHI officer.</p>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs text-muted-foreground">Tracking Reference</p>
              <p className="text-2xl font-mono font-bold">{trackId}</p>
            </div>
            <p className="text-xs text-muted-foreground">Save this reference to track your complaint status. Expected response within 48 hours.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setSubmitted(false)}>Submit Another</Button>
              <Link href="/public"><Button>Back to Portal</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/public"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-orange-500" />Submit a Complaint</h1>
            <p className="text-sm text-muted-foreground">Report public health or environmental concerns</p>
          </div>
        </div>

        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/10">
          <CardContent className="p-4 text-sm text-orange-800 dark:text-orange-200">
            <strong>Important:</strong> For emergencies (disease outbreaks, acute poisoning), please call <strong>1390</strong> immediately. This form is for non-emergency complaints.
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader><CardTitle className="text-base">Complaint Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">