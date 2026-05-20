import { redirect } from 'next/navigation';

// The activity & tasks calendar is now the single calendar embedded directly
// in /dashboard (Overview). This route just forwards there.
export default function ActivityCalendarRedirect() {
  redirect('/dashboard#calendar');
}
