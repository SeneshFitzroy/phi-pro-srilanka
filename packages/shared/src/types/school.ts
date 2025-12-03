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
}

// ---------------------------------------------------------------------------
// H1214 – Summary of School Medical Inspection (Monthly)
// ---------------------------------------------------------------------------

export interface SchoolInspectionSummary extends BaseForm {
  formCode: 'H1214';
  
  // Report period
  year: number;
  month: number;
  
  // One entry per school
  schoolSummaries: SchoolSummaryEntry[];
  
  // Area totals
  areaTotal: {
    totalSchoolsVisited: number;
    totalStudentsExamined: number;
    totalMale: number;
    totalFemale: number;
    totalDefectsFound: number;
    totalReferrals: number;
    anemiaTotal: number;
    visionTotal: number;
    dentalTotal: number;
    malnutritionTotal: number;
  };
}

export interface SchoolSummaryEntry {
  schoolId: string;
  schoolName: string;
  gradeInspected: TargetedSchoolGrade;
  totalExamined: number;
  male: number;
  female: number;
  defectsFound: number;
  referralsIssued: number;
  followUpsCompleted: number;
}

// ---------------------------------------------------------------------------
// H1015 – School Health Survey (WASH & Environment)
// ---------------------------------------------------------------------------

export interface SchoolHealthSurvey extends BaseForm {
  formCode: 'H1015';
  schoolId: string;
  schoolName: string;
  surveyDate: string;
  
  // Student count
  totalStudents: number;
  totalMale: number;
  totalFemale: number;
  
  // WASH Assessment
  wash: {
    totalToilets: number;
    maleToilets: number;
    femaleToilets: number;
    toiletWaterAvailable: boolean;
    toiletCleanliness: number;    // 1-5
    drinkingWaterAvailable: boolean;
    drinkingWaterSafe: boolean;
    handwashStations: number;
    soapAvailable: boolean;
    washScore: number;            // auto-calculated
  };
  
  // Classroom environment
  classroom: {
    ventilationAdequate: boolean;
    lightingAdequate: boolean;
    desksAdequate: boolean;
    overcrowding: boolean;
    classroomCleanliness: number; // 1-5
  };
  
  // General campus
  campus: {
    playgroundAvailable: boolean;
    wasteDisposal: boolean;
    pestIssues: boolean;
    canteenHygiene?: number;      // 1-5
    firstAidKit: boolean;
  };
  
  overallScore: number;
  recommendations: string[];
}

// ---------------------------------------------------------------------------
// H1014 – Monthly Statement of School Health Activities
// ---------------------------------------------------------------------------

export interface SchoolHealthActivities extends BaseForm {
  formCode: 'H1014';
  year: number;
  month: number;
  
  activities: SchoolActivity[];
  
  totalSchoolVisits: number;
  totalTrainingSessions: number;
  totalFollowUps: number;
  totalHomeVisits: number;
}

export interface SchoolActivity {
  date: string;
  schoolId?: string;
  schoolName?: string;
  activityType: 'VISIT' | 'TRAINING' | 'FOLLOW_UP' | 'HOME_VISIT' | 'VACCINATION' | 'OTHER';
  description: string;
  outcome?: string;
  attendees?: number;
}

// ---------------------------------------------------------------------------
// H1247 – Vaccination & Consent
// ---------------------------------------------------------------------------

export interface SchoolVaccinationForm extends BaseForm {
  formCode: 'H1247';
  schoolId: string;
  schoolName: string;
  vaccineType: SchoolVaccineType;
  targetGrade: number;
  
  // Vaccination records
  vaccinationRecords: VaccinationRecord[];
  
  // Summary
  totalEligible: number;
  totalConsented: number;
  totalVaccinated: number;
  totalAbsent: number;
  totalRefused: number;
  doseNumber: number;         // For HPV: 1 or 2
}

export interface VaccinationRecord {
  studentId?: string;
  studentName: string;
  gender: 'M' | 'F';
  parentConsentGiven: boolean;
  consentDate?: string;
  vaccinated: boolean;
  vaccinationDate?: string;
  batchNo?: string;
  reason?: string;            // if not vaccinated
}
