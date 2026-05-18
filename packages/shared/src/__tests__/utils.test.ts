// ============================================================================
// Shared Utilities — Unit Tests
// Covers the grade / BMI / factory-scale classifiers and reference-number
// generator that the H800 inspection screens, school-health module and
// permit issuance flow all depend on.
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  calculateFoodGrade,
  getGradeColor,
  getGradeLabel,
  calculateBMI,
  categorizeBMI,
  classifyFactoryScale,
  generateRefNo,
} from '../utils';

describe('calculateFoodGrade', () => {
  it('returns A at and above 90', () => {
    expect(calculateFoodGrade(100)).toBe('A');
    expect(calculateFoodGrade(90)).toBe('A');
  });

  it('returns B between 75 and 89', () => {
    expect(calculateFoodGrade(89)).toBe('B');
    expect(calculateFoodGrade(75)).toBe('B');
  });

  it('returns C below 75', () => {
    expect(calculateFoodGrade(74)).toBe('C');
    expect(calculateFoodGrade(0)).toBe('C');
  });

  it('grade colour and label resolve for every grade', () => {
    for (const g of ['A', 'B', 'C'] as const) {
      expect(getGradeColor(g)).toMatch(/^#?[a-zA-Z0-9]+$/);
      expect(getGradeLabel(g).length).toBeGreaterThan(0);
    }
  });
});

describe('calculateBMI', () => {
  it('matches the standard formula kg / m^2 rounded to 1dp', () => {
    expect(calculateBMI(170, 70)).toBe(24.2);  // 70 / 1.7^2 = 24.22
    expect(calculateBMI(180, 81)).toBe(25);     // 81 / 1.8^2 = 25.0
  });

  it('returns 0 for non-positive height (guards against div-by-zero)', () => {
    expect(calculateBMI(0, 70)).toBe(0);
    expect(calculateBMI(-150, 70)).toBe(0);
  });
});

describe('categorizeBMI', () => {
  it('classifies the WHO bands correctly at boundaries', () => {
    expect(categorizeBMI(18.4)).toBe('UNDERWEIGHT');
    expect(categorizeBMI(18.5)).toBe('NORMAL');
    expect(categorizeBMI(24.9)).toBe('NORMAL');
    expect(categorizeBMI(25)).toBe('OVERWEIGHT');
    expect(categorizeBMI(29.9)).toBe('OVERWEIGHT');
    expect(categorizeBMI(30)).toBe('OBESE');
  });
});

describe('classifyFactoryScale', () => {
  it('returns SMALL for low worker counts', () => {
    expect(classifyFactoryScale(0)).toBe('SMALL');
    expect(classifyFactoryScale(5)).toBe('SMALL');
  });

  it('escalates to MEDIUM and LARGE as worker count grows', () => {
    expect(classifyFactoryScale(50)).not.toBe('SMALL');
    expect(classifyFactoryScale(500)).toBe('LARGE');
  });
});

describe('generateRefNo', () => {
  it('embeds the prefix and the current year', () => {
    const ref = generateRefNo('H800');
    const year = new Date().getFullYear();
    expect(ref.startsWith(`H800-${year}-`)).toBe(true);
  });

  it('produces a 6-digit random suffix', () => {
    const ref = generateRefNo('PERMIT');
    const suffix = ref.split('-').pop()!;
    expect(suffix).toMatch(/^\d{6}$/);
  });

  it('produces unique references across many calls', () => {
    const refs = new Set(Array.from({ length: 200 }, () => generateRefNo('X')));
    // 200 calls × 900_000 possible suffixes → collisions are rare but possible;
    // we just want most calls to be unique, not all.
    expect(refs.size).toBeGreaterThan(190);
  });
});
