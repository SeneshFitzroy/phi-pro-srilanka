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

/** Digital signature */
export interface DigitalSignature {
  signedBy: string;        // userId
  signedByName: string;
  signedAt: string;
  signatureDataUrl: string; // base64 PNG
  role: string;
}

/** Base form across all 5 domains */
export interface BaseForm {
  id: string;
  formCode: string;        // e.g., "H800", "H1214"
  domain: PHIDomain;
  title: string;
  
  // PHI info
  phiId: string;
  phiName: string;
  phiAreaId: string;
  gnDivisionCode?: string;
  
  // Status
  status: InspectionStatus;
  syncStatus: SyncStatus;
  
  // Timestamps
  inspectionDate: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  
  // Attachments
  photos: PhotoAttachment[];
  signatures: DigitalSignature[];
  
  // Offline
  localId?: string;        // for offline-first
  lastSyncedAt?: string;
  version: number;         // optimistic concurrency
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/** Monthly report summary */
export interface MonthlyReportSummary {
  year: number;
  month: number; // 1-12
  phiId: string;
  phiAreaId: string;
  domain: PHIDomain;
  totalInspections: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  submittedAt?: string;
  dueDate: string;         // 5th of next month
}
