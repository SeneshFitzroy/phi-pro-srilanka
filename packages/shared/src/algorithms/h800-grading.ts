// ============================================================================
// H800 GRADING ALGORITHM — Deterministic 100-Point Scoring Engine
// Sri Lanka Food Act No.26 of 1980 & Food (Labelling & Advertising) Regs 2005
// ============================================================================
//
// ALGORITHM OVERVIEW:
//   1. PHI scores 6 sections → raw section totals
//   2. Section totals sum to 100
//   3. Any critical violation triggers automatic grade cap
//   4. Final grade: A (90–100), B (75–89), C (0–74)
//   5. All logic is deterministic and auditable
// ============================================================================

import {
  FOOD_GRADE_THRESHOLDS,
  H800_SECTION_MAX_SCORES,
} from '../constants';
import { FoodHygieneGrade } from '../types/enums';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface H800SectionInput {
  sectionId: keyof typeof H800_SECTION_MAX_SCORES;
  itemScores: Record<string, number>;
}

export interface H800SectionResult {
  sectionId: string;
  sectionName: string;
  sectionNameSi: string;
  scored: number;
  maxScore: number;
  percentage: number;
  weight: number;          // proportion of total (0–1)
  weightedScore: number;   // contribution to total score
  performanceLevel: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  criticalFailures: string[];
}

export interface H800GradingResult {
  // === INPUTS ===
  rawSectionScores: Record<string, number>;

  // === CALCULATED ===
  totalScore: number;         // 0–100
  grade: FoodHygieneGrade;    // A | B | C
  gradeLabel: string;
  gradeColor: string;
  gradeTailwindClasses: string;

  // === SECTION BREAKDOWN ===
  sectionResults: H800SectionResult[];

  // === ENFORCEMENT ===
  gradeCapped: boolean;       // true if critical violation overrides score
  gradeCappedReason?: string;
  criticalViolations: string[];
  autoRecommendedNotice: 'NONE' | 'WARNING' | 'IMPROVEMENT' | 'CLOSURE' | 'COURT_SUMMONS';
  requiresImmediateClosure: boolean;
  followUpDays: number;

  // === COMPLIANCE TREND ===
  percentFromNextGrade: number;  // points needed to reach the next grade up
  nextGrade: FoodHygieneGrade | null;

  // === AUDIT ===
  computedAt: string;   // ISO 8601 timestamp
  algorithmVersion: '2.1'; // increment when logic changes
}

// ---------------------------------------------------------------------------
// Section metadata
// ---------------------------------------------------------------------------

const SECTION_META: Record<string, { name: string; nameSi: string; criticalItems: string[] }> = {
  premises: {
    name: 'Premises & Structure',
    nameSi: 'ස්ථානය සහ ව්‍යුහය',
    criticalItems: ['pestProofing'],  // pest infestation = automatic grade cap
  },
  hygiene: {
    name: 'Personal Hygiene',
    nameSi: 'පුද්ගලික සනීපාරක්ෂාව',
    criticalItems: ['healthCertificates'],  // no health certs = CLOSURE risk
  },
  foodHandling: {
    name: 'Food Handling & Storage',
    nameSi: 'ආහාර හැසිරවීම සහ ගබඩා කිරීම',
    criticalItems: ['coldStorage', 'hotHolding', 'crossContamination'],
  },
  equipment: {
    name: 'Equipment & Utensils',
    nameSi: 'උපකරණ සහ භාජන',
    criticalItems: [],
  },
  wasteSanitation: {
    name: 'Waste & Sanitation',
    nameSi: 'අපද්‍රව්‍ය සහ සනීපාරක්ෂාව',
    criticalItems: ['drainage'],
  },
  documentation: {
    name: 'Documentation & Records',
    nameSi: 'ලේඛන සහ වාර්තා',
    criticalItems: [],
  },
};

// Score zero on a critical item triggers grade cap
const CRITICAL_ZERO_CAP: FoodHygieneGrade = FoodHygieneGrade.C;

