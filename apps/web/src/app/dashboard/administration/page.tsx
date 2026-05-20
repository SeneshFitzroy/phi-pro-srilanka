import { redirect } from 'next/navigation';

// Administration & Reporting has been merged into the main dashboard
// (Administration tab). The sub-routes (/dashboard/administration/gn-mapping,
// /statistics, /monthly-report, /area-survey, /spot-map, /inventory) still
// exist; only this index redirects to the unified dashboard tab.
export default function AdministrationRedirect() {
  redirect('/dashboard?tab=administration');
}
