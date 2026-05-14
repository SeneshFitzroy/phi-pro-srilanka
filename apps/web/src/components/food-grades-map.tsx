'use client';

/**
 * FoodGradesMap
 * Real interactive Mapbox map of every PHIPRO-verified food premises.
 * Pins coloured by hygiene grade: A=green, B=amber, C=red.
 * Click a pin -> popup with name, grade, score, last inspection, and
 * a deep-link to the official `/public/verify` certificate page.
 *
 * Used inline on /public/food-grades — no codes, no embeds, just a map.
 */

import { useMemo, useState } from 'react';
import Map, {
  Marker,
  Popup,
  NavigationControl,
  ScaleControl,
  GeolocateControl,
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ShieldCheck, MapPin } from 'lucide-react';

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

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Sri Lanka centroid (Colombo) — used when nothing has coords
const SRI_LANKA_CENTRE = { lat: 7.0, lng: 80.7, zoom: 7.2 };

// Visual styling per hygiene grade
const GRADE_STYLE: Record<string, { ring: string; bg: string; text: string; label: string }> = {
  A: { ring: 'ring-emerald-300', bg: 'bg-emerald-500', text: 'text-emerald-50', label: 'Grade A' },
  B: { ring: 'ring-amber-300',   bg: 'bg-amber-500',   text: 'text-amber-50',   label: 'Grade B' },
  C: { ring: 'ring-red-300',     bg: 'bg-red-500',     text: 'text-red-50',     label: 'Grade C' },
};

function fmtDate(iso?: string): string {
  if (!iso) return 'N/A';
  try { return new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

interface Props {
  premises: FoodGradePoint[];
  /** Tailwind height class — defaults to a comfortable 24rem (384px) */
  heightClass?: string;
}

export function FoodGradesMap({ premises, heightClass = 'h-[28rem]' }: Props) {
  const points = useMemo(
    () => premises.filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number'),
    [premises],
  );
  const [selected, setSelected] = useState<FoodGradePoint | null>(null);

  // Auto-fit camera to the points when there are some
  const initial = useMemo(() => {
    if (points.length === 0) return SRI_LANKA_CENTRE;
    const lats = points.map((p) => p.lat as number);
    const lngs = points.map((p) => p.lng as number);
    const lat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const lng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const span = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));
    const zoom = span < 0.05 ? 13 : span < 0.2 ? 11 : span < 0.6 ? 10 : 8.5;
    return { lat, lng, zoom };
  }, [points]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`flex ${heightClass} w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400`}>
        Map unavailable: NEXT_PUBLIC_MAPBOX_TOKEN is not set.
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className={`flex ${heightClass} w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400`}>
        <MapPin className="h-6 w-6 opacity-40" />
        <p>No premises with coordinates in the current filter.</p>
      </div>
    );
  }

  return (
    <div className={`relative ${heightClass} w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800`}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        initialViewState={{ latitude: initial.lat, longitude: initial.lng, zoom: initial.zoom }}
        style={{ width: '100%', height: '100%' }}
        attributionControl={true}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" trackUserLocation />
        <ScaleControl position="bottom-left" />

        {points.map((p) => {
          const style = GRADE_STYLE[p.grade] ?? GRADE_STYLE.C;
          return (
            <Marker
              key={p.id}
              latitude={p.lat as number}
              longitude={p.lng as number}
              anchor="bottom"
              onClick={(e) => { e.originalEvent.stopPropagation(); setSelected(p); }}
            >
              <button
                type="button"
                aria-label={`${p.name} — ${style.label}`}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-md ring-4 ${style.ring} ${style.bg} transition-transform hover:scale-110`}
              >
                <span className={`text-sm font-black ${style.text}`}>{p.grade}</span>
              </button>
            </Marker>
          );
        })}

        {selected && (
          <Popup
            latitude={selected.lat as number}
            longitude={selected.lng as number}
            anchor="top"
            onClose={() => setSelected(null)}
            closeOnClick={false}
            offset={12}
            maxWidth="280px"
          >
            <div className="space-y-1.5 p-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{selected.name}</p>
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-black text-white ${(GRADE_STYLE[selected.grade] ?? GRADE_STYLE.C).bg}`}
                  title={(GRADE_STYLE[selected.grade] ?? GRADE_STYLE.C).label}
                >
                  {selected.grade}
                </span>
              </div>
              <p className="text-xs text-slate-600">{selected.address}</p>
              {selected.type && (
                <p className="text-[11px] uppercase tracking-wider text-slate-400">{selected.type}</p>
              )}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>Score: <strong className="text-slate-900">{selected.score ?? '—'}/100</strong></span>
                <span>Inspected {fmtDate(selected.lastInspection)}</span>
              </div>
              <div className="flex items-center gap-1 pt-1 text-[11px] font-semibold text-emerald-700">
                <ShieldCheck className="h-3 w-3" />
                <span>Verified by PHIPRO</span>
              </div>
              <a
                href="/public/verify"
                className="mt-1 block rounded-md bg-blue-700 px-2 py-1.5 text-center text-[11px] font-bold text-white hover:bg-blue-800"
              >
                Verify certificate
              </a>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
