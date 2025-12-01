// ============================================================================
// School Health Types (H1214, H1046, H1014, H1015, H1247)
// ============================================================================
import { BaseForm, GeoPoint, PhotoAttachment } from './forms';
import { SchoolVaccineType, TargetedSchoolGrade } from './enums';

// ---------------------------------------------------------------------------
// School Profile
// ---------------------------------------------------------------------------

export interface SchoolProfile {
  id: string;
  schoolName: string;
  schoolNameSi?: string;
  schoolNameTa?: string;
  schoolCode?: string;        // MOE code
  address: string;
  gnDivision: string;
  phiAreaId: string;
  geoPoint?: GeoPoint;
  
  // Enrollment
  totalStudents: number;
  totalMale: number;
  totalFemale: number;
  
  // Grades available
  gradeRange: string;         // e.g., "1-13"
  isPirivena: boolean;        // Buddhist school
  isPreschool: boolean;
  
  // Principal