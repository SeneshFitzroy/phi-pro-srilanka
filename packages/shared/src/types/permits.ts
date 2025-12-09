// ============================================================================
// Permit & Payment Types
// ============================================================================
import { PermitType, PermitStatus, PaymentStatus } from './enums';
import { GeoPoint, PhotoAttachment, DigitalSignature } from './forms';

/** Permit application */
export interface PermitApplication {
  id: string;
  permitNo: string;              // Auto-generated
  permitType: PermitType;
  
  // Applicant
  applicantName: string;
  applicantNic: string;
  applicantPhone: string;
  applicantEmail?: string;
  applicantAddress: string;
  
  // Property / Location