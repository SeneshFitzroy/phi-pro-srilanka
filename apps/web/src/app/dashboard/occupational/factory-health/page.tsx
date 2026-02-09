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
    title: 'Sanitary Facilities',
    items: [
      { id: 'toilets_count', label: 'Number of toilets', type: 'number' },
      { id: 'toilets_clean', label: 'Toilet cleanliness', options: ['Good', 'Fair', 'Poor'] },
      { id: 'washing_facilities', label: 'Hand washing facilities', options: ['Adequate', 'Inadequate'] },
      { id: 'drinking_water', label: 'Drinking water supply', options: ['Safe & Adequate', 'Safe but Limited', 'Unsafe'] },
      { id: 'canteen', label: 'Canteen/Eating area', options: ['Good', 'Fair', 'Poor', 'None'] },
      { id: 'changing_rooms', label: 'Changing rooms available?', options: ['Yes', 'No'] },
    ]
  },
  {
    title: 'Hazardous Substances',
    items: [
      { id: 'chemicals_used', label: 'Chemicals used?', options: ['Yes', 'No'] },
      { id: 'msds_available', label: 'MSDS available?', options: ['Yes', 'No', 'N/A'] },
      { id: 'storage_proper', label: 'Chemical storage proper?', options: ['Yes', 'No', 'N/A'] },
      { id: 'spill_kits', label: 'Spill kits available?', options: ['Yes', 'No', 'N/A'] },
      { id: 'exposure_monitoring', label: 'Exposure monitoring done?', options: ['Regular', 'Irregular', 'Never'] },
    ]
  },
  {