// ---------------------------------------------------------------------------
// Core grading engine
// ---------------------------------------------------------------------------

/**
 * computeH800Grade — the primary deterministic grading function.
 *
 * Takes a flat map of item IDs → scores and returns a full audit trail.
 * The algorithm is intentionally transparent so PHIs, supervisors, and
 * courts can verify the grade from first principles.
 */
export function computeH800Grade(
  sectionItemScores: Record<string, Record<string, number>>,
  sectionMaxScores: Partial<typeof H800_SECTION_MAX_SCORES> = H800_SECTION_MAX_SCORES,
): H800GradingResult {
  const sectionResults: H800SectionResult[] = [];
  const criticalViolations: string[] = [];
  let totalScore = 0;

  // Step 1: Score each section
  for (const [sectionId, itemScores] of Object.entries(sectionItemScores)) {
    const meta = SECTION_META[sectionId];
    if (!meta) continue;

    const maxScore = sectionMaxScores[sectionId as keyof typeof H800_SECTION_MAX_SCORES] ?? 0;
    if (maxScore === 0) continue;

    const scored = Object.values(itemScores).reduce((sum, v) => sum + Math.max(0, v), 0);
    const clamped = Math.min(scored, maxScore);
    const percentage = maxScore > 0 ? Math.round((clamped / maxScore) * 100) : 0;

    // Check for critical item zeroes
    const sectionCriticalFailures: string[] = [];
    for (const criticalItemId of meta.criticalItems) {
      if (itemScores[criticalItemId] === 0) {
        const failure = `Zero score on critical item "${criticalItemId}" in ${meta.name}`;
        sectionCriticalFailures.push(failure);
        criticalViolations.push(failure);
      }
    }

    const performanceLevel = getPerformanceLevel(percentage);

    sectionResults.push({
      sectionId,
      sectionName: meta.name,
      sectionNameSi: meta.nameSi,
      scored: clamped,
      maxScore,
      percentage,
      weight: maxScore / 100,
      weightedScore: clamped,
      performanceLevel,
      criticalFailures: sectionCriticalFailures,
    });

    totalScore += clamped;
  }

  const clampedTotal = Math.min(Math.max(0, totalScore), 100);

  // Step 2: Determine raw grade from thresholds
  let grade = rawGradeFromScore(clampedTotal);
  let gradeCapped = false;
  let gradeCappedReason: string | undefined;

  // Step 3: Apply critical violation caps (override grade downward)
  if (criticalViolations.length > 0 && grade !== FoodHygieneGrade.C) {
    grade = CRITICAL_ZERO_CAP;
    gradeCapped = true;
    gradeCappedReason = `Grade capped to C: ${criticalViolations[0]}`;
  }

  // Step 4: Enforcement recommendation
  const requiresImmediateClosure = criticalViolations.some((v) =>
    v.includes('coldStorage') || v.includes('hotHolding') || v.includes('crossContamination'),
  );

  const autoRecommendedNotice = deriveNoticeType(grade, criticalViolations, requiresImmediateClosure);
  const followUpDays = deriveFollowUpDays(autoRecommendedNotice);

  // Step 5: Improvement gap
  const nextGrade = getNextGrade(grade);
  const percentFromNextGrade = nextGrade
    ? FOOD_GRADE_THRESHOLDS[nextGrade].min - clampedTotal
    : 0;

  return {
    rawSectionScores: Object.fromEntries(
      Object.entries(sectionItemScores).map(([k, items]) => [
        k,
        Object.values(items).reduce((s, v) => s + Math.max(0, v), 0),
      ]),
    ),
    totalScore: clampedTotal,
    grade,
    gradeLabel: FOOD_GRADE_THRESHOLDS[grade].label,
    gradeColor: FOOD_GRADE_THRESHOLDS[grade].color,
    gradeTailwindClasses: gradeTailwind(grade),
    sectionResults,
    gradeCapped,
    gradeCappedReason,
    criticalViolations,
    autoRecommendedNotice,
    requiresImmediateClosure,
    followUpDays,
    percentFromNextGrade: Math.max(0, percentFromNextGrade),
    nextGrade,
    computedAt: new Date().toISOString(),
    algorithmVersion: '2.1',
  };
}

