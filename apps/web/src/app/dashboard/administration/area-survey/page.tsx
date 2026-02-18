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

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-4">
          <div className="space-y-2"><Label>MOH Area</Label><Input placeholder="Area name" /></div>
          <div className="space-y-2"><Label>PHI Area</Label><Input placeholder="Code" /></div>
          <div className="space-y-2"><Label>Survey Year</Label><Input type="number" placeholder="2025" /></div>
          <div className="space-y-2"><Label>Survey Date</Label><Input type="date" /></div>
        </CardContent>
      </Card>

      {/* Demographics by GN Division */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-purple-50 dark:bg-purple-950/10 rounded-t-lg">
          <CardTitle className="text-base">Section 1: Demographics by GN Division</CardTitle>
          <Button size="sm" onClick={addGN}><Plus className="mr-1 h-4 w-4" />Add GN</Button>
        </CardHeader>
        <CardContent className="overflow-auto p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b"><th className="py-2 text-left text-xs">GN Division</th><th className="px-1 py-2 text-center text-xs">Population</th><th className="px-1 py-2 text-center text-xs">Males</th><th className="px-1 py-2 text-center text-xs">Females</th><th className="px-1 py-2 text-center text-xs">&lt;5 yrs</th><th className="px-1 py-2 text-center text-xs">&gt;60 yrs</th><th className="px-1 py-2 text-center text-xs">Households</th><th className="w-8"></th></tr>
            </thead>
            <tbody>
              {gnDivisions.map(g => (
                <tr key={g.id} className="border-b">
                  <td className="py-1"><Input className="h-8 text-xs" value={g.gnName} onChange={e => updateGN(g.id, 'gnName', e.target.value)} placeholder="Name" /></td>
                  <td className="px-1 py-1"><Input type="number" className="h-8 text-xs text-center" value={g.population} onChange={e => updateGN(g.id, 'population', e.target.value)} /></td>
                  <td className="px-1 py-1"><Input type="number" className="h-8 text-xs text-center" value={g.males} onChange={e => updateGN(g.id, 'males', e.target.value)} /></td>
                  <td className="px-1 py-1"><Input type="number" className="h-8 text-xs text-center" value={g.females} onChange={e => updateGN(g.id, 'females', e.target.value)} /></td>
                  <td className="px-1 py-1"><Input type="number" className="h-8 text-xs text-center" value={g.under5} onChange={e => updateGN(g.id, 'under5', e.target.value)} /></td>
                  <td className="px-1 py-1"><Input type="number" className="h-8 text-xs text-center" value={g.over60} onChange={e => updateGN(g.id, 'over60', e.target.value)} /></td>
                  <td className="px-1 py-1"><Input type="number" className="h-8 text-xs text-center" value={g.households} onChange={e => updateGN(g.id, 'households', e.target.value)} /></td>
                  <td>{gnDivisions.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeGN(g.id)}><Trash2 className="h-3 w-3" /></Button>}</td>
                </tr>
              ))}
              <tr className="font-bold bg-muted/50">
                <td className="py-2 text-xs">TOTAL</td>
                <td className="text-center text-xs">{totals.population}</td>
                <td className="text-center text-xs">{totals.males}</td>
                <td className="text-center text-xs">{totals.females}</td>
                <td></td><td></td>
                <td className="text-center text-xs">{totals.households}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Water Supply */}
      <Card>
        <CardHeader className="bg-blue-50 dark:bg-blue-950/10 rounded-t-lg"><CardTitle className="text-base">Section 2: Water Supply</CardTitle></CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {WATER_SOURCES.map(src => (
              <div key={src} className="flex items-center justify-between rounded border p-2">
                <span className="text-sm">{src}</span>
                <Input type="number" className="h-8 w-24 text-center text-xs" placeholder="HH count" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sanitation / Toilet Facilities */}
      <Card>
        <CardHeader className="bg-green-50 dark:bg-green-950/10 rounded-t-lg"><CardTitle className="text-base">Section 3: Toilet Facilities</CardTitle></CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {TOILET_TYPES.map(t => (
              <div key={t} className="flex items-center justify-between rounded border p-2">
                <span className="text-sm">{t}</span>
                <Input type="number" className="h-8 w-24 text-center text-xs" placeholder="HH count" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Waste Management */}
      <Card>
        <CardHeader className="bg-yellow-50 dark:bg-yellow-950/10 rounded-t-lg"><CardTitle className="text-base">Section 4: Waste Disposal Methods</CardTitle></CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {WASTE_METHODS.map(m => (
              <div key={m} className="flex items-center justify-between rounded border p-2">
                <span className="text-sm">{m}</span>
                <Input type="number" className="h-8 w-24 text-center text-xs" placeholder="HH count" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Housing */}
      <Card>
        <CardHeader className="bg-orange-50 dark:bg-orange-950/10 rounded-t-lg"><CardTitle className="text-base">Section 5: Housing Types</CardTitle></CardHeader>
        <CardContent className="p-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>Permanent</Label><Input type="number" placeholder="Count" /></div>
          <div className="space-y-2"><Label>Semi-permanent</Label><Input type="number" placeholder="Count" /></div>
          <div className="space-y-2"><Label>Temporary/Shanty</Label><Input type="number" placeholder="Count" /></div>
        </CardContent>
      </Card>

      {/* Key Facilities */}
      <Card>
        <CardHeader className="bg-red-50 dark:bg-red-950/10 rounded-t-lg"><CardTitle className="text-base">Section 6: Key Facilities in Area</CardTitle></CardHeader>
        <CardContent className="p-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {['Hospitals', 'MOH Offices', 'Schools', 'Pre-schools', 'Food Premises', 'Factories', 'Markets', 'Places of Worship', 'Hotels/Restaurants', 'Bakeries', 'Slaughter Houses', 'Cemeteries'].map(f => (
            <div key={f} className="space-y-1"><Label className="text-xs">{f}</Label><Input type="number" placeholder="0" /></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
