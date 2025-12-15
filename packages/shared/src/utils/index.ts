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
  return 'OBESE';
}

/** Classify factory scale by worker count */
export function classifyFactoryScale(workerCount: number): 'SMALL' | 'MEDIUM' | 'LARGE' {
  if (workerCount >= FACTORY_SCALE_THRESHOLDS.LARGE.minWorkers) return 'LARGE';
  if (workerCount >= FACTORY_SCALE_THRESHOLDS.MEDIUM.minWorkers) return 'MEDIUM';
  return 'SMALL';
}

/** Generate a reference number with prefix and timestamp */
export function generateRefNo(prefix: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}-${year}-${random}`;
}

/** Format date as Sri Lankan display format (DD/MM/YYYY) */
export function formatDateSL(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Check if a date is within 48 hours from now */
export function isWithin48Hours(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= 48;
}

/** Get the due date for monthly report (5th of next month) */
export function getMonthlyReportDueDate(year: number, month: number): Date {
  // Month is 1-indexed; report due on 5th of *next* month
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return new Date(nextYear, nextMonth - 1, 5);
}

/** Calculate compliance percentage */
export function calculateCompliancePercent(compliant: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((compliant / total) * 100);
}

/** Haversine distance between two GPS points (in metres) */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371000; // Earth radius in metres
  const dLat = toRad(lat2 - lat1);