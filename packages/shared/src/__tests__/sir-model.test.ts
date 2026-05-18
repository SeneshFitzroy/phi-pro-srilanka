// ============================================================================
// SIR Epidemic Model — Unit Tests
// Verifies the Runge-Kutta 4 integrator, basic invariants of the SIR system
// and the disease-preset wrappers used by the dengue / typhoid / leptospirosis
// outbreak forecasting screens.
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  runSIRModel,
  runSIRForDisease,
  daysUntilThreshold,
  DISEASE_PRESETS,
} from '../algorithms/sir-model';

describe('runSIRModel', () => {
  const baseParams = {
    population: 100_000,
    beta: 0.4,
    gamma: 0.143,
    initialInfected: 50,
    days: 180,
  } as const;

  it('produces one data point per day plus day-zero (181 for 180-day run)', () => {
    const r = runSIRModel({ ...baseParams });
    expect(r.series).toHaveLength(baseParams.days + 1);
    expect(r.series[0].day).toBe(0);
    expect(r.series.at(-1)!.day).toBe(baseParams.days);
  });

  it('conserves the population (S + I + R == N within rounding)', () => {
    const r = runSIRModel({ ...baseParams });
    for (const p of r.series) {
      // Rounded ints in the series — allow ±2 for accumulated rounding noise.
      expect(Math.abs(p.S + p.I + p.R - baseParams.population)).toBeLessThanOrEqual(2);
    }
  });

  it('reports R0 = beta / gamma', () => {
    const r = runSIRModel({ ...baseParams });
    expect(r.R0).toBeCloseTo(baseParams.beta / baseParams.gamma, 1);
  });

  it('herd-immunity threshold equals 1 - 1/R0 (as a percentage)', () => {
    const r = runSIRModel({ ...baseParams });
    const expected = (1 - 1 / r.R0) * 100;
    expect(r.herdImmunityThreshold).toBeCloseTo(expected, 0);
  });

  it('peaks before the end of a sufficiently long simulation', () => {
    const r = runSIRModel({ ...baseParams });
    expect(r.peakDay).toBeGreaterThan(0);
    expect(r.peakDay).toBeLessThan(baseParams.days);
    expect(r.peakInfected).toBeGreaterThan(baseParams.initialInfected);
  });

  it('falls below 1 infected before the horizon for self-limiting outbreaks', () => {
    const r = runSIRModel({ ...baseParams, days: 365 });
    expect(r.daysToExtinction).toBeLessThan(365);
  });
});

describe('runSIRForDisease', () => {
  it('uses dengue preset constants', () => {
    const r = runSIRForDisease('dengue', 50_000, 25);
    expect(r.diseaseParameters).toEqual(DISEASE_PRESETS.dengue);
    expect(r.diseaseParameters.name).toBe('Dengue Fever');
  });

  it('dengue peaks earlier than typhoid (shorter infectious period drives faster dynamics)', () => {
    const dengue  = runSIRForDisease('dengue',  100_000, 50);
    const typhoid = runSIRForDisease('typhoid', 100_000, 50);
    expect(dengue.peakDay).toBeLessThan(typhoid.peakDay);
  });

  it('every preset carries an R0 strictly greater than 1', () => {
    for (const key of Object.keys(DISEASE_PRESETS)) {
      const preset = DISEASE_PRESETS[key];
      expect(preset.R0).toBeGreaterThan(1);
    }
  });
});

describe('daysUntilThreshold', () => {
  it('returns the first day the infected count exceeds a threshold', () => {
    const r = runSIRForDisease('dengue', 100_000, 50);
    const d = daysUntilThreshold(r, 500);
    expect(d).toBeGreaterThan(0);
    expect(r.series[d].I).toBeGreaterThanOrEqual(500);
  });

  it('returns -1 when the threshold is never crossed', () => {
    const r = runSIRForDisease('dengue', 100_000, 50);
    expect(daysUntilThreshold(r, 10_000_000)).toBe(-1);
  });
});
