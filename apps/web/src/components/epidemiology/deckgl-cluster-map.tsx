'use client';

// ============================================================================
// Deck.gl 3D Disease Cluster Visualization
// Uses: @deck.gl/react v9 + ScatterplotLayer + HeatmapLayer + ColumnLayer
// Shows 3D columns whose HEIGHT = case count → instant severity reading
// ============================================================================

import { useState } from 'react';
import DeckGL from '@deck.gl/react';
import {
  ScatterplotLayer,
  ColumnLayer,
  TextLayer,
} from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAP_DEFAULTS } from '@phi-pro/shared';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DiseasePoint {
  id: string;
  disease: string;
  lat: number;
  lng: number;
  caseCount: number;
  confirmed: boolean;
  color: [number, number, number, number]; // RGBA
}

interface Props {
  points: DiseasePoint[];
  mode: '3D_COLUMNS' | 'HEATMAP' | 'SCATTER';
}

const INITIAL_VIEW = {
  longitude: MAP_DEFAULTS.center.lng,
  latitude: MAP_DEFAULTS.center.lat,
  zoom: 10,
  pitch: 50,    // tilt for 3D effect
  bearing: -10,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DeckGLClusterMap({ points, mode }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // ── Layer definitions ────────────────────────────────────────────────────

  // 3D Column layer: each cluster is a cylinder whose height = case count × 50m
  const columnLayer = new ColumnLayer<DiseasePoint>({
    id: 'disease-columns',
    data: points,
    diskResolution: 16,
    radius: 80,                         // 80m radius per column
    extruded: true,
    pickable: true,
    elevationScale: 50,                 // 1 case = 50 units height
    getPosition: (d) => [d.lng, d.lat],
    getElevation: (d) => d.caseCount,
    getFillColor: (d) => d.color,
    getLineColor: [255, 255, 255, 60],
    onHover: (info) => {
      if (info.object) {
        setTooltip({
          x: info.x,
          y: info.y,
          text: `${info.object.disease}\n${info.object.caseCount} cases`,
        });
      } else {
        setTooltip(null);
      }
    },
  });

  // Heatmap layer: density-based heat for epidemic spread visualization
  const heatmapLayer = new HeatmapLayer<DiseasePoint>({
    id: 'disease-heatmap',
    data: points,
    getPosition: (d) => [d.lng, d.lat],
    getWeight: (d) => d.caseCount,
    radiusPixels: 60,
    intensity: 1.5,
    threshold: 0.03,
    colorRange: [
      [0, 104, 55, 180],
      [255, 255, 153, 200],
      [253, 174, 97, 220],
      [215, 48, 39, 240],
      [165, 0, 38, 255],
    ],
  });

  // Scatter layer: simple dots for individual case view
  const scatterLayer = new ScatterplotLayer<DiseasePoint>({
    id: 'disease-scatter',
    data: points,
    pickable: true,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 5,
    radiusMaxPixels: 30,
    lineWidthMinPixels: 1,
    getPosition: (d) => [d.lng, d.lat],
    getRadius: (d) => Math.sqrt(d.caseCount) * 20,
    getFillColor: (d) => d.color,
    getLineColor: [255, 255, 255, 150],
  });

  // Label layer: disease name labels on 3D columns
  const textLayer = new TextLayer<DiseasePoint>({
    id: 'disease-labels',
    data: points.filter((p) => p.caseCount >= 3),
    getPosition: (d) => [d.lng, d.lat, d.caseCount * 50 + 20],
    getText: (d) => `${d.caseCount}`,
    getSize: 14,
    getColor: [255, 255, 255, 255],
    getAngle: 0,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    fontWeight: 700,
  });

  const layers =
    mode === '3D_COLUMNS'
      ? [columnLayer, textLayer]
      : mode === 'HEATMAP'
      ? [heatmapLayer, scatterLayer]
      : [scatterLayer];

  if (!token) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <p className="text-lg font-semibold">Deck.gl 3D View Ready</p>
        <code className="rounded bg-slate-700 px-4 py-2 text-xs text-green-400">
          NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
        </code>
        <p className="text-xs text-slate-400">Add Mapbox token to enable 3D cluster visualization</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <DeckGL
        initialViewState={INITIAL_VIEW}
        controller={{ dragRotate: true }}
        layers={layers}
        style={{ width: '100%', height: '100%' }}
      >
        <Map
          mapboxAccessToken={token}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          reuseMaps
        />
      </DeckGL>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-black/80 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-sm"
          style={{ left: tooltip.x + 12, top: tooltip.y - 30 }}
        >
          {tooltip.text.split('\n').map((line, i) => (
            <p key={i} className={i === 0 ? 'font-bold' : 'text-slate-300'}>
              {line}
            </p>
          ))}
        </div>
      )}

      {/* 3D controls hint */}
      {mode === '3D_COLUMNS' && (
        <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-[10px] text-white backdrop-blur-sm">
          Hold Ctrl + drag to rotate 3D view · Column height = case count
        </div>
      )}
    </div>
  );
}
