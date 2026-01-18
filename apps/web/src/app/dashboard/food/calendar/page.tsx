'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CalendarEvent {
  date: number;
  title: string;
  type: 'inspection' | 'followup' | 'sampling' | 'renewal';
  premises: string;
}

const EVENTS: CalendarEvent[] = [
  { date: 3, title: 'Routine Inspection', type: 'inspection', premises: 'Saman Hotel' },
  { date: 5, title: 'Re-inspection', type: 'followup', premises: 'City Bakery' },
  { date: 8, title: 'Food Sampling', type: 'sampling', premises: 'Fresh Mart' },
  { date: 10, title: 'Routine Inspection', type: 'inspection', premises: 'Lanka Restaurant' },