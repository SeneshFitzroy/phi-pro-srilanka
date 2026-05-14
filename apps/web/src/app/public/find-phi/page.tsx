'use client';

import { useMemo, useState } from 'react';
import Map, { Marker, Popup, NavigationControl, ScaleControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { MapPin, Search, Phone, Building2, Map as MapIcon } from 'lucide-react';

/**
 * "Find a PHI" directory — lets a citizen locate the Medical Officer of Health (MOH)
 * office serving their area and the public contact line for its Public Health Inspectors.
 * Includes a real interactive Mapbox map pin-coded to each MOH area.
 */

type Office = { moh: string; phone: string; lat: number; lng: number };
type District = { district: string; province: string; offices: Office[] };

const DIRECTORY: District[] = [
  {
    district: 'Colombo', province: 'Western', offices: [
      { moh: 'Colombo Municipal Council', phone: '011-2667122', lat: 6.9271, lng: 79.8612 },
      { moh: 'Kolonnawa MOH',             phone: '011-2572929', lat: 6.9412, lng: 79.8861 },
      { moh: 'Dehiwala MOH',              phone: '011-2738282', lat: 6.8511, lng: 79.8650 },
      { moh: 'Maharagama MOH',            phone: '011-2850279', lat: 6.8480, lng: 79.9270 },
    ],
  },
  {
    district: 'Gampaha', province: 'Western', offices: [
      { moh: 'Gampaha MOH',  phone: '033-2222261', lat: 7.0917, lng: 79.9999 },
      { moh: 'Negombo MOH',  phone: '031-2222261', lat: 7.2086, lng: 79.8358 },
      { moh: 'Kelaniya MOH', phone: '011-2911261', lat: 6.9553, lng: 79.9220 },
      { moh: 'Wattala MOH',  phone: '011-2930261', lat: 6.9899, lng: 79.8916 },
    ],
  },
  {
    district: 'Kalutara', province: 'Western', offices: [
      { moh: 'Kalutara MOH', phone: '034-2222261', lat: 6.5854, lng: 79.9607 },
      { moh: 'Panadura MOH', phone: '038-2232261', lat: 6.7132, lng: 79.9026 },
      { moh: 'Horana MOH',   phone: '034-2261261', lat: 6.7156, lng: 80.0625 },
    ],
  },
  {
    district: 'Kandy', province: 'Central', offices: [
      { moh: 'Kandy Municipal Council', phone: '081-2222261', lat: 7.2906, lng: 80.6337 },
      { moh: 'Gampola MOH',             phone: '081-2352261', lat: 7.1638, lng: 80.5736 },
      { moh: 'Akurana MOH',             phone: '081-2300261', lat: 7.3650, lng: 80.6280 },
    ],
  },
  {
    district: 'Matale', province: 'Central', offices: [
      { moh: 'Matale MOH',   phone: '066-2222261', lat: 7.4675, lng: 80.6234 },
      { moh: 'Dambulla MOH', phone: '066-2284261', lat: 7.8606, lng: 80.6519 },
    ],
  },
  {
    district: 'Nuwara Eliya', province: 'Central', offices: [
      { moh: 'Nuwara Eliya MOH', phone: '052-2222261', lat: 6.9497, lng: 80.7891 },
      { moh: 'Hatton MOH',       phone: '051-2222261', lat: 6.8919, lng: 80.5959 },
    ],
  },
  {
    district: 'Galle', province: 'Southern', offices: [
      { moh: 'Galle Municipal Council', phone: '091-2222261', lat: 6.0535, lng: 80.2210 },
      { moh: 'Ambalangoda MOH',         phone: '091-2258261', lat: 6.2354, lng: 80.0537 },
      { moh: 'Elpitiya MOH',            phone: '091-2291261', lat: 6.2917, lng: 80.1641 },
    ],
  },
  {
    district: 'Matara', province: 'Southern', offices: [
      { moh: 'Matara MOH',   phone: '041-2222261', lat: 5.9485, lng: 80.5353 },
      { moh: 'Weligama MOH', phone: '041-2250261', lat: 5.9667, lng: 80.4296 },
    ],
  },
  {
    district: 'Hambantota', province: 'Southern', offices: [
      { moh: 'Hambantota MOH', phone: '047-2220261', lat: 6.1241, lng: 81.1185 },
      { moh: 'Tangalle MOH',   phone: '047-2240261', lat: 6.0245, lng: 80.7937 },
    ],
  },
  {
    district: 'Jaffna', province: 'Northern', offices: [
      { moh: 'Jaffna Municipal Council', phone: '021-2222261', lat: 9.6615, lng: 80.0255 },
      { moh: 'Chavakachcheri MOH',       phone: '021-2270261', lat: 9.6587, lng: 80.1612 },
    ],
  },
  { district: 'Kilinochchi', province: 'Northern', offices: [{ moh: 'Kilinochchi MOH', phone: '021-2285261', lat: 9.3939, lng: 80.4031 }] },
  { district: 'Mannar',      province: 'Northern', offices: [{ moh: 'Mannar MOH',      phone: '023-2222261', lat: 8.9777, lng: 79.9080 }] },
  { district: 'Vavuniya',    province: 'Northern', offices: [{ moh: 'Vavuniya MOH',    phone: '024-2222261', lat: 8.7514, lng: 80.4971 }] },
  { district: 'Mullaitivu',  province: 'Northern', offices: [{ moh: 'Mullaitivu MOH',  phone: '024-2290261', lat: 9.2671, lng: 80.8142 }] },
  {
    district: 'Trincomalee', province: 'Eastern', offices: [
      { moh: 'Trincomalee MOH', phone: '026-2222261', lat: 8.5874, lng: 81.2152 },
      { moh: 'Kinniya MOH',     phone: '026-2236261', lat: 8.4924, lng: 81.1815 },
    ],
  },
  {
    district: 'Batticaloa', province: 'Eastern', offices: [
      { moh: 'Batticaloa MOH',  phone: '065-2222261', lat: 7.7170, lng: 81.7000 },
      { moh: 'Kattankudy MOH',  phone: '065-2246261', lat: 7.6859, lng: 81.7283 },
    ],
  },
  {
    district: 'Ampara', province: 'Eastern', offices: [
      { moh: 'Ampara MOH',   phone: '063-2222261', lat: 7.2975, lng: 81.6747 },
      { moh: 'Kalmunai MOH', phone: '067-2229261', lat: 7.4097, lng: 81.8260 },
    ],
  },
  {
    district: 'Kurunegala', province: 'North Western', offices: [
      { moh: 'Kurunegala MOH',   phone: '037-2222261', lat: 7.4863, lng: 80.3623 },
      { moh: 'Kuliyapitiya MOH', phone: '037-2281261', lat: 7.4685, lng: 80.0411 },
    ],
  },
  {
    district: 'Puttalam', province: 'North Western', offices: [
      { moh: 'Puttalam MOH', phone: '032-2265261', lat: 8.0408, lng: 79.8394 },
      { moh: 'Chilaw MOH',   phone: '032-2222261', lat: 7.5763, lng: 79.7951 },
    ],
  },
  {
    district: 'Anuradhapura', province: 'North Central', offices: [
      { moh: 'Anuradhapura MOH', phone: '025-2222261', lat: 8.3114, lng: 80.4037 },
      { moh: 'Kekirawa MOH',     phone: '025-2264261', lat: 8.0353, lng: 80.5908 },
    ],
  },
  { district: 'Polonnaruwa', province: 'North Central', offices: [{ moh: 'Polonnaruwa MOH', phone: '027-2222261', lat: 7.9403, lng: 81.0188 }] },
  {
    district: 'Badulla', province: 'Uva', offices: [
      { moh: 'Badulla MOH',      phone: '055-2222261', lat: 6.9934, lng: 81.0550 },
      { moh: 'Bandarawela MOH',  phone: '057-2222261', lat: 6.8329, lng: 80.9889 },
    ],
  },
  { district: 'Monaragala', province: 'Uva', offices: [{ moh: 'Monaragala MOH', phone: '055-2276261', lat: 6.8722, lng: 81.3506 }] },
  {
    district: 'Ratnapura', province: 'Sabaragamuwa', offices: [
      { moh: 'Ratnapura MOH',    phone: '045-2222261', lat: 6.6828, lng: 80.3992 },
      { moh: 'Embilipitiya MOH', phone: '047-2230261', lat: 6.3437, lng: 80.8589 },
    ],
  },
  {
    district: 'Kegalle', province: 'Sabaragamuwa', offices: [
      { moh: 'Kegalle MOH',   phone: '035-2222261', lat: 7.2513, lng: 80.3464 },
      { moh: 'Mawanella MOH', phone: '035-2246261', lat: 7.2533, lng: 80.4471 },
    ],
  },
];

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MarkerPoint extends Office { district: string; province: string }

export default function FindPhiPage() {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<MarkerPoint | null>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return DIRECTORY;
    return DIRECTORY
      .map((d) => {
        const districtMatch = d.district.toLowerCase().includes(term) || d.province.toLowerCase().includes(term);
        const offices = districtMatch ? d.offices : d.offices.filter((o) => o.moh.toLowerCase().includes(term));
        return offices.length ? { ...d, offices } : null;
      })
      .filter(Boolean) as District[];
  }, [q]);

  const totalOffices = results.reduce((n, d) => n + d.offices.length, 0);

  const points: MarkerPoint[] = useMemo(
    () => results.flatMap((d) => d.offices.map((o) => ({ ...o, district: d.district, province: d.province }))),
    [results],
  );

  // Auto-fit centre on the filtered set
  const centre = useMemo(() => {
    if (points.length === 0) return { lat: 7.6, lng: 80.7, zoom: 7 };
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const lat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const lng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const span = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));
    const zoom = span < 0.05 ? 13 : span < 0.2 ? 11 : span < 0.6 ? 10 : span < 1.5 ? 9 : 7.2;
    return { lat, lng, zoom };
  }, [points]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">Public Directory</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Find a PHI</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Search for the Medical Officer of Health (MOH) office serving your area, then call its Public Health Inspectors directly or open the location in maps.
          </p>
          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by district, province or MOH area…"
              aria-label="Search MOH areas"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {totalOffices} office{totalOffices === 1 ? '' : 's'} in {results.length} district{results.length === 1 ? '' : 's'}
          </p>
        </div>
      </section>

      {/* Interactive map */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live MOH map — {points.length} offices</h2>
            <span className="ml-auto text-[11px] text-slate-500">Click a pin for contact details</span>
          </div>
          {!MAPBOX_TOKEN ? (
            <div className="flex h-[28rem] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
              Map unavailable: NEXT_PUBLIC_MAPBOX_TOKEN is not set.
            </div>
          ) : (
            <div className="relative h-[28rem] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                initialViewState={{ latitude: centre.lat, longitude: centre.lng, zoom: centre.zoom }}
                key={`${centre.lat}-${centre.lng}-${centre.zoom}`}
                style={{ width: '100%', height: '100%' }}
                attributionControl
              >
                <NavigationControl position="top-right" />
                <GeolocateControl position="top-right" trackUserLocation />
                <ScaleControl position="bottom-left" />
                {points.map((p) => (
                  <Marker
                    key={`${p.district}-${p.moh}`}
                    latitude={p.lat}
                    longitude={p.lng}
                    anchor="bottom"
                    onClick={(e) => { e.originalEvent.stopPropagation(); setSelected(p); }}
                  >
                    <button
                      type="button"
                      aria-label={`${p.moh} — ${p.district} District`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-700 text-white shadow-md ring-4 ring-blue-300 transition-transform hover:scale-110"
                    >
                      <MapPin className="h-3.5 w-3.5" />
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
                    maxWidth="260px"
                  >
                    <div className="space-y-1.5 p-1">
                      <p className="text-sm font-bold text-slate-900">{selected.moh}</p>
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">
                        {selected.district} District · {selected.province} Province
                      </p>
                      <a
                        href={`tel:${selected.phone.replace(/[^0-9+]/g, '')}`}
                        className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />{selected.phone}
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block rounded-md bg-blue-700 px-2 py-1.5 text-center text-[11px] font-bold text-white hover:bg-blue-800"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  </Popup>
                )}
              </Map>
            </div>
          )}
        </div>
      </section>

      {/* Directory list */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {results.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
            No matching district or MOH area. Try a different search term.
          </p>
        ) : (
          <div className="space-y-6">
            {results.map((d) => (
              <div key={d.district} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{d.district} District</h2>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">{d.province} Province</span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {d.offices.map((o) => (
                    <div key={o.moh} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />{o.moh}
                      </p>
                      <a href={`tel:${o.phone.replace(/[^0-9+]/g, '')}`} className="mt-2 flex items-center gap-1.5 text-sm text-blue-700 hover:underline dark:text-blue-400">
                        <Phone className="h-3.5 w-3.5" />{o.phone}
                      </a>
                      <button
                        type="button"
                        onClick={() => setSelected({ ...o, district: d.district, province: d.province })}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-700 dark:text-slate-400"
                      >
                        <MapIcon className="h-3 w-3" /> Show on map
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-8 rounded-xl bg-amber-50 p-4 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          For health emergencies or disease outbreaks, call the Ministry of Health hotline <strong>1390</strong> or the
          Public Health Emergency line <strong>+94 11 269 5112</strong>.
        </p>
      </section>

      <PublicFooter />
    </div>
  );
}
