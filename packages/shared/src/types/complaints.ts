// ============================================================================
// Complaint Types
// ============================================================================
import { ComplaintStatus, Priority } from './enums';
import { GeoPoint, PhotoAttachment } from './forms';

/** Public complaint submission */
export interface Complaint {
  id: string;
  referenceNo: string;          // Auto-generated e.g., "CMP-2026-001234"
  
  // Complainant (anonymous allowed)
  isAnonymous: boolean;
  complainantName?: string;
  complainantPhone?: string;
  complainantEmail?: string;
  
  // Complaint details
  category: ComplaintCategory;
  subject: string;
  description: string;
  location?: string;
  gnDivision?: string;
  geoPoint?: GeoPoint;
  photos?: PhotoAttachment[];
  
  // Target (if known)
  targetPremisesName?: string;
  targetPremisesAddress?: string;
  targetPremisesId?: string;
  
  // Routing
  mohAreaId: string;
  assignedPhiId?: string;
  assignedDate?: string;
  
  // Status
  status: ComplaintStatus;
  priority: Priority;
  
  // Investigation
  investigationNotes?: string;
  actionTaken?: string;
  inspectionFormId?: string;    // Linked inspection form
  
  // Resolution
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionSummary?: string;
  complainantNotified: boolean;
  satisfaction?: number;        // 1-5 rating
  
  createdAt: string;
  updatedAt: string;
}

/** Complaint categories */
export type ComplaintCategory =
  | 'FOOD_HYGIENE'
  | 'FOOD_ADULTERATION'
  | 'WATER_POLLUTION'
  | 'NOISE_POLLUTION'
  | 'VECTOR_BREEDING'
  | 'WASTE_MANAGEMENT'
  | 'UNSANITARY_PREMISES'
  | 'ILLEGAL_CONSTRUCTION'
  | 'OCCUPATIONAL_HAZARD'
  | 'OTHER';