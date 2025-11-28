// ============================================================================
// Common / Shared Form Types
// ============================================================================
import {
  InspectionStatus,
  SyncStatus,
  PHIDomain,
} from './enums';

/** GPS coordinates for geotagging */
export interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;       // metres
  altitude?: number;
  timestamp: string;       // ISO 8601