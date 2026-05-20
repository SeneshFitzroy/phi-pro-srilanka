import { redirect } from 'next/navigation';

// Food inspection scheduling now lives in the single dashboard calendar (food
// events appear there alongside every other domain). This route forwards there.
export default function FoodCalendarRedirect() {
  redirect('/dashboard#calendar');
}
