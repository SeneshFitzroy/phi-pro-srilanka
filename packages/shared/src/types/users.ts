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