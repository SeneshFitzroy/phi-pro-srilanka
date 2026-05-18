import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, Shield, Activity, Globe2, Users, Phone, Newspaper,
  UserCheck, Store, ChevronDown, ChevronRight, Microscope, Stethoscope,
  HeartPulse, Briefcase, BookOpen, Sparkles, ShieldCheck, BadgeCheck, MapPin,
  AlertTriangle, CheckCircle, Megaphone, LineChart,
} from 'lucide-react';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';

/* ──────────────────────────── data ─────────────────────────────────────── */

// National impact — operational throughput, not the "Union biography" stats
// that already live on the About page (officers / districts / years).
const impact = [
  { value: '12,400+',  label: 'Inspections this year', sub: 'Food, water, vector' },
  { value: '8,930',    label: 'Certificates verified', sub: 'QR-signed by MoH' },
  { value: '3,217',    label: 'Complaints resolved',    sub: 'Public-portal intake' },
  { value: '147',      label: 'Outbreak signals',      sub: 'Live in last 30 days' },
];

// The five statutory enforcement pillars — short visual summary. The full
// explanatory copy lives on the About page; here we only tease.
const pillars = [
  { icon: Stethoscope, name: 'Communicable disease',  tone: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
  { icon: Microscope,  name: 'Food safety',           tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  { icon: Activity,    name: 'Environment & vector',  tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  { icon: HeartPulse,  name: 'Maternal & school',     tone: 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300' },
  { icon: Briefcase,   name: 'Occupational & disaster', tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
];

// Three audiences served by PHI-PRO — keep here, this is unique to the home
// page and is the highest-converting block.
const audiences = [
  {
    icon: UserCheck,
    title: 'Field officers',
    tag: 'PHI · SPHI · MOH',
    bullets: ['H800 / H1046 / H1203 digital forms', 'Offline-first field inspections', 'GIS outbreak triage', 'AI compliance copilot'],
    cta: 'Officer login',
    href: '/login',
    accent: 'from-blue-700 to-blue-950',
  },
  {
    icon: Store,
    title: 'Business owners',
    tag: 'Premises · factories',
    bullets: ['Live A/B/C grade status', 'Online permit renewal', 'QR-signed certificates', 'PayHere fines & fees'],
    cta: 'Pay or renew',
    href: '/public/payments',
    accent: 'from-sky-600 to-blue-800',
  },
  {
    icon: Users,
    title: 'Citizens',
    tag: 'Every Sri Lankan',
    bullets: ['Restaurant hygiene lookup', 'District outbreak alerts', 'Anonymous complaints', 'Trilingual EN · සි · த'],
    cta: 'Public portal',
    href: '/public/portal',
    accent: 'from-indigo-600 to-blue-900',
  },
];

// Portal teaser tiles — link to the consolidated /public/portal hub.
const portalTeaser = [
  { icon: AlertTriangle, label: 'Outbreak alerts',      href: '/public/alerts',      tone: 'text-rose-600 dark:text-rose-300' },
  { icon: CheckCircle,   label: 'Verify a certificate', href: '/public/verify',      tone: 'text-emerald-600 dark:text-emerald-300' },
  { icon: MapPin,        label: 'Food hygiene grades',  href: '/public/food-grades', tone: 'text-blue-700 dark:text-blue-300' },
];

/* ──────────────────────────── page ─────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-screen scroll-smooth bg-white dark:bg-slate-950">
      <PublicHeader />

      {/* ═══════════════════ EDITORIAL HERO ═══════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" aria-hidden />
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#1e3a8a 1px,transparent 1px),linear-gradient(to right,#1e3a8a 1px,transparent 1px)',
            backgroundSize: '56px 56px',
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* Editorial copy */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-700 shadow-sm dark:border-blue-800/60 dark:bg-slate-900 dark:text-blue-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live &middot; Official digital platform &middot; Ministry of Health
              </div>

              <h1 className="mt-5 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-[4.2rem] dark:text-white">
                Sri Lanka&rsquo;s{' '}
                <span className="relative inline-block">
                  <span className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-900 bg-clip-text text-transparent">
                    preventive
                  </span>
                </span>{' '}
                health corps,&nbsp;online.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                PHI-PRO is the secure, audit-grade workspace that carries the daily statutory work of every
                Public Health Inspector — from the food-stall in Kandy to the airport in Katunayake. Built for
                the field, signed by the Ministry, open to every citizen.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/public/portal"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-7 text-[15px] font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:brightness-110 hover:shadow-xl"
                >
                  Open public portal <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-7 text-[15px] font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Officer login <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Trust ribbon */}
              <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />WCAG 2.1 AA</li>
                <li className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />WebAuthn passkeys</li>
                <li className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />Sinhala &middot; Tamil &middot; English</li>
                <li className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />Tamper-evident audit chain</li>
              </ul>
            </div>

            {/* Editorial side panel — newsroom-style snapshot, not a stat grid */}
            <aside className="lg:col-span-5">
              <div className="relative rounded-3xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="rounded-[1.4rem] bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-100 ring-1 ring-white/20">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                      Operational dashboard
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-200/80">Snapshot · last 24 h</span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <PanelStat icon={<Activity className="h-4 w-4" />}    k="438"   v="inspections logged" />
                    <PanelStat icon={<LineChart className="h-4 w-4" />}   k="62"    v="grades published" />
                    <PanelStat icon={<AlertTriangle className="h-4 w-4" />} k="9"   v="new dengue clusters" />
                    <PanelStat icon={<CheckCircle className="h-4 w-4" />} k="214"  v="certificates issued" />
                  </div>

                  <div className="mt-5 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Field map</p>
                    <p className="mt-1 text-xs leading-relaxed text-blue-100/90">
                      74 MOH offices, 354 PHI divisions and 1,793 active officers — live on the
                      <Link href="/public/find-phi" className="underline-offset-2 hover:underline"> Find PHI</Link> map.
                    </p>
                  </div>
                </div>

                {/* Small footer tag */}
                <div className="flex items-center justify-between gap-3 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Government data</span>
                  <span>Updated continuously</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ═══════════════════ NATIONAL IMPACT TICKER ═══════════════════ */}
      <section className="border-y border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-4">
            {impact.map((i) => (
              <div key={i.label} className="border-l-2 border-blue-700 pl-4 dark:border-blue-400">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
                  {i.sub}
                </p>
                <p className="mt-1 font-mono text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                  {i.value}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{i.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FIVE PILLARS (compact teaser, full copy on About) ═══════════════════ */}
      <section className="bg-slate-50/70 py-16 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">Statutory remit</p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Five enforcement domains. One digital file.
              </h2>
            </div>
            <Link href="/public/about" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:underline dark:text-blue-300">
              Read the full mandate <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {pillars.map((p, i) => (
              <article key={p.name} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${p.tone}`}>
                  <p.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">0{i + 1}</p>
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TODAY (newsroom layout) ═══════════════════ */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">Today on PHI-PRO</p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                A daily public health newsroom
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Verified Sri Lanka health news, Union statements and a live link straight to the citizen portal.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/public/news" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <Newspaper className="h-3.5 w-3.5" /> News &amp; press
              </Link>
              <Link href="/public/portal" className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800">
                Open portal <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            {/* Lead news card */}
            <Link
              href="/public/news"
              className="group relative col-span-12 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-8 text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl lg:col-span-7"
            >
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-200 ring-1 ring-white/20">
                <ShieldCheck className="h-3 w-3" /> Verified — corroborated
              </span>
              <h3 className="mt-5 text-2xl font-extrabold leading-tight sm:text-3xl">
                Live Sri Lanka health news, fact-checked across outlets.
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100/90">
                The newsroom block on /public/news cross-references every story across multiple outlets and
                screens it against published fact-checks. Disputed claims are flagged before they spread.
              </p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-white/95">
                Open newsroom <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Press release card */}
            <Link
              href="/public/news#press"
              className="group relative col-span-12 flex flex-col overflow-hidden rounded-2xl border border-amber-100 bg-amber-50 p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-amber-900/40 dark:bg-amber-950/20 lg:col-span-5"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                <Megaphone className="h-3.5 w-3.5" /> Latest press release
              </div>
              <h3 className="mt-3 text-lg font-bold leading-snug text-slate-900 dark:text-white">
                Union welcomes constructive discussions with the Ministry of Health
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Cadre, service matters and the strengthening of field public health services discussed in
                August 2025.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 dark:text-amber-300">
                Read full statement <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Portal teaser tiles */}
            {portalTeaser.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="col-span-12 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md sm:col-span-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 ${t.tone} dark:bg-slate-800`}>
                  <t.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Public portal</p>
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{t.label}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ THREE AUDIENCES ═══════════════════ */}
      <section className="border-t border-slate-200 bg-slate-50/70 py-16 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">Who PHI-PRO serves</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Three audiences. One secure platform.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {audiences.map((a) => (
              <article key={a.title} className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className={`relative bg-gradient-to-br ${a.accent} p-6 text-white`}>
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" aria-hidden />
                  <div className="relative">
                    <div className="inline-flex rounded-xl bg-white/15 p-2.5 ring-1 ring-white/25 backdrop-blur-sm">
                      <a.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/80">{a.tag}</p>
                    <h3 className="mt-1 text-xl font-extrabold">{a.title}</h3>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <ul className="flex-1 space-y-2">
                    {a.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[13px] text-slate-700 dark:text-slate-300">
                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={a.href}
                    className={`mt-5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r ${a.accent} px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110`}
                  >
                    {a.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ THE UNION (compact teaser, full body on About) ═══════════════════ */}
      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2">
              <Image src="/phi-emblem.png" alt="" width={44} height={44} className="h-11 w-11" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">The Union</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Est. 1913</p>
              </div>
            </div>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
              A century of preventive health, kept by the people who walk the wards.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
              The Public Health Inspector&rsquo;s Union of Sri Lanka is the professional body that represents the
              1,793 officers running the country&rsquo;s preventive health work. From the malaria epidemic of 1935
              to the digital enforcement of today, the Union has been one voice for the cadre.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/public/about" className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800">
                Read the full story <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/public/find-phi#contact" className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Contact the secretariat
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { role: 'Hon. President', name: 'K.A.P. Boralessa' },
                { role: 'Hon. Secretary', name: 'M.A.A.D.S. Muthukuda' },
                { role: 'Hon. Treasurer', name: 'M.A.C. Prasad' },
              ].map((o) => (
                <div key={o.role} className="flex flex-col items-center rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 text-center shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-800/40">
                  <Image src="/phi-emblem.png" alt="" width={48} height={48} className="h-12 w-12" />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">{o.role}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{o.name}</p>
                </div>
              ))}
            </div>

            <blockquote className="mt-4 rounded-2xl border-l-4 border-blue-700 bg-blue-50 p-5 italic text-slate-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-slate-200">
              <BookOpen className="mb-2 h-4 w-4 text-blue-700 dark:text-blue-300" />
              &ldquo;Prevention is better than cure&rdquo; &mdash; motto of the PHI service, since 1913.
            </blockquote>
          </div>
        </div>
      </section>

      {/* ═══════════════════ EMERGENCY + OFFICER CTA ═══════════════════ */}
      <section className="relative overflow-hidden border-t border-blue-900/20 bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 py-14 text-white">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,0.4) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">For PHI officers</p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Sign in to your full enforcement workspace.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-blue-100/90 sm:text-base">
              Offline-capable field forms, GIS disease maps, AI compliance copilot, supervisory approvals and the
              tamper-evident audit chain — all behind a WebAuthn passkey.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-blue-900 shadow-lg transition-all hover:bg-blue-50">
                Sign in to PHI-PRO <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/public/portal" className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-white/30 px-7 text-sm font-bold text-white hover:bg-white/10">
                Back to public portal <ChevronDown className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-widest text-red-200">Emergency hotline</p>
            <p className="mt-1 text-sm text-blue-100/90">
              Outbreaks &middot; food-poisoning &middot; suspected public-health threats &mdash; 24 / 7 from the Ministry of Health.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="tel:1390" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700">
                <Phone className="h-4 w-4" /> 1390
              </a>
              <a href="tel:+94112695112" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">
                +94 11 269 5112
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

/* ───── helpers ───── */

function PanelStat({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <div className="flex items-center gap-1.5 text-blue-200">
        {icon}<span className="text-[10px] font-bold uppercase tracking-wider">{v}</span>
      </div>
      <p className="mt-1 font-mono text-2xl font-extrabold text-white">{k}</p>
    </div>
  );
}
