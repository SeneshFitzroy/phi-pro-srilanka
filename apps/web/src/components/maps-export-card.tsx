'use client';

/**
 * MapsExportCard
 * Two one-click actions for citizens — no codes, no copy/paste:
 *
 *   1. "Open in Maps" — `geo:`/`maps:` deep-link on iOS/Android, Google Maps on desktop.
 *                       Drops the user at the first verified premise.
 *   2. "View map"     — Toggles a real interactive Mapbox map inline below the card,
 *                       showing every PHIPRO-verified premise as a colour-coded pin
 *                       (A=green / B=amber / C=red). Click a pin -> popup with details
 *                       and a deep-link to the verify-certificate page.
 */

import { useState } from 'react';
import { Map as MapIcon, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FoodGradesMap, type FoodGradePoint } from '@/components/food-grades-map';

export interface MapsExportPremise {
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

/** Build a Google Maps URL — uses lat/lng if present, otherwise address search. */
export function googleMapsUrl(p: { lat?: number; lng?: number; address: string; name: string }): string {
  if (p.lat != null && p.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.address}`)}`;
}

/** Best-effort deep-link: native maps on mobile, https fallback elsewhere. */
export function openInMaps(p: { lat?: number; lng?: number; address: string; name: string }): void {
  if (typeof window === 'undefined') return;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  if (p.lat != null && p.lng != null) {
    if (isIOS) { window.location.href = `maps://?q=${p.lat},${p.lng}`; return; }
    if (isAndroid) { window.location.href = `geo:${p.lat},${p.lng}?q=${p.lat},${p.lng}(${encodeURIComponent(p.name)})`; return; }
  }
  window.open(googleMapsUrl(p), '_blank', 'noopener,noreferrer');
}

interface Props {
  premises: MapsExportPremise[];
  /** Show the bulk "Open in Maps" deep-link button (only sensible when at least one premise has coords) */
  showOpenAll?: boolean;
  /** Whether the inline map is open by default. Default: true so visitors see the map immediately. */
  defaultMapOpen?: boolean;
}

export function MapsExportCard({ premises, showOpenAll = true, defaultMapOpen = true }: Props) {
  const [mapOpen, setMapOpen] = useState(defaultMapOpen);

  const openAllInMaps = () => {
    const first = premises.find((p) => p.lat != null && p.lng != null);
    if (first) {
      openInMaps(first);
    } else {
      window.open('https://www.google.com/maps/search/?api=1&query=food+premises+sri+lanka', '_blank', 'noopener,noreferrer');
    }
  };

  const points: FoodGradePoint[] = premises;

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/60 to-white shadow-sm dark:border-blue-900/40 dark:from-blue-950/30 dark:to-slate-950">
      <CardContent className="p-5">
        {/* Header + actions on one line on desktop */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
              <MapIcon className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Verified premises map</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Live interactive map of every PHIPRO-verified food premises. Click a pin for details.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
            {showOpenAll && (
              <Button
                size="sm"
                variant="outline"
                onClick={openAllInMaps}
                className="h-9 gap-1.5 whitespace-nowrap text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in Maps
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setMapOpen((v) => !v)}
              className="h-9 gap-1.5 whitespace-nowrap bg-blue-700 text-xs text-white shadow-sm hover:bg-blue-800"
            >
              {mapOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {mapOpen ? 'Hide map' : 'View map'}
            </Button>
          </div>
        </div>

        {/* Real interactive Mapbox map */}
        {mapOpen && (
          <div className="mt-4">
            <FoodGradesMap premises={points} />
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" /> Grade A
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" /> Grade B
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" /> Grade C
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
