import { redirect } from 'next/navigation';

/**
 * /public/press has been folded into the News & Press page. This route stays
 * as a permanent redirect for any external link or bookmark pointing here.
 */
export default function PressPage(): never {
  redirect('/public/news#press');
}
