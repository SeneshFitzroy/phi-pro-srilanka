import { redirect } from 'next/navigation';

// Statutory duties moved into the authenticated dashboard at
// /dashboard/resources (Officer Resources). Citizens reaching the old URL
// are sent to the public portal; officers land on the consolidated page.
export default function DutyRedirect() {
  redirect('/dashboard/resources?tab=duty');
}
