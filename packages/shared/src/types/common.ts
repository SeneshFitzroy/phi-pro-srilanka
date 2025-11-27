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
  
  // Display
  isActive: boolean;
  expiresAt?: string;
  actionUrl?: string;
  
  // Source
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Audit log entry */
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  
  action: string;              // e.g., "CREATE", "UPDATE", "DELETE", "APPROVE"
  resource: string;            // e.g., "FoodInspection", "Permit"
  resourceId: string;
  
  details?: string;
  previousValue?: string;      // JSON
  newValue?: string;           // JSON
  
  ipAddress?: string;
  userAgent?: string;
  
  createdAt: string;
}

/** Dashboard analytics data point */
export interface AnalyticsDataPoint {
  label: string;
  value: number;
  previousValue?: number;
  changePercent?: number;
  trend?: 'UP' | 'DOWN' | 'STABLE';
}

/** Dashboard card metric */
export interface DashboardMetric {
  id: string;
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: string;
  color?: string;
  trend?: 'UP' | 'DOWN' | 'STABLE';
  changePercent?: number;
  period?: string;
}

/** Notification for individual users */
export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: AlertType;
  
  // Action
  actionUrl?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  
  isRead: boolean;
  readAt?: string;
  
  createdAt: string;
}

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/** Search / filter parameters */
export interface SearchParams {
  query?: string;
  domain?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  phiAreaId?: string;
  gnDivision?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
