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
  births: number;
  deaths: number;
  birthRate: number;
  deathRate: number;
  householdCount: number;
  
  // Communicable
  totalCommunicableCases: number;
  dengueCount: number;
  typhoidCount: number;
  leptospirosisCount: number;
  
  // Food safety
  foodPremisesInspected: number;
  gradeACount: number;
  gradeBCount: number;
  gradeCCount: number;
  
  // School
  studentsExamined: number;
  defectsFound: number;
  
  // OHS
  factoriesInspected: number;
  accidentsReported: number;
}

export interface DiseaseStatEntry {
  diseaseCode: string;
  diseaseName: string;
  year1Count: number;
  year2Count: number;
  year3Count: number;
  year4Count: number;
  year5Count: number;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
}

export interface FacilityStatEntry {
  facilityType: string;       // e.g., "Restaurants", "Schools", "Factories"
  year1Count: number;
  year2Count: number;
  year3Count: number;
  year4Count: number;
  year5Count: number;
}

// ---------------------------------------------------------------------------
// PHI-1 – PHI Monthly Report Form
// ---------------------------------------------------------------------------

export interface PHIMonthlyReport extends BaseForm {
  formCode: 'PHI-1';
  year: number;
  month: number;
  
  // Food Safety Summary
  foodSafety: {
    premisesInspected: number;
    gradeA: number;
    gradeB: number;
    gradeC: number;
    newRegistrations: number;
    samplesTaken: number;
    noticesIssued: number;
    courtCases: number;
    followUpsCompleted: number;
  };
  
  // School Health Summary
  schoolHealth: {
    schoolsVisited: number;
    studentsExamined: number;
    defectsFound: number;
    referralsIssued: number;
    vaccinationsGiven: number;
    homeVisits: number;
    trainingSessions: number;
  };
  
  // Epidemiology Summary
  epidemiology: {
    notificationsReceived: number;
    investigationsCompleted: number;
    investigationsWithin48hrs: number;
    outbreaksIdentified: number;
    quarantinesIssued: number;
    immunizationsConducted: number;
  };
  
  // Occupational Health Summary
  occupationalHealth: {
    factoriesInspected: number;
    workersExamined: number;
    hazardsIdentified: number;
    noticesIssued: number;
    accidentsReported: number;
    trainingsSessions: number;
  };
  
  // Administration
  administration: {
    gnVisits: number;
    mapsUpdated: number;
    reportsCompiled: number;
    meetingsAttended: number;
    permitsProcessed: number;
    complaintsHandled: number;
  };
  
  // Overall
  totalWorkDays: number;
  totalFieldVisits: number;
  notes?: string;
}

// ---------------------------------------------------------------------------
// H1200 – Area Health Survey Form
// ---------------------------------------------------------------------------

export interface AreaHealthSurvey extends BaseForm {
  formCode: 'H1200';
  phiAreaId: string;
  year: number;
  
  // Vital stats
  births: number;
  deaths: number;
  infantDeaths: number;
  maternalDeaths: number;
  
  // Sanitary facilities
  sanitaryFacilities: {
    publicToiletsTotal: number;
    publicToiletsMale: number;
    publicToiletsFemale: number;
    safeWaterSources: number;
    unsafeWaterSources: number;
    potableWaterPercent: number;
  };
  
  // Facility counts
  facilities: {
    restaurants: number;
    hotels: number;
    bars: number;
    groceryStores: number;
    bakeries: number;
    meatShops: number;
    schools: number;
    pirivenas: number;
    preschools: number;
    factoriesSmall: number;
    factoriesMedium: number;
    factoriesLarge: number;
    privateHospitals: number;
    publicHospitals: number;
    pharmacies: number;
    welfareCenters: number;
    religiousPlaces: number;
    other: number;
  };
  
  // 5-year comparison
  previousYearData?: {
    year: number;
    births: number;
    deaths: number;
    totalFacilities: number;
  }[];
}

// ---------------------------------------------------------------------------
// Spot Map / GIS Layer
// ---------------------------------------------------------------------------

export interface SpotMapEntry {
  id: string;
  phiAreaId: string;
  gnDivision: string;
  entryType: 'DISEASE_CASE' | 'FOOD_PREMISES' | 'SCHOOL' | 'FACTORY' | 'TEMPLE' | 'COMPLAINT' | 'OTHER';
  label: string;
  description?: string;
  geoPoint: GeoPoint;
  color: string;              // hex color for pin
  icon?: string;
  metadata?: Record<string, unknown>;
  relatedFormId?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Activity / Task Tracking
// ---------------------------------------------------------------------------

export interface PHITask {
  id: string;
  title: string;
  description?: string;
  domain: string;
  assignedPhiId: string;
  assignedPhiName: string;
  dueDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  relatedFormId?: string;
  relatedFormCode?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}