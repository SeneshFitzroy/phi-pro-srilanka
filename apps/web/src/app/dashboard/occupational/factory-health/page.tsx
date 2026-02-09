'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Factory, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const healthSections = [
  {
    title: 'General Environment',
    items: [
      { id: 'ventilation', label: 'Ventilation adequate?', options: ['Good', 'Fair', 'Poor'] },
      { id: 'lighting', label: 'Lighting sufficient?', options: ['Good', 'Fair', 'Poor'] },
      { id: 'noise_level', label: 'Noise level', options: ['<85dB (Safe)', '85-90dB (Risk)', '>90dB (Hazardous)'] },
      { id: 'temperature', label: 'Temperature comfort', options: ['Acceptable', 'Hot', 'Very Hot'] },
      { id: 'dust', label: 'Dust/Fume exposure', options: ['None', 'Mild', 'Moderate', 'Severe'] },
    ]
  },
  {