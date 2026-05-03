'use client';

// ============================================================================
// Contact Tracing Knowledge Graph — graphology data structure
// Nodes: Patient | Venue | Supplier   Edges: visited | supplied | contacted
// Spring layout computed client-side; rendered as SVG
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import Graph from 'graphology';
import { GitFork, Plus, Trash2, Users, MapPin, Truck, ZoomIn, ZoomOut, RefreshCw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Node / Edge types ─────────────────────────────────────────────────────────

type NodeType = 'patient' | 'venue' | 'supplier';
interface NodeAttrs { label: string; type: NodeType; x: number; y: number; vx: number; vy: number; infected?: boolean }
interface EdgeAttrs { label: string }

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_NODES: { id: string; attrs: Omit<NodeAttrs, 'vx' | 'vy'> }[] = [
  { id: 'P1',  attrs: { label: 'Patient 001', type: 'patient',  x: 200, y: 150, infected: true  } },
  { id: 'P2',  attrs: { label: 'Patient 002', type: 'patient',  x: 180, y: 280, infected: true  } },
  { id: 'P3',  attrs: { label: 'Patient 003', type: 'patient',  x: 350, y: 200, infected: false } },
  { id: 'P4',  attrs: { label: 'Patient 004', type: 'patient',  x: 100, y: 380, infected: false } },
  { id: 'V1',  attrs: { label: 'Lal\'s Restaurant', type: 'venue',   x: 300, y: 330 } },
  { id: 'V2',  attrs: { label: 'City Food Court',   type: 'venue',   x: 480, y: 140 } },
  { id: 'S1',  attrs: { label: 'Sea Fresh Suppliers', type: 'supplier', x: 460, y: 360 } },
  { id: 'S2',  attrs: { label: 'Lanka Veggie Co.',  type: 'supplier', x: 620, y: 260 } },
];

const SEED_EDGES: { source: string; target: string; attrs: EdgeAttrs }[] = [
  { source: 'P1', target: 'V1', attrs: { label: 'visited' } },
  { source: 'P2', target: 'V1', attrs: { label: 'visited' } },
  { source: 'P3', target: 'V2', attrs: { label: 'visited' } },
  { source: 'P4', target: 'V1', attrs: { label: 'visited' } },
  { source: 'P1', target: 'P2', attrs: { label: 'contact' } },
  { source: 'S1', target: 'V1', attrs: { label: 'supplied' } },
  { source: 'S2', target: 'V1', attrs: { label: 'supplied' } },
  { source: 'S2', target: 'V2', attrs: { label: 'supplied' } },
];

// ── Force simulation (Fruchterman-Reingold) ───────────────────────────────────

const WIDTH  = 720;
const HEIGHT = 420;
const K      = Math.sqrt((WIDTH * HEIGHT) / (SEED_NODES.length || 1));

function repulse(dx: number, dy: number, k: number) {
  const d = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);
  return (k * k) / d;
}

function attract(dx: number, dy: number, k: number) {
  const d = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);
  return (d * d) / k;
}

