// ============================================================================
// PHI-PRO Utility Functions
// ============================================================================
import { FOOD_GRADE_THRESHOLDS, FACTORY_SCALE_THRESHOLDS } from '../constants';

/**
 * Calculate food hygiene grade from total H800 score.
 * Deterministic: A (90-100), B (75-89), C (<75)
 */
export function calculateFoodGrade(totalScore: number): 'A' | 'B' | 'C' {
  if (totalScore >= FOOD_GRADE_THRESHOLDS.A.min) return 'A';
  if (totalScore >= FOOD_GRADE_THRESHOLDS.B.min) return 'B';
  return 'C';
}

/** Get grade color for display */
export function getGradeColor(grade: 'A' | 'B' | 'C'): string {
  return FOOD_GRADE_THRESHOLDS[grade].color;
}
