'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, MessageSquare, Search, Clock, MapPin, Eye, Check, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const COMPLAINTS = [
  { id: 'CMP-10234521', type: 'Food Safety Concern', desc: 'Cockroaches observed in kitchen area of restaurant. Unhygienic food handling practices.', location: '45 Main St, Colombo 07', area: 'Colombo North', reporter: 'Anonymous', date: '2025-02-10', status: 'new', priority: 'high', assigned: '-' },
  { id: 'CMP-10234520', type: 'Mosquito Breeding', desc: 'Stagnant water in abandoned construction site, many mosquito larvae visible.', location: '78 Temple Rd, Nugegoda', area: 'Nugegoda', reporter: 'R. Silva — 077-1234567', date: '2025-02-09', status: 'assigned', priority: 'high', assigned: 'K. Perera' },
  { id: 'CMP-10234519', type: 'Garbage Dumping', desc: 'Illegal garbage dumping near canal. Attracting rats and producing foul smell.', location: 'Canal Rd, Dehiwala', area: 'Dehiwala West', reporter: 'M. Fernando — m.f@email.com', date: '2025-02-09', status: 'investigating', priority: 'medium', assigned: 'R. Fernando' },
  { id: 'CMP-10234518', type: 'Water Contamination', desc: 'Well water has unusual color and smell after nearby factory started operations.', location: '23 Factory Ln, Homagama', area: 'Homagama', reporter: 'A. Bandara — 070-9876543', date: '2025-02-08', status: 'investigating', priority: 'high', assigned: 'A. Bandara' },
  { id: 'CMP-10234517', type: 'Unsanitary Premises', desc: 'Public toilet near bus stand in very poor condition. No water supply, broken doors.', location: 'Bus Stand, Moratuwa', area: 'Moratuwa', reporter: 'Anonymous', date: '2025-02-07', status: 'resolved', priority: 'low', assigned: 'S. Jayawardena' },