'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const sections = [
  {
    title: 'Disease Control Activities',
    items: [
      { id: 'houses_visited', label: 'Houses visited', type: 'number' },
      { id: 'premises_inspected', label: 'Premises inspected', type: 'number' },
      { id: 'breeding_sites', label: 'Breeding sites detected', type: 'number' },
      { id: 'breeding_destroyed', label: 'Breeding sites destroyed', type: 'number' },
      { id: 'fogging_ops', label: 'Fogging operations conducted', type: 'number' },
      { id: 'larvicide_area', label: 'Area treated with larvicide (sq.m)', type: 'number' },
    ]
  },
  {
    title: 'Case Detection & Investigation',
    items: [
      { id: 'cases_reported', label: 'Cases reported from hospitals', type: 'number' },
      { id: 'cases_field', label: 'Cases detected in field', type: 'number' },
      { id: 'cases_investigated', label: 'Cases investigated (within 48hrs)', type: 'number' },
      { id: 'cases_late', label: 'Cases investigated (after 48hrs)', type: 'number' },
      { id: 'contacts_traced', label: 'Contacts traced', type: 'number' },
      { id: 'clusters_identified', label: 'Clusters identified (150m radius)', type: 'number' },
    ]
  },
  {
    title: 'Health Education',
    items: [
      { id: 'he_sessions', label: 'Health education sessions', type: 'number' },
      { id: 'he_participants', label: 'Total participants', type: 'number' },
      { id: 'leaflets_distributed', label: 'Leaflets distributed', type: 'number' },
      { id: 'home_visits', label: 'Home visits for health education', type: 'number' },
    ]
  },
  {
    title: 'Environmental Health',
    items: [
      { id: 'water_sources_tested', label: 'Water sources tested', type: 'number' },
      { id: 'water_unsafe', label: 'Unsafe water sources found', type: 'number' },
      { id: 'chlorination', label: 'Wells chlorinated', type: 'number' },
      { id: 'sanitary_surveys', label: 'Sanitary surveys done', type: 'number' },
    ]
  },
];

export default function EpidemiologyMonthlyPage() {