// ---------------------------------------------------------------------------
// Pure helper functions (fully testable, no side-effects)
// ---------------------------------------------------------------------------

/** Map numeric score to FoodHygieneGrade enum */
export function rawGradeFromScore(score: number): FoodHygieneGrade {
  if (score >= FOOD_GRADE_THRESHOLDS.A.min) return FoodHygieneGrade.A;
  if (score >= FOOD_GRADE_THRESHOLDS.B.min) return FoodHygieneGrade.B;
  return FoodHygieneGrade.C;
}

/** Get performance level label from section percentage */
export function getPerformanceLevel(
  percentage: number,
): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
  if (percentage >= 90) return 'EXCELLENT';
  if (percentage >= 75) return 'GOOD';
  if (percentage >= 50) return 'FAIR';
  return 'POOR';
}

/** Derive enforcement notice from grade and violations */
export function deriveNoticeType(
  grade: FoodHygieneGrade,
  criticalViolations: string[],
  requiresImmediateClosure: boolean,
): 'NONE' | 'WARNING' | 'IMPROVEMENT' | 'CLOSURE' | 'COURT_SUMMONS' {
  if (requiresImmediateClosure) return 'CLOSURE';
  if (grade === FoodHygieneGrade.A && criticalViolations.length === 0) return 'NONE';
  if (grade === FoodHygieneGrade.B) return 'WARNING';
  if (grade === FoodHygieneGrade.C && criticalViolations.length === 0) return 'IMPROVEMENT';
  if (grade === FoodHygieneGrade.C && criticalViolations.length > 0) return 'COURT_SUMMONS';
  return 'NONE';
}

/** Follow-up days by notice type */
export function deriveFollowUpDays(
  notice: 'NONE' | 'WARNING' | 'IMPROVEMENT' | 'CLOSURE' | 'COURT_SUMMONS',
): number {
  const MAP = { NONE: 0, WARNING: 30, IMPROVEMENT: 7, CLOSURE: 1, COURT_SUMMONS: 14 };
  return MAP[notice];
}

/** Grade above current (for improvement gap) */
export function getNextGrade(grade: FoodHygieneGrade): FoodHygieneGrade | null {
  if (grade === FoodHygieneGrade.C) return FoodHygieneGrade.B;
  if (grade === FoodHygieneGrade.B) return FoodHygieneGrade.A;
  return null;
}

/** Tailwind CSS classes for grade display */
export function gradeTailwind(grade: FoodHygieneGrade): string {
  const MAP: Record<FoodHygieneGrade, string> = {
    [FoodHygieneGrade.A]: 'text-green-700 bg-green-50 border-green-300',
    [FoodHygieneGrade.B]: 'text-amber-700 bg-amber-50 border-amber-300',
    [FoodHygieneGrade.C]: 'text-red-700 bg-red-50 border-red-300',
  };
  return MAP[grade];
}

/** Grade display badge color (inline style) */
export function gradeHexColor(grade: FoodHygieneGrade): string {
  return FOOD_GRADE_THRESHOLDS[grade].color;
}

// ---------------------------------------------------------------------------
// Convenience: flat score map → grade (used in list views)
// ---------------------------------------------------------------------------

/**
 * Lightweight grade helper — accepts total score directly.
 * Identical thresholds to computeH800Grade; no side-effect computation.
 */
export function gradeFromTotal(totalScore: number): {
  grade: FoodHygieneGrade;
  label: string;
  color: string;
  tailwind: string;
} {
  const grade = rawGradeFromScore(totalScore);
  return {
    grade,
    label: FOOD_GRADE_THRESHOLDS[grade].label,
    color: FOOD_GRADE_THRESHOLDS[grade].color,
    tailwind: gradeTailwind(grade),
  };
}
