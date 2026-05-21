'use client';

// Page route for Area Analytics — actual content lives in the reusable
// AnalyticsContent component so the SPHI /dashboard can embed the same view.

import { AuthGuard } from '@/components/auth-guard';
import { UserRole } from '@phi-pro/shared';
import { AnalyticsContent } from '@/components/analytics-content';

export default function AnalyticsPage() {
  return (
    <AuthGuard allowedRoles={[UserRole.SPHI, UserRole.MOH_ADMIN]}>
      <AnalyticsContent />
    </AuthGuard>
  );
}
