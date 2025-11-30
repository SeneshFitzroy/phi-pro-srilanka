// ============================================================================
// Food Inspection & Hygiene Types (H800, H801, H802, H803)
// ============================================================================
import { BaseForm, GeoPoint, PhotoAttachment } from './forms';
import { FoodRiskLevel, FoodHygieneGrade, NoticeType } from './enums';

// ---------------------------------------------------------------------------
// H800 – Food Premises Inspection (100-mark scoring system)
// ---------------------------------------------------------------------------

/** Individual scoring section of H800 */
export interface H800Section {
  sectionId: string;
  sectionName: string;
  sectionNameSi: string;
  maxScore: number;
  score: number;
  notes?: string;
  photos?: PhotoAttachment[];
}

/** H800 Premises & Structure section items */
export interface H800PremisesChecks {
  wallsCondition: number;       // 0-5