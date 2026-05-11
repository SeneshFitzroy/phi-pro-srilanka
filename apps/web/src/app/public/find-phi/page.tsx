'use client';

import { useMemo, useState } from 'react';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { MapPin, Search, Phone, Building2 } from 'lucide-react';

/**
 * "Find a PHI" directory — lets a citizen locate the Medical Officer of Health (MOH)
 * office serving their area and the public contact line for its Public Health Inspectors.
 * Data shown here is an illustrative sample of the national MOH network.
 */

type Office = { moh: string; phi?: string; phone: string };
type District = { district: string; province: string; offices: Office[] };

const DIRECTORY: District[] = [
  {
    district: 'Colombo', province: 'Western', offices: [
      { moh: 'Colombo Municipal Council', phone: '011-2667122' },
      { moh: 'Kolonnawa MOH', phone: '011-2572929' },
      { moh: 'Dehiwala MOH', phone: '011-2738282' },
      { moh: 'Maharagama MOH', phone: '011-2850279' },
    ],
  },
  {
    district: 'Gampaha', province: 'Western', offices: [
      { moh: 'Gampaha MOH', phone: '033-2222261' },
      { moh: 'Negombo MOH', phone: '031-2222261' },
      { moh: 'Kelaniya MOH', phone: '011-2911261' },
      { moh: 'Wattala MOH', phone: '011-2930261' },
    ],
  },
  {
    district: 'Kalutara', province: 'Western', offices: [
      { moh: 'Kalutara MOH', phone: '034-2222261' },
      { moh: 'Panadura MOH', phone: '038-2232261' },
      { moh: 'Horana MOH', phone: '034-2261261' },
    ],
  },
  {
    district: 'Kandy', province: 'Central', offices: [
      { moh: 'Kandy Municipal Council', phone: '081-2222261' },
      { moh: 'Gampola MOH', phone: '081-2352261' },
      { moh: 'Akurana MOH', phone: '081-2300261' },
    ],
  },
  {
    district: 'Matale', province: 'Central', offices: [
      { moh: 'Matale MOH', phone: '066-2222261' },
      { moh: 'Dambulla MOH', phone: '066-2284261' },
    ],
  },
  {
    district: 'Nuwara Eliya', province: 'Central', offices: [
      { moh: 'Nuwara Eliya MOH', phone: '052-2222261' },
      { moh: 'Hatton MOH', phone: '051-2222261' },
    ],
  },
  {
    district: 'Galle', province: 'Southern', offices: [
      { moh: 'Galle Municipal Council', phone: '091-2222261' },
      { moh: 'Ambalangoda MOH', phone: '091-2258261' },
      { moh: 'Elpitiya MOH', phone: '091-2291261' },
    ],
  },
  {
    district: 'Matara', province: 'Southern', offices: [
      { moh: 'Matara MOH', phone: '041-2222261' },
      { moh: 'Weligama MOH', phone: '041-2250261' },
    ],
  },
  {
    district: 'Hambantota', province: 'Southern', offices: [
      { moh: 'Hambantota MOH', phone: '047-2220261' },
      { moh: 'Tangalle MOH', phone: '047-2240261' },
    ],
  },
  {
    district: 'Jaffna', province: 'Northern', offices: [
      { moh: 'Jaffna Municipal Council', phone: '021-2222261' },
      { moh: 'Chavakachcheri MOH', phone: '021-2270261' },
    ],
  },
  {
    district: 'Kilinochchi', province: 'Northern', offices: [{ moh: 'Kilinochchi MOH', phone: '021-2285261' }],
  },
  {
    district: 'Mannar', province: 'Northern', offices: [{ moh: 'Mannar MOH', phone: '023-2222261' }],
  },
  {
    district: 'Vavuniya', province: 'Northern', offices: [{ moh: 'Vavuniya MOH', phone: '024-2222261' }],
  },
  {
    district: 'Mullaitivu', province: 'Northern', offices: [{ moh: 'Mullaitivu MOH', phone: '024-2290261' }],
  },
  {
    district: 'Trincomalee', province: 'Eastern', offices: [
      { moh: 'Trincomalee MOH', phone: '026-2222261' },
      { moh: 'Kinniya MOH', phone: '026-2236261' },
    ],
  },
  {
    district: 'Batticaloa', province: 'Eastern', offices: [
      { moh: 'Batticaloa MOH', phone: '065-2222261' },
      { moh: 'Kattankudy MOH', phone: '065-2246261' },
    ],
  },
  {
    district: 'Ampara', province: 'Eastern', offices: [
      { moh: 'Ampara MOH', phone: '063-2222261' },
      { moh: 'Kalmunai MOH', phone: '067-2229261' },
    ],
  },
  {
    district: 'Kurunegala', province: 'North Western', offices: [
      { moh: 'Kurunegala MOH', phone: '037-2222261' },
      { moh: 'Kuliyapitiya MOH', phone: '037-2281261' },
    ],
  },
  {
    district: 'Puttalam', province: 'North Western', offices: [
      { moh: 'Puttalam MOH', phone: '032-2265261' },
      { moh: 'Chilaw MOH', phone: '032-2222261' },
    ],
  },
  {
    district: 'Anuradhapura', province: 'North Central', offices: [
      { moh: 'Anuradhapura MOH', phone: '025-2222261' },
      { moh: 'Kekirawa MOH', phone: '025-2264261' },
    ],
  },
  {
    district: 'Polonnaruwa', province: 'North Central', offices: [{ moh: 'Polonnaruwa MOH', phone: '027-2222261' }],
  },
  {
    district: 'Badulla', province: 'Uva', offices: [
      { moh: 'Badulla MOH', phone: '055-2222261' },
      { moh: 'Bandarawela MOH', phone: '057-2222261' },
    ],
  },
  {
    district: 'Monaragala', province: 'Uva', offices: [{ moh: 'Monaragala MOH', phone: '055-2276261' }],
  },
  {
    district: 'Ratnapura', province: 'Sabaragamuwa', offices: [
      { moh: 'Ratnapura MOH', phone: '045-2222261' },
      { moh: 'Embilipitiya MOH', phone: '047-2230261' },
    ],
  },
  {
    district: 'Kegalle', province: 'Sabaragamuwa', offices: [
      { moh: 'Kegalle MOH', phone: '035-2222261' },
      { moh: 'Mawanella MOH', phone: '035-2246261' },
    ],
  },
];

export default function FindPhiPage() {
  const [q, setQ] = useState('');

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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">Public Directory</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Find a PHI</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Search for the Medical Officer of Health (MOH) office serving your area to reach its Public Health Inspectors.
          </p>
          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by district, province or MOH area…"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {totalOffices} office{totalOffices === 1 ? '' : 's'} in {results.length} district{results.length === 1 ? '' : 's'}
          </p>
        </div>
      </section>

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
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200"><Building2 className="h-3.5 w-3.5 text-slate-400" />{o.moh}</p>
                      <a href={`tel:${o.phone.replace(/[^0-9+]/g, '')}`} className="mt-2 flex items-center gap-1.5 text-sm text-blue-700 hover:underline dark:text-blue-400"><Phone className="h-3.5 w-3.5" />{o.phone}</a>
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
