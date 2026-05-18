import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import {
  MessageSquare, CheckCircle, CreditCard, Search, AlertTriangle, MapPin, FileText,
  ArrowRight, ShieldCheck, Phone, BadgeCheck, Newspaper, Languages, Lock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Public Portal | PHI-PRO',
  description:
    'Sri Lanka Public Health Inspector citizen portal — submit complaints, verify certificates, pay fees, check food-hygiene grades, view outbreak alerts and find your local PHI.',
};

const primary = [
  {
    icon: MessageSquare,
    title: 'Submit a complaint',
    desc: 'Report unsafe food, hygiene risks or suspected outbreaks. Anonymous option available.',
    href: '/public/complaints',
    tag: 'Anonymous OK',
    accent: 'from-blue-700 to-blue-900',
  },
  {
    icon: CheckCircle,
    title: 'Verify a certificate',
    desc: 'Confirm a PHI permit, food-grade or training certificate by QR or reference ID.',
    href: '/public/verify',
    tag: 'Instant',
    accent: 'from-emerald-600 to-emerald-800',
  },
  {
    icon: CreditCard,
    title: 'Pay a fee or fine',
    desc: 'Settle permits, renewals or compliance fines through PayHere — government-grade.',
    href: '/public/payments',
    tag: 'GovPay',
    accent: 'from-indigo-600 to-blue-900',
  },
];

const maps = [
  {
    icon: Search,
    title: 'Food hygiene grades',
    desc: 'Interactive map of every PHI-PRO-graded food premises in your district. Grade A · B · C with last inspection date.',
    href: '/public/food-grades',
    accent: 'from-emerald-600 to-emerald-800',
  },
  {
    icon: AlertTriangle,
    title: 'Disease outbreak alerts',
    desc: 'Real-time dengue, cholera and typhoid hotspots reported live by field officers nationwide.',
    href: '/public/alerts',
    accent: 'from-red-600 to-rose-800',
  },
  {
    icon: MapPin,
    title: 'Find a PHI / MOH',
    desc: 'Search the national register by district, MOH area or PHI Range — and call the officer directly.',
    href: '/public/find-phi',
    accent: 'from-blue-700 to-blue-950',
  },
];

const secondary = [
  { icon: Newspaper, label: 'News & press releases', href: '/public/news' },
  { icon: FileText,  label: 'Public reports & audit log', href: '/public/reports' },
  { icon: BadgeCheck, label: 'Public audit chain', href: '/public/audit' },
  { icon: FileText,  label: 'Downloads (forms, manuals)', href: '/public/downloads' },
];

export default function PublicPortalPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      {/* Hero — distinct compact band, no stat grid like Home / About */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white py-10 sm:py-14 dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                <ShieldCheck className="h-3 w-3" /> Citizen Services
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                The Public Portal
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
                Every public-facing service of the PHI cadre in one place. No login required. Trilingual.
                Verified data from the field, signed by the Ministry of Health.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 lg:col-span-4 lg:justify-end dark:text-slate-400">
              <Pill icon={<Lock className="h-3 w-3" />}>No login</Pill>
              <Pill icon={<Languages className="h-3 w-3" />}>EN &middot; සිංහල &middot; தமிழ்</Pill>
              <Pill icon={<BadgeCheck className="h-3 w-3" />}>Signed by MoH</Pill>
            </div>
          </div>
        </div>
      </section>

      {/* Primary trio */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="sr-only">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {primary.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`group relative flex items-start gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${s.accent} p-6 text-white shadow-lg shadow-blue-900/10 transition-all hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="inline-flex shrink-0 rounded-xl bg-white/15 p-3 ring-1 ring-white/20 backdrop-blur-sm">
                <s.icon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">{s.title}</h3>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    {s.tag}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/85">{s.desc}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-white/80 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* Map services trio */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">Live data</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">Map-driven services</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {maps.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`h-1 w-full bg-gradient-to-r ${s.accent}`} />
              <div className="flex flex-1 flex-col p-6">
                <div className={`inline-flex rounded-2xl bg-gradient-to-br ${s.accent} p-3 shadow-sm`}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Emergency strip */}
      <section className="mx-auto mb-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-rose-50 px-6 py-5 sm:flex-row dark:border-red-900/40 dark:from-red-950/20 dark:to-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 shadow-sm">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Public Health Emergency Hotline</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ministry of Health, 24 / 7 &middot; report outbreaks &amp; food-poisoning incidents
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="tel:1390" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700">
              <Phone className="h-4 w-4" /> 1390
            </a>
            <a href="tel:+94112695112" className="inline-flex items-center gap-2 rounded-xl border-2 border-red-300 px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30">
              +94 11 269 5112
            </a>
          </div>
        </div>
      </section>

      {/* Secondary links */}
      <section className="border-t border-slate-200 bg-slate-50/70 py-12 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">More resources</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {secondary.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700"
              >
                <s.icon className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                <span className="flex-1">{s.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      {icon}{children}
    </span>
  );
}
