'use client';

import { useEffect, useMemo, useState } from 'react';
import MapGL, { Marker, Popup, NavigationControl, ScaleControl, GeolocateControl, FullscreenControl } from 'react-map-gl';
import type { StyleSpecification } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import {
  MapPin, Search, Phone, Building2, Map as MapIcon, Filter, X, ShieldCheck,
  Users, Layers, Hash, Sparkles, Copy, Check, ArrowUpRight,
} from 'lucide-react';
import {
  DISTRICTS, PHI_OFFICERS, mohPins, listMohOffices,
  type PhiOfficer, type MohPin, type Province,
} from '@/data/phi-officers';

/**
 * Public "Find a PHI" directory.
 *
 * Three coordinated views over the same dataset:
 *   1. Live Mapbox map of every MOH office (auto-zooms to filter selection).
 *   2. District + MOH filter chips with full-text search.
 *   3. Officer cards with PHI name, range / station, MOH parent, district, phone.
 */

const ALL_MOHS = listMohOffices();
const ALL_PINS = mohPins();

/**
 * Mapbox-GL-compatible raster style that points at the OpenStreetMap tile
 * servers. We use this regardless of whether a Mapbox token is configured —
 * production Mapbox tokens often carry domain restrictions and quotas that
 * cause the basemap to render blank in deployed environments. OSM raster
 * tiles are token-free, copyright-clean and always render Sri Lanka.
 */
const OSM_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [
    { id: 'osm-bg', type: 'background', paint: { 'background-color': '#e8edf2' } },
    { id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 22 },
  ],
};

/** Sri Lanka bounding box — keeps the initial map view centred on the island. */
const SL_BOUNDS = { lat: 7.8731, lng: 80.7718, zoom: 6.8 };

const PROVINCE_BADGE: Record<Province, string> = {
  'Western':       'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  'Central':       'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  'Southern':      'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  'Northern':      'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  'Eastern':       'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  'North Western': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300',
  'North Central': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
  'Uva':           'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  'Sabaragamuwa':  'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
};

