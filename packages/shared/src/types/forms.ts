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

/** Base form shared by all domain-specific forms */
export interface BaseForm {
  id: string;
  domain: PHIDomain;
  status: InspectionStatus;
  syncStatus: SyncStatus;

  // Ownership & workflow
  createdBy: string;       // PHI uid
  assignedTo?: string;     // PHI uid
  reviewedBy?: string;     // SPHI uid
  approvedBy?: string;     // MOH uid

  // Timestamps
  createdAt: string;       // ISO 8601
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;

  // Location context
  mohArea?: string;
  phiArea?: string;
  gnDivision?: string;

  // Attachments
  photos?: PhotoAttachment[];
  signatures?: {
    inspector?: string;    // base64 or Storage URL
    owner?: string;
  };

  // Notes
  remarks?: string;
  internalNotes?: string;

  // Offline sync
  localId?: string;        // local device ID
  deviceId?: string;
  lastSyncedAt?: string;
}

/** Form list item (lightweight, for list views) */
export interface FormListItem {
  id: string;
  formCode: string;
  domain: PHIDomain;
  status: InspectionStatus;
  syncStatus: SyncStatus;
  title: string;           // display title
  subtitle?: string;       // secondary description
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/** Workflow action on a form (approve, reject, etc.) */
export interface FormWorkflowAction {
  id: string;
  formId: string;
  action: 'submit' | 'review' | 'approve' | 'reject' | 'return' | 'archive';
  performedBy: string;
  performedAt: string;
  comment?: string;
  previousStatus: InspectionStatus;
  newStatus: InspectionStatus;
}

/** Digital signature capture */
export interface DigitalSignature {
  signedBy: string;
  signedAt: string;        // ISO 8601
  signatureData: string;   // base64 or Storage URL
  role: string;            // e.g. 'inspector', 'owner', 'supervisor'
}
