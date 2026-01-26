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
    ]
  },
  {
    title: 'Sanitation Facilities',
    items: [
      { id: 'toilet_count', label: 'Total toilet cubicles', type: 'number' },
      { id: 'toilet_boys', label: 'Toilets for boys', type: 'number' },
      { id: 'toilet_girls', label: 'Toilets for girls', type: 'number' },
      { id: 'toilet_disabled', label: 'Disabled-accessible toilets', type: 'number' },
      { id: 'toilet_clean', label: 'Cleanliness standard', options: ['Good', 'Satisfactory', 'Poor'] },
      { id: 'toilet_water', label: 'Water available in all toilets?', options: ['Yes', 'No'] },
      { id: 'toilet_soap', label: 'Soap available?', options: ['Yes', 'No'] },
    ]
  },
  {
    title: 'Handwashing Facilities',
    items: [
      { id: 'hw_stations', label: 'Number of handwashing stations', type: 'number' },
      { id: 'hw_soap', label: 'Soap available at stations?', options: ['Yes - All', 'Yes - Some', 'No'] },
      { id: 'hw_functional', label: 'All stations functional?', options: ['Yes', 'No'] },
      { id: 'hw_near_toilet', label: 'Stations near toilets?', options: ['Yes', 'No'] },
    ]
  },
  {
    title: 'Waste Management',
    items: [
      { id: 'waste_bins', label: 'Waste bins available?', options: ['Yes - Segregated', 'Yes - Mixed', 'No'] },
      { id: 'waste_disposal', label: 'Disposal method', options: ['Municipal Collection', 'Burning', 'Composting', 'Open Dumping'] },
      { id: 'waste_frequency', label: 'Collection frequency', options: ['Daily', 'Twice/week', 'Weekly', 'Irregular'] },
    ]
  },
  {
    title: 'Menstrual Hygiene Management',
    items: [
      { id: 'mhm_facilities', label: 'Separate MHM facilities (girls)?', options: ['Yes', 'No'] },
      { id: 'mhm_bins', label: 'Sanitary disposal bins in girls toilets?', options: ['Yes', 'No'] },
      { id: 'mhm_education', label: 'MHM education conducted?', options: ['Yes', 'No'] },
    ]