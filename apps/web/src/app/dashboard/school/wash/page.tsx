'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Droplets, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const washSections = [
  {
    title: 'Water Supply',
    items: [
      { id: 'water_source', label: 'Primary water source', options: ['Pipe-borne (NWS&DB)', 'Well', 'Tube Well', 'Rain Harvest', 'Other'] },
      { id: 'water_safe', label: 'Water treated / safe to drink?', options: ['Yes', 'No', 'Unknown'] },
      { id: 'water_points', label: 'Number of drinking water points', type: 'number' },
      { id: 'water_functional', label: 'All water points functional?', options: ['Yes', 'No - Specify'] },
      { id: 'water_test', label: 'Last water quality test', type: 'date' },