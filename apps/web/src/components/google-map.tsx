'use client';

/**
 * Google Maps renderer — uses the Maps JavaScript API directly.
 * Auto-activates when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set; otherwise the
 * LeafletMap dispatcher falls back to OSM-based tiles.
 *
 * Same prop surface as LeafletMap so consumer pages don't change.
 */

import { useEffect, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { LeafletMarker, LatLng } from '@/components/leaflet-map';

declare global {
  interface Window {
    __phiproMapsLoader__?: Promise<void>;
  }
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const SL_CENTRE: LatLng = { lat: 7.8731, lng: 80.7718 };

/** Has the user configured a Google Maps key? Consumers branch on this. */
export const HAS_GOOGLE_MAPS_KEY = Boolean(API_KEY);

/**
 * Load the Google Maps JS once per page. Idempotent — concurrent callers
 * share the same in-flight promise.
 */
function isMapsReady(): boolean {
  return typeof window !== 'undefined' && Boolean((window as unknown as { google?: { maps?: unknown } }).google?.maps);
}

function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (isMapsReady()) return Promise.resolve();
  if (window.__phiproMapsLoader__) return window.__phiproMapsLoader__;

  window.__phiproMapsLoader__ = new Promise<void>((resolve, reject) => {
    if (!API_KEY) { reject(new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY missing')); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
  return window.__phiproMapsLoader__;
}

const PIN_COLOR: Record<NonNullable<LeafletMarker['color']>, string> = {
  blue:    '#1d4ed8',
  emerald: '#059669',
  amber:   '#d97706',
  rose:    '#e11d48',
  indigo:  '#4f46e5',
};

interface Props {
  centre?: LatLng;
  zoom?: number;
  fitToMarkers?: boolean;
  height?: string;
  markers?: LeafletMarker[];
  onMapClick?: (pos: LatLng) => void;
  showZoomControl?: boolean;
  className?: string;
  /**
   * Called when the Google Maps script fails to load (ad-blocker, CSP,
   * Brave Shields, missing billing, etc.). Parent components use this to
   * fall back to the OSM Leaflet renderer so the user still sees a map.
   */
  onLoadFailure?: () => void;
}

export default function GoogleMap({
  centre = SL_CENTRE,
  zoom = 7,
  fitToMarkers = false,
  height = '28rem',
  markers = [],
  onMapClick,
  showZoomControl = true,
  className = '',
  onLoadFailure,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const renderedMarkers = useRef<google.maps.Marker[]>([]);
  const popupRoots = useRef<Root[]>([]);
  const openInfoWindow = useRef<google.maps.InfoWindow | null>(null);

  /* Initialise map once. */
  useEffect(() => {
    let cancelled = false;
    // Hard timeout — if the script hasn't loaded in 6s (almost always means
    // the user's ad-blocker / Brave Shields blocked maps.googleapis.com with
    // ERR_BLOCKED_BY_CLIENT) we surrender and let the parent swap in the
    // OSM Leaflet renderer.
    const loadDeadline = window.setTimeout(() => {
      if (cancelled || isMapsReady()) return;
      console.warn('[google-map] script never loaded — falling back to OSM tiles');
      onLoadFailure?.();
    }, 6000);

    loadGoogleMaps()
      .then(() => {
        clearTimeout(loadDeadline);
        if (cancelled || !ref.current) return;
        if (!isMapsReady()) { onLoadFailure?.(); return; }
        try {
          if (!mapRef.current) {
            mapRef.current = new google.maps.Map(ref.current, {
              center: centre,
              zoom,
              zoomControl: showZoomControl,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              gestureHandling: 'greedy',
            });
            if (onMapClick) {
              mapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
                if (e.latLng) onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
              });
            }
          }
        } catch (err) {
          // google.maps.Map constructor exists but threw — treat as failure.
          console.warn('[google-map] constructor failed:', err);
          onLoadFailure?.();
        }
      })
      .catch((err) => {
        clearTimeout(loadDeadline);
        // eslint-disable-next-line no-console
        console.warn('[google-map] init failed:', err);
        onLoadFailure?.();
      });

    return () => {
      cancelled = true;
      clearTimeout(loadDeadline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* (Re)render markers whenever the set changes. */
  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    // Tear down previous markers + React popup roots
    renderedMarkers.current.forEach((m) => m.setMap(null));
    renderedMarkers.current = [];
    popupRoots.current.forEach((r) => { try { r.unmount(); } catch { /* */ } });
    popupRoots.current = [];
    openInfoWindow.current?.close();

    const bounds = new google.maps.LatLngBounds();

    markers.forEach((m) => {
      const color = PIN_COLOR[m.color ?? 'blue'];
      const marker = new google.maps.Marker({
        position: m.position,
        map: mapRef.current!,
        draggable: m.draggable,
        label: m.label ? { text: m.label, color: '#ffffff', fontWeight: '700', fontSize: '11px' } : undefined,
        icon: {
          path: 'M 16 1 C 7.7 1 1 7.7 1 16 c 0 11 15 25 15 25 s 15 -14 15 -25 c 0 -8.3 -6.7 -15 -15 -15 z',
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1,
          anchor: new google.maps.Point(16, 42),
          labelOrigin: new google.maps.Point(16, 16),
        },
      });

      if (m.popup) {
        const node = document.createElement('div');
        node.style.fontFamily = 'system-ui, sans-serif';
        node.style.fontSize = '12px';
        node.style.maxWidth = '260px';
        const root = createRoot(node);
        root.render(<>{m.popup}</>);
        popupRoots.current.push(root);

        const iw = new google.maps.InfoWindow({ content: node });
        marker.addListener('click', () => {
          openInfoWindow.current?.close();
          openInfoWindow.current = iw;
          iw.open({ anchor: marker, map: mapRef.current! });
        });
      }

      if (m.onDragEnd) {
        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if (pos) m.onDragEnd!({ lat: pos.lat(), lng: pos.lng() });
        });
      }

      renderedMarkers.current.push(marker);
      bounds.extend(m.position);
    });

    if (fitToMarkers && markers.length > 1) {
      mapRef.current.fitBounds(bounds, 40);
    } else if (fitToMarkers && markers.length === 1) {
      mapRef.current.setCenter(markers[0].position);
      mapRef.current.setZoom(14);
    }
  }, [markers, fitToMarkers]);

  /* Unmount: clean up React popup roots */
  useEffect(() => {
    return () => {
      popupRoots.current.forEach((r) => { try { r.unmount(); } catch { /* */ } });
      popupRoots.current = [];
    };
  }, []);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}
      style={{ height, background: '#e5e7eb' }}
    >
      <div ref={ref} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
