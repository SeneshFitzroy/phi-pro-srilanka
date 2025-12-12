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
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
] as const;

/** Role display labels */
export const ROLE_LABELS = {
  PUBLIC: { en: 'Public User', si: 'පොදු පරිශීලක', ta: 'பொது பயனர்' },
  PHI: { en: 'Public Health Inspector', si: 'මහජන සෞඛ්‍ය පරීක්ෂක', ta: 'பொது சுகாதார ஆய்வாளர்' },
  SPHI: { en: 'Supervising PHI', si: 'අධීක්ෂණ PHI', ta: 'மேற்பார்வை PHI' },
  MOH_ADMIN: { en: 'MOH Administrator', si: 'MOH පරිපාලක', ta: 'MOH நிர்வாகி' },
} as const;

/** Domain labels */
export const DOMAIN_LABELS = {
  FOOD_SAFETY: { en: 'Food Safety', si: 'ආහාර සුරක්ෂිතතාව', ta: 'உணவு பாதுகாப்பு', icon: 'utensils' },
  SCHOOL_HEALTH: { en: 'School Health', si: 'පාසල් සෞඛ්‍ය', ta: 'பள்ளி சுகாதாரம்', icon: 'school' },
  EPIDEMIOLOGY: { en: 'Epidemiology', si: 'වසංගත විද්‍යාව', ta: 'தொற்றுநோயியல்', icon: 'activity' },
  OCCUPATIONAL_HEALTH: { en: 'Occupational Health', si: 'වෘත්තීය සෞඛ්‍ය', ta: 'தொழில்சார் சுகாதாரம்', icon: 'hard-hat' },
  ADMINISTRATION: { en: 'Administration', si: 'පරිපාලනය', ta: 'நிர்வாகம்', icon: 'clipboard-list' },
} as const;

/** Group A notifiable diseases (International Quarantine) */
export const GROUP_A_DISEASES = [
  { code: 'CHOLERA', en: 'Cholera', si: 'කොලරාව' },
  { code: 'YELLOW_FEVER', en: 'Yellow Fever', si: 'කහ උණ' },
  { code: 'PLAGUE', en: 'Plague', si: 'ප්ලේගය' },
] as const;

/** Group B notifiable diseases (National) */
export const GROUP_B_DISEASES = [
  { code: 'DENGUE', en: 'Dengue', si: 'ඩෙංගු' },
  { code: 'DHF', en: 'Dengue Haemorrhagic Fever', si: 'ඩෙංගු රක්තපාත උණ' },
  { code: 'TYPHOID', en: 'Typhoid', si: 'ටයිපොයිඩ්' },
  { code: 'POLIO', en: 'Polio', si: 'පෝලියෝ' },
  { code: 'CHICKEN_POX', en: 'Chicken Pox', si: 'සුළු වසූරිය' },
  { code: 'MEASLES', en: 'Measles', si: 'සරම්ප' },
  { code: 'FOOD_POISONING', en: 'Food Poisoning', si: 'ආහාර විෂවීම' },
  { code: 'RABIES', en: 'Human Rabies', si: 'බලු උන්මාදය' },
  { code: 'LEPTOSPIROSIS', en: 'Leptospirosis', si: 'මී වැඩියා' },
  { code: 'MALARIA', en: 'Malaria', si: 'මැලේරියා' },
  { code: 'HIV', en: 'HIV/AIDS', si: 'එච්.අයි.වී.' },
  { code: 'TB', en: 'Tuberculosis', si: 'ක්ෂය රෝගය' },
  { code: 'MUMPS', en: 'Mumps', si: 'මම්ස්' },