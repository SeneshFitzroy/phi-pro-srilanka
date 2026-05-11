import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { CalendarDays, Newspaper, Video, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'News & Events | The Public Health Inspector\'s Union of Sri Lanka',
  description: 'Latest news, meetings and events of the Public Health Inspector\'s Union of Sri Lanka.',
};

type Item = { title: string; date: string; tag: 'News' | 'Event' | 'AGM' | 'Video'; excerpt: string };

const items: Item[] = [
  {
    title: 'Key Discussions Held Between Health Ministry and Public Health Inspectors’ Union of Sri Lanka',
    date: 'August 4, 2025',
    tag: 'Video',
    excerpt:
      'A significant meeting took place between the Ministry of Health and the Public Health Inspector’s Union of Sri Lanka covering service matters, cadre, and the modernisation of field public health work.',
  },
  {
    title: 'PHI-PRO Digital Enforcement Hub — pilot rollout briefing',
    date: 'February 18, 2025',
    tag: 'News',
    excerpt:
      'Members were briefed on the PHI-PRO digital platform: offline-capable H800/H399 field forms, GIS disease mapping, and the AI compliance assistant for Sri Lankan health law.',
  },
  {
    title: 'World Health Day awareness programmes conducted island-wide',
    date: 'April 7, 2024',
    tag: 'Event',
    excerpt:
      'PHIs across all districts led food-handler training, dengue source-reduction drives and school health education sessions to mark World Health Day.',
  },
  {
    title: 'Annual General Meeting 2018',
    date: 'July 28, 2018',
    tag: 'AGM',
    excerpt: 'The Union held its Annual General Meeting with the election of office bearers and review of the year’s work.',
  },
  {
    title: 'Annual General Meeting 2016',
    date: 'November 30, 2016',
    tag: 'AGM',
    excerpt: 'Members convened for the 2016 Annual General Meeting and adopted resolutions on service conditions and training.',
  },
];

const tagStyle: Record<Item['tag'], string> = {
  News: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  Event: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  AGM: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  Video: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
};

const tagIcon: Record<Item['tag'], typeof Newspaper> = { News: Newspaper, Event: CalendarDays, AGM: Users, Video: Video };

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">From the Union</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">News &amp; Events</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">Meetings, programmes and announcements from the Public Health Inspector&apos;s Union of Sri Lanka.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((it) => {
            const Icon = tagIcon[it.tag];
            return (
              <article key={it.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${tagStyle[it.tag]}`}><Icon className="h-3 w-3" />{it.tag}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-400"><CalendarDays className="h-3 w-3" />{it.date}</span>
                </div>
                <h2 className="mt-3 text-base font-bold leading-snug text-slate-900 dark:text-white">{it.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{it.excerpt}</p>
              </article>
            );
          })}
        </div>
        <p className="mt-8 text-xs text-slate-400">Older bulletins and AGM minutes are available from the Union secretariat. See the <a href="/public/downloads" className="text-blue-700 hover:underline dark:text-blue-400">Downloads</a> page for newsletters.</p>
      </section>

      <PublicFooter />
    </div>
  );
}
