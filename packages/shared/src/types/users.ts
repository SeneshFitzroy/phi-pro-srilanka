// ============================================================================
// User & Auth Types
// ============================================================================
import {
  UserRole,
  AccountStatus,
  Language,
  PHIDomain,
} from './enums';

/** Base timestamp fields for all Firestore documents */
export interface BaseDocument {
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  createdBy: string; // userId
}

/** GN Division reference (smallest geographic unit) */
export interface GNDivision {
  gnCode: string;          // e.g., "547A"
  gnName: string;
  gnNameSi: string;
  gnNameTa: string;
  dsDiv: string;           // Divisional Secretariat
  district: string;
  province: string;
  mohArea: string;
  phiArea: string;
  population?: number;
  householdCount?: number;
  areaSquareKm?: number;
}

/** PHI Area containing multiple GN Divisions */
export interface PHIArea {
  phiAreaId: string;
  phiAreaName: string;
  mohAreaId: string;
  gnDivisions: string[];   // GN codes
  assignedPhiId: string;
  supervisingPhiId: string;
}