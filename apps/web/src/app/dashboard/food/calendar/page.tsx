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
  { date: 12, title: 'License Renewal', type: 'renewal', premises: 'Rasa Bojun' },
  { date: 15, title: 'Routine Inspection', type: 'inspection', premises: 'Street Vendor #3' },
  { date: 17, title: 'Follow-up', type: 'followup', premises: 'Saman Hotel' },
  { date: 20, title: 'Food Sampling', type: 'sampling', premises: 'New Bakery' },
  { date: 22, title: 'Routine Inspection', type: 'inspection', premises: 'Tea Centre' },
  { date: 25, title: 'Routine Inspection', type: 'inspection', premises: 'Vijitha Hotel' },
  { date: 28, title: 'Follow-up', type: 'followup', premises: 'Lanka Restaurant' },
];

const typeColors: Record<string, string> = {
  inspection: 'bg-green-100 text-green-700 border-green-200',
  followup: 'bg-amber-100 text-amber-700 border-amber-200',
  sampling: 'bg-blue-100 text-blue-700 border-blue-200',
  renewal: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function FoodCalendarPage() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();