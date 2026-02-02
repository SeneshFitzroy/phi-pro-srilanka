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