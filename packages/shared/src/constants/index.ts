// ============================================================================
// PHI-PRO Constants
// ============================================================================

/** Application metadata */
export const APP_NAME = 'PHI-PRO';
export const APP_FULL_NAME = 'PHI-PRO: Digital Health Enforcement & Integrated Intelligence System';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Unified digital platform for Sri Lanka\'s Public Health Inspectors';

/** Form H800 Grading Thresholds */
export const FOOD_GRADE_THRESHOLDS = {
  A: { min: 90, max: 100, label: 'Excellent', color: '#22c55e' },
  B: { min: 75, max: 89, label: 'Good', color: '#eab308' },
  C: { min: 0, max: 74, label: 'Needs Improvement', color: '#ef4444' },
} as const;

/** H800 section max scores */
export const H800_SECTION_MAX_SCORES = {
  premises: 30,
  hygiene: 20,
  foodHandling: 25,
  equipment: 10,