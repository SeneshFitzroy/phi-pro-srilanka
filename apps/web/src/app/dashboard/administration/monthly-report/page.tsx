'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, FileText, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Section { title: string; items: { key: string; label: string }[]; color: string; }

const SECTIONS: Section[] = [
  {
    title: '1. Food & Water Safety',
    color: 'bg-green-50 dark:bg-green-950/10',
    items: [
      { key: 'f1', label: 'Food premises inspected' },
      { key: 'f2', label: 'Food samples collected' },
      { key: 'f3', label: 'Water samples collected' },
      { key: 'f4', label: 'Premises registered (new)' },
      { key: 'f5', label: 'Court cases filed' },
      { key: 'f6', label: 'Seizures/destructions' },
      { key: 'f7', label: 'Warnings issued' },