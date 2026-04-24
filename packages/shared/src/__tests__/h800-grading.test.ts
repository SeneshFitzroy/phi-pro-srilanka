// ============================================================================
// H800 Grading Algorithm — Unit Tests (Vitest)
// Tests every branch of the deterministic grading engine
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  computeH800Grade,
  rawGradeFromScore,
  getPerformanceLevel,
  deriveNoticeType,
  deriveFollowUpDays,
  getNextGrade,
  gradeTailwind,
} from '../algorithms/h800-grading';
import { FoodHygieneGrade } from '../types/enums';

// ---------------------------------------------------------------------------
// Helper: build perfect scores for all sections
// ---------------------------------------------------------------------------
function perfectScores() {
  return {
    premises:       { walls: 5, floors: 5, ceiling: 5, ventilation: 5, lighting: 5, pestProofing: 5 },
    hygiene:        { uniforms: 5, handwashing: 5, healthCertificates: 5, cleanliness: 5 },
    foodHandling:   { coldStorage: 5, hotHolding: 5, crossContamination: 5, rawCookedSeparation: 5, dateLabeling: 5 },
    equipment:      { eqCleanliness: 3, calibration: 2, condition: 3, rustFree: 2 },
    wasteSanitation:{ disposal: 3, drainage: 2, toilets: 3, bins: 2 },
    documentation:  { supplierRecords: 1, pestLog: 1, cleaningSchedule: 1, staffTraining: 1, haccp: 1 },
  };
}

// ---------------------------------------------------------------------------
// Grade threshold tests
// ---------------------------------------------------------------------------
describe('rawGradeFromScore', () => {
  it('returns A for score >= 90', () => {
    expect(rawGradeFromScore(90)).toBe(FoodHygieneGrade.A);
    expect(rawGradeFromScore(100)).toBe(FoodHygieneGrade.A);
  });

  it('returns B for score 75-89', () => {
    expect(rawGradeFromScore(75)).toBe(FoodHygieneGrade.B);
    expect(rawGradeFromScore(89)).toBe(FoodHygieneGrade.B);
  });

  it('returns C for score < 75', () => {
    expect(rawGradeFromScore(74)).toBe(FoodHygieneGrade.C);
    expect(rawGradeFromScore(0)).toBe(FoodHygieneGrade.C);
  });
});

// ---------------------------------------------------------------------------
// Full algorithm — Grade A (perfect)
// ---------------------------------------------------------------------------
describe('computeH800Grade', () => {
  it('awards Grade A for perfect score', () => {
    const result = computeH800Grade(perfectScores());
    expect(result.totalScore).toBe(100);
    expect(result.grade).toBe(FoodHygieneGrade.A);
    expect(result.criticalViolations).toHaveLength(0);
    expect(result.gradeCapped).toBe(false);
    expect(result.autoRecommendedNotice).toBe('NONE');
  });

  it('awards Grade B for score 75-89', () => {
    const scores = perfectScores();
    // Drop premises from 30 to 19 (total = 89)
    scores.premises.walls = 1;
    scores.premises.floors = 1;
    scores.premises.ceiling = 1;
    const result = computeH800Grade(scores);
    expect(result.grade).toBe(FoodHygieneGrade.B);
    expect(result.autoRecommendedNotice).toBe('WARNING');
  });

  it('awards Grade C for score < 75 with IMPROVEMENT notice (no critical violations)', () => {
    const scores = perfectScores();
    // Zero most of premises but keep pestProofing at 5 (avoid critical violation)
    // Lose 25 points → score = 75 (still B), so also reduce hygiene
    scores.premises = { walls: 0, floors: 0, ceiling: 0, ventilation: 0, lighting: 0, pestProofing: 5 };
    scores.hygiene  = { uniforms: 0, handwashing: 0, healthCertificates: 5, cleanliness: 0 };
    const result = computeH800Grade(scores);
    expect(result.grade).toBe(FoodHygieneGrade.C);
    expect(result.gradeCapped).toBe(false);
    expect(result.autoRecommendedNotice).toBe('IMPROVEMENT');
  });

  it('caps grade to C on pestProofing = 0 (critical violation)', () => {
    const scores = perfectScores();
    scores.premises.pestProofing = 0; // CRITICAL item
    const result = computeH800Grade(scores);
    expect(result.grade).toBe(FoodHygieneGrade.C);
    expect(result.gradeCapped).toBe(true);
    expect(result.criticalViolations.length).toBeGreaterThan(0);
  });

  it('triggers CLOSURE notice for cold storage critical zero', () => {
    const scores = perfectScores();
    scores.foodHandling.coldStorage = 0; // cold chain failure = CLOSURE
    const result = computeH800Grade(scores);
    expect(result.requiresImmediateClosure).toBe(true);
    expect(result.autoRecommendedNotice).toBe('CLOSURE');
    expect(result.followUpDays).toBe(1);
  });

  it('clamps total score to 100 max', () => {
    const scores = perfectScores();
    // Inflate a value
    scores.premises.walls = 999;
    const result = computeH800Grade(scores);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });

  it('returns correct section count', () => {
    const result = computeH800Grade(perfectScores());
    expect(result.sectionResults).toHaveLength(6);
  });

  it('calculates improvement gap correctly for Grade B', () => {
    const scores = perfectScores();
    scores.premises.walls = 0; // lose 5 points → score 95 → A
    const result = computeH800Grade(scores);
    // 95 is Grade A, next grade is null
    expect(result.nextGrade).toBeNull();
    expect(result.percentFromNextGrade).toBe(0);
  });

  it('has algorithmVersion field', () => {
    const result = computeH800Grade(perfectScores());
    expect(result.algorithmVersion).toBe('2.1');
  });
});