function runForce(g: Graph<NodeAttrs, EdgeAttrs>, temp: number) {
  const nodes = g.nodes();

  // Repulsion
  for (let i = 0; i < nodes.length; i++) {
    let dx = 0; let dy = 0;
    const u = nodes[i];
    const ux = g.getNodeAttribute(u, 'x');
    const uy = g.getNodeAttribute(u, 'y');
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const v = nodes[j];
      const ddx = ux - g.getNodeAttribute(v, 'x');
      const ddy = uy - g.getNodeAttribute(v, 'y');
      const f   = repulse(ddx, ddy, K);
      const dist = Math.max(Math.sqrt(ddx * ddx + ddy * ddy), 0.01);
      dx += (ddx / dist) * f;
      dy += (ddy / dist) * f;
    }
    g.setNodeAttribute(u, 'vx', (g.getNodeAttribute(u, 'vx') + dx));
    g.setNodeAttribute(u, 'vy', (g.getNodeAttribute(u, 'vy') + dy));
  }

  // Attraction
  g.forEachEdge((_, _a, source, target) => {
    const sx = g.getNodeAttribute(source, 'x');
    const sy = g.getNodeAttribute(source, 'y');
    const tx = g.getNodeAttribute(target, 'x');
    const ty = g.getNodeAttribute(target, 'y');
    const ddx = sx - tx; const ddy = sy - ty;
    const f   = attract(ddx, ddy, K);
    const dist = Math.max(Math.sqrt(ddx * ddx + ddy * ddy), 0.01);
    const fx = (ddx / dist) * f; const fy = (ddy / dist) * f;
    g.setNodeAttribute(source, 'vx', g.getNodeAttribute(source, 'vx') - fx);
    g.setNodeAttribute(source, 'vy', g.getNodeAttribute(source, 'vy') - fy);
    g.setNodeAttribute(target, 'vx', g.getNodeAttribute(target, 'vx') + fx);
    g.setNodeAttribute(target, 'vy', g.getNodeAttribute(target, 'vy') + fy);
  });

  // Apply with temperature damping + boundary clamping
  nodes.forEach(u => {
    let vx = g.getNodeAttribute(u, 'vx');
    let vy = g.getNodeAttribute(u, 'vy');
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > temp) { vx = (vx / speed) * temp; vy = (vy / speed) * temp; }
    const nx = Math.max(40, Math.min(WIDTH  - 40, g.getNodeAttribute(u, 'x') + vx));
    const ny = Math.max(40, Math.min(HEIGHT - 40, g.getNodeAttribute(u, 'y') + vy));
    g.setNodeAttribute(u, 'x', nx);
    g.setNodeAttribute(u, 'y', ny);
    g.setNodeAttribute(u, 'vx', vx * 0.5);
    g.setNodeAttribute(u, 'vy', vy * 0.5);
  });
}

// ── Colour helpers ────────────────────────────────────────────────────────────

const NODE_CFG: Record<NodeType, { fill: string; stroke: string; icon: React.ElementType; label: string }> = {
  patient:  { fill: '#fee2e2', stroke: '#ef4444', icon: Users,   label: 'Patient'  },
  venue:    { fill: '#dbeafe', stroke: '#3b82f6', icon: MapPin,  label: 'Venue'    },
  supplier: { fill: '#d1fae5', stroke: '#10b981', icon: Truck,   label: 'Supplier' },
};

const EDGE_CFG: Record<string, { stroke: string; dash?: string }> = {
  visited:  { stroke: '#3b82f6' },
  supplied: { stroke: '#10b981', dash: '6 3' },
  contact:  { stroke: '#f59e0b', dash: '4 4' },
};

// ── Main component ────────────────────────────────────────────────────────────

