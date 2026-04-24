'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { ArrowLeft, MapPin, Layers, AlertTriangle, Box, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { haversineDistance, DENGUE_CLUSTER_RADIUS_METRES } from '@phi-pro/shared';

const DeckGLClusterMap = dynamic(
  () => import('@/components/epidemiology/deckgl-cluster-map').then((m) => ({ default: m.DeckGLClusterMap })),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading 3D view…</div> },
);

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------
interface DiseaseCase {
  id: string;
  disease: string;
  lat: number;
  lng: number;
  date: string;
  gn: string;
  confirmed: boolean;
}

// ---------------------------------------------------------------------------
// Haversine cluster detection
// Groups cases within DENGUE_CLUSTER_RADIUS_METRES (150m) of each other
// ---------------------------------------------------------------------------
interface Cluster {
  id: string;
  disease: string;
  centroidLat: number;
  centroidLng: number;
  cases: DiseaseCase[];
  radiusMetres: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

function detectClusters(cases: DiseaseCase[]): Cluster[] {
  const visited = new Set<string>();
  const clusters: Cluster[] = [];

  for (const caseA of cases) {
    if (visited.has(caseA.id)) continue;
    const nearby: DiseaseCase[] = [caseA];
    visited.add(caseA.id);

    for (const caseB of cases) {
      if (visited.has(caseB.id) || caseA.id === caseB.id) continue;
      if (caseA.disease !== caseB.disease) continue;

      const dist = haversineDistance(caseA.lat, caseA.lng, caseB.lat, caseB.lng);
      if (dist <= DENGUE_CLUSTER_RADIUS_METRES) {
        nearby.push(caseB);
        visited.add(caseB.id);
      }
    }

    const centroidLat = nearby.reduce((s, c) => s + c.lat, 0) / nearby.length;
    const centroidLng = nearby.reduce((s, c) => s + c.lng, 0) / nearby.length;
    const n = nearby.length;
    const severity: Cluster['severity'] =
      n >= 10 ? 'CRITICAL' : n >= 5 ? 'HIGH' : n >= 3 ? 'MEDIUM' : 'LOW';

    clusters.push({
      id: `cluster-${caseA.id}`,
      disease: caseA.disease,
      centroidLat,
      centroidLng,
      cases: nearby,
      radiusMetres: DENGUE_CLUSTER_RADIUS_METRES,
      severity,
    });
  }

  return clusters;
}

// ---------------------------------------------------------------------------
// Sample disease case data (would come from Firestore in production)
// ---------------------------------------------------------------------------
const SAMPLE_CASES: DiseaseCase[] = [
  { id: 'c1', disease: 'Dengue Fever', lat: 6.9167, lng: 79.8750, date: '2025-02-12', gn: 'Borella South', confirmed: true },
  { id: 'c2', disease: 'Dengue Fever', lat: 6.9171, lng: 79.8748, date: '2025-02-13', gn: 'Borella South', confirmed: true },
  { id: 'c3', disease: 'Dengue Fever', lat: 6.9163, lng: 79.8753, date: '2025-02-14', gn: 'Borella South', confirmed: true },
  { id: 'c4', disease: 'Dengue Fever', lat: 6.9175, lng: 79.8745, date: '2025-02-14', gn: 'Borella North', confirmed: true },
  { id: 'c5', disease: 'Dengue Fever', lat: 6.9180, lng: 79.8760, date: '2025-02-15', gn: 'Borella North', confirmed: false },
  { id: 'c6', disease: 'Chickenpox', lat: 6.8986, lng: 79.8756, date: '2025-02-10', gn: 'Narahenpita', confirmed: true },
  { id: 'c7', disease: 'Chickenpox', lat: 6.8990, lng: 79.8760, date: '2025-02-11', gn: 'Narahenpita', confirmed: true },
  { id: 'c8', disease: 'Leptospirosis', lat: 6.8800, lng: 79.8667, date: '2025-02-08', gn: 'Kirulapone', confirmed: true },
  { id: 'c9', disease: 'Leptospirosis', lat: 6.8805, lng: 79.8670, date: '2025-02-09', gn: 'Kirulapone', confirmed: true },
  { id: 'c10', disease: 'Leptospirosis', lat: 6.8795, lng: 79.8663, date: '2025-02-09', gn: 'Kirulapone', confirmed: false },
  { id: 'c11', disease: 'Food Poisoning', lat: 6.9020, lng: 79.8605, date: '2025-02-11', gn: 'Cinnamon Gardens', confirmed: true },
];

// ---------------------------------------------------------------------------
// Disease colour map
// ---------------------------------------------------------------------------
const DISEASE_COLORS: Record<string, string> = {
  'Dengue Fever': '#dc2626',
  Chickenpox: '#2563eb',
  Leptospirosis: '#d97706',
  'Food Poisoning': '#16a34a',
  Typhoid: '#7c3aed',
  Cholera: '#be185d',
};

function diseaseColor(disease: string) {
  return DISEASE_COLORS[disease] ?? '#6b7280';
}

function hexToRgba(hex: string, alpha = 200): [number, number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, alpha];
}

