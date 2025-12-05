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