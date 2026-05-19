import { redirect } from 'next/navigation';

// Downloads moved into the authenticated dashboard at
// /dashboard/resources (Officer Resources). Public link redirects there;
// the AuthGuard kicks unauthenticated users to /login first.
export default function DownloadsRedirect() {
  redirect('/dashboard/resources?tab=downloads');
}
