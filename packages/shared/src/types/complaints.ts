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