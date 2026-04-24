'use client';

// ============================================================================
// Mapbox GL JS v3 — Disease Intelligence Map
// Features: 150m cluster circles, case markers, popup details
// Uses react-map-gl v7 with Mapbox GL JS v3.12
// ============================================================================

import { useRef, useCallback, useState } from 'react';
import Map, {
  Marker,
  Popup,
  Source,
  Layer,
  MapRef,
  NavigationControl,
  ScaleControl,
} from 'react-map-gl';
import type { CircleLayer } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAP_DEFAULTS } from '@phi-pro/shared';

// ---------------------------------------------------------------------------
// Types (duplicated locally to avoid circular import with page.tsx)
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

interface Cluster {
  id: string;
  disease: string;
  centroidLat: number;
  centroidLng: number;
  cases: DiseaseCase[];
  radiusMetres: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface Props {
  cases: DiseaseCase[];
  clusters: Cluster[];
  diseaseColor: (disease: string) => string;
  onClusterSelect: (cluster: Cluster) => void;
}

// ---------------------------------------------------------------------------
// Build GeoJSON for cluster fill circles (drawn with GL layer)
// ---------------------------------------------------------------------------
function buildClusterGeoJSON(clusters: Cluster[], diseaseColor: (d: string) => string) {
  return {
    type: 'FeatureCollection' as const,
    features: clusters
      .filter((c) => c.cases.length >= 2)
      .map((c) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [c.centroidLng, c.centroidLat],
        },
        properties: {
          id: c.id,
          disease: c.disease,
          caseCount: c.cases.length,
          severity: c.severity,
          color: diseaseColor(c.disease),
          radiusMetres: c.radiusMetres,
        },
      })),
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function MapboxDiseaseMap({ cases, clusters, diseaseColor, onClusterSelect }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [popup, setPopup] = useState<{ lat: number; lng: number; content: React.ReactNode } | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const handleCaseClick = useCallback(
    (c: DiseaseCase) => {
      setPopup({
        lat: c.lat,
        lng: c.lng,
        content: (
          <div className="text-sm">
            <p className="font-bold">{c.disease}</p>
            <p className="text-xs text-gray-500">{c.gn}</p>
            <p className="text-xs">{c.date}</p>
            <p className="text-xs">{c.confirmed ? 'Confirmed' : 'Suspected'}</p>
          </div>
        ),
      });
    },
    [],
  );

  const handleClusterClick = useCallback(
    (cluster: Cluster) => {
      onClusterSelect(cluster);
      mapRef.current?.flyTo({
        center: [cluster.centroidLng, cluster.centroidLat],
        zoom: 15,
        duration: 1000,
      });
    },
    [onClusterSelect],
  );

  const clusterGeoJSON = buildClusterGeoJSON(clusters, diseaseColor);

  const clusterCircleLayer: CircleLayer = {
    id: 'cluster-circles',
    type: 'circle',
    source: 'clusters',
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        10, 15,
        14, 40,
        16, 80,
      ],
      'circle-color': ['get', 'color'],
      'circle-opacity': 0.15,
      'circle-stroke-width': 2,
      'circle-stroke-color': ['get', 'color'],
      'circle-stroke-opacity': 0.8,
    },
  };

  const clusterLabelLayer = {
    id: 'cluster-labels',
    type: 'symbol' as const,
    source: 'clusters',
    layout: {
      'text-field': '{caseCount}' as string,
      'text-size': 14,
    },
    paint: {
      'text-color': '#ffffff' as string,
      'text-halo-color': '#000000' as string,
      'text-halo-width': 1,
    },
  } as const;

  if (!token) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-blue-50 p-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">Map Ready — API Key Required</p>
          <p className="mt-1 text-sm text-slate-500">
            Add your Mapbox token to enable interactive disease mapping
          </p>
          <code className="mt-2 block rounded bg-slate-800 px-4 py-2 text-xs text-green-400">
            NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
          </code>
          <p className="mt-2 text-xs text-slate-400">in apps/web/.env.local</p>
        </div>

        {/* Static cluster visualisation fallback */}
        <div className="mt-4 grid gap-2 sm:grid-cols-3 w-full max-w-lg">
          {clusters
            .filter((c) => c.cases.length >= 2)
            .slice(0, 3)
            .map((c) => (
              <button
                key={c.id}
                onClick={() => handleClusterClick(c)}
                className="rounded-lg border-2 p-3 text-center transition-transform hover:scale-105"
                style={{ borderColor: diseaseColor(c.disease) }}
              >
                <div
                  className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold"
                  style={{ backgroundColor: diseaseColor(c.disease) }}
                >
                  {c.cases.length}
                </div>
                <p className="text-xs font-semibold">{c.disease}</p>
                <p className="text-[10px] text-slate-500">{c.cases[0].gn}</p>
                <p className="text-[10px] text-slate-400">150m cluster</p>
              </button>
            ))}
        </div>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{
        longitude: MAP_DEFAULTS.center.lng,
        latitude: MAP_DEFAULTS.center.lat,
        zoom: 10,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      minZoom={MAP_DEFAULTS.minZoom}
      maxZoom={MAP_DEFAULTS.maxZoom}
      onClick={() => setPopup(null)}
    >
      <NavigationControl position="top-right" />
      <ScaleControl position="bottom-left" unit="metric" />

      {/* Cluster GL circles drawn as a source/layer for performance */}
      <Source id="clusters" type="geojson" data={clusterGeoJSON}>
        <Layer {...clusterCircleLayer} />
        <Layer {...clusterLabelLayer} />
      </Source>

      {/* Individual case markers */}
      {cases.map((c) => (
        <Marker
          key={c.id}
          longitude={c.lng}
          latitude={c.lat}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            handleCaseClick(c);
          }}
        >
          <div
            title={`${c.disease} — ${c.gn}`}
            className="cursor-pointer transition-transform hover:scale-125"
          >
            <div
              className="h-3 w-3 rounded-full border-2 border-white shadow-md"
              style={{
                backgroundColor: diseaseColor(c.disease),
                opacity: c.confirmed ? 1 : 0.6,
              }}
            />
          </div>
        </Marker>
      ))}

      {/* Cluster centroid markers */}
      {clusters
        .filter((c) => c.cases.length >= 2)
        .map((c) => (
          <Marker
            key={c.id}
            longitude={c.centroidLng}
            latitude={c.centroidLat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleClusterClick(c);
            }}
          >
            <div
              className="flex cursor-pointer items-center justify-center rounded-full border-2 border-white text-white text-xs font-bold shadow-lg transition-transform hover:scale-110"
              style={{
                backgroundColor: diseaseColor(c.disease),
                width: 28,
                height: 28,
              }}
              title={`${c.disease}: ${c.cases.length} cases`}
            >
              {c.cases.length}
            </div>
          </Marker>
        ))}

      {/* Popup */}
      {popup && (
        <Popup
          longitude={popup.lng}
          latitude={popup.lat}
          anchor="bottom"
          onClose={() => setPopup(null)}
          closeButton
          closeOnClick={false}
        >
          <div className="min-w-[140px] p-1">{popup.content}</div>
        </Popup>
      )}
    </Map>
  );
}
