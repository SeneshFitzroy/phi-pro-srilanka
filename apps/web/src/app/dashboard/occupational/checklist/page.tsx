'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, ClipboardCheck, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const checklistCategories = [
  {
    title: 'Administration & Documentation',
    items: ['Factory registration valid', 'Workers compensation insurance', 'Safety policy displayed', 'Accident register maintained', 'Training records available', 'Emergency contacts posted'],
  },
  {
    title: 'Fire & Emergency',
    items: ['Fire extinguishers serviced (date)', 'Emergency exits marked & clear', 'Fire alarm functional', 'Evacuation plan posted', 'Assembly point designated', 'Fire drill records'],
  },
  {