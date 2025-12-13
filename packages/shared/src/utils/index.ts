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

/** Get grade label */
export function getGradeLabel(grade: 'A' | 'B' | 'C'): string {
  return FOOD_GRADE_THRESHOLDS[grade].label;
}

/**
 * Calculate BMI from height (cm) and weight (kg).
 */
export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/** Categorize BMI for school children (simplified WHO) */
export function categorizeBMI(bmi: number): 'UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE' {
  if (bmi < 18.5) return 'UNDERWEIGHT';
  if (bmi < 25) return 'NORMAL';
  if (bmi < 30) return 'OVERWEIGHT';