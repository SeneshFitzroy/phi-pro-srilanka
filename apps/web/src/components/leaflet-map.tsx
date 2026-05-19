'use client';

// ============================================================================
// Generic Leaflet map for citizen-facing pages.
// Mapbox-GL + Carto tiles were rendering blank in production for some users
// (mostly Asian ISPs + ad-blocked browsers). Leaflet + plain OSM raster tiles
// is the lowest-friction stack — no API key, no CORS hostname filtering, and
// renders identically in every browser.
//
// Imported via next/dynamic from every consumer page so Leaflet's window
// dependency never reaches the server bundle.
// ============================================================================

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Tile-source pool. We try Carto Voyager first (fast CDN, anti-block-list
 * friendly), then fall back to plain OpenStreetMap with subdomain rotation
 * if Carto's CDN is unreachable from the user's network.
 */
const TILE_SOURCES = [
  {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
] as const;

/* ── leaflet default marker shim (Next/Webpack mangles the asset paths) ── */
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export type LatLng = { lat: number; lng: number };

export interface LeafletMarker {
  id: string;
  position: LatLng;
  popup?: React.ReactNode;
  /** Colour for the rendered DivIcon pin */
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo';
  /** Optional label (single character / number) drawn inside the pin */
  label?: string;
  draggable?: boolean;
  onDragEnd?: (pos: LatLng) => void;
}

interface Props {
  /** Initial view centre (defaults to Sri Lanka geographic centre). */
  centre?: LatLng;
  /** Initial zoom level (defaults to 7 for the whole island). */
  zoom?: number;
  /** Bounds to fit when markers change. */
  fitToMarkers?: boolean;
  height?: string;
  markers?: LeafletMarker[];
  /** Click anywhere on the map. Used by complaints to drop a pin. */
  onMapClick?: (pos: LatLng) => void;
  /** Show the locate-me + zoom controls. */
  showZoomControl?: boolean;
  /** Custom CSS class on the container. */
  className?: string;
}

const SL_CENTRE: LatLng = { lat: 7.8731, lng: 80.7718 };

const COLORS: Record<NonNullable<LeafletMarker['color']>, string> = {
  blue:    '#1d4ed8',
  emerald: '#059669',
  amber:   '#d97706',
  rose:    '#e11d48',
  indigo:  '#4f46e5',
};

function pinSvg(color: string, label?: string) {
  return `
    <div style="position:relative;width:32px;height:42px;">
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 1 C7.7 1 1 7.7 1 16 c0 11 15 25 15 25 s15 -14 15 -25 c0 -8.3 -6.7 -15 -15 -15 z"
              fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
      ${label ? `<span style="position:absolute;top:9px;left:0;width:32px;text-align:center;font:700 11px system-ui;color:${color}">${label}</span>` : ''}
    </div>`;
}

function makeIcon(color: string, label?: string) {
  return L.divIcon({
    className: 'leaflet-div-pin',
    html: pinSvg(color, label),
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
}

function MapClickHandler({ onClick }: { onClick?: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) { onClick?.({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return null;
}

function FitBounds({ markers }: { markers: LeafletMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].position.lat, markers[0].position.lng], 14);
      return;
    }
    const bounds = L.latLngBounds(markers.map((m) => [m.position.lat, m.position.lng]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [markers, map]);
  return null;
}

export default function LeafletMap({
  centre = SL_CENTRE,
  zoom = 7,
  fitToMarkers = false,
  height = '28rem',
  markers = [],
  onMapClick,
  showZoomControl = true,
  className = '',
}: Props) {
  // Tile source with auto-failover. If the active source errors more than 3
  // tiles in 4 seconds (usually a CDN block or DNS failure on the user's
  // network), we transparently fall through to the next entry in TILE_SOURCES.
  const [tileIdx, setTileIdx] = useState(0);
  const [tileErrCount, setTileErrCount] = useState(0);
  useEffect(() => {
    if (tileErrCount < 3) return;
    if (tileIdx >= TILE_SOURCES.length - 1) return;
    const t = setTimeout(() => {
      setTileIdx((i) => i + 1);
      setTileErrCount(0);
    }, 1500);
    return () => clearTimeout(t);
  }, [tileErrCount, tileIdx]);
  const tile = TILE_SOURCES[tileIdx];

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 ${className}`} style={{ height }}>
      <MapContainer
        center={[centre.lat, centre.lng]}
        zoom={zoom}
        scrollWheelZoom
        zoomControl={showZoomControl}
        style={{ width: '100%', height: '100%', background: '#e5e7eb' }}
        attributionControl
      >
        <TileLayer
          key={tile.url}
          attribution={tile.attribution}
          url={tile.url}
          subdomains={tile.subdomains as unknown as string[]}
          maxZoom={19}
          eventHandlers={{ tileerror: () => setTileErrCount((n) => n + 1) }}
        />

        {fitToMarkers && <FitBounds markers={markers} />}
        <MapClickHandler onClick={onMapClick} />

        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.position.lat, m.position.lng]}
            icon={makeIcon(COLORS[m.color ?? 'blue'], m.label)}
            draggable={m.draggable}
            eventHandlers={
              m.onDragEnd
                ? {
                    dragend: (e) => {
                      const { lat, lng } = (e.target as L.Marker).getLatLng();
                      m.onDragEnd!({ lat, lng });
                    },
                  }
                : undefined
            }
          >
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
