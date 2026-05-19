'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import {
  MapPin, Search, Phone, Building2, Map as MapIcon, Filter, X, ShieldCheck,
  Users, Layers, Hash, Sparkles, Copy, Check, Mail, Clock, ExternalLink,
} from 'lucide-react';
import {
  DISTRICTS, PHI_OFFICERS, mohPins, listMohOffices,
  type PhiOfficer, type Province,
} from '@/data/phi-officers';
import type { LeafletMarker } from '@/components/leaflet-map';

/**
 * Public "Find a PHI" directory.
 *
 * Three coordinated views over the same dataset:
 *   1. Live OSM/Leaflet map of every MOH office (auto-zooms to selection).
 *   2. District + MOH dropdown filters with full-text search.
 *   3. Officer cards with PHI name, range/station, MOH parent, district, phone.
 */

const ALL_MOHS = listMohOffices();
const ALL_PINS = mohPins();

// Leaflet uses `window`, so we render it client-side only.
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), { ssr: false });

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

  /* ── Leaflet markers (memoised so the map doesn't re-render on unrelated state) ── */
  const leafletMarkers: LeafletMarker[] = useMemo(
    () => pins.map((p): LeafletMarker => ({
      id: `${p.district}::${p.moh}`,
      position: { lat: p.lat, lng: p.lng },
      color: 'blue',
      label: p.officers.length > 1 ? String(p.officers.length) : undefined,
      popup: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-slate-900">{p.moh} MOH</p>
          <p className="text-[11px] uppercase tracking-wider text-slate-400">
            {p.district} District &middot; {p.province} Province
          </p>
          <div className="max-h-36 space-y-1.5 overflow-y-auto rounded border border-slate-100 bg-slate-50/70 p-2">
            {p.officers.map((o) => (
              <div key={o.phone + o.range} className="text-[11px]">
                <p className="font-semibold text-slate-900">{o.name ?? 'PHI Officer'}</p>
                <p className="text-slate-500">PHI {o.range}</p>
                <a href={`tel:${o.phone}`} className="font-semibold text-blue-700 hover:underline">{o.phone}</a>
              </div>
            ))}
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`MOH Office ${p.moh}, ${p.district}, Sri Lanka`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md bg-blue-700 px-2 py-1.5 text-center text-[11px] font-bold text-white hover:bg-blue-800"
          >
            Open in Google Maps
          </a>
        </div>
      ),
    })),
    [pins],
  );

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
          {/* Professional dropdowns — replaces the chip flood. Real selects so it
              works with keyboard, screen readers and tiny screens. */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">District</span>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={districtFilter ?? ''}
                  onChange={(e) => setDistrictFilter(e.target.value || null)}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  aria-label="Filter by district"
                >
                  <option value="">All 25 districts</option>
                  {DISTRICTS.map((d) => (
                    <option key={d.district} value={d.district}>{d.district} &nbsp;·&nbsp; {d.province}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/></svg>
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                MOH Area {districtFilter && <span className="text-slate-400">(in {districtFilter})</span>}
              </span>
              <div className="relative">
                <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={mohFilter ?? ''}
                  onChange={(e) => setMohFilter(e.target.value || null)}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  aria-label="Filter by MOH area"
                >
                  <option value="">All MOH areas ({visibleMohs.length})</option>
                  {visibleMohs.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/></svg>
              </div>
            </label>
          </div>

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

          <LeafletMap markers={leafletMarkers} height="28rem" fitToMarkers />
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
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`MOH Office ${p.moh}, ${p.district}, Sri Lanka`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${p.moh} MOH in Google Maps`}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[12px] font-bold text-blue-800 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
                </a>
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

      {/* Union secretariat — merged from the old /public/contact page */}
      <section id="contact" className="border-t border-slate-200 bg-slate-50/70 py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">Reach the Union</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">Union Secretariat</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            For matters that fall outside a specific PHI Range — membership, press, official correspondence, legal
            notices — the Union secretariat is available during office hours.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ContactTile icon={<MapPin className="h-5 w-5" />} title="Office address" lines={['673 Maradana Rd,', 'Colombo 01000,', 'Sri Lanka.']} />
            <ContactTile
              icon={<Phone className="h-5 w-5" />}
              title="Telephone"
              lines={[
                <a key="t1" href="tel:+94112670759" className="hover:text-blue-700 dark:hover:text-blue-400">(+94) 11 267 0759</a>,
                <a key="t2" href="tel:+94112635675" className="hover:text-blue-700 dark:hover:text-blue-400">(+94) 11-263 5675</a>,
              ]}
            />
            <ContactTile
              icon={<Mail className="h-5 w-5" />}
              title="Email"
              lines={[
                <a key="e1" href="mailto:info@phi.lk" className="hover:text-blue-700 dark:hover:text-blue-400">info@phi.lk</a>,
                <a key="e2" href="mailto:phisrilanka1@gmail.com" className="hover:text-blue-700 dark:hover:text-blue-400">phisrilanka1@gmail.com</a>,
              ]}
            />
            <ContactTile icon={<Clock className="h-5 w-5" />} title="Office hours" lines={['Mon – Fri', '08:30 – 16:15 (IST)']} />
          </div>

          <a
            href="https://www.google.com/maps/search/?api=1&query=673+Maradana+Road+Colombo+01000+Sri+Lanka"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-110"
          >
            <MapPin className="h-4 w-4" /> Open Maradana Rd in Google Maps <ExternalLink className="h-3.5 w-3.5" />
          </a>
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

function ContactTile({ icon, title, lines }: { icon: React.ReactNode; title: string; lines: React.ReactNode[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
        {icon}
      </div>
      <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">{title}</p>
      <div className="mt-1 space-y-0.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}
