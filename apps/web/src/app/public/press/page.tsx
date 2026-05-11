import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { Megaphone, CalendarDays } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Press Releases | The Public Health Inspector\'s Union of Sri Lanka',
  description: 'Official press releases and statements of the Public Health Inspector\'s Union of Sri Lanka.',
};

const releases = [
  {
    date: 'August 5, 2025',
    title: 'Union welcomes constructive discussions with the Ministry of Health',
    body:
      'The Public Health Inspector’s Union of Sri Lanka acknowledges the recent discussions held with the Ministry of Health on cadre, service matters and the strengthening of field public health services, and looks forward to early implementation of the agreed measures.',
  },
  {
    date: 'June 12, 2025',
    title: 'Statement on strengthening dengue prevention ahead of the monsoon',
    body:
      'The Union calls on local authorities and the public to support intensified source-reduction and premises-inspection programmes, and reaffirms the commitment of Public Health Inspectors to lead vector-control operations island-wide.',
  },
  {
    date: 'March 2, 2025',
    title: 'On the digitalisation of field public health work',
    body:
      'The Union supports the responsible adoption of digital tools — including offline-capable inspection forms, disease mapping and decision-support — provided they are accessible, secure, and reduce rather than add to the field officer’s burden.',
  },
  {
    date: 'December 10, 2024',
    title: 'World Human Rights Day — public health is a public good',
    body:
      'The Union reiterates that access to safe food, clean water and a healthy environment are fundamental, and that adequate investment in preventive health services is essential to protect them.',
  },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">Media</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Press Releases</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">Official statements of the Public Health Inspector&apos;s Union of Sri Lanka.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        {releases.map((r) => (
          <article key={r.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
              <Megaphone className="h-3.5 w-3.5" /> Press Release
              <span className="flex items-center gap-1 text-slate-400"><CalendarDays className="h-3 w-3" />{r.date}</span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{r.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{r.body}</p>
          </article>
        ))}
        <p className="text-xs text-slate-400">Media enquiries: <a href="mailto:info@phi.lk" className="text-blue-700 hover:underline dark:text-blue-400">info@phi.lk</a> · (+94) 11-2635675</p>
      </section>

      <PublicFooter />
    </div>
  );
}
