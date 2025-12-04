// ============================================================================
// Epidemiology Types (H399, H411, Health 160, SIV, IDSR)
// ============================================================================
import { BaseForm, GeoPoint, PhotoAttachment } from './forms';
import { DiseaseGroup, Priority } from './enums';

// ---------------------------------------------------------------------------
// Notifiable Disease Reference
// ---------------------------------------------------------------------------

export interface NotifiableDisease {
  code: string;
  nameEn: string;
  nameSi: string;
  nameTa: string;
  group: DiseaseGroup;
  mandatoryInvestigation: boolean;
  investigationTimelineHours: number;  // e.g., 48
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Health 160 – Suspect Notification Card
// ---------------------------------------------------------------------------

export interface NotificationCard {
  id: string;
  cardNo: string;                 // Health 160 reference
  
  // Source
  sourceType: 'HOSPITAL' | 'COMMUNITY' | 'WORKPLACE' | 'SCHOOL';
  sourceName: string;             // Hospital/clinic name
  sourceAddress?: string;
  notifiedBy: string;             // Doctor/officer name
  notifiedDate: string;
  
  // Patient
  patientName?: string;
  patientAge?: number;
  patientGender?: 'M' | 'F';
  patientAddress?: string;
  patientGN?: string;
  patientPhone?: string;
  
  // Disease
  suspectedDiseaseCode: string;
  suspectedDiseaseName: string;
  symptoms: string[];
  onsetDate?: string;
  
  // Routing
  mohAreaId: string;
  assignedPhiId?: string;
  assignedDate?: string;
  investigationDeadline?: string;  // 48hr from notification
  
  // Status
  isInvestigated: boolean;
  investigationFormId?: string;   // Link to SIV form
  
  geoPoint?: GeoPoint;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// SIV – Special Investigation Form
// ---------------------------------------------------------------------------

export interface SpecialInvestigationForm extends BaseForm {
  formCode: 'SIV';
  notificationCardId: string;
  
  // Patient details
  patientName: string;
  patientNic?: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  patientAddress: string;
  patientGN: string;
  patientPhone?: string;
  workplace?: string;
  
  // Disease details
  diseaseCode: string;
  diseaseName: string;
  diseaseGroup: DiseaseGroup;
  symptomsObserved: string[];
  onsetDate: string;
  diagnosisDate?: string;
  
  // Investigation
  investigationDate: string;
  investigationBy: string;        // PHI name
  travelHistory?: string;
  contactsList: ContactPerson[];
  foodWaterHistory?: string;
  possibleSource?: string;
  
  // Environmental check
  environmentalChecks: EnvironmentalCheck[];
  breedingSitesFound?: number;    // For dengue
  waterContainersChecked?: number;
  
  // Location / mapping
  caseGeoPoint?: GeoPoint;
  spotMapUpdated: boolean;
  clusterIdentified: boolean;