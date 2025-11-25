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