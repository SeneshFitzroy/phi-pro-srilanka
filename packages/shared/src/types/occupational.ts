// ============================================================================
// Occupational Health & Safety Types (H1203, H1204, H1205, OHS Checklist)
// ============================================================================
import { BaseForm, GeoPoint, PhotoAttachment } from './forms';
import { FactoryScale, NoticeType } from './enums';

// ---------------------------------------------------------------------------
// Factory Profile
// ---------------------------------------------------------------------------

export interface FactoryProfile {
  id: string;
  factoryName: string;
  factoryNameSi?: string;
  registrationNo?: string;       // Factories Ordinance reg.
  ownerName: string;
  ownerNic?: string;
  ownerPhone?: string;
  address: string;
  gnDivision: string;
  phiAreaId: string;
  geoPoint?: GeoPoint;
  
  // Classification
  scale: FactoryScale;
  industryType: string;          // e.g., "Garment", "Tea Processing", "Food Manufacturing"
  totalWorkers: number;
  maleWorkers: number;
  femaleWorkers: number;
  
  // Compliance
  factoriesOrdinanceLicense: boolean;
  lastInspectionDate?: string;
  isActive: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// H1203 – Factory Health Inspection Report
// ---------------------------------------------------------------------------

export interface FactoryHealthInspection extends BaseForm {
  formCode: 'H1203';
  factoryId: string;
  factoryName: string;
  factoryScale: FactoryScale;
  industryType: string;
  totalWorkers: number;
  
  // Sanitation & Facilities
  sanitation: {
    toiletsMale: number;
    toiletsFemale: number;
    toiletsClean: boolean;
    waterSupplyAdequate: boolean;
    washingStations: number;
    drinkingWaterSafe: boolean;
    sanitationScore: number;     // 1-10
  };
  
  // Welfare
  welfare: {
    firstAidKit: boolean;
    firstAidTrained: number;
    canteenAvailable: boolean;
    canteenHygiene?: number;     // 1-5
    restAreaAvailable: boolean;
    crecheAvailable: boolean;    // For women workers
    welfareScore: number;        // 1-10
  };
  
  // Environmental Health
  environmental: {
    noiseLevel: string;          // e.g., "<85dB" or measurement
    noiseLevelSafe: boolean;
    vibrationSafe: boolean;
    lightingAdequate: boolean;
    temperatureAdequate: boolean;
    temperatureReading?: string;
    ventilationAdequate: boolean;
    dustExposure: boolean;
    chemicalExposure: boolean;
    chemicalDetails?: string;
    biologicalHazards: boolean;
    environmentalScore: number;  // 1-10
  };
  
  // Safety
  safety: {
    machineryGuards: boolean;
    ppeAvailable: boolean;
    ppeUsed: boolean;
    fireExtinguishers: boolean;
    fireExits: boolean;
    emergencyPlan: boolean;
    childLaborAbsent: boolean;   // Must be true
    safetyScore: number;         // 1-10
  };
  
  // Overall
  overallScore: number;          // aggregate
  overallCompliance: boolean;
  
  // Enforcement
  noticeIssued?: NoticeType;
  noticeDetails?: string;
  followUpDate?: string;
  improvementItems?: string[];
  criticalHazards?: string[];
}

// ---------------------------------------------------------------------------
// H1204 – Factory Safety Report
// ---------------------------------------------------------------------------

export interface FactorySafetyReport extends BaseForm {
  formCode: 'H1204';
  factoryId: string;
  factoryName: string;
  
  // Machinery safety
  machinerySafety: MachineryCheck[];
  
  // PPE compliance
  ppeCompliance: {
    helmets: boolean;
    gloves: boolean;
    goggles: boolean;
    earProtection: boolean;
    masks: boolean;
    safetyShoes: boolean;
    otherPPE?: string;
    overallPPECompliance: number; // percentage
  };
  
  // Fire safety
  fireSafety: {
    extinguishersCount: number;
    extinguishersServiced: boolean;
    fireExitsCount: number;
    fireExitsClear: boolean;
    evacuationPlanDisplayed: boolean;
    lastDrillDate?: string;
  };
  
  // Accident log
  recentAccidents: AccidentRecord[];
  
  overallSafetyScore: number;
  recommendations: string[];
}

export interface MachineryCheck {
  machineName: string;
  location: string;
  guardPresent: boolean;
  safetySwitch: boolean;
  condition: 'GOOD' | 'FAIR' | 'POOR' | 'DANGEROUS';
  notes?: string;
}

export interface AccidentRecord {
  date: string;
  description: string;
  severity: 'MINOR' | 'MODERATE' | 'SERIOUS' | 'FATAL';
  workersAffected: number;
  actionTaken: string;
  notifiedToDoL: boolean;       // Department of Labour
  reportedWithin24hrs: boolean;
}

// ---------------------------------------------------------------------------
// H1205 – Worker Health Survey
// ---------------------------------------------------------------------------

export interface WorkerHealthSurvey extends BaseForm {
  formCode: 'H1205';
  factoryId: string;
  factoryName: string;
  surveyDate: string;
  
  // Worker demographics
  totalWorkersSurveyed: number;
  maleSurveyed: number;
  femaleSurveyed: number;
  
  // Health checks
  healthChecks: WorkerHealthCheck[];
  
  // Training
  trainingRecords: WorkerTraining[];
  
  // Common issues found
  commonIssues: string[];
  referralsMade: number;
  followUpRequired: number;
}

export interface WorkerHealthCheck {
  workerId?: string;
  workerName: string;
  gender: 'M' | 'F';
  ageGroup: string;
  department: string;
  healthStatus: 'FIT' | 'REQUIRES_FOLLOWUP' | 'REQUIRES_TREATMENT';
  conditionsFound?: string[];
  referralIssued: boolean;
  notes?: string;
}

export interface WorkerTraining {
  trainingDate: string;
  topic: string;
  attendees: number;
  trainerName: string;
}

// ---------------------------------------------------------------------------
// OHS Checklist (EOHFS)
// ---------------------------------------------------------------------------

export interface OHSChecklist extends BaseForm {
  formCode: 'OHS_CHECKLIST';
  factoryId: string;
  factoryName: string;
  
  items: OHSChecklistItem[];
  
  totalItems: number;
  compliantItems: number;
  nonCompliantItems: number;
  compliancePercentage: number;
}

export interface OHSChecklistItem {
  category: string;           // e.g., "Noise", "Lighting", "Temperature"
  itemDescription: string;
  standard: string;           // e.g., "<85dB", "<30°C"
  measurement?: string;       // actual measurement
  isCompliant: boolean;
  notes?: string;
  photo?: PhotoAttachment;
}