export default function ContactTracingPage() {
  const graphRef   = useRef<Graph<NodeAttrs, EdgeAttrs> | null>(null);
  const animRef    = useRef<number>(0);
  const [, forceUpdate] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [simulating, setSimulating] = useState(false);
  const [addMode, setAddMode] = useState<NodeType | null>(null);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, clusters: 0 });

  const buildGraph = useCallback(() => {
    const g = new Graph<NodeAttrs, EdgeAttrs>({ multi: false, type: 'undirected' });
    SEED_NODES.forEach(n => g.addNode(n.id, { ...n.attrs, vx: 0, vy: 0 }));
    SEED_EDGES.forEach(e => { try { g.addEdge(e.source, e.target, e.attrs); } catch { /* duplicate */ } });
    graphRef.current = g;
    setStats({ nodes: g.order, edges: g.size, clusters: 2 });
    forceUpdate(v => v + 1);
  }, []);

  useEffect(() => { buildGraph(); }, [buildGraph]);

  const runSimulation = useCallback(() => {
    if (!graphRef.current) return;
    setSimulating(true);
    let temp = 80; let step = 0;
    const tick = () => {
      if (!graphRef.current || temp < 0.5 || step > 300) { setSimulating(false); return; }
      runForce(graphRef.current, temp);
      temp *= 0.98;
      step++;
      forceUpdate(v => v + 1);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => { setTimeout(runSimulation, 200); return () => cancelAnimationFrame(animRef.current); }, [runSimulation]);

  const addNode = (type: NodeType) => {
    if (!graphRef.current) return;
    const g = graphRef.current;
    const id = `${type[0].toUpperCase()}${g.order + 1}`;
    const counts = { patient: g.filterNodes((_, a) => a.type === 'patient').length, venue: g.filterNodes((_, a) => a.type === 'venue').length, supplier: g.filterNodes((_, a) => a.type === 'supplier').length };
    g.addNode(id, {
      label: type === 'patient' ? `Patient ${String(counts.patient + 1).padStart(3, '0')}` : type === 'venue' ? `New Venue ${counts.venue + 1}` : `New Supplier ${counts.supplier + 1}`,
      type, x: 100 + Math.random() * 500, y: 80 + Math.random() * 300, vx: 0, vy: 0,
    });
    setStats({ nodes: g.order, edges: g.size, clusters: Math.ceil(g.order / 4) });
    forceUpdate(v => v + 1);
    setAddMode(null);
  };

  const removeSelected = () => {
    if (!graphRef.current || !selected) return;
    graphRef.current.dropNode(selected);
    setSelected(null);
    const g = graphRef.current;
    setStats({ nodes: g.order, edges: g.size, clusters: Math.ceil(g.order / 4) });
    forceUpdate(v => v + 1);
  };

  const g = graphRef.current;
  const selAttrs = selected && g?.hasNode(selected) ? g.getNodeAttributes(selected) : null;
  const selEdges = selected && g ? g.edges(selected).map(e => ({ id: e, attrs: g.getEdgeAttributes(e), source: g.source(e), target: g.target(e) })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow">
            <GitFork className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Contact Tracing Knowledge Graph</h1>
            <p className="text-xs text-slate-500">graphology · Fruchterman-Reingold force layout · Patient–Venue–Supplier network</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))}   className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><ZoomIn className="inline h-3.5 w-3.5" /></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))} className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><ZoomOut className="inline h-3.5 w-3.5" /></button>
          <button onClick={runSimulation} disabled={simulating} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">
            <RefreshCw className={cn('h-3.5 w-3.5', simulating && 'animate-spin')} />Re-layout
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Nodes in graph', value: stats.nodes, cls: 'text-violet-600' },
          { label: 'Relationships',  value: stats.edges, cls: 'text-blue-600'   },
          { label: 'Clusters',       value: stats.clusters, cls: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className={cn('text-2xl font-bold', s.cls)}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Graph canvas */}
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-4 py-2 dark:border-slate-800">
              {Object.entries(NODE_CFG).map(([type, cfg]) => (
                <span key={type} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  <span className="inline-block h-3 w-3 rounded-full border-2" style={{ background: cfg.fill, borderColor: cfg.stroke }} />
                  {cfg.label}
                </span>
              ))}
              <span className="ml-auto text-[10px] text-slate-400">Click a node to inspect</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <svg
                width={WIDTH}
                height={HEIGHT}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.2s', display: 'block' }}
              >
                <defs>
                  <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
                  </marker>
                </defs>
                {/* Edges */}
                {g && g.edges().map(e => {
                  const src = g.source(e); const tgt = g.target(e);
                  if (!g.hasNode(src) || !g.hasNode(tgt)) return null;
                  const sx = g.getNodeAttribute(src, 'x'); const sy = g.getNodeAttribute(src, 'y');
                  const tx = g.getNodeAttribute(tgt, 'x'); const ty = g.getNodeAttribute(tgt, 'y');
                  const lbl = g.getEdgeAttribute(e, 'label');
                  const cfg = EDGE_CFG[lbl] ?? { stroke: '#94a3b8' };
                  const mx = (sx + tx) / 2; const my = (sy + ty) / 2;
                  return (
                    <g key={e}>
                      <line x1={sx} y1={sy} x2={tx} y2={ty} stroke={cfg.stroke} strokeWidth={1.5} strokeDasharray={cfg.dash} opacity={0.7} />
                      <text x={mx} y={my - 4} textAnchor="middle" fontSize={9} fill={cfg.stroke} opacity={0.85}>{lbl}</text>
                    </g>
                  );
                })}
                {/* Nodes */}
                {g && g.nodes().map(n => {
                  const a = g.getNodeAttributes(n);
                  const cfg = NODE_CFG[a.type];
                  const isSelected = n === selected;
                  return (
                    <g key={n} style={{ cursor: 'pointer' }} onClick={() => setSelected(n === selected ? null : n)}>
                      <circle cx={a.x} cy={a.y} r={isSelected ? 26 : 22}
                        fill={cfg.fill} stroke={cfg.stroke} strokeWidth={isSelected ? 3 : 1.5}
                        opacity={0.9}
                      />
                      {a.infected && (
                        <circle cx={a.x + 14} cy={a.y - 14} r={6} fill="#ef4444" stroke="white" strokeWidth={1.5} />
                      )}
                      <text x={a.x} y={a.y + 4} textAnchor="middle" fontSize={9} fontWeight="600" fill={cfg.stroke}>{n}</text>
                      <text x={a.x} y={a.y + 34} textAnchor="middle" fontSize={8} fill="#64748b">{a.label}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Add node */}
          <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Add Node</p>
            <div className="space-y-2">
              {(['patient', 'venue', 'supplier'] as NodeType[]).map(type => {
                const cfg = NODE_CFG[type];
                const Icon = cfg.icon;
                return (
                  <button key={type} onClick={() => addNode(type)}
                    className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                    style={{ borderColor: cfg.stroke, color: cfg.stroke }}>
                    <Icon className="h-3.5 w-3.5" />Add {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Node inspector */}
          {selAttrs ? (
            <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected Node</p>
                <button onClick={removeSelected} className="rounded p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">ID</span><span className="font-mono font-medium">{selected}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Type</span>
                  <span className="font-semibold capitalize" style={{ color: NODE_CFG[selAttrs.type].stroke }}>{selAttrs.type}</span>
                </div>
                <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="font-medium">{selAttrs.label}</span></div>
                {selAttrs.infected !== undefined && (
                  <div className="flex justify-between"><span className="text-slate-400">Status</span>
                    <span className={selAttrs.infected ? 'font-semibold text-red-500' : 'font-semibold text-green-500'}>{selAttrs.infected ? 'Infected' : 'No infection'}</span>
                  </div>
                )}
                <div className="flex justify-between"><span className="text-slate-400">Connections</span><span className="font-bold">{selEdges.length}</span></div>
                {selEdges.length > 0 && (
                  <div className="mt-2 space-y-1 border-t pt-2 dark:border-slate-700">
                    {selEdges.map(e => (
                      <div key={e.id} className="flex items-center gap-1.5 text-[10px]">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <span className="font-mono">{e.source === selected ? e.target : e.source}</span>
                        <span className="text-slate-400">({e.attrs.label})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <Info className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-xs text-slate-400">Click a node to inspect its connections</p>
            </div>
          )}

          {/* Legend detail */}
          <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Edge Types</p>
            <div className="space-y-2">
              {Object.entries(EDGE_CFG).map(([lbl, cfg]) => (
                <div key={lbl} className="flex items-center gap-2 text-xs">
                  <svg width={28} height={8}><line x1={0} y1={4} x2={28} y2={4} stroke={cfg.stroke} strokeWidth={1.5} strokeDasharray={cfg.dash} /></svg>
                  <span className="capitalize text-slate-600 dark:text-slate-400">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-400">
        Knowledge graph powered by <strong>graphology</strong> · Force layout: Fruchterman-Reingold · Production: store in Firestore + neo4j
      </p>
    </div>
  );
}
