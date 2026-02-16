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
  { key: 'infantDeaths', label: 'Infant Deaths' },
  { key: 'maternalDeaths', label: 'Maternal Deaths' },
  { key: 'dengue', label: 'Dengue Cases' },
  { key: 'typhoid', label: 'Typhoid Cases' },
  { key: 'dysentery', label: 'Dysentery Cases' },
  { key: 'foodPoisoning', label: 'Food Poisoning Cases' },
  { key: 'tuberculosis', label: 'Tuberculosis Cases' },
  { key: 'leprosy', label: 'Leprosy Cases' },
  { key: 'rabies', label: 'Animal Bite / Rabies' },
  { key: 'foodPremises', label: 'Food Premises Inspected' },
  { key: 'schoolsInspected', label: 'Schools Inspected' },
  { key: 'factoriesInspected', label: 'Factories Inspected' },
  { key: 'waterSamples', label: 'Water Samples Tested' },
  { key: 'foodSamples', label: 'Food Samples Tested' },
];

const currentYear = new Date().getFullYear();