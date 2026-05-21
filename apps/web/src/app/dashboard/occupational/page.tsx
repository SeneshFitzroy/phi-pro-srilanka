'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HardHat, Factory, FileText, ClipboardCheck, Users, Search, AlertTriangle, TrendingUp, Plus, Trash2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { COLOMBO_FACTORIES, mapsHref, type ColomboFactory, type FactoryScale, type RiskLevel } from '@/data/colombo-factories';

const quickActions = [
  { title: 'Factory Health', subtitle: 'H1203', icon: Factory, href: '/dashboard/occupational/factory-health', color: 'bg-amber-50 text-occupational border-amber-200' },
  { title: 'Safety Inspection', subtitle: 'H1204', icon: ClipboardCheck, href: '/dashboard/occupational/safety', color: 'bg-amber-50 text-occupational border-amber-200' },
  { title: 'Worker Survey', subtitle: 'H1205', icon: Users, href: '/dashboard/occupational/worker-survey', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { title: 'OHS Checklist', subtitle: 'Inspection', icon: FileText, href: '/dashboard/occupational/checklist', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
];

const scaleOf = (w: number): FactoryScale => (w >= 250 ? 'LARGE' : w >= 50 ? 'MEDIUM' : 'SMALL');

export default function OccupationalHealthPage() {
  const [search, setSearch] = useState('');
  const [factories, setFactories] = useState<ColomboFactory[]>(COLOMBO_FACTORIES);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ name: '', type: 'Textile', workers: '', address: '', phone: '', risk: 'MEDIUM' as RiskLevel });

  const addFactory = () => {
    if (!draft.name.trim()) { toast.error('Factory name is required.'); return; }
    const workers = Number(draft.workers) || 0;
    setFactories((prev) => [{
      id: `FAC-${String(prev.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
      name: draft.name.trim(), type: draft.type, scale: scaleOf(workers), workers,
      address: draft.address.trim(), phone: draft.phone.trim(), lat: 0, lng: 0,
      risk: draft.risk, lastInspection: new Date().toISOString().slice(0, 10),
    }, ...prev]);
    toast.success(`Registered ${draft.name.trim()}.`);
    setDraft({ name: '', type: 'Textile', workers: '', address: '', phone: '', risk: 'MEDIUM' });
    setShowAdd(false);
  };
  const removeFactory = (id: string) => setFactories((prev) => prev.filter((x) => x.id !== id));

  const filtered = factories.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) || f.type.toLowerCase().includes(search.toLowerCase())
  );
  const workersCovered = factories.reduce((s, f) => s + f.workers, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><HardHat className="h-7 w-7 text-occupational" /> Occupational Health & Safety</h1>
        <p className="text-sm text-muted-foreground mt-1">Factory inspections: Small (&lt;50) • Medium (50-250) • Large (250+) workers</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-occupational">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Registered Factories</p><p className="text-2xl font-bold">{factories.length}</p></div><Factory className="h-8 w-8 text-occupational/60" /></div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Inspected This Quarter</p><p className="text-2xl font-bold">42</p></div><TrendingUp className="h-8 w-8 text-green-500/60" /></div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Violations Found</p><p className="text-2xl font-bold">18</p></div><AlertTriangle className="h-8 w-8 text-red-500/60" /></div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Workers Covered</p><p className="text-2xl font-bold">{workersCovered.toLocaleString()}</p></div><Users className="h-8 w-8 text-blue-500/60" /></div></CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className={`cursor-pointer border transition hover:shadow-md ${action.color}`}>
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <action.icon className="h-8 w-8" />
                <p className="font-semibold text-sm">{action.title}</p>
                <p className="text-xs opacity-75">{action.subtitle}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Factories Table */}
      <Card>
        <CardHeader className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Registered Factories</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search factories..." className="pl-9 w-56" /></div>
              <Button size="sm" onClick={() => setShowAdd((v) => !v)} className="bg-occupational hover:bg-occupational/90"><Plus className="mr-1 h-3.5 w-3.5" /> Add factory</Button>
            </div>
          </div>
          {showAdd && (
            <div className="grid gap-2 rounded-lg border border-dashed border-slate-300 p-3 sm:grid-cols-3 lg:grid-cols-6 dark:border-slate-700">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Factory name" className="lg:col-span-2" />
              <Input value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} placeholder="Type" />
              <Input type="number" value={draft.workers} onChange={(e) => setDraft({ ...draft, workers: e.target.value })} placeholder="Workers" />
              <select value={draft.risk} onChange={(e) => setDraft({ ...draft, risk: e.target.value as RiskLevel })} className="h-10 rounded-md border border-input bg-background px-2 text-sm"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select>
              <Button onClick={addFactory} className="bg-occupational hover:bg-occupational/90">Add</Button>
              <Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="Address" className="sm:col-span-3 lg:col-span-6" />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">Reg. No.</th><th className="pb-3 pr-4 font-medium">Factory</th><th className="pb-3 pr-4 font-medium">Type</th><th className="pb-3 pr-4 font-medium">Scale</th><th className="pb-3 pr-4 font-medium">Workers</th><th className="pb-3 pr-4 font-medium">Last Inspection</th><th className="pb-3 pr-4 font-medium">Risk</th><th className="pb-3 text-right font-medium">Map / Remove</th></tr></thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} className="border-b last:border-0 hover:bg-accent/50">
                    <td className="py-3 pr-4 font-mono text-xs">{f.id}</td>
                    <td className="py-3 pr-4"><p className="font-medium">{f.name}</p><p className="text-[11px] text-muted-foreground">{f.address}</p></td>
                    <td className="py-3 pr-4">{f.type}</td>
                    <td className="py-3 pr-4"><span className={`rounded px-2 py-0.5 text-xs font-medium ${f.scale === 'LARGE' ? 'bg-red-100 text-red-700' : f.scale === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{f.scale}</span></td>
                    <td className="py-3 pr-4">{f.workers}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{f.lastInspection}</td>
                    <td className="py-3 pr-4"><span className={`rounded px-2 py-0.5 text-xs font-bold ${f.risk === 'HIGH' ? 'bg-red-100 text-red-700' : f.risk === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{f.risk}</span></td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a href={mapsHref(f)} target="_blank" rel="noopener noreferrer" title="Open in Google Maps" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300"><MapPin className="h-3.5 w-3.5" /></a>
                        <button onClick={() => removeFactory(f.id)} aria-label={`Remove ${f.name}`} title="Remove" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-red-500 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-900"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
