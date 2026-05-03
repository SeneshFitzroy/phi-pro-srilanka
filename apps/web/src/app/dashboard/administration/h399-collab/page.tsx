'use client';

// ============================================================================
// H399 Collaborative Weekly Return — CRDT-based multi-officer editing
// Yjs (CRDT) + y-indexeddb (offline persistence)
// Multiple browser tabs simulate concurrent edits — conflict-free merge
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Users, Database, GitMerge, RefreshCw, CheckCircle, AlertTriangle, Trash2, Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CRDTEvent {
  ts: string;
  type: 'local' | 'remote' | 'merge' | 'persist';
  field: string;
  value: string;
  clientId: string;
}

interface WeeklyRow {
  id: string;
  disease: string;
  cases: string;
  deaths: string;
  area: string;
  remarks: string;
}

const DISEASES = [
  'Dengue Fever', 'Leptospirosis', 'Typhoid', 'Hepatitis A',
  'Food Poisoning', 'Chickenpox', 'Dysentery', 'Rabies',
];

const AREAS = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara', 'Kurunegala', 'Ratnapura'];

function makeRow(i: number): WeeklyRow {
  return { id: `row-${i}`, disease: DISEASES[i % DISEASES.length], cases: '0', deaths: '0', area: AREAS[i % AREAS.length], remarks: '' };
}

const DOC_NAME = 'phi-pro:h399-weekly-return';
const CLIENT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// ── Component ─────────────────────────────────────────────────────────────────

