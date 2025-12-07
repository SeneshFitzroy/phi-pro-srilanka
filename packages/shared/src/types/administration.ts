// ============================================================================
// Administration Types (H795, H796, PHI-1, H1200, Spot Maps)
// ============================================================================
import { BaseForm, GeoPoint } from './forms';
import { AreaType } from './enums';

// ---------------------------------------------------------------------------
// H795 – GN Division Area Measurement Form
// ---------------------------------------------------------------------------

export interface GNAreaMeasurementForm extends BaseForm {
  formCode: 'H795';
  gnCode: string;
  gnName: string;
  gnNameSi: string;
  gnNameTa?: string;
  
  // Geographic
  areaType: AreaType;
  areaSquareKm: number;
  boundaryDescription?: string;
  geoPoints?: GeoPoint[];       // boundary polygon
  
  // Population
  estimatedPopulation: number;   // census projection
  actualPopulation: number;      // field count
  householdCount: number;
  malePopulation: number;
  femalePopulation: number;
  
  // Demographics
  populationDensity: number;     // per sq km
  growthRate?: number;           // % 5-year
  urbanRuralSplit?: string;
  
  // Notes
  specialNotes?: string;
  lastRevisedDate: string;
}

// ---------------------------------------------------------------------------
// H796 – Public Health Statistics Form (5-Year Historical)
// ---------------------------------------------------------------------------

export interface PublicHealthStatisticsForm extends BaseForm {
  formCode: 'H796';
  phiAreaId: string;
  
  // 5-year data
  historicalData: YearlyStatEntry[];
  
  // Vital stats (current)
  currentYear: number;
  birthRate: number;
  deathRate: number;
  infantMortalityRate?: number;
  
  // Disease trends (Group A & B)
  diseaseStats: DiseaseStatEntry[];
  
  // Facility trends
  facilityStats: FacilityStatEntry[];
}

export interface YearlyStatEntry {
  year: number;
  population: number;