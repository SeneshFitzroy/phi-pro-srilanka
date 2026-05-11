import type { Metadata } from 'next';
import Image from 'next/image';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { Shield, Globe, History, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | The Public Health Inspector\'s Union of Sri Lanka',
  description:
    'History of the Public Health Inspector service in Sri Lanka since 1913, the Union, its mission, vision and office bearers.',
};

const officeBearers = [
  { role: 'Hon. President', name: 'K.A.P. Boralessa' },
  { role: 'Hon. Secretary', name: 'M.A.A.D.S. Muthukuda' },
  { role: 'Hon. Treasurer', name: 'M.A.C. Prasad' },
];

const milestones = [
  { year: '1913', text: 'Sanitary Branch of the Medical Department established; six Sanitary Inspectors appointed after six months training at the Colombo Medical College.' },
  { year: '1913 onward', text: 'Recruitment of Sanitary Inspectors continued bi-annually; training curriculum modelled on the British Royal Health Institution.' },
  { year: '1960s–1990s', text: 'Eradication of smallpox (Wasuriya), control of communicable diseases, safe food culture and school health programmes led by PHIs island-wide.' },
  { year: 'Today', text: '1,793 Public Health Inspectors and Administrative Public Health Inspectors serve as the front-line prevention team across Sri Lanka.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">About the Union</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            The Public Health Inspector&apos;s Union of Sri Lanka
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
            &ldquo;Prevention is better than cure.&rdquo; The Public Health Inspector (PHI) is the leading
            field officer of preventive health in Sri Lanka. This service began in 1913 and its training was
            based on the curriculum of the British Royal Health Institution. Over the past century PHIs have
            driven smallpox eradication, communicable disease control, a safe and healthy food culture,
            the wellbeing of school children, reduced occupational health hazards, and wider vaccination coverage.
          </p>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 dark:border-blue-900/50 dark:from-blue-950/30">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 p-2.5"><Shield className="h-5 w-5 text-white" /></div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Environmental health management focusing on control of communicable &amp; non-communicable
              diseases, resuscitation of health, and enforcement of health regulations.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-8 dark:border-amber-900/50 dark:from-amber-950/30">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2.5"><Globe className="h-5 w-5 text-white" /></div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Our Vision</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              A healthy nation built on a safe environment.
            </p>
          </div>
        </div>
      </section>

      {/* History timeline */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-2">
            <History className="h-5 w-5 text-blue-700 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our History</h2>
          </div>
          <ol className="relative space-y-6 border-l-2 border-blue-200 pl-6 dark:border-blue-900">
            {milestones.map((m) => (
              <li key={m.year} className="relative">
                <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-700 dark:border-slate-900" />
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400">{m.year}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Office bearers */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Office Bearers</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {officeBearers.map((o) => (
            <div key={o.role} className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Image src="/phi-emblem.png" alt="" width={56} height={56} className="h-14 w-14" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400">{o.role}</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{o.name}</p>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
