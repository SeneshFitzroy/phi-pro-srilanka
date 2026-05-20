import { redirect } from 'next/navigation';

// Complaints management has been merged into the main dashboard
// (Complaints tab). Old links + the management-console card redirect here so
// nothing breaks.
export default function ComplaintsRedirect() {
  redirect('/dashboard?tab=complaints');
}
