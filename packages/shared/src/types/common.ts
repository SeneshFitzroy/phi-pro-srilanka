// ============================================================================
// Common Types (Alerts, Notifications, Audit, etc.)
// ============================================================================
import { AlertType, Priority } from './enums';

/** System-wide alert/notification */
export interface SystemAlert {
  id: string;
  type: AlertType;
  title: string;
  titleSi?: string;
  titleTa?: string;
  message: string;
  messageSi?: string;
  messageTa?: string;
  priority: Priority;
  
  // Targeting
  targetRoles?: string[];      // UserRole[]
  targetMohAreas?: string[];
  targetPhiAreas?: string[];
  isPublic: boolean;           // Visible on public portal