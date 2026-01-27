'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Syringe, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VaccineRecord {
  id: number;
  studentName: string;
  grade: string;
  age: string;
  gender: string;
  vaccine: string;
  doseNumber: string;
  batchNo: string;
  site: string;
  reaction: string;
  consent: boolean;