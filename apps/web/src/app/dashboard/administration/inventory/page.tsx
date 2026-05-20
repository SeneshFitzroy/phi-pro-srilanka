'use client';

// ============================================================================
// Inventory / Stock — MOH-area consumables register (vaccines, test kits, forms,
// PPE, reagents). Live Firestore (`inventory_items`), add / adjust quantities,
// QR per item to log usage at the point of use, low-stock alerts.
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, Boxes, Plus, Minus, AlertTriangle, PackagePlus, Search, RefreshCw, Loader2, QrCode, Trash2, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { createDocument, updateDocument, removeDocument, subscribeToCollection, orderBy } from '@/lib/firestore';

interface Item {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  location: string;
  sku: string;
  updatedAt?: string;
}

const CATEGORIES = ['Vaccines', 'Test kits', 'Forms', 'PPE', 'Lab reagents', 'Other'] as const;
const catColor = (c: string) =>
  ({ Vaccines: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300', 'Test kits': 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', Forms: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300', PPE: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', 'Lab reagents': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' } as Record<string, string>)[c] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';

const emptyDraft = { name: '', category: 'Vaccines' as string, unit: 'units', quantity: 0, reorderLevel: 5, location: '', sku: '' };

// Standard consumables a Sri Lankan PHI / MOH area actually stocks — used by
// the one-click "Load standard PHI stock" seed when the register is empty.
const DEFAULT_STOCK: Omit<Item, 'id' | 'updatedAt'>[] = [
  // Vaccines (EPI cold chain)
  { name: 'BCG vaccine (10-dose vial)',          category: 'Vaccines',    unit: 'vials', quantity: 40, reorderLevel: 15, location: 'Cold room A', sku: 'VAC-BCG' },
  { name: 'OPV — bivalent oral polio',           category: 'Vaccines',    unit: 'vials', quantity: 60, reorderLevel: 20, location: 'Cold room A', sku: 'VAC-OPV' },
  { name: 'Pentavalent (DPT-HepB-Hib)',          category: 'Vaccines',    unit: 'vials', quantity: 55, reorderLevel: 20, location: 'Cold room A', sku: 'VAC-PENTA' },
  { name: 'MMR vaccine',                         category: 'Vaccines',    unit: 'vials', quantity: 45, reorderLevel: 15, location: 'Cold room A', sku: 'VAC-MMR' },
  { name: 'Japanese Encephalitis vaccine',       category: 'Vaccines',    unit: 'vials', quantity: 30, reorderLevel: 10, location: 'Cold room A', sku: 'VAC-JE' },
  { name: 'aTd (adult tetanus-diphtheria)',      category: 'Vaccines',    unit: 'vials', quantity: 50, reorderLevel: 15, location: 'Cold room A', sku: 'VAC-ATD' },
  { name: 'Hepatitis B (paediatric)',            category: 'Vaccines',    unit: 'vials', quantity: 35, reorderLevel: 12, location: 'Cold room A', sku: 'VAC-HEPB' },
  { name: 'HPV vaccine',                         category: 'Vaccines',    unit: 'vials', quantity: 25, reorderLevel: 10, location: 'Cold room B', sku: 'VAC-HPV' },
  { name: 'fIPV (inactivated polio)',            category: 'Vaccines',    unit: 'vials', quantity: 28, reorderLevel: 10, location: 'Cold room A', sku: 'VAC-FIPV' },
  { name: 'Rabies vaccine (post-exposure)',      category: 'Vaccines',    unit: 'vials', quantity: 20, reorderLevel: 8,  location: 'Cold room B', sku: 'VAC-RAB' },
  // Test kits
  { name: 'Dengue NS1 Antigen RDT',              category: 'Test kits',   unit: 'kits',  quantity: 80, reorderLevel: 25, location: 'Store shelf 2', sku: 'TK-NS1' },
  { name: 'Dengue IgM/IgG RDT',                  category: 'Test kits',   unit: 'kits',  quantity: 60, reorderLevel: 20, location: 'Store shelf 2', sku: 'TK-DENVIG' },
  { name: 'Malaria RDT',                         category: 'Test kits',   unit: 'kits',  quantity: 40, reorderLevel: 15, location: 'Store shelf 2', sku: 'TK-MAL' },
  { name: 'COVID-19 Antigen RDT',                category: 'Test kits',   unit: 'kits',  quantity: 50, reorderLevel: 20, location: 'Store shelf 2', sku: 'TK-COV' },
  { name: 'Water bacteriology H2S test kit',     category: 'Test kits',   unit: 'kits',  quantity: 35, reorderLevel: 12, location: 'Lab store',     sku: 'TK-H2S' },
  { name: 'Chlorine (DPD) test kit',             category: 'Test kits',   unit: 'kits',  quantity: 30, reorderLevel: 10, location: 'Lab store',     sku: 'TK-DPD' },
  // Forms
  { name: 'H800 Food Inspection form',           category: 'Forms',       unit: 'pads',  quantity: 18, reorderLevel: 5,  location: 'Store shelf 4', sku: 'FRM-H800' },
  { name: 'H801 Premises Registration form',     category: 'Forms',       unit: 'pads',  quantity: 15, reorderLevel: 5,  location: 'Store shelf 4', sku: 'FRM-H801' },
  { name: 'H399 Weekly Return form',             category: 'Forms',       unit: 'pads',  quantity: 22, reorderLevel: 6,  location: 'Store shelf 4', sku: 'FRM-H399' },
  { name: 'Disease Notification (H544) cards',   category: 'Forms',       unit: 'packs', quantity: 40, reorderLevel: 10, location: 'Store shelf 4', sku: 'FRM-H544' },
  // PPE
  { name: 'N95 respirator masks',                category: 'PPE',         unit: 'boxes', quantity: 24, reorderLevel: 6,  location: 'PPE cabinet',  sku: 'PPE-N95' },
  { name: 'Surgical face masks',                 category: 'PPE',         unit: 'boxes', quantity: 60, reorderLevel: 15, location: 'PPE cabinet',  sku: 'PPE-MASK' },
  { name: 'Nitrile examination gloves',          category: 'PPE',         unit: 'boxes', quantity: 45, reorderLevel: 12, location: 'PPE cabinet',  sku: 'PPE-GLV' },
  { name: 'Disposable gowns',                    category: 'PPE',         unit: 'units', quantity: 50, reorderLevel: 15, location: 'PPE cabinet',  sku: 'PPE-GOWN' },
  { name: 'Gumboots',                            category: 'PPE',         unit: 'pairs', quantity: 12, reorderLevel: 4,  location: 'PPE cabinet',  sku: 'PPE-BOOT' },
  // Lab reagents
  { name: 'H2S broth medium',                    category: 'Lab reagents',unit: 'bottles', quantity: 28, reorderLevel: 8, location: 'Lab fridge', sku: 'LAB-H2S' },
  { name: "Lugol's iodine solution",             category: 'Lab reagents',unit: 'bottles', quantity: 15, reorderLevel: 5, location: 'Lab fridge', sku: 'LAB-IOD' },
  { name: 'Formalin (sample preservative)',      category: 'Lab reagents',unit: 'bottles', quantity: 20, reorderLevel: 6, location: 'Lab store',  sku: 'LAB-FORM' },
  // Other
  { name: 'Temephos (Abate) larvicide',          category: 'Other',       unit: 'kg',    quantity: 18, reorderLevel: 5,  location: 'Vector store', sku: 'OTH-ABATE' },
  { name: 'Sterile sample bottles',              category: 'Other',       unit: 'units', quantity: 120, reorderLevel: 30, location: 'Lab store',    sku: 'OTH-BOTL' },
  { name: 'Cool box with ice packs',             category: 'Other',       unit: 'units', quantity: 6,  reorderLevel: 2,  location: 'Cold room A',  sku: 'OTH-COOL' },
];

export default function InventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [seeding, setSeeding] = useState(false);
  const [qrFor, setQrFor] = useState<Item | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => { setOrigin(window.location.origin); }, []);

  useEffect(() => {
    const unsub = subscribeToCollection<Item>('inventory_items', [orderBy('name', 'asc')], (rows) => { setItems(rows); setLoading(false); });
    return () => unsub();
  }, []);

  const lowStock = useMemo(() => items.filter((i) => i.quantity <= i.reorderLevel), [items]);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => (cat === 'ALL' || i.category === cat) && (!term || i.name.toLowerCase().includes(term) || i.sku.toLowerCase().includes(term) || i.location.toLowerCase().includes(term)));
  }, [items, q, cat]);

  const addItem = async () => {
    if (!draft.name.trim()) { toast.error('Name is required.'); return; }
    try {
      await createDocument('inventory_items', {
        name: draft.name.trim(),
        category: draft.category,
        unit: draft.unit.trim() || 'units',
        quantity: Number(draft.quantity) || 0,
        reorderLevel: Number(draft.reorderLevel) || 0,
        location: draft.location.trim(),
        sku: draft.sku.trim() || `SKU-${Date.now().toString(36).toUpperCase()}`,
        updatedBy: user?.uid ?? 'anonymous',
      });
      toast.success('Item added.');
      setShowAdd(false); setDraft(emptyDraft);
    } catch { toast.error('Could not add item (sign in & deploy Firestore rules).'); }
  };

  const seedStandard = async () => {
    setSeeding(true);
    let ok = 0;
    for (const it of DEFAULT_STOCK) {
      try { await createDocument('inventory_items', { ...it, updatedBy: user?.uid ?? 'anonymous' }); ok++; } catch { /* rules/auth */ }
    }
    setSeeding(false);
    if (ok > 0) toast.success(`Loaded ${ok} standard PHI stock items.`);
    else toast.error('Could not load stock — sign in and deploy Firestore rules.');
  };

  const adjust = async (item: Item, delta: number) => {
    const next = Math.max(0, item.quantity + delta);
    try {
      await updateDocument('inventory_items', item.id, { quantity: next, updatedBy: user?.uid ?? 'anonymous' });
      if (delta < 0) toast.message(`Logged usage: ${item.name} → ${next} ${item.unit}`);
      if (next <= item.reorderLevel && delta < 0) toast.warning(`${item.name} at/below reorder level (${item.reorderLevel}).`);
    } catch { toast.error('Update failed.'); }
  };

  const del = async (item: Item) => {
    if (!confirm(`Remove "${item.name}" from inventory?`)) return;
    try { await removeDocument('inventory_items', item.id); toast.success('Removed.'); } catch { toast.error('Delete failed (admin only).'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/administration"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold"><Boxes className="h-6 w-6 text-blue-600" />Inventory &amp; Stock</h1>
            <p className="text-sm text-muted-foreground">Vaccines · test kits · forms · PPE · reagents — MOH-area register</p>
          </div>
        </div>
        <Button onClick={() => setShowAdd((v) => !v)} className="gap-2"><PackagePlus className="h-4 w-4" /> Add Item</Button>
      </div>

      {/* Low-stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span><strong>{lowStock.length}</strong> item{lowStock.length === 1 ? '' : 's'} at or below reorder level: {lowStock.slice(0, 5).map((i) => i.name).join(', ')}{lowStock.length > 5 ? '…' : ''}</span>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">New Inventory Item</CardTitle><button onClick={() => setShowAdd(false)}><X className="h-4 w-4 text-muted-foreground" /></button></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5"><Label>Name *</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. BCG vaccine 10-dose vial" /></div>
              <div className="space-y-1.5"><Label>Category</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="space-y-1.5"><Label>Unit</Label><Input value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} placeholder="vials / boxes / units" /></div>
              <div className="space-y-1.5"><Label>Quantity in stock</Label><Input type="number" value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label>Reorder level</Label><Input type="number" value={draft.reorderLevel} onChange={(e) => setDraft({ ...draft, reorderLevel: Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label>Storage location</Label><Input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="e.g. Cold room A / Store shelf 3" /></div>
              <div className="space-y-1.5"><Label>SKU / batch (optional)</Label><Input value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} placeholder="auto if blank" /></div>
            </div>
            <div className="mt-4 flex gap-2"><Button onClick={addItem} className="gap-2"><Plus className="h-4 w-4" /> Save Item</Button><Button variant="outline" onClick={() => { setShowAdd(false); setDraft(emptyDraft); }}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name / SKU / location…" className="rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm" />
        </div>
        {['ALL', ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1 text-xs font-semibold ${cat === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>{c === 'ALL' ? 'All' : c}</button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Items ({filtered.length})</CardTitle>{loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}</CardHeader>
        <CardContent className="overflow-x-auto">
          {!loading && items.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              <p>No items yet — click <strong>Add Item</strong>, or load the standard PHI stock list to get started.</p>
              <Button onClick={seedStandard} disabled={seeding} className="mt-4 gap-2">
                {seeding ? <><Loader2 className="h-4 w-4 animate-spin" />Loading…</> : <><PackagePlus className="h-4 w-4" />Load standard PHI stock ({DEFAULT_STOCK.length} items)</>}
              </Button>
              <p className="mt-2 text-[11px]">(Requires sign-in and deployed Firestore rules.)</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-2 font-medium">Item</th><th className="py-2 pr-2 font-medium">Category</th><th className="py-2 pr-2 font-medium">Location</th><th className="py-2 pr-2 font-medium text-center">In stock</th><th className="py-2 pr-2 font-medium text-center">Adjust</th><th className="py-2 font-medium text-right">QR / Remove</th></tr></thead>
              <tbody>
                {filtered.map((i) => {
                  const low = i.quantity <= i.reorderLevel;
                  return (
                    <tr key={i.id} className={`border-b last:border-0 ${low ? 'bg-amber-50/60 dark:bg-amber-950/10' : ''}`}>
                      <td className="py-2 pr-2"><div className="font-medium">{i.name}</div><div className="text-[11px] text-muted-foreground">{i.sku}</div></td>
                      <td className="py-2 pr-2"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${catColor(i.category)}`}>{i.category}</span></td>
                      <td className="py-2 pr-2 text-muted-foreground">{i.location || '—'}</td>
                      <td className="py-2 pr-2 text-center"><span className={`tabular-nums font-semibold ${low ? 'text-amber-600' : ''}`}>{i.quantity}</span> <span className="text-[11px] text-muted-foreground">{i.unit}</span>{low && <AlertTriangle className="ml-1 inline h-3 w-3 text-amber-500" />}<div className="text-[10px] text-muted-foreground">reorder ≤ {i.reorderLevel}</div></td>
                      <td className="py-2 pr-2"><div className="flex items-center justify-center gap-1">
                        <button onClick={() => adjust(i, -1)} title="Log 1 used" className="rounded border px-1.5 py-0.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Minus className="h-3 w-3" /></button>
                        <button onClick={() => adjust(i, -5)} title="Log 5 used" className="rounded border px-1 py-0.5 text-[10px] hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">-5</button>
                        <button onClick={() => adjust(i, +1)} title="Receive 1" className="rounded border px-1.5 py-0.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Plus className="h-3 w-3" /></button>
                        <button onClick={() => adjust(i, +10)} title="Receive 10" className="rounded border px-1 py-0.5 text-[10px] hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">+10</button>
                      </div></td>
                      <td className="py-2 text-right"><div className="flex items-center justify-end gap-1">
                        <button onClick={() => setQrFor(i)} title="Show QR (scan to log usage)" className="rounded border px-1.5 py-1 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><QrCode className="h-3.5 w-3.5" /></button>
                        <button onClick={() => del(i)} title="Remove (admin)" className="rounded border px-1.5 py-1 text-red-500 hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-950/30"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* QR modal */}
      {qrFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setQrFor(null)}>
          <div className="rounded-2xl bg-white p-6 text-center dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <p className="mb-1 text-sm font-semibold">{qrFor.name}</p>
            <p className="mb-3 text-[11px] text-muted-foreground">{qrFor.sku} · scan at point of use</p>
            <QRCodeSVG value={origin ? `${origin}/dashboard/administration/inventory?use=${qrFor.id}` : qrFor.sku} size={180} className="mx-auto rounded bg-white p-2" />
            <button onClick={() => setQrFor(null)} className="mt-4 rounded-md border px-4 py-1.5 text-sm dark:border-slate-700">Close</button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground"><RefreshCw className="mr-1 inline h-3 w-3" />Live-synced from Firestore (<code>inventory_items</code>). Low-stock items are highlighted; quantities update in real time across devices. Deploy the updated rules: <code>firebase deploy --only firestore:rules</code>.</p>
    </div>
  );
}
