'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Send,
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

// H800 100-point scoring sections
const scoringSections = [
  {
    id: 'premises',
    title: 'Premises & Structure',
    titleSi: 'ස්ථානය සහ ව්‍යුහය',
    maxScore: 30,
    items: [
      { id: 'walls', label: 'Walls Condition', max: 5 },
      { id: 'floors', label: 'Floors Condition', max: 5 },
      { id: 'ceiling', label: 'Ceiling Condition', max: 5 },
      { id: 'ventilation', label: 'Ventilation', max: 5 },
      { id: 'lighting', label: 'Lighting', max: 5 },
      { id: 'pestProofing', label: 'Pest Proofing', max: 5 },
    ],
  },
  {