export default function H399CollabPage() {
  const ydocRef     = useRef<Y.Doc | null>(null);
  const persistRef  = useRef<IndexeddbPersistence | null>(null);
  const rowsRef     = useRef<Y.Array<Y.Map<string>> | null>(null);
  const metaRef     = useRef<Y.Map<string> | null>(null);

  const [rows, setRows]       = useState<WeeklyRow[]>([]);
  const [log, setLog]         = useState<CRDTEvent[]>([]);
  const [synced, setSynced]   = useState(false);
  const [docSize, setDocSize] = useState(0);
  const [clientId, setClientId] = useState('');

  const pushLog = useCallback((type: CRDTEvent['type'], field: string, value: string, cid: string) => {
    const ev: CRDTEvent = {
      ts: new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type, field, value, clientId: cid,
    };
    setLog(prev => [ev, ...prev.slice(0, 29)]);
  }, []);

  const readRows = useCallback(() => {
    if (!rowsRef.current) return;
    const arr: WeeklyRow[] = [];
    rowsRef.current.forEach(ymap => {
      arr.push({
        id:       ymap.get('id')       ?? '',
        disease:  ymap.get('disease')  ?? '',
        cases:    ymap.get('cases')    ?? '0',
        deaths:   ymap.get('deaths')   ?? '0',
        area:     ymap.get('area')     ?? '',
        remarks:  ymap.get('remarks')  ?? '',
      });
    });
    setRows(arr);
    setDocSize(Y.encodeStateAsUpdate(ydocRef.current!).length);
  }, []);

  useEffect(() => {
    const cid = `PHI-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setClientId(cid);

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const yrows = ydoc.getArray<Y.Map<string>>('h399_rows');
    rowsRef.current = yrows;
    const ymeta = ydoc.getMap<string>('meta');
    metaRef.current = ymeta;

    // Seed initial rows if empty
    ydoc.transact(() => {
      if (yrows.length === 0) {
        for (let i = 0; i < 5; i++) {
          const ymap = new Y.Map<string>();
          const row = makeRow(i);
          Object.entries(row).forEach(([k, v]) => ymap.set(k, v));
          yrows.push([ymap]);
        }
        ymeta.set('week',   `W${new Date().getFullYear()}-${String(Math.ceil((new Date().getMonth() + 1) / 4)).padStart(2, '0')}`);
        ymeta.set('officer', cid);
        ymeta.set('district', 'Colombo');
      }
    }, cid);

    // Observe changes
    yrows.observeDeep(() => {
      readRows();
      pushLog('remote', 'rows', `${yrows.length} rows`, cid);
    });

    // IndexedDB persistence
    const persistence = new IndexeddbPersistence(DOC_NAME, ydoc);
    persistRef.current = persistence;
    persistence.on('synced', () => {
      setSynced(true);
      readRows();
      pushLog('persist', 'IndexedDB', 'restored', cid);
    });

    readRows();

    return () => {
      persistence.destroy();
      ydoc.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCell = (rowIdx: number, field: keyof WeeklyRow, value: string) => {
    if (!rowsRef.current || !ydocRef.current) return;
    ydocRef.current.transact(() => {
      rowsRef.current!.get(rowIdx).set(field, value);
    }, clientId);
    pushLog('local', `row[${rowIdx}].${field}`, value, clientId);
  };

  const addRow = () => {
    if (!rowsRef.current || !ydocRef.current) return;
    const idx = rowsRef.current.length;
    ydocRef.current.transact(() => {
      const ymap = new Y.Map<string>();
      const row = makeRow(idx);
      Object.entries(row).forEach(([k, v]) => ymap.set(k, v));
      rowsRef.current!.push([ymap]);
    }, clientId);
    pushLog('local', 'rows', `+row ${idx}`, clientId);
  };

  const deleteRow = (idx: number) => {
    if (!rowsRef.current || !ydocRef.current) return;
    ydocRef.current.transact(() => { rowsRef.current!.delete(idx, 1); }, clientId);
    pushLog('local', 'rows', `-row ${idx}`, clientId);
  };

  const simulateConcurrentEdit = () => {
    if (!rowsRef.current || !ydocRef.current) return;
    const remoteClientId = `PHI-REMOTE-${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

    // Simulate another client's update arriving as a remote state vector
    const remoteDoc = new Y.Doc();
    const remoteRows = remoteDoc.getArray<Y.Map<string>>('h399_rows');

    // Copy current state into remoteDoc
    Y.applyUpdate(remoteDoc, Y.encodeStateAsUpdate(ydocRef.current));

    // Remote doc makes a conflicting edit
    remoteDoc.transact(() => {
      if (remoteRows.length > 0) {
        const target = Math.floor(Math.random() * remoteRows.length);
        const newCases = String(Math.floor(Math.random() * 20));
        remoteRows.get(target).set('cases', newCases);
        remoteRows.get(target).set('remarks', `Updated by ${remoteClientId}`);
      }
    }, remoteClientId);

    // Merge remote into local (CRDT magic — conflict-free)
    const remoteUpdate = Y.encodeStateAsUpdate(remoteDoc, Y.encodeStateAsUpdate(ydocRef.current));
    Y.applyUpdate(ydocRef.current, remoteUpdate);

    pushLog('merge', 'rows', `merged from ${remoteClientId}`, clientId);
    readRows();
    remoteDoc.destroy();
  };

  const clearDoc = () => {
    if (!ydocRef.current || !rowsRef.current) return;
    ydocRef.current.transact(() => {
      rowsRef.current!.delete(0, rowsRef.current!.length);
    }, clientId);
    pushLog('local', 'rows', 'cleared', clientId);
  };

  const weekMeta  = metaRef.current?.get('week')     ?? '—';
  const distMeta  = metaRef.current?.get('district') ?? '—';
  const totalCases = rows.reduce((s, r) => s + (parseInt(r.cases) || 0), 0);
  const totalDeaths = rows.reduce((s, r) => s + (parseInt(r.deaths) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow">
            <GitMerge className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">H399 Collaborative Weekly Return</h1>
            <p className="text-xs text-slate-500">Yjs CRDT · IndexedDB offline persistence · conflict-free concurrent editing</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', synced ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700')}>
            {synced ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5 animate-spin" />}
            {synced ? 'Persisted to IndexedDB' : 'Syncing…'}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Users className="h-3.5 w-3.5" />{clientId}
          </span>
        </div>
      </div>

      {/* Doc stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Doc size (bytes)',  value: docSize,     icon: Database, cls: 'text-violet-600' },
          { label: 'Rows in CRDT',      value: rows.length, icon: Users,    cls: 'text-blue-600'   },
          { label: 'Total cases',       value: totalCases,  icon: AlertTriangle, cls: 'text-amber-600' },
          { label: 'Total deaths',      value: totalDeaths, icon: CheckCircle,   cls: 'text-red-600'  },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <Icon className={cn('h-5 w-5', s.cls)} />
              <div><p className={cn('text-xl font-bold', s.cls)}>{s.value}</p><p className="text-[10px] text-slate-500">{s.label}</p></div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button onClick={addRow} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700">
          <Plus className="h-3.5 w-3.5" />Add Row
        </button>
        <button onClick={simulateConcurrentEdit} className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          <GitMerge className="h-3.5 w-3.5" />Simulate Remote Edit (CRDT merge)
        </button>
        <button onClick={clearDoc} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/20">
          <Trash2 className="h-3.5 w-3.5" />Clear
        </button>
        <span className="ml-auto self-center text-xs text-slate-400">Week: <strong>{weekMeta}</strong> · District: <strong>{distMeta}</strong></span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Editable table */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                    {['Disease', 'Cases', 'Deaths', 'Area', 'Remarks', ''].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                      <td className="px-3 py-1.5">
                        <select value={row.disease} onChange={e => updateCell(idx, 'disease', e.target.value)}
                          className="w-full rounded border-0 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-200">
                          {DISEASES.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" min={0} value={row.cases} onChange={e => updateCell(idx, 'cases', e.target.value)}
                          className="w-16 rounded border border-slate-200 bg-transparent px-2 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-200" />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" min={0} value={row.deaths} onChange={e => updateCell(idx, 'deaths', e.target.value)}
                          className="w-16 rounded border border-slate-200 bg-transparent px-2 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-200" />
                      </td>
                      <td className="px-3 py-1.5">
                        <select value={row.area} onChange={e => updateCell(idx, 'area', e.target.value)}
                          className="w-full rounded border-0 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-200">
                          {AREAS.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-1.5">
                        <input value={row.remarks} onChange={e => updateCell(idx, 'remarks', e.target.value)}
                          placeholder="notes…"
                          className="w-full rounded border-0 bg-transparent text-xs placeholder:text-slate-300 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-600" />
                      </td>
                      <td className="px-2 py-1.5">
                        <button onClick={() => deleteRow(idx)} className="rounded p-1 text-slate-300 hover:text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CRDT event log */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-2 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">CRDT Event Log</p>
          </div>
          <div className="h-80 overflow-y-auto p-3">
            {log.length === 0
              ? <p className="text-center text-xs text-slate-400 mt-8">No events yet</p>
              : log.map((ev, i) => (
                <div key={i} className="mb-1.5 rounded-lg border border-slate-50 bg-slate-50 px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-center gap-1.5">
                    <span className={cn('rounded px-1 py-0.5 text-[9px] font-bold uppercase',
                      ev.type === 'local'   ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : ev.type === 'remote'  ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'
                      : ev.type === 'merge'   ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                             : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400')}>
                      {ev.type}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{ev.clientId}</span>
                    <span className="ml-auto text-[9px] text-slate-300">{ev.ts}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-600 dark:text-slate-400">
                    <span className="font-medium">{ev.field}</span> → <span className="font-mono">{ev.value.slice(0, 40)}</span>
                  </p>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* CRDT explanation */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/10">
        <div className="flex gap-3">
          <GitMerge className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div className="text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
            <p className="font-semibold">How CRDTs guarantee conflict-free collaboration:</p>
            <p>Each field is a <strong>Yjs YMap</strong> inside a <strong>YArray</strong>. Every change is appended as an immutable operation in the document's state vector. When two officers edit the same cell simultaneously, Yjs applies a deterministic merge rule (last-write-wins per client clock) — no merge conflicts, no data loss.</p>
            <p>Press <strong>"Simulate Remote Edit"</strong> to see a concurrent change from a remote client merge into this document automatically — this is the same mechanism used by Google Docs.</p>
            <p className="text-emerald-600 dark:text-emerald-400">Persistence: the full CRDT state is stored in <strong>IndexedDB</strong> — the form survives browser refresh and works offline.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
