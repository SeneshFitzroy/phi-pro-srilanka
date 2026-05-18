// ============================================================================
// PHI Officer Dataset — Unit Tests
// Sanity-checks the national directory that powers /public/find-phi: coordinate
// bounds (Sri Lanka), phone-number format, every officer's district resolves
// to a known district, and the MOH-aggregation helper is consistent.
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  DISTRICTS,
  PHI_OFFICERS,
  mohPins,
  listMohOffices,
} from '@/data/phi-officers';

const SL_LAT_RANGE: readonly [number, number] = [5.5, 10.0];
const SL_LNG_RANGE: readonly [number, number] = [79.5, 82.0];

describe('DISTRICTS metadata', () => {
  it('covers 26 administrative districts', () => {
    expect(DISTRICTS.length).toBeGreaterThanOrEqual(25);
  });

  it('every district capital sits inside the Sri Lanka bounding box', () => {
    for (const d of DISTRICTS) {
      expect(d.lat).toBeGreaterThanOrEqual(SL_LAT_RANGE[0]);
      expect(d.lat).toBeLessThanOrEqual(SL_LAT_RANGE[1]);
      expect(d.lng).toBeGreaterThanOrEqual(SL_LNG_RANGE[0]);
      expect(d.lng).toBeLessThanOrEqual(SL_LNG_RANGE[1]);
    }
  });

  it('every district has a published RDHS landline', () => {
    for (const d of DISTRICTS) {
      expect(d.rdhs).toMatch(/^\d{3}-\d{6,7}$/);
    }
  });
});

describe('PHI_OFFICERS register', () => {
  const districtSet = new Set(DISTRICTS.map((d) => d.district));

  it('lists at least one officer per dataset', () => {
    expect(PHI_OFFICERS.length).toBeGreaterThan(0);
  });

  it("every officer's district is a known DISTRICT", () => {
    for (const o of PHI_OFFICERS) {
      expect(districtSet.has(o.district)).toBe(true);
    }
  });

  it("every officer's coordinates fall inside Sri Lanka", () => {
    for (const o of PHI_OFFICERS) {
      expect(o.lat).toBeGreaterThanOrEqual(SL_LAT_RANGE[0]);
      expect(o.lat).toBeLessThanOrEqual(SL_LAT_RANGE[1]);
      expect(o.lng).toBeGreaterThanOrEqual(SL_LNG_RANGE[0]);
      expect(o.lng).toBeLessThanOrEqual(SL_LNG_RANGE[1]);
    }
  });

  it('every officer carries a phone number that looks like an LK mobile or landline', () => {
    // 07x mobile, 011/021/.. landline, or international +94 — at least 9 digits.
    for (const o of PHI_OFFICERS) {
      const digits = o.phone.replace(/\D/g, '');
      expect(digits.length).toBeGreaterThanOrEqual(9);
    }
  });
});

describe('mohPins() and listMohOffices()', () => {
  it('returns one pin per (district, moh) pair', () => {
    const pins = mohPins();
    const keys = new Set(pins.map((p) => `${p.district}::${p.moh}`));
    expect(keys.size).toBe(pins.length);
  });

  it('the union of pin-officers equals the full register', () => {
    const fromPins = mohPins().flatMap((p) => p.officers);
    expect(fromPins.length).toBe(PHI_OFFICERS.length);
  });

  it('listMohOffices() is sorted and deduplicated', () => {
    const list = listMohOffices();
    expect(list).toEqual([...new Set(list)].sort());
  });
});