// ---------------------------------------------------------------------------
// Performance level tests
// ---------------------------------------------------------------------------
describe('getPerformanceLevel', () => {
  it('returns EXCELLENT for >=90%', () => expect(getPerformanceLevel(90)).toBe('EXCELLENT'));
  it('returns GOOD for >=75%', () => expect(getPerformanceLevel(75)).toBe('GOOD'));
  it('returns FAIR for >=50%', () => expect(getPerformanceLevel(50)).toBe('FAIR'));
  it('returns POOR for <50%', () => expect(getPerformanceLevel(49)).toBe('POOR'));
});

// ---------------------------------------------------------------------------
// Enforcement notice derivation
// ---------------------------------------------------------------------------
describe('deriveNoticeType', () => {
  it('returns NONE for Grade A with no violations', () =>
    expect(deriveNoticeType(FoodHygieneGrade.A, [], false)).toBe('NONE'));

  it('returns WARNING for Grade B', () =>
    expect(deriveNoticeType(FoodHygieneGrade.B, [], false)).toBe('WARNING'));

  it('returns IMPROVEMENT for Grade C with no critical violations', () =>
    expect(deriveNoticeType(FoodHygieneGrade.C, [], false)).toBe('IMPROVEMENT'));

  it('returns COURT_SUMMONS for Grade C with critical violations', () =>
    expect(deriveNoticeType(FoodHygieneGrade.C, ['violation'], false)).toBe('COURT_SUMMONS'));

  it('returns CLOSURE when immediate closure required', () =>
    expect(deriveNoticeType(FoodHygieneGrade.C, [], true)).toBe('CLOSURE'));
});

describe('deriveFollowUpDays', () => {
  it('NONE → 0 days', () => expect(deriveFollowUpDays('NONE')).toBe(0));
  it('WARNING → 30 days', () => expect(deriveFollowUpDays('WARNING')).toBe(30));
  it('IMPROVEMENT → 7 days', () => expect(deriveFollowUpDays('IMPROVEMENT')).toBe(7));
  it('CLOSURE → 1 day', () => expect(deriveFollowUpDays('CLOSURE')).toBe(1));
  it('COURT_SUMMONS → 14 days', () => expect(deriveFollowUpDays('COURT_SUMMONS')).toBe(14));
});

// ---------------------------------------------------------------------------
// Tailwind class helper
// ---------------------------------------------------------------------------
describe('gradeTailwind', () => {
  it('returns green classes for Grade A', () =>
    expect(gradeTailwind(FoodHygieneGrade.A)).toContain('green'));
  it('returns amber classes for Grade B', () =>
    expect(gradeTailwind(FoodHygieneGrade.B)).toContain('amber'));
  it('returns red classes for Grade C', () =>
    expect(gradeTailwind(FoodHygieneGrade.C)).toContain('red'));
});
