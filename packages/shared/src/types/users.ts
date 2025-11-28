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

/** User profile stored in Firestore */
export interface UserProfile extends BaseDocument {
  uid: string;             // Firebase Auth UID
  email: string;
  displayName: string;
  nameInSinhala?: string;
  nameInTamil?: string;
  role: UserRole;
  status: AccountStatus;
  phone?: string;
  nic?: string;            // National Identity Card
  avatarUrl?: string;
  preferredLanguage: Language;
  
  // Role-specific
  phiArea?: PHIArea;               // PHI
  assignedPHIAreas?: string[];      // SPHI: multiple PHI areas
  mohAreaId?: string;               // MOH Admin
  domains?: PHIDomain[];            // Enabled domains
  
  // Security
  lastLoginAt?: string;
  deviceTokens?: string[];          // FCM tokens for push notifications
  failedLoginAttempts?: number;
}

/** Public user (anonymous or registered complaint submitter) */
export interface PublicUser {
  sessionId?: string;
  language: Language;
  location?: { lat: number; lng: number };
}

/** Authentication state */
export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
