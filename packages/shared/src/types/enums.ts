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
export enum PermitStatus {
  APPLIED = 'APPLIED',
  INSPECTION_SCHEDULED = 'INSPECTION_SCHEDULED',
  INSPECTED = 'INSPECTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  ISSUED = 'ISSUED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

/** Enforcement notice types */
export enum NoticeType {
  IMPROVEMENT = 'IMPROVEMENT',   // 7-day compliance
  CLOSURE = 'CLOSURE',           // Immediate
  WARNING = 'WARNING',
  COURT_SUMMONS = 'COURT_SUMMONS',
}

/** Notifiable disease groups (Epid Unit) */
export enum DiseaseGroup {
  GROUP_A = 'GROUP_A', // International quarantine (Cholera, Yellow Fever, Plague)
  GROUP_B = 'GROUP_B', // National notifiable
}

/** School grades targeted for medical inspection */
export enum TargetedSchoolGrade {
  GRADE_1 = 1,
  GRADE_4 = 4,
  GRADE_7 = 7,
  GRADE_10 = 10,
}

/** School vaccine types */
export enum SchoolVaccineType {
  HPV = 'HPV',          // Girls Grade 6, 2 doses 6 months apart
  AP_DT = 'AP_DT',      // Grade 7, 1 dose
  MEBENDAZOLE = 'MEBENDAZOLE',  // Twice yearly
  IRON_VIT_C = 'IRON_VIT_C',     // 24-month cycle Grades 5-9 girls
}

/** Factory size classification */
export enum FactoryScale {
  SMALL = 'SMALL',     // Sulu Paimana: <50 workers
  MEDIUM = 'MEDIUM',   // Madya Paimana: 50-250 workers
  LARGE = 'LARGE',     // Mahapaimana: 250+ workers
}

/** Supported UI languages */
export enum Language {
  EN = 'EN',
  SI = 'SI',
  TA = 'TA',
}

/** System alert / notification type */
export enum AlertType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  SUCCESS = 'SUCCESS',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

/** Priority levels */
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/** Geographic area type (H795 survey) */
export enum AreaType {
  URBAN = 'URBAN',
  SEMI_URBAN = 'SEMI_URBAN',
  RURAL = 'RURAL',
  ESTATE = 'ESTATE',
}

/** Payment status for permits */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  WAIVED = 'WAIVED',
}

/** Offline sync status */
export enum SyncStatus {
  SYNCED = 'SYNCED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  CONFLICT = 'CONFLICT',
}
