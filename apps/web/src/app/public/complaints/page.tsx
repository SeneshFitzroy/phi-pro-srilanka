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