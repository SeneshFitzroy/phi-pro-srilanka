// ============================================================================
// PHI-PRO Core Enumerations
// ============================================================================

/** User roles in the PHI-PRO system */
export enum UserRole {
  PUBLIC = 'PUBLIC',
  PHI = 'PHI',
  SPHI = 'SPHI',
  MOH_ADMIN = 'MOH_ADMIN',
}

/** Account status */
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  DEACTIVATED = 'DEACTIVATED',
}

/** The 5 core PHI workflow domains */
export enum PHIDomain {
  FOOD_SAFETY = 'FOOD_SAFETY',
  SCHOOL_HEALTH = 'SCHOOL_HEALTH',
  EPIDEMIOLOGY = 'EPIDEMIOLOGY',
  OCCUPATIONAL_HEALTH = 'OCCUPATIONAL_HEALTH',
  ADMINISTRATION = 'ADMINISTRATION',
}

/** Food premises risk classification */
export enum FoodRiskLevel {
  HIGH = 'HIGH',       // Quarterly inspection
  MEDIUM = 'MEDIUM',   // Biannual inspection
  LOW = 'LOW',         // Annual inspection
}

/** Food hygiene grade (H800 100-mark system) */
export enum FoodHygieneGrade {
  A = 'A', // 90-100
  B = 'B', // 75-89
  C = 'C', // <75
}

/** Inspection workflow status */
export enum InspectionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUIRES_FOLLOWUP = 'REQUIRES_FOLLOWUP',
}

/** Complaint status lifecycle */
export enum ComplaintStatus {
  RECEIVED = 'RECEIVED',
  ASSIGNED = 'ASSIGNED',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  ACTION_TAKEN = 'ACTION_TAKEN',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  ESCALATED = 'ESCALATED',
}

/** Permit types managed by MOH */
export enum PermitType {
  SEPTIC_TANK = 'SEPTIC_TANK',
  WELL_CONSTRUCTION = 'WELL_CONSTRUCTION',
  FOOD_PREMISES = 'FOOD_PREMISES',
  TRADE_LICENSE_HEALTH = 'TRADE_LICENSE_HEALTH',
  CONSTRUCTION_HEALTH = 'CONSTRUCTION_HEALTH',
}

/** Permit status lifecycle */