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
  floorsCondition: number;      // 0-5
  ceilingCondition: number;     // 0-5
  ventilation: number;          // 0-5
  lighting: number;             // 0-5
  pestProofing: number;         // 0-5
  notes?: string;
}

/** H800 Personal Hygiene section */
export interface H800HygieneChecks {
  staffUniforms: number;        // 0-5
  handWashing: number;          // 0-5
  healthCertificates: number;   // 0-5
  personalCleanliness: number;  // 0-5
  notes?: string;
}

/** H800 Food Handling section */
export interface H800FoodHandling {
  coldStorage: number;          // 0-5 (temp <5°C)
  hotHolding: number;           // 0-5 (temp >60°C)
  crossContamination: number;   // 0-5
  rawCookedSeparation: number;  // 0-5
  dateLabeling: number;         // 0-5
  notes?: string;
}

/** H800 Equipment section */
export interface H800Equipment {
  cleanliness: number;          // 0-5
  calibration: number;          // 0-5
  condition: number;            // 0-5
  rustFree: number;             // 0-5
  notes?: string;
}

/** H800 Waste & Sanitation section */
export interface H800WasteSanitation {
  wasteDisposal: number;        // 0-5
  drainageSystem: number;       // 0-5
  toiletAccess: number;         // 0-5
  binCondition: number;         // 0-5
  notes?: string;
}

/** H800 Documentation section */
export interface H800Documentation {
  supplierRecords: number;      // 0-5
  pestControlLog: number;       // 0-5
  cleaningSchedule: number;     // 0-5
  staffTraining: number;        // 0-5
  notes?: string;
}

/** Complete H800 Food Premises Inspection Form */
export interface FoodInspectionForm extends BaseForm {
  formCode: 'H800';
  
  // Premises info
  premisesId: string;
  premisesName: string;
  premisesNameSi?: string;
  ownerName: string;
  ownerNic?: string;
  address: string;
  gnDivision: string;
  riskLevel: FoodRiskLevel;
  registrationNo?: string;
  
  // Location
  geoPoint?: GeoPoint;
  
  // Scoring sections (100-mark system)
  premises: H800PremisesChecks;
  hygiene: H800HygieneChecks;
  foodHandling: H800FoodHandling;
  equipment: H800Equipment;
  wasteSanitation: H800WasteSanitation;
  documentation: H800Documentation;
  
  // Auto-calculated
  totalScore: number;          // 0-100
  grade: FoodHygieneGrade;     // A/B/C
  previousGrade?: FoodHygieneGrade;
  
  // Enforcement
  noticeIssued?: NoticeType;
  noticeDetails?: string;
  followUpDate?: string;
  courtSummonsRef?: string;
  
  // Compliance
  improvementItems?: string[];
  criticalViolations?: string[];
}

// ---------------------------------------------------------------------------
// H801 – Food Premises Registration
// ---------------------------------------------------------------------------

export interface FoodPremisesRegistration {
  id: string;
  registrationNo: string;
  premisesName: string;
  premisesNameSi?: string;
  ownerName: string;
  ownerNic: string;
  ownerPhone?: string;
  ownerEmail?: string;
  address: string;
  gnDivision: string;
  phiAreaId: string;
  foodType: string;          // e.g., "Restaurant", "Bakery", "Grocery"
  foodTypeDetail?: string;
  riskLevel: FoodRiskLevel;
  registeredDate: string;
  expiryDate: string;        // valid 1 year
  certificateNo?: string;
  geoPoint?: GeoPoint;
  isActive: boolean;
  lastInspectionDate?: string;
  lastGrade?: FoodHygieneGrade;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// H802 – Food Sample Submission
// ---------------------------------------------------------------------------

export interface FoodSampleSubmission {
  id: string;
  sampleRefNo: string;
  premisesId: string;
  premisesName: string;
  phiId: string;
  phiAreaId: string;
  
  // Sample details
  sampleType: string;        // e.g., "Milk", "Oil", "Spices"
  sampleDescription: string;
  collectionDate: string;
  collectionMethod: 'RANDOM' | 'COMPLAINT_BASED' | 'ROUTINE';
  
  // Lab info
  sentToLab: string;         // Usually "MRI" (Medical Research Institute)
  sentDate: string;
  labRefNo?: string;
  resultReceived: boolean;
  resultDate?: string;
  resultSummary?: string;
  adulterantFound?: string;
  isCompliant: boolean | null;
  
  // Actions
  enforcementAction?: NoticeType;
  notes?: string;
  photos: PhotoAttachment[];
  
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// H803 – Food Inspection Calendar / Schedule
// ---------------------------------------------------------------------------

export interface FoodInspectionSchedule {
  id: string;
  phiId: string;
  phiAreaId: string;
  premisesId: string;
  premisesName: string;
  riskLevel: FoodRiskLevel;
  scheduledDate: string;
  scheduledTime?: string;
  inspectionType: 'ROUTINE' | 'FOLLOW_UP' | 'COMPLAINT' | 'RE_INSPECTION';
  isCompleted: boolean;
  completedInspectionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
