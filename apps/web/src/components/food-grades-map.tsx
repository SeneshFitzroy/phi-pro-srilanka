'use client';

/**
 * FoodGradesMap
 * Interactive Leaflet/OSM map of every PHIPRO-verified food premises.
 * Pins coloured by hygiene grade: A=emerald, B=amber, C=rose.
 *
 * Migrated off Mapbox-GL to Leaflet so the map renders without a token and
 * without CDN-blocking issues some Sri Lankan ISPs hit on basemaps.cartocdn.com.
 */

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { LeafletMarker } from '@/components/leaflet-map';

const LeafletMap = dynamic(() => import('@/components/leaflet-map'), { ssr: false });

export interface FoodGradePoint {
  id: string;
  name: string;
  address: string;
  grade: string;
  score?: number;
  lat?: number;
  lng?: number;
  type?: string;
  lastInspection?: string;
}

function fmtDate(iso?: string): string {
  if (!iso) return 'N/A';
  try { return new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

interface Props {
  premises: FoodGradePoint[];
  /** Tailwind-style height string — defaults to 28rem (448px) */
  height?: string;
}

export function FoodGradesMap({ premises, height = '28rem' }: Props) {
  const pinned = useMemo(
    () => premises.filter((p): p is FoodGradePoint & { lat: number; lng: number } => p.lat != null && p.lng != null),
    [premises],
  );

  const markers: LeafletMarker[] = useMemo(
    () => pinned.map((p) => ({
      id: p.id,
      position: { lat: p.lat, lng: p.lng },
      color: p.grade === 'A' ? 'emerald' : p.grade === 'B' ? 'amber' : 'rose',
      label: p.grade,
      popup: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-slate-900">{p.name}</p>
          <p className="text-[11px] text-slate-500">{p.address}</p>
          <p className="text-[11px]">
            <span className="font-bold">Grade {p.grade}</span>
            {p.score != null ? ` · ${p.score}%` : ''}
            {p.type ? ` · ${p.type}` : ''}
          </p>
          <p className="text-[10px] text-slate-400">Last inspection: {fmtDate(p.lastInspection)}</p>
          <a
            href={`/public/verify?ref=${encodeURIComponent(p.id)}`}
            className="mt-1 block rounded-md bg-emerald-700 px-2 py-1.5 text-center text-[11px] font-bold text-white hover:bg-emerald-800"
          >
            Verify certificate
          </a>
        </div>
      ),
    })),
    [pinned],
  );

  return <LeafletMap markers={markers} fitToMarkers height={height} />;
}
