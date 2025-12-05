// ============================================================================
// Occupational Health & Safety Types (H1203, H1204, H1205, OHS Checklist)
// ============================================================================
import { BaseForm, GeoPoint, PhotoAttachment } from './forms';
import { FactoryScale, NoticeType } from './enums';

// ---------------------------------------------------------------------------
// Factory Profile
// ---------------------------------------------------------------------------

export interface FactoryProfile {
  id: string;
  factoryName: string;
  factoryNameSi?: string;
  registrationNo?: string;       // Factories Ordinance reg.
  ownerName: string;
  ownerNic?: string;
  ownerPhone?: string;
  address: string;
  gnDivision: string;
  phiAreaId: string;
  geoPoint?: GeoPoint;
  
  // Classification
  scale: FactoryScale;
  industryType: string;          // e.g., "Garment", "Tea Processing", "Food Manufacturing"
  totalWorkers: number;
  maleWorkers: number;