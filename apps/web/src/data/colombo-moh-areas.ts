// MOH areas of the Colombo district, with the PHI sub-area each maps to.
// Shared by the H399 weekly + H411 monthly returns so entering an MOH area
// suggests from the dropdown and auto-fills the related fields.

export interface ColomboMohArea { name: string; phiArea: string }

export const COLOMBO_MOH_AREAS: ColomboMohArea[] = [
  { name: 'Colombo (CMC)',                 phiArea: 'PHI Area 04 — Colombo Central' },
  { name: 'Kolonnawa',                     phiArea: 'PHI Area 11 — Kolonnawa' },
  { name: 'Kaduwela',                      phiArea: 'PHI Area 07 — Kaduwela' },
  { name: 'Kotte (Sri Jayawardenepura)',   phiArea: 'PHI Area 02 — Kotte' },
  { name: 'Dehiwala',                      phiArea: 'PHI Area 05 — Dehiwala' },
  { name: 'Ratmalana',                     phiArea: 'PHI Area 06 — Ratmalana' },
  { name: 'Moratuwa',                      phiArea: 'PHI Area 09 — Moratuwa' },
  { name: 'Maharagama',                    phiArea: 'PHI Area 08 — Maharagama' },
  { name: 'Kesbewa (Piliyandala)',         phiArea: 'PHI Area 10 — Kesbewa' },
  { name: 'Homagama',                      phiArea: 'PHI Area 12 — Homagama' },
  { name: 'Nugegoda (Thimbirigasyaya)',    phiArea: 'PHI Area 03 — Thimbirigasyaya' },
];

export const MOH_AREA_NAMES = COLOMBO_MOH_AREAS.map((m) => m.name);

// ISO-8601 week number of a date.
function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Saturday that ends the current epidemiological week (ISO weeks end Sunday;
// Sri Lanka's surveillance week ends Saturday — close enough for the form).
function weekEnding(d = new Date()): string {
  const e = new Date(d);
  e.setDate(e.getDate() + (6 - e.getDay()));
  return e.toISOString().slice(0, 10);
}

// Autofill values for a chosen MOH area.
export function mohDefaults(name: string) {
  const match = COLOMBO_MOH_AREAS.find((m) => m.name === name);
  return {
    phiArea: match?.phiArea ?? '',
    week: String(isoWeek(new Date())),
    ending: weekEnding(),
    month: new Date().toISOString().slice(0, 7),
  };
}
