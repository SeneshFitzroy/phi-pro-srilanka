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
  propertyAddress: string;
  gnDivision: string;
  phiAreaId: string;
  mohAreaId: string;
  geoPoint?: GeoPoint;
  
  // Application details
  description: string;
  documents: PermitDocument[];
  
  // Inspection
  inspectionScheduledDate?: string;
  inspectedByPhiId?: string;
  inspectionDate?: string;
  inspectionReport?: string;
  inspectionPhotos?: PhotoAttachment[];
  inspectionPassed?: boolean;
  
  // Approval
  status: PermitStatus;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  
  // Payment
  feeAmount: number;             // LKR
  paymentId?: string;
  paymentStatus: PaymentStatus;
  
  // Certificate
  certificateNo?: string;
  issuedDate?: string;
  expiryDate?: string;
  signatures?: DigitalSignature[];
  qrCodeData?: string;
  
  createdAt: string;
  updatedAt: string;
}
