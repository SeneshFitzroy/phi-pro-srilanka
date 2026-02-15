'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, MapPin, Plus, Trash2, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GNRecord {
  id: number;
  gnCode: string;
  gnName: string;
  gnOfficer: string;
  population: string;
  households: string;
  waterSource: string;
  sanitationType: string;
  healthFacilities: string;
  schools: string;
  factories: string;
  foodPremises: string;
}

export default function GNMappingPage() {
  const [records, setRecords] = useState<GNRecord[]>([
    { id: 1, gnCode: '', gnName: '', gnOfficer: '', population: '', households: '', waterSource: '', sanitationType: '', healthFacilities: '', schools: '', factories: '', foodPremises: '' },
  ]);

  const addRecord = () => setRecords(prev => [...prev, { id: Date.now(), gnCode: '', gnName: '', gnOfficer: '', population: '', households: '', waterSource: '', sanitationType: '', healthFacilities: '', schools: '', factories: '', foodPremises: '' }]);
  const removeRecord = (id: number) => setRecords(prev => prev.filter(r => r.id !== id));