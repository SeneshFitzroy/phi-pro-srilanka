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