export default function FindPhiPage() {
  const [q, setQ] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string | null>(null);
  const [mohFilter, setMohFilter] = useState<string | null>(null);
  const [view, setView] = useState<'officers' | 'mohs'>('officers');
  const [selected, setSelected] = useState<MohPin | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Reset MOH filter when district changes so it does not silently filter out matches.
  useEffect(() => { setMohFilter(null); }, [districtFilter]);

  const officers = useMemo(() => {
    const term = q.trim().toLowerCase();
    return PHI_OFFICERS.filter((o) => {
      if (districtFilter && o.district !== districtFilter) return false;
      if (mohFilter && o.moh !== mohFilter) return false;
      if (!term) return true;
      return (
        (o.name ?? '').toLowerCase().includes(term) ||
        o.range.toLowerCase().includes(term) ||
        o.moh.toLowerCase().includes(term) ||
        o.district.toLowerCase().includes(term) ||
        o.province.toLowerCase().includes(term) ||
        o.phone.replace(/\D/g, '').includes(term.replace(/\D/g, '')) ||
        (o.memberNo ?? '').toLowerCase().includes(term)
      );
    });
  }, [q, districtFilter, mohFilter]);

  const pins = useMemo(() => {
    const officerKeys = new Set(officers.map((o) => `${o.district}::${o.moh}`));
    return ALL_PINS.filter((p) => officerKeys.has(`${p.district}::${p.moh}`));
  }, [officers]);

  /** Auto-fit centre / zoom for the currently filtered pin-set. */
  const centre = useMemo(() => {
    if (pins.length === 0) return SL_BOUNDS;
    if (pins.length === 1) return { lat: pins[0].lat, lng: pins[0].lng, zoom: 12 };
    const lats = pins.map((p) => p.lat);
    const lngs = pins.map((p) => p.lng);
    const lat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const lng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const span = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));
    const zoom = span < 0.05 ? 13 : span < 0.2 ? 11 : span < 0.6 ? 9.5 : span < 1.5 ? 8.5 : 6.8;
    return { lat, lng, zoom };
  }, [pins]);

  const officersByDistrict = useMemo(() => {
    const map = new Map<string, PhiOfficer[]>();
    for (const o of officers) {
      if (!map.has(o.district)) map.set(o.district, []);
      map.get(o.district)!.push(o);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [officers]);

  const visibleMohs = useMemo(() => {
    if (!districtFilter) return ALL_MOHS;
    return Array.from(new Set(PHI_OFFICERS.filter((o) => o.district === districtFilter).map((o) => o.moh))).sort();
  }, [districtFilter]);

  const filtersActive = Boolean(q || districtFilter || mohFilter);
  const clearFilters = () => { setQ(''); setDistrictFilter(null); setMohFilter(null); };

  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(phone);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* clipboard blocked — silently ignore */ }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">Public Directory</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Find a Public Health Inspector
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Search the national register of Public Health Inspectors and Medical Officer of Health (MOH) offices.
            Filter by district, MOH area or PHI Range — then tap a number to call directly.
          </p>

          {/* KPI row */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard icon={<Users className="h-4 w-4" />}  label="Listed officers"  value={PHI_OFFICERS.length.toLocaleString()} />
            <KpiCard icon={<Building2 className="h-4 w-4" />} label="MOH offices"   value={ALL_PINS.length.toString()} />
            <KpiCard icon={<MapIcon className="h-4 w-4" />} label="Districts"       value={DISTRICTS.length.toString()} />
            <KpiCard icon={<ShieldCheck className="h-4 w-4" />} label="Verified register" value="Ministry of Health" small />
          </div>

          {/* Search */}
          <div className="relative mt-6 max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by officer name, PHI range, MOH area, district or phone…"
              aria-label="Search PHI directory"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-10 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            {q && (
              <button onClick={() => setQ('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="border-y border-slate-200 bg-white py-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Filter by District</h2>
            {filtersActive && (
              <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline dark:text-rose-400">
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={!districtFilter} onClick={() => setDistrictFilter(null)}>All districts</FilterChip>
            {DISTRICTS.map((d) => (
              <FilterChip
                key={d.district}
                active={districtFilter === d.district}
                onClick={() => setDistrictFilter(districtFilter === d.district ? null : d.district)}
              >
                {d.district}
              </FilterChip>
            ))}
          </div>

          {visibleMohs.length > 0 && (
            <>
              <div className="mt-5 mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                  Filter by MOH Area {districtFilter && <span className="text-slate-400">(in {districtFilter})</span>}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterChip small active={!mohFilter} onClick={() => setMohFilter(null)}>All MOH areas</FilterChip>
                {visibleMohs.map((m) => (
                  <FilterChip key={m} small active={mohFilter === m} onClick={() => setMohFilter(mohFilter === m ? null : m)}>
                    {m}
                  </FilterChip>
                ))}
              </div>
            </>
          )}

          {/* View toggle */}
          <div className="mt-5 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">View:</span>
            <div role="tablist" aria-label="Result view" className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-900">
              <ViewTab active={view === 'officers'} onClick={() => setView('officers')}>
                <Users className="h-3.5 w-3.5" /> {officers.length} Officers
              </ViewTab>
              <ViewTab active={view === 'mohs'} onClick={() => setView('mohs')}>
                <Building2 className="h-3.5 w-3.5" /> {pins.length} MOH Offices
              </ViewTab>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <MapIcon className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Live Sri Lanka map &mdash; {pins.length} of {ALL_PINS.length} MOH offices
            </h2>
            <span className="ml-auto text-[11px] text-slate-500 dark:text-slate-400">
              Tap a pin to see the PHI officers attached to that office
            </span>
          </div>

          <div className="relative h-[28rem] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <MapGL
              mapStyle={OSM_STYLE}
              initialViewState={{ latitude: centre.lat, longitude: centre.lng, zoom: centre.zoom }}
              key={`${centre.lat}-${centre.lng}-${centre.zoom}-${pins.length}`}
              style={{ width: '100%', height: '100%' }}
              maxBounds={[[78.5, 5.0], [82.5, 10.5]]}
              minZoom={6.4}
              maxZoom={17}
              attributionControl
            >
              <NavigationControl position="top-right" />
              <FullscreenControl position="top-right" />
              <GeolocateControl position="top-right" trackUserLocation />
              <ScaleControl position="bottom-left" />
              {pins.map((p) => (
                <Marker
                  key={`${p.district}-${p.moh}`}
                  latitude={p.lat}
                  longitude={p.lng}
                  anchor="bottom"
                  onClick={(e) => { e.originalEvent.stopPropagation(); setSelected(p); }}
                >
                  <button
                    type="button"
                    aria-label={`${p.moh} MOH — ${p.district} District (${p.officers.length} officers)`}
                    className="group relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-600 to-blue-900 text-white shadow-lg ring-4 ring-blue-300/60 transition-transform hover:scale-110"
                  >
                    <MapPin className="h-4 w-4" />
                    {p.officers.length > 1 && (
                      <span className="absolute -right-1 -top-1 rounded-full bg-amber-400 px-1.5 text-[10px] font-extrabold leading-4 text-slate-900 shadow ring-2 ring-white">
                        {p.officers.length}
                      </span>
                    )}
                  </button>
                </Marker>
              ))}
              {selected && (
                <Popup
                  latitude={selected.lat}
                  longitude={selected.lng}
                  anchor="top"
                  offset={12}
                  onClose={() => setSelected(null)}
                  closeOnClick={false}
                  maxWidth="320px"
                >
                  <div className="space-y-2 p-1">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selected.moh} MOH</p>
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">
                        {selected.district} District &middot; {selected.province} Province
                      </p>
                    </div>
                    <div className="max-h-44 space-y-1.5 overflow-y-auto rounded border border-slate-100 bg-slate-50/70 p-2">
                      {selected.officers.map((o) => (
                        <div key={o.phone + o.range} className="text-[11px]">
                          <p className="font-semibold text-slate-900">{o.name ?? 'PHI Officer'}</p>
                          <p className="text-slate-500">PHI {o.range}</p>
                          <a href={`tel:${o.phone}`} className="font-semibold text-blue-700 hover:underline">{o.phone}</a>
                        </div>
                      ))}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-md bg-blue-700 px-2 py-1.5 text-center text-[11px] font-bold text-white hover:bg-blue-800"
                    >
                      Open in Google Maps <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
                    </a>
                  </div>
                </Popup>
              )}
            </MapGL>

            <p className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 shadow dark:bg-slate-900/90 dark:text-slate-300">
              Basemap: © OpenStreetMap contributors
            </p>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {officers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
            No officer matches the current filters. Try clearing them or searching for a different range.
          </p>
        ) : view === 'officers' ? (
          <div className="space-y-7">
            {officersByDistrict.map(([district, list]) => {
              const province = list[0].province;
              return (
                <div key={district} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">{district} District</h2>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PROVINCE_BADGE[province]}`}>{province} Province</span>
                    <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500">{list.length} officer{list.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((o) => (
                      <article
                        key={`${o.range}-${o.phone}`}
                        className="group relative overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 transition-shadow hover:shadow-md dark:border-slate-800 dark:from-slate-800/40 dark:to-slate-900"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{o.name ?? 'PHI Officer'}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              PHI {o.range}
                            </p>
                          </div>
                          {o.memberNo && o.memberNo !== '—' && (
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                              <Hash className="h-2.5 w-2.5" />{o.memberNo}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <Building2 className="h-3 w-3" />{o.moh} MOH
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <a
                            href={`tel:${o.phone}`}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-700 px-2.5 py-1.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-800"
                          >
                            <Phone className="h-3.5 w-3.5" />{o.phone}
                          </a>
                          <button
                            type="button"
                            aria-label={`Copy phone number ${o.phone}`}
                            onClick={() => copyPhone(o.phone)}
                            className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          >
                            {copied === o.phone ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pins.map((p) => (
              <article key={`${p.district}-${p.moh}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{p.moh}</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-400">
                      {p.district} District
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${PROVINCE_BADGE[p.province]}`}>{p.province}</span>
                </div>
                <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">{p.officers.length} listed PHI officer{p.officers.length === 1 ? '' : 's'}</p>
                <button
                  type="button"
                  onClick={() => setSelected(p)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[12px] font-bold text-blue-800 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  <MapIcon className="h-3.5 w-3.5" /> Show on map
                </button>
              </article>
            ))}
          </div>
        )}

        {/* Helpful info */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <InfoBlock
            tone="amber"
            icon={<Phone className="h-4 w-4" />}
            title="Health emergency? Call first."
            body={<>For outbreaks or food-poisoning emergencies dial the Ministry of Health hotline <strong>1390</strong> or
              the Public Health Emergency line <strong>+94 11 269 5112</strong>.</>}
          />
          <InfoBlock
            tone="blue"
            icon={<Sparkles className="h-4 w-4" />}
            title="Numbers come from official sources"
            body={<>Cross-verified against the Ministry of Health PHI register, the Union of Sri Lanka membership roll
              and the Rainbow Pages public directory. Report any error to <a href="mailto:info@phi.lk" className="font-semibold underline">info@phi.lk</a>.</>}
          />
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

/* ───── small presentational helpers ─────────────────────────────────────── */

function KpiCard({ icon, label, value, small }: { icon: React.ReactNode; label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">{icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className={`mt-1 font-extrabold text-slate-900 dark:text-white ${small ? 'text-sm' : 'text-xl'}`}>{value}</p>
    </div>
  );
}

function FilterChip({ children, active, onClick, small }: { children: React.ReactNode; active: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-semibold transition-colors ${
        small ? 'text-[11px]' : 'text-xs'
      } ${
        active
          ? 'border-blue-700 bg-blue-700 text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40'
      }`}
    >
      {children}
    </button>
  );
}

function ViewTab({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-bold transition-colors ${
        active ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
    >
      {children}
    </button>
  );
}

function InfoBlock({ tone, icon, title, body }: { tone: 'amber' | 'blue'; icon: React.ReactNode; title: string; body: React.ReactNode }) {
  const cls = tone === 'amber'
    ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200'
    : 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200';
  return (
    <div className={`rounded-xl border p-4 text-xs leading-relaxed ${cls}`}>
      <p className="mb-1 flex items-center gap-1.5 font-bold">{icon}{title}</p>
      <p>{body}</p>
    </div>
  );
}
