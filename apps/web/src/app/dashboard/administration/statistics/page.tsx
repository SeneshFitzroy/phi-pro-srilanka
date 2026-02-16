'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, BarChart3, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CATEGORIES = [
  { key: 'population', label: 'Total Population' },
  { key: 'males', label: 'Males' },
  { key: 'females', label: 'Females' },
  { key: 'households', label: 'Total Households' },
  { key: 'births', label: 'Births' },
  { key: 'deaths', label: 'Deaths' },