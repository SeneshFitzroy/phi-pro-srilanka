'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, ClipboardCheck, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const safetySections = [
  {
    title: 'Fire Safety',
    items: [
      { id: 'fire_extinguishers', label: 'Fire extinguishers present & serviced?', options: ['Yes', 'No', 'Partial'] },
      { id: 'fire_exits', label: 'Fire exits clearly marked?', options: ['Yes', 'No'] },
      { id: 'exit_routes', label: 'Exit routes unobstructed?', options: ['Yes', 'No'] },
      { id: 'fire_alarm', label: 'Fire alarm system?', options: ['Yes - Functional', 'Yes - Faulty', 'No'] },
      { id: 'fire_drill', label: 'Fire drills conducted?', options: ['Regular', 'Occasional', 'Never'] },
      { id: 'fire_plan', label: 'Emergency evacuation plan posted?', options: ['Yes', 'No'] },
    ]
  },
  {
    title: 'Machine Safety',
    items: [
      { id: 'machine_guards', label: 'Machine guards in place?', options: ['All', 'Most', 'Some', 'None'] },
      { id: 'lockout_tagout', label: 'Lockout/tagout procedures?', options: ['Yes', 'No'] },
      { id: 'maintenance_schedule', label: 'Maintenance schedule followed?', options: ['Regular', 'Irregular', 'None'] },
      { id: 'safe_distances', label: 'Safe working distances maintained?', options: ['Yes', 'No'] },
      { id: 'training_machines', label: 'Workers trained on machines?', options: ['Yes - All', 'Yes - Some', 'No'] },
    ]
  },
  {
    title: 'Personal Protective Equipment (PPE)',
    items: [
      { id: 'ppe_provided', label: 'PPE provided to all workers?', options: ['Yes', 'No', 'Partial'] },
      { id: 'ppe_used', label: 'PPE usage compliance?', options: ['High (>90%)', 'Medium (50-90%)', 'Low (<50%)'] },
      { id: 'ppe_types', label: 'PPE types available', options: ['Comprehensive', 'Basic', 'Minimal'] },
      { id: 'ppe_condition', label: 'PPE condition?', options: ['Good', 'Fair', 'Poor'] },
    ]
  },