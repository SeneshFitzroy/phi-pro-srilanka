import { redirect } from 'next/navigation';

/**
 * /public/contact has been folded into the Find-PHI page so a citizen can both
 * look up the nearest PHI and reach the Union secretariat in one place. This
 * route stays as a permanent redirect for any external link / bookmark.
 */
export default function ContactPage(): never {
  redirect('/public/find-phi#contact');
}