// ---------------------------------------------------------------------------
// Dynamic Mapbox Map (SSR-disabled — Mapbox needs window)
// ---------------------------------------------------------------------------
const MapboxMap = dynamic(() => import('@/components/epidemiology/mapbox-disease-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#0066cc] border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    </div>
  ),
});

// ---------------------------------------------------------------------------
// Severity badge
// ---------------------------------------------------------------------------
const SEV_CLASSES: Record<string, string> = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-blue-100 text-blue-700',
};

export default function DiseaseMapPage() {
  const [diseaseFilter, setDiseaseFilter] = useState<string>('ALL');
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [mapMode, setMapMode] = useState<'2D' | '3D_COLUMNS' | 'HEATMAP'>('2D');

  const diseases = useMemo(
    () => ['ALL', ...Array.from(new Set(SAMPLE_CASES.map((c) => c.disease)))],
    [],
  );

  const filteredCases = useMemo(
    () => (diseaseFilter === 'ALL' ? SAMPLE_CASES : SAMPLE_CASES.filter((c) => c.disease === diseaseFilter)),
    [diseaseFilter],
  );

  // Haversine cluster detection runs every time filter changes
  const clusters = useMemo(() => detectClusters(filteredCases), [filteredCases]);

  const stats = {
    total: filteredCases.length,
    confirmed: filteredCases.filter((c) => c.confirmed).length,
    activeClusters: clusters.filter((c) => c.cases.length >= 2).length,
    critical: clusters.filter((c) => c.severity === 'CRITICAL' || c.severity === 'HIGH').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/epidemiology">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-[#cc0000]" /> Disease Intelligence Map
            </h1>
            <p className="text-sm text-muted-foreground">
              Haversine {DENGUE_CLUSTER_RADIUS_METRES}m hotspot detection · Real-time case mapping
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Cases', value: stats.total, color: 'text-slate-700' },
          { label: 'Confirmed', value: stats.confirmed, color: 'text-green-700' },
          { label: 'Active Clusters', value: stats.activeClusters, color: 'text-amber-700' },
          { label: 'High Priority', value: stats.critical, color: 'text-red-700' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {diseases.map((d) => (
          <button
            key={d}
            onClick={() => setDiseaseFilter(d)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              diseaseFilter === d
                ? 'bg-[#0066cc] text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {d === 'ALL' ? 'All Diseases' : d}
          </button>
        ))}
      </div>

      {/* Algorithm transparency panel */}
      <Card className="border border-blue-200 bg-blue-50/50">
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-blue-800 mb-1">
            Haversine Cluster Algorithm (150m buffer)
          </p>
          <code className="block rounded bg-white p-2 text-[11px] font-mono text-gray-700 shadow-sm">
            {`// For each pair of same-disease cases:
dist = haversineDistance(lat1,lng1, lat2,lng2)  // metres
if dist <= ${DENGUE_CLUSTER_RADIUS_METRES} → grouped into same cluster
// Severity: ≥10 cases = CRITICAL, ≥5 = HIGH, ≥3 = MEDIUM, else LOW`}
          </code>
          <p className="mt-1 text-[10px] text-blue-600">
            {clusters.length} clusters detected from {filteredCases.length} cases ·
            Earth radius = 6,371,000m · Reference: Sri Lanka Epidemiology Unit SOP 2019
          </p>
        </CardContent>
      </Card>

      {/* Map mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">View:</span>
        {([
          { id: '2D', label: '2D Map', icon: Map },
          { id: '3D_COLUMNS', label: '3D Clusters', icon: Box },
          { id: 'HEATMAP', label: 'Heatmap', icon: Layers },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMapMode(id)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              mapMode === id
                ? 'border-[#0066cc] bg-[#0066cc] text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Map */}
      <Card className="overflow-hidden">
        <div className="relative h-[480px] sm:h-[560px]">
          {mapMode === '2D' ? (
            <MapboxMap
              cases={filteredCases}
              clusters={clusters}
              diseaseColor={diseaseColor}
              onClusterSelect={setSelectedCluster}
            />
          ) : (
            <DeckGLClusterMap
              mode={mapMode}
              points={clusters.map((c) => ({
                id: c.id,
                disease: c.disease,
                lat: c.centroidLat,
                lng: c.centroidLng,
                caseCount: c.cases.length,
                confirmed: true,
                color: hexToRgba(diseaseColor(c.disease), c.severity === 'CRITICAL' ? 255 : c.severity === 'HIGH' ? 220 : 180),
              }))}
            />
          )}
        </div>
      </Card>

      {/* Selected cluster detail */}
      {selectedCluster && (
        <Card className="border-2 border-[#cc0000]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Cluster Detail — {selectedCluster.disease}
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-xs ${SEV_CLASSES[selectedCluster.severity]}`}
              >
                {selectedCluster.severity}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm"><strong>Cases in cluster:</strong> {selectedCluster.cases.length}</p>
                <p className="text-sm"><strong>Radius:</strong> {selectedCluster.radiusMetres}m</p>
                <p className="text-sm">
                  <strong>Centroid:</strong>{' '}
                  {selectedCluster.centroidLat.toFixed(5)}, {selectedCluster.centroidLng.toFixed(5)}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Individual Cases:</p>
                {selectedCluster.cases.map((c) => (
                  <p key={c.id} className="text-xs text-muted-foreground">
                    • {c.gn} — {c.date} {c.confirmed ? '[confirmed]' : '[suspected]'}
                  </p>
                ))}
              </div>
            </div>
            <button
              onClick={() => setSelectedCluster(null)}
              className="mt-3 text-xs text-slate-500 underline"
            >
              Dismiss
            </button>
          </CardContent>
        </Card>
      )}

      {/* Cluster list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Active Clusters ({clusters.filter((c) => c.cases.length >= 2).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clusters
              .filter((c) => c.cases.length >= 2)
              .sort((a, b) => b.cases.length - a.cases.length)
              .map((cluster) => (
                <button
                  key={cluster.id}
                  onClick={() => setSelectedCluster(cluster)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-slate-50 ${
                    cluster.severity === 'CRITICAL' || cluster.severity === 'HIGH'
                      ? 'border-red-200 bg-red-50'
                      : cluster.severity === 'MEDIUM'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{cluster.disease}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {cluster.cases[0].gn} area · {cluster.radiusMetres}m radius
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold" style={{ color: diseaseColor(cluster.disease) }}>
                        {cluster.cases.length}
                      </p>
                      <p className="text-xs text-muted-foreground">cases</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${SEV_CLASSES[cluster.severity]}`}>
                      {cluster.severity}
                    </span>
                    <span className="text-muted-foreground">
                      Latest: {cluster.cases[cluster.cases.length - 1].date}
                    </span>
                  </div>
                </button>
              ))}
            {clusters.filter((c) => c.cases.length >= 2).length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No multi-case clusters detected for selected filter
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" /> Map Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(DISEASE_COLORS).map(([disease, color]) => (
              <div key={disease} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs">{disease}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="h-4 w-8 rounded border-2 border-dashed border-red-500 bg-red-50/50" />
              <span className="text-xs">150m cluster radius</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
