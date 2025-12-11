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
  wasteSanitation: 10,
  documentation: 5,
  TOTAL: 100,
} as const;

/** Inspection frequency by risk level */
export const INSPECTION_FREQUENCY = {
  HIGH: { months: 3, label: 'Quarterly' },
  MEDIUM: { months: 6, label: 'Biannual' },
  LOW: { months: 12, label: 'Annual' },
} as const;

/** School targeted grades */
export const TARGETED_SCHOOL_GRADES = [1, 4, 7, 10] as const;

/** School vaccination schedule */
export const SCHOOL_VACCINES = {
  HPV: { targetGrade: 6, gender: 'F', doses: 2, intervalMonths: 6, name: 'HPV (Papola)' },
  AP_DT: { targetGrade: 7, gender: 'ALL', doses: 1, intervalMonths: 0, name: 'aP + dT (Pita gasma)' },
  MEBENDAZOLE: { frequency: 'TWICE_YEARLY', name: 'Mebendazole (Panu Beheth)' },
  IRON_VIT_C: { targetGrades: [5, 6, 7, 8, 9], gender: 'F', cycleMonths: 24, name: 'Iron + Vitamin C' },
} as const;

/** Epidemiology investigation timeline */
export const INVESTIGATION_TIMELINE_HOURS = 48;

/** Dengue cluster radius (metres) */
export const DENGUE_CLUSTER_RADIUS_METRES = 150;

/** Factory scale thresholds */
export const FACTORY_SCALE_THRESHOLDS = {
  SMALL: { maxWorkers: 49, label: 'Small (Sulu Paimana)' },
  MEDIUM: { minWorkers: 50, maxWorkers: 249, label: 'Medium (Madya Paimana)' },
  LARGE: { minWorkers: 250, label: 'Large (Mahapaimana)' },
} as const;

/** Monthly report due date */
export const MONTHLY_REPORT_DUE_DAY = 5; // 5th of next month

/** Quarantine default days */
export const DEFAULT_QUARANTINE_DAYS = 14;

/** Supported languages with labels */
export const SUPPORTED_LANGUAGES = [