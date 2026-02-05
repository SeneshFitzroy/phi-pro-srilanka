'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Search, MapPin, Users, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const investigationSections = [
  {
    title: 'Case Identification',
    fields: [
      { id: 'case_ref', label: 'Case Reference No.', type: 'text' },
      { id: 'notification_ref', label: 'Notification (H160) Ref.', type: 'text' },
      { id: 'patient_name', label: 'Patient Name', type: 'text' },
      { id: 'age', label: 'Age', type: 'number' },
      { id: 'address', label: 'Address', type: 'text' },
      { id: 'gn_division', label: 'GN Division', type: 'text' },