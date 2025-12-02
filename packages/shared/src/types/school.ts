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
  principalName?: string;
  principalPhone?: string;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// H1046 – School Medical Examination Record of Health Problems
// ---------------------------------------------------------------------------

/** Individual student health examination record */
export interface StudentHealthRecord {
  id: string;
  studentId?: string;
  studentName: string;
  dateOfBirth?: string;
  gender: 'M' | 'F';
  grade: number;
  className?: string;
  
  // Measurements
  heightCm: number;
  weightKg: number;
  bmi: number;               // auto-calculated: kg/m²
  bmiCategory: 'UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE';
  
  // Medical checks
  visionLeft?: string;       // e.g., "6/6"
  visionRight?: string;
  colorBlindness: boolean;
  squint: boolean;
  dentalCaries: boolean;
  oralHygieneScore?: number; // 1-5
  goiterCheck: boolean;
  pallor: boolean;            // anemia indicator
  skinCondition?: string;
  hairCondition?: string;
  
  // Defects found
  defectsFound: StudentDefect[];
  
  // Referral
  referralIssued: boolean;
  referralType?: string;      // e.g., "Eye Hospital", "Dental", "MOH Clinic"
  referralDate?: string;
  referralFollowUpDate?: string;
  referralOutcome?: string;
  
  // Parent
  parentConsentGiven: boolean;
  parentName?: string;
  parentPhone?: string;
}

/** Student health defect tracking */
export interface StudentDefect {
  defectType: string;         // e.g., "Anemia", "Vision", "Dental Caries", "Malnutrition"
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  detectedDate: string;
  referredTo?: string;
  followUpDate?: string;
  resolved: boolean;
  resolvedDate?: string;
  notes?: string;
}

/** H1046 form – batch of student records for a school visit */
export interface SchoolMedicalExamForm extends BaseForm {
  formCode: 'H1046';
  schoolId: string;
  schoolName: string;
  targetGrade: TargetedSchoolGrade;
  examDate: string;
  
  // Summary counts
  totalExamined: number;
  totalMale: number;
  totalFemale: number;
  
  // Defect summary
  anemiaCount: number;
  visionDefectCount: number;
  dentalCariesCount: number;
  malnutritionCount: number;
  otherDefectsCount: number;
  
  // Referral summary
  totalReferrals: number;
  
  // Individual records
  studentRecords: StudentHealthRecord[];