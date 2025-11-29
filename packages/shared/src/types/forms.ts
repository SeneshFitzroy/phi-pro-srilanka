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
}

/** Photo attachment with geotag */
export interface PhotoAttachment {
  id: string;
  uri: string;             // local or Storage URL
  thumbnailUri?: string;
  geoPoint?: GeoPoint;
  capturedAt: string;
  annotation?: string;     // photo markup text
  annotationData?: string; // JSON for canvas annotations
  mimeType: string;
  sizeBytes: number;
}
