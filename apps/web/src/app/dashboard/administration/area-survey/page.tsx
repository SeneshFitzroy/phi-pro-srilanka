'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, ClipboardList, Printer, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HousingEntry { id: number; type: string; permanent: string; semipermanent: string; temporary: string; }

const WATER_SOURCES = ['Pipe-borne (treated)', 'Protected well', 'Unprotected well', 'Tube well', 'Stream/river', 'Rainwater', 'Bowser/vendor'];
const TOILET_TYPES = ['Water-sealed', 'Pour flush', 'Pit latrine', 'No latrine'];
const WASTE_METHODS = ['Municipal collection', 'Open burning', 'Burying', 'Composting', 'Open dumping'];

export default function AreaSurveyPage() {
  const [gnDivisions, setGnDivisions] = useState([
    { id: 1, gnName: '', population: '', males: '', females: '', under5: '', over60: '', households: '' },
  ]);

  const addGN = () => setGnDivisions(prev => [...prev, { id: Date.now(), gnName: '', population: '', males: '', females: '', under5: '', over60: '', households: '' }]);
  const removeGN = (id: number) => setGnDivisions(prev => prev.filter(g => g.id !== id));
  const updateGN = (id: number, field: string, val: string) => setGnDivisions(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g));

  const totals = useMemo(() => ({
    population: gnDivisions.reduce((s, g) => s + (parseInt(g.population) || 0), 0),
    males: gnDivisions.reduce((s, g) => s + (parseInt(g.males) || 0), 0),
    females: gnDivisions.reduce((s, g) => s + (parseInt(g.females) || 0), 0),
    households: gnDivisions.reduce((s, g) => s + (parseInt(g.households) || 0), 0),
  }), [gnDivisions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/administration"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="h-6 w-6 text-administration" />Area Survey (H1200)</h1>
            <p className="text-sm text-muted-foreground">Comprehensive area survey — demographics, housing, water, sanitation</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button className="bg-administration hover:bg-administration/90"><Save className="mr-2 h-4 w-4" />Save</Button>
        </div>
      </div>