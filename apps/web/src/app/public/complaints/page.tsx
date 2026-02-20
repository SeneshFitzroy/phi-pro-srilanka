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