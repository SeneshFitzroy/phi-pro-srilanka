import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  UtensilsCrossed,
  School,
  Activity,
  HardHat,
  ClipboardList,
  ArrowRight,
  Shield,
  Globe,
  Wifi,
  MapPin,
  Lock,
  Users,
  Calendar,
  Search,
  MessageSquare,
  AlertTriangle,
  CreditCard,
  CheckCircle,
  FileText,
  ChevronDown,
  Star,
  Phone,
} from 'lucide-react';

const GoogleTranslateWidget = dynamic(
  () => import('@/components/google-translate').then((m) => ({ default: m.GoogleTranslateWidget })),
  { ssr: false },
);

/* ─────────────────────────────── data ─────────────────────────────── */

const publicServices = [
  {
    icon: Search,
    title: 'Food Hygiene Grades',
    desc: 'Look up any restaurant, bakery, or food stall by name or area to check their official hygiene certification grade.',
    href: '/public/food-grades',
    iconGradient: 'from-emerald-500 to-green-600',
    badge: 'Live',
    badgeCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  },
  {
    icon: AlertTriangle,
    title: 'Disease Outbreak Alerts',
    desc: 'View active dengue, cholera, and typhoid advisories in your area. Reported directly from field PHI officers.',
    href: '/public/alerts',
    iconGradient: 'from-red-500 to-rose-600',
    badge: 'Real-time',
    badgeCls: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
  {
    icon: MessageSquare,
    title: 'Submit a Complaint',
    desc: 'Report food safety violations, unhygienic premises, or disease concerns anonymously and securely.',
    href: '/public/complaints',
    iconGradient: 'from-blue-500 to-indigo-600',
    badge: 'Anonymous',
    badgeCls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  {
    icon: CheckCircle,
    title: 'Verify a Certificate',
    desc: 'Instantly verify the authenticity of any PHI-issued health permit or compliance certificate by QR scan or ID.',
    href: '/public/verify',
    iconGradient: 'from-teal-500 to-cyan-600',
    badge: 'Instant',
    badgeCls: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
  },
  {
    icon: CreditCard,
    title: 'Pay Fine or Fee',
    desc: 'Settle permit renewal fees or compliance fines securely online through the Government GovPay gateway.',
    href: '/public/payments',
    iconGradient: 'from-amber-500 to-orange-500',
    badge: 'GovPay',
    badgeCls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  {
    icon: FileText,
    title: 'Published Health Reports',
    desc: 'Access official inspection summaries, surveillance bulletins, and public health statistics by district.',
    href: '/public/reports',
    iconGradient: 'from-violet-500 to-purple-600',
    badge: 'Open Data',
    badgeCls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
  },
];

const domains = [
  { icon: UtensilsCrossed, label: 'Food Safety', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', desc: 'H800 inspections & grading' },
  { icon: Activity, label: 'Epidemiology', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/40', desc: 'Disease surveillance' },
  { icon: School, label: 'School Health', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40', desc: 'Vaccinations & WASH' },
  { icon: HardHat, label: 'Occupational', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40', desc: 'Factory inspections' },
  { icon: ClipboardList, label: 'Administration', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40', desc: 'Reports & analytics' },
];

const trustPoints = [
  { icon: Wifi, label: 'Offline-first', sub: 'Works without internet' },
  { icon: Globe, label: 'Trilingual', sub: 'Sinhala · Tamil · English' },
  { icon: Lock, label: 'Secure RBAC', sub: '4-tier access control' },
  { icon: MapPin, label: 'GIS-enabled', sub: 'Real-time disease maps' },
  { icon: Shield, label: 'WCAG 2.1 AA', sub: 'Fully accessible' },
  { icon: Star, label: 'FHIR R4', sub: 'DHIS2 interoperability' },
];

const steps = [
  { num: '01', title: 'Choose a Service', desc: 'Select the public health service you need from the portal below.' },
  { num: '02', title: 'Get Information', desc: 'Access verified data — grades, alerts, and reports — from our database.' },
  { num: '03', title: 'Take Action', desc: 'Submit complaints, verify certificates, or pay fees directly online.' },
];

/* ──────────────────────────── page ────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-screen scroll-smooth bg-white dark:bg-slate-950">

      {/* ═══════════════════ NAVIGATION ═══════════════════ */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-2.5">
            <Image src="/phi-emblem.png" alt="PHI Emblem" width={36} height={36} className="drop-shadow-sm" />
            <div className="leading-none">
              <p className="text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-white">PHI-PRO</p>
              <p className="hidden text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:block">
                Sri Lanka Health Enforcement
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-2">
            <GoogleTranslateWidget />
            <a
              href="#services"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white sm:block"
            >
              Public Services
            </a>
            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-700 to-blue-900 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-900/30 transition-all hover:brightness-110 hover:shadow-md hover:shadow-blue-900/30"
            >
              PHI Login
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(#1e3a8a 1px,transparent 1px),linear-gradient(to right,#1e3a8a 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-600/10" />

        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-14 sm:px-6 sm:pb-36 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">

            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <Image
                src="/phi-logo.png"
                alt="The Public Health Inspector's Union of Sri Lanka"
                width={300}
                height={59}
                className="h-auto w-56 drop-shadow-sm sm:w-72"
                priority
              />
            </div>

            {/* Live badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/60 dark:text-blue-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Official Digital Platform — Ministry of Health, Sri Lanka
            </div>

            {/* Headline */}
            <h1 className="text-[2.4rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.4rem]">
              Protecting{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">
                  Public Health
                </span>
              </span>
              <br />
              Across Sri Lanka
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              PHI-PRO digitises all five statutory enforcement domains for{' '}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">1,793 Public Health Inspectors</strong>{' '}
              serving{' '}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">21.9 million citizens</strong>{' '}
              island-wide.
            </p>

            <p className="mt-3 text-sm italic text-slate-400 dark:text-slate-500">
              &ldquo;Prevention is better than cure&rdquo;
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#services"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-9 text-base font-semibold text-white shadow-lg shadow-blue-900/25 transition-all hover:brightness-110 hover:shadow-xl sm:w-auto"
              >
                Public Services
                <ChevronDown className="h-4 w-4" />
              </a>
              <Link
                href="/login"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-9 text-base font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
              >
                PHI Officer Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Trust row */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-500">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-blue-700 dark:text-blue-500" />Est. 1913</span>
              <span className="hidden text-slate-300 dark:text-slate-700 sm:block">·</span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-blue-700 dark:text-blue-500" />1,793 PHIs Island-wide</span>
              <span className="hidden text-slate-300 dark:text-slate-700 sm:block">·</span>
              <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-blue-700 dark:text-blue-500" />Sinhala · Tamil · English</span>
              <span className="hidden text-slate-300 dark:text-slate-700 sm:block">·</span>
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-blue-700 dark:text-blue-500" />WCAG 2.1 AA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS STRIP ═══════════════════ */}
      <div className="border-y border-blue-900/20 bg-gradient-to-r from-blue-800 via-blue-900 to-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-blue-700/40 sm:grid-cols-4">
            {[
              { value: '1,793', label: 'Active PHIs', sub: 'Island-wide' },
              { value: '21.9M', label: 'Citizens Protected', sub: 'Sri Lanka' },
              { value: '5', label: 'Statutory Domains', sub: 'Fully Digitised' },
              { value: '12,000+', label: 'Inspections / Year', sub: 'Food Safety alone' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center gap-0.5 py-8 text-center">
                <span className="text-2xl font-extrabold text-white sm:text-3xl">{s.value}</span>
                <span className="text-xs font-semibold text-blue-200">{s.label}</span>
                <span className="text-[10px] text-blue-400">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="bg-slate-50/70 py-20 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              For Citizens
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              How to Use the Public Portal
            </h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
              Three simple steps to access public health services online
            </p>
          </div>

          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* Connecting line (desktop) */}
            <div className="absolute left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] top-10 hidden h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 dark:from-blue-800 dark:via-blue-600 dark:to-blue-800 sm:block" />

            {steps.map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-blue-900 shadow-lg shadow-blue-900/20 dark:border-slate-900">
                  <span className="text-2xl font-black text-white">{step.num}</span>
                </div>
                <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PUBLIC SERVICES ═══════════════════ */}
      <section id="services" className="scroll-mt-16 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Public Health Portal
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Services for Every Sri Lankan Citizen
            </h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
              Transparent, accessible public health services — no login required
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {publicServices.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                {/* Top accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${s.iconGradient}`} />

                <div className="flex flex-1 flex-col p-6">
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex rounded-2xl bg-gradient-to-br ${s.iconGradient} p-3 shadow-sm`}>
                      <s.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${s.badgeCls}`}>
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-[15px] font-bold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.desc}</p>

                  <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-blue-700 opacity-0 transition-all group-hover:opacity-100 dark:text-blue-400">
                    Open
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Emergency contact bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-rose-50 px-6 py-5 sm:flex-row dark:border-red-900/40 dark:from-red-950/20 dark:to-rose-950/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 shadow-sm">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Public Health Emergency Hotline</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">24/7 Ministry of Health — Report outbreaks immediately</p>
              </div>
            </div>
            <a
              href="tel:+94112695112"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
            >
              <Phone className="h-4 w-4" />
              +94 11 269 5112
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ 5 DOMAINS ═══════════════════ */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Our Scope
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Five Statutory PHI Domains
            </h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
              Every area of public health enforcement, now fully digitised
            </p>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {domains.map((d) => (
              <div
                key={d.label}
                className={`flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 ${d.bg} px-4 py-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800`}
              >
                <div className={`inline-flex rounded-xl bg-white/80 p-3 shadow-sm dark:bg-slate-800/80`}>
                  <d.icon className={`h-6 w-6 ${d.color}`} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${d.color}`}>{d.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PLATFORM TRUST ═══════════════════ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Platform Standards
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Built on Trust &amp; Reliability
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {trustPoints.map((t) => (
              <div
                key={t.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50">
                  <t.icon className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{t.label}</p>
                <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-500">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ MISSION / VISION ═══════════════════ */}
      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/20">
              <div className="mb-1 inline-flex rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 p-2.5 shadow-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Our Mission</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Environmental Health Management focused on the control of Communicable &amp; Non-Communicable
                Diseases, resuscitation of public health, and enforcement of statutory health regulations
                across all regions of Sri Lanka — digitally, efficiently, and equitably.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/20">
              <div className="mb-1 inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 shadow-sm">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Our Vision</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                A healthy nation built on a safe environment — empowering Sri Lanka&apos;s 1,793 Public Health
                Inspectors with data-driven digital tools, advancing the National Digital Health Blueprint
                and DHIS2 interoperability since the PHI service was established in 1913.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA BANNER ═══════════════════ */}
      <section className="relative overflow-hidden border-t border-blue-900/20 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,0.4) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Are You a PHI Officer?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-blue-200">
            Access your full enforcement dashboard — offline-capable field forms, GIS maps,
            AI compliance copilot, and supervisory approvals.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-9 text-base font-bold text-blue-800 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
            >
              Sign In to PHI-PRO
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#services"
              className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-white/30 px-9 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Back to Public Services
              <ChevronDown className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-3">
              <Image src="/phi-emblem.png" alt="PHI Emblem" width={30} height={30} />
              <div className="leading-none">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">PHI-PRO</span>
                <span className="ml-2 text-xs text-slate-400">Est. 1913</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-500">
              <a href="https://health.gov.lk" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-700 dark:hover:text-blue-400">
                Ministry of Health
              </a>
              <span className="hidden text-slate-300 dark:text-slate-700 sm:inline">&bull;</span>
              <a href="https://epid.gov.lk" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-700 dark:hover:text-blue-400">
                Epidemiology Unit
              </a>
              <span className="hidden text-slate-300 dark:text-slate-700 sm:inline">&bull;</span>
              <a href="https://phi.lk" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-700 dark:hover:text-blue-400">
                PHI Union of Sri Lanka
              </a>
            </div>

            <p className="text-center text-[11px] leading-relaxed text-slate-400 dark:text-slate-600">
              &copy; {new Date().getFullYear()} PHI-PRO — Digital Health Enforcement &amp; Integrated Intelligence System
              <span className="hidden sm:inline"> &bull; </span>
              <br className="sm:hidden" />
              673 Maradana Road, Colombo 01000, Sri Lanka
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
