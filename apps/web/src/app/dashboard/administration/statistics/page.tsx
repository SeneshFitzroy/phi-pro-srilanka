'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, BarChart3, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const CATEGORIES = [
  { key: 'population', label: 'Total Population' },
  { key: 'males', label: 'Males' },
  { key: 'females', label: 'Females' },
  { key: 'households', label: 'Total Households' },
  { key: 'births', label: 'Births' },
  { key: 'deaths', label: 'Deaths' },
  { key: 'infantDeaths', label: 'Infant Deaths' },
  { key: 'maternalDeaths', label: 'Maternal Deaths' },
  { key: 'dengue', label: 'Dengue Cases' },
  { key: 'typhoid', label: 'Typhoid Cases' },
  { key: 'dysentery', label: 'Dysentery Cases' },
  { key: 'foodPoisoning', label: 'Food Poisoning Cases' },
  { key: 'tuberculosis', label: 'Tuberculosis Cases' },
  { key: 'leprosy', label: 'Leprosy Cases' },
  { key: 'rabies', label: 'Animal Bite / Rabies' },
  { key: 'foodPremises', label: 'Food Premises Inspected' },
  { key: 'schoolsInspected', label: 'Schools Inspected' },
  { key: 'factoriesInspected', label: 'Factories Inspected' },
  { key: 'waterSamples', label: 'Water Samples Tested' },
  { key: 'foodSamples', label: 'Food Samples Tested' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

// Realistic 5-year figures for the Colombo (CMC) MOH area — oldest → newest.
const SEED_VALUES: Record<string, number[]> = {
  population:        [86000, 86800, 87500, 88000, 88250],
  males:             [42140, 42532, 42875, 43120, 43243],
  females:           [43860, 44268, 44625, 44880, 45007],
  households:        [19420, 19610, 19820, 19980, 20090],
  births:            [1410, 1380, 1342, 1305, 1288],
  deaths:            [602, 631, 648, 659, 671],
  infantDeaths:      [8, 7, 6, 6, 5],
  maternalDeaths:    [1, 0, 1, 0, 0],
  dengue:            [420, 510, 380, 640, 590],
  typhoid:           [12, 9, 7, 11, 8],
  dysentery:         [34, 28, 22, 30, 25],
  foodPoisoning:     [18, 22, 15, 26, 19],
  tuberculosis:      [64, 58, 52, 49, 47],
  leprosy:           [3, 2, 2, 1, 1],
  rabies:            [210, 240, 198, 265, 231],
  foodPremises:      [1180, 1240, 980, 1320, 1410],
  schoolsInspected:  [42, 44, 38, 45, 46],
  factoriesInspected:[28, 31, 24, 33, 35],
  waterSamples:      [320, 360, 280, 390, 410],
  foodSamples:       [240, 270, 210, 300, 315],
};

const SEED_DATA: Record<string, Record<number, string>> = (() => {
  const d: Record<string, Record<number, string>> = {};
  CATEGORIES.forEach((c) => { d[c.key] = {}; YEARS.forEach((y, i) => { d[c.key][y] = String(SEED_VALUES[c.key]?.[i] ?? ''); }); });
  return d;
})();

const DEFAULT_NOTES = `Figures cover the Colombo Municipal Council (CMC) MOH area, 18 GN divisions. ${currentYear - 1}–${currentYear} dengue rise tracks the inter-monsoon breeding peak (Apr–Jun); vector control intensified in Kotahena and Wanathamulla. Infant and maternal mortality remain at/near zero. Food-premises inspection coverage exceeds 95% of registered premises.`;

export default function StatisticsPage() {
  const [data, setData] = useState<Record<string, Record<number, string>>>(SEED_DATA);
  const [meta, setMeta] = useState({ moh: 'Colombo (CMC)', code: 'COL-PHI-04', preparedBy: 'C.M.I.T. Wijerathna (PHI)' });
  const [notes, setNotes] = useState(DEFAULT_NOTES);

  const updateCell = (cat: string, year: number, val: string) => {
    setData(prev => ({ ...prev, [cat]: { ...prev[cat], [year]: val } }));
  };

  const save = () => { try { localStorage.setItem('phi-h796', JSON.stringify({ data, meta, notes })); } catch { /* */ } toast.success('Five-Year Statistics saved.'); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/administration"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-administration" />Five-Year Statistics (H796)</h1>
            <p className="text-sm text-muted-foreground">Population and health statistics over {YEARS[0]}–{YEARS[4]}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button className="bg-administration hover:bg-administration/90" onClick={save}><Save className="mr-2 h-4 w-4" />Save</Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>MOH Area</Label><Input value={meta.moh} onChange={(e) => setMeta({ ...meta, moh: e.target.value })} placeholder="Area name" /></div>
          <div className="space-y-2"><Label>PHI Area Code</Label><Input value={meta.code} onChange={(e) => setMeta({ ...meta, code: e.target.value })} placeholder="Code" /></div>
          <div className="space-y-2"><Label>Prepared By</Label><Input value={meta.preparedBy} onChange={(e) => setMeta({ ...meta, preparedBy: e.target.value })} placeholder="PHI name" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Data Table</CardTitle></CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="py-2 text-left font-medium min-w-[200px]">Category</th>{YEARS.map(y => <th key={y} className="px-2 py-2 text-center font-medium min-w-[100px]">{y}</th>)}</tr></thead>
            <tbody>
              {CATEGORIES.map((c, i) => (
                <tr key={c.key} className={`border-b ${i < 4 ? 'bg-purple-50/40 dark:bg-purple-950/10' : i < 8 ? '' : i < 15 ? 'bg-red-50/40 dark:bg-red-950/10' : ''}`}>
                  <td className="py-1.5 font-medium text-xs">{c.label}</td>
                  {YEARS.map(y => (
                    <td key={y} className="px-1 py-1"><Input type="number" className="h-8 text-center text-xs" value={data[c.key][y]} onChange={e => updateCell(c.key, y, e.target.value)} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
        <CardContent>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Additional remarks or explanations..." />
        </CardContent>
      </Card>
    </div>
  );
}
