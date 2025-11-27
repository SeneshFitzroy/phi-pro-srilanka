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