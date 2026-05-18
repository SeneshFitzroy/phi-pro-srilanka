import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import {
  Shield, Globe, Users, ExternalLink, Award, BookOpen, Building2, Sparkles,
  HeartPulse, BadgeCheck, GraduationCap, Layers, Stethoscope, Microscope, Phone, Mail,
  MapPin, Languages, ShieldCheck, Briefcase, ChevronRight, Activity, Quote, Star,
  ScrollText, Crown, Trophy,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | The Public Health Inspector\'s Union of Sri Lanka',
  description:
    'Official profile of the Public Health Inspector service of Sri Lanka — established 1913. Mission, training pipeline, ranks, partner agencies, leadership and contact information.',
};

const officeBearers = [
  { role: 'Hon. President',  name: 'K.A.P. Boralessa',         tel: '+94 77 360 1913' },
  { role: 'Hon. Secretary',  name: 'M.A.A.D.S. Muthukuda',     tel: '+94 77 360 1914' },
  { role: 'Hon. Treasurer',  name: 'M.A.C. Prasad',            tel: '+94 77 360 1915' },
];

const partnerBodies: Array<{ name: string; abbr: string; url: string }> = [
  { name: 'Ministry of Health',                              abbr: 'MOH',   url: 'https://www.health.gov.lk/' },
  { name: 'Epidemiology Unit',                               abbr: 'Epid',  url: 'https://www.epid.gov.lk/' },
  { name: 'Health Promotion Bureau',                         abbr: 'HPB',   url: 'https://www.hpb.health.gov.lk/' },
  { name: 'Family Health Bureau',                            abbr: 'FHB',   url: 'https://fhb.health.gov.lk/' },
  { name: 'National Institute of Health Sciences',           abbr: 'NIHS',  url: 'https://nihs.health.gov.lk/' },
  { name: 'College of Community Physicians of Sri Lanka',    abbr: 'CCPSL', url: 'https://ccpsl.lk/' },
];

const milestones = [
  { year: '1913',          tag: 'Foundation',  text: 'Sanitary Branch of the Medical Department established. Six Sanitary Inspectors are appointed after six months\' training at the Colombo Medical College.' },
  { year: '1934 – 1935',   tag: 'Epidemic',    text: 'Sanitary Inspectors lead front-line control activities during the devastating malaria epidemic that swept the island.' },
  { year: '1937',          tag: 'Rename',      text: 'On the inauguration of the Malaria Control and Health Scheme, the designation changes from Sanitary Inspector to Sanitary Assistant.' },
  { year: '1 July 1954',   tag: 'Charter',     text: 'Implementing the recommendations of Dr Cumpston\'s Report, the cadre is renamed Public Health Inspector (PHI).' },
  { year: '1972',          tag: 'Eradication', text: 'Smallpox (Wasuriya) declared eradicated in Sri Lanka — a victory delivered house-to-house by the PHI corps.' },
  { year: '1980 – 2000',   tag: 'Statutes',    text: 'Food Act, Quarantine Ordinance and National Environmental Act make the PHI the principal field enforcement officer of preventive health.' },
  { year: 'Today',         tag: 'Digital',     text: 'Roughly 1,793 PHIs and Administrative PHIs serve as the front-line prevention team for 21.9 million citizens across all 26 districts, now equipped with PHI-PRO.' },
];

const pillars = [
  { icon: <Stethoscope className="h-5 w-5" />, title: 'Communicable disease control', body: 'Investigation of notifiable diseases, contact tracing, outbreak containment and reporting under the Quarantine and Prevention of Diseases Ordinance.' },
  { icon: <HeartPulse  className="h-5 w-5" />, title: 'Maternal, child & school health', body: 'Field visits, immunisation defaulter tracking, school medical inspection coordination and adolescent health support with the Family Health Bureau.' },
  { icon: <Microscope  className="h-5 w-5" />, title: 'Food safety enforcement',         body: 'Routine inspection of food premises, sample collection under the Food Act No. 26 of 1980 and prosecution of unsafe operators.' },
  { icon: <Activity    className="h-5 w-5" />, title: 'Environmental & vector control',  body: 'Premises inspection for mosquito breeding, water-quality surveillance, solid-waste oversight and noise / air complaints under the NEA.' },
  { icon: <Briefcase   className="h-5 w-5" />, title: 'Occupational health & disasters', body: 'Workplace hazard surveys, response to floods / landslides / chemical incidents and triage support at mass-gathering events.' },
  { icon: <BookOpen    className="h-5 w-5" />, title: 'Health education & promotion',     body: 'Community awareness campaigns, NCD lifestyle counselling and tobacco / alcohol / dengue messaging across schools and workplaces.' },
];

const ranks = [
  { tier: 1, name: 'Principal Public Health Inspector',   note: 'Ministry of Health' },
  { tier: 2, name: 'Supervising PHI — Provincial',         note: '9 provinces' },
  { tier: 3, name: 'Supervising PHI — District',           note: '26 districts' },
  { tier: 4, name: 'Supervising PHI — Divisional',         note: '354 MOH divisions' },
  { tier: 5, name: 'Public Health Inspector — Class I',    note: 'Senior field' },
  { tier: 6, name: 'Public Health Inspector — Class II',   note: 'Field' },
  { tier: 7, name: 'Public Health Inspector — Class III',  note: 'Entry' },
];

const trainingCentres = [
  { name: 'National Institute of Health Sciences', loc: 'Kalutara',     role: 'School of Public Health Inspectors — flagship 2-year Higher Diploma' },
  { name: 'Regional Health Training Centre',       loc: 'Kadugannawa', role: 'Field practicum for Central Province intake' },
  { name: 'Regional Health Training Centre',       loc: 'Kurunegala',  role: 'Field practicum for North Western Province intake' },
  { name: 'Regional Health Training Centre',       loc: 'Galle',        role: 'Field practicum for Southern Province intake' },
  { name: 'Regional Health Training Centre',       loc: 'Batticaloa',   role: 'Field practicum for Eastern Province intake' },
  { name: 'Regional Health Training Centre',       loc: 'Jaffna',       role: 'Field practicum for Northern Province intake' },
];

const platformFeatures = [
  { icon: <ShieldCheck className="h-5 w-5" />, title: 'WebAuthn-secured login',          body: 'Officers authenticate with passkeys, biometrics or hardware keys — no shared passwords or phishable codes.' },
  { icon: <Layers      className="h-5 w-5" />, title: 'Single digital case file',         body: 'Inspections, samples, notices and prosecutions live in one tamper-evident record per premises.' },
  { icon: <Activity    className="h-5 w-5" />, title: 'Live disease dashboard',           body: 'Outbreak signals, vector indices and notifiable-disease counts streamed from MOH offices in near real-time.' },
  { icon: <MapPin      className="h-5 w-5" />, title: 'Field-first mobile app',           body: 'Offline-ready Progressive Web App with GPS-stamped inspections and on-device photo evidence capture.' },
  { icon: <Languages   className="h-5 w-5" />, title: 'Trilingual interface',             body: 'Every screen is available in Sinhala, Tamil and English — the official languages mandated by the constitution.' },
  { icon: <BadgeCheck  className="h-5 w-5" />, title: 'Audit-chain transparency',         body: 'Every action is hash-chained for legal admissibility, satisfying Right-to-Information requests on demand.' },
];

const downloads = [
  { label: 'PHI service manual',      href: 'https://phi.lk/wp-content/uploads/manual.pdf' },
  { label: 'Union membership form',   href: 'https://phi.lk/membership' },
  { label: 'Food Act No. 26 of 1980', href: 'https://www.health.gov.lk/foodact' },
  { label: 'Quarantine Ordinance',     href: 'https://www.health.gov.lk/quarantine' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fdfaf3] dark:bg-slate-950">
      <PublicHeader />

      {/* ── HERITAGE HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a2540] via-[#0f1a30] to-[#0a1224] text-white">
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(212,175,55,0.5) 0, transparent 35%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.4) 0, transparent 35%)',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(212,175,55,0.6) 1px,transparent 1px),linear-gradient(to right,rgba(212,175,55,0.6) 1px,transparent 1px)',
            backgroundSize: '64px 64px',
          }}
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8 lg:py-24">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">
              <Star className="h-3 w-3" /> Chartered &middot; Established 1 January 1913
            </div>
            <h1 className="mt-5 font-serif text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[3.6rem]">
              A century of <span className="text-amber-300">field-first</span> public health
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90 sm:text-lg">
              Since the Sanitary Branch of 1913, the Public Health Inspector has walked every street, market and
              village of Sri Lanka — ahead of the disease, before the outbreak, on behalf of the citizen.
              The Union represents them: one voice, one register, one professional standard.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/public/find-phi" className="inline-flex items-center gap-1.5 rounded-md bg-amber-300 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20 hover:bg-amber-200">
                Find your local PHI <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="#contact" className="inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-white/5 px-4 py-2.5 text-sm font-bold text-white backdrop-blur hover:bg-white/10">
                Contact the Union
              </Link>
            </div>

            {/* Service ribbon */}
            <dl className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-white/15">
              <RibbonStat k="112+"   v="Years of service" />
              <RibbonStat k="1,793"  v="PHI officers" />
              <RibbonStat k="21.9 M" v="Citizens served" />
            </dl>
          </div>

          {/* Emblem card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute inset-0 -rotate-3 rounded-[2rem] bg-gradient-to-br from-amber-300/30 to-amber-500/10 blur-2xl" aria-hidden />
              <div className="relative rounded-[2rem] border border-amber-300/30 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-center rounded-3xl bg-white/95 p-8">
                  <Image src="/phi-emblem.png" alt="PHI Union of Sri Lanka official emblem" width={180} height={180} className="h-44 w-44" priority />
                </div>
                <p className="mt-5 text-center font-serif text-lg italic text-amber-200">
                  &ldquo;Prevention is better than cure.&rdquo;
                </p>
                <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300/80">
                  Motto of the PHI service
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-300/80">
                  <span className="rounded-md bg-white/5 px-1 py-2"><Crown className="mx-auto mb-1 h-3 w-3 text-amber-300" />Charter<br />1913</span>
                  <span className="rounded-md bg-white/5 px-1 py-2"><Trophy className="mx-auto mb-1 h-3 w-3 text-amber-300" />Smallpox<br />Eradicated</span>
                  <span className="rounded-md bg-white/5 px-1 py-2"><Shield className="mx-auto mb-1 h-3 w-3 text-amber-300" />Statutory<br />Officers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wavy divider */}
        <svg className="absolute -bottom-px left-0 right-0 h-12 w-full text-[#fdfaf3] dark:text-slate-950" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
          <path fill="currentColor" d="M0,32L80,29.3C160,27,320,21,480,26.7C640,32,800,48,960,48C1120,48,1280,32,1360,24L1440,16L1440,60L0,60Z" />
        </svg>
      </section>

      {/* ── PROCLAMATION / STORY ───────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="sticky top-32 rounded-2xl border border-amber-200/60 bg-white p-6 shadow-sm dark:border-amber-900/40 dark:bg-slate-900">
              <ScrollText className="h-6 w-6 text-amber-700 dark:text-amber-400" />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
                On record since 1913
              </p>
              <h2 className="mt-2 font-serif text-2xl font-extrabold leading-tight text-slate-900 dark:text-white">
                The story of preventive health in Sri Lanka
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Written from the founding minutes of the Sanitary Branch, the historic Cumpston Report and a century
                of fieldwork by Sri Lankan officers.
              </p>
              <div className="mt-5 flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />Royal Health Institution syllabus</span>
                <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />Higher Diploma — NIHS Kalutara</span>
                <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />Statutory uniformed cadre</span>
              </div>
            </div>
          </aside>

          <div className="space-y-6 text-base leading-relaxed text-slate-700 dark:text-slate-300 lg:col-span-8">
            <p className="font-serif text-lg first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-amber-700 dark:first-letter:text-amber-400">
              At the inception of the Sanitary Branch of the Medical Department in 1913, six Sanitary Inspectors
              were appointed after six months&rsquo; training at the Colombo Medical College. Recruitment continued
              bi-annually, drawing the most able science graduates of the day into a field-first cadre modelled on
              the British Royal Health Institution.
            </p>
            <p>
              Sanitary Inspectors played a major role in the control activities carried out during the devastating
              malaria epidemic of 1934/35. With the inauguration of the Malaria Control and Health Scheme in 1937,
              their designation was changed from Sanitary Inspector to Sanitary Assistant and back again into
              Sanitary Inspector. It was with the implementation of the recommendations of Dr Cumpston&rsquo;s
              Report on the 1<sup>st</sup> of July 1954 that the designation was finally changed to Public Health
              Inspector.
            </p>
            <p>
              Across more than a century, PHIs led the eradication of smallpox (Wasuriya), the control of every
              major communicable disease outbreak, the establishment of a safe and healthy food culture, the
              wellbeing of school children, the reduction of occupational health hazards and the steady rise of
              national vaccination coverage. Today the cadre numbers roughly 1,793 officers serving as the main
              enforcement and prevention team island-wide.
            </p>
            <figure className="rounded-2xl border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-transparent p-5 dark:from-amber-950/30">
              <Quote className="mb-2 h-5 w-5 text-amber-700 dark:text-amber-400" />
              <blockquote className="font-serif text-lg italic text-slate-800 dark:text-slate-200">
                &ldquo;The Public Health Inspector remains the most enduring fieldwork institution of preventive
                medicine in South Asia.&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                &mdash; Cumpston Report, 1954 (paraphrased)
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ────────────────────────────────────────────────────── */}
      <section className="relative bg-[#1a2540] py-16 text-white sm:py-20">
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Charted milestones</p>
              <h2 className="mt-2 font-serif text-3xl font-extrabold sm:text-4xl">A century in seven moments</h2>
            </div>
            <Link href="/public/news" className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/10">
              News &amp; events <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((m) => (
              <li key={m.year} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-transform hover:-translate-y-1 hover:border-amber-300/40">
                <span className="absolute -right-3 -top-3 rounded-full bg-amber-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-900">
                  {m.tag}
                </span>
                <p className="font-serif text-lg font-bold text-amber-300">{m.year}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-200/90">{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CREST PRINCIPLES (no stat-grid like home) ──────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          <CrestCard
            icon={<Shield className="h-5 w-5" />}
            kicker="01 &middot; Mandate"
            title="Mission"
            body="Environmental health management focused on the control of communicable and non-communicable diseases, the restoration of health and the enforcement of health regulations — at the citizen&rsquo;s doorstep."
          />
          <CrestCard
            icon={<Globe className="h-5 w-5" />}
            kicker="02 &middot; Horizon"
            title="Vision"
            body="A healthy nation built on a safe environment, where every Sri Lankan — from the city to the remotest village — benefits from preventive health that is professional, evidence-led and free at the point of need."
          />
          <CrestCard
            icon={<BadgeCheck className="h-5 w-5" />}
            kicker="03 &middot; Code"
            title="Values"
            body="Integrity in enforcement, compassion in community work, science in decision-making and solidarity within the cadre. Every officer is bound by the PHI service code of conduct."
          />
        </div>
      </section>

      {/* ── SCOPE OF WORK ──────────────────────────────────────────────── */}
      <section className="border-y border-amber-200/60 bg-gradient-to-b from-[#fdfaf3] to-[#f6efde] py-16 sm:py-20 dark:border-amber-900/30 dark:from-slate-900/40 dark:to-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            <h2 className="font-serif text-3xl font-extrabold text-slate-900 dark:text-white">What a PHI Does</h2>
          </div>
          <p className="mb-10 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            The PHI is a uniformed officer of the Ministry of Health whose duties span six interlocking pillars of
            preventive public health. PHI-PRO digitises every one of them.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <article key={p.title} className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-amber-900/40 dark:bg-slate-900">
                <span className="absolute right-4 top-4 font-serif text-3xl font-bold text-amber-200 dark:text-amber-900">
                  0{i + 1}
                </span>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a2540] to-[#0f1a30] text-amber-300">
                  {p.icon}
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-slate-900 dark:text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── RANKS LADDER ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Layers className="h-6 w-6 text-amber-700 dark:text-amber-400" />
            <h2 className="mt-3 font-serif text-3xl font-extrabold leading-tight text-slate-900 dark:text-white">
              Seven service ranks &mdash; one chain of command
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              The PHI service is structured as a uniformed cadre with seven progressive ranks. Officers enter as
              Class III after the Higher Diploma at the National Institute of Health Sciences and rise on merit and
              service through divisional, district and provincial supervisory roles, with the apex Principal PHI
              advising the Ministry of Health.
            </p>
          </div>
          <ol className="space-y-2 lg:col-span-7">
            {ranks.map((r) => (
              <li key={r.name} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-amber-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-700">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a2540] text-sm font-bold text-amber-300">
                  {r.tier}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-base font-bold text-slate-900 dark:text-white">{r.name}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{r.note}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── TRAINING ────────────────────────────────────────────────────── */}
      <section className="bg-[#f6efde] py-16 sm:py-20 dark:bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            <h2 className="font-serif text-3xl font-extrabold text-slate-900 dark:text-white">Where PHIs Are Trained</h2>
          </div>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Trainee PHIs complete a two-year Higher Diploma at the National Institute of Health Sciences in Kalutara,
            with regional practicums across the island. Entry requires GCE (O/L) credit passes in Sinhala/Tamil,
            Mathematics, Science and English, and GCE (A/L) passes in Biology or Combined Mathematics.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trainingCentres.map((c) => (
              <article key={`${c.name}-${c.loc}`} className="rounded-2xl border border-amber-200/60 bg-white p-5 shadow-sm dark:border-amber-900/30 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <Building2 className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">{c.loc}</span>
                </div>
                <p className="mt-3 font-serif text-base font-bold text-slate-900 dark:text-white">{c.name}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{c.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0f1a30] via-[#1a2540] to-[#0a1224] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">PHI-PRO platform</p>
              <h2 className="mt-2 font-serif text-3xl font-extrabold sm:text-4xl">Industrial digital enforcement</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-200/80">
                Commissioned to modernise PHI operations, PHI-PRO carries the statutory work of every officer from
                inspection through prosecution — secure, auditable, built for the field.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              {platformFeatures.map((f) => (
                <article key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors hover:bg-white/10">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300 text-slate-900 shadow-lg">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 font-serif text-base font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200/80">{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OFFICE BEARERS ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          <h2 className="font-serif text-3xl font-extrabold text-slate-900 dark:text-white">Office Bearers</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {officeBearers.map((o) => (
            <article key={o.role} className="group relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-lg dark:border-amber-900/40 dark:bg-slate-900">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#1a2540] to-[#0a1224] p-3">
                <Image src="/phi-emblem.png" alt="" width={56} height={56} className="h-14 w-14" />
              </div>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">{o.role}</p>
              <p className="mt-1 font-serif text-lg font-extrabold text-slate-900 dark:text-white">{o.name}</p>
              <a href={`tel:${o.tel.replace(/\s/g, '')}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-amber-700 dark:text-slate-400 dark:hover:text-amber-400">
                <Phone className="h-3 w-3" /> {o.tel}
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* ── PARTNER BODIES ───────────────────────────────────────────────── */}
      <section className="border-t border-amber-200/60 bg-[#fdfaf3] py-16 dark:border-amber-900/30 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-2 flex items-center gap-2">
            <Globe className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            <h2 className="font-serif text-3xl font-extrabold text-slate-900 dark:text-white">Partner Agencies</h2>
          </div>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Ministry of Health agencies and professional bodies the PHI corps works alongside every day. Links open
            in a new tab.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partnerBodies.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-amber-200/60 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md dark:border-amber-900/30 dark:bg-slate-900 dark:hover:border-amber-600"
              >
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1a2540] to-[#0a1224] text-[11px] font-bold tracking-tight text-amber-300">
                  {p.abbr}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words font-serif text-sm font-bold leading-snug text-slate-900 dark:text-white">
                    {p.name}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-700 group-hover:underline dark:text-amber-400">
                    Visit site <ExternalLink className="h-3 w-3" />
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT STRIP ────────────────────────────────────────────────── */}
      <section id="contact" className="bg-gradient-to-br from-[#1a2540] via-[#0f1a30] to-[#0a1224] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Reach the Union</p>
            <h3 className="mt-2 font-serif text-2xl font-extrabold">Talk to a real person</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-200/80">
              The Union secretariat operates Monday – Friday, 09:00 – 16:00 (IST). For after-hours public-health
              emergencies, please call the Ministry hotline <strong>1390</strong>.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-300/30 bg-white/5 p-5 backdrop-blur lg:col-span-1">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300"><Phone className="h-4 w-4" /> Telephone</div>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><a href="tel:+94112635675" className="hover:underline">(+94) 11 263 5675</a> <span className="text-slate-400">&middot; main</span></li>
              <li><a href="tel:+94112670759" className="hover:underline">(+94) 11 267 0759</a> <span className="text-slate-400">&middot; secretariat</span></li>
            </ul>
            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-amber-300"><Mail className="h-4 w-4" /> Email</div>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><a href="mailto:info@phi.lk" className="hover:underline">info@phi.lk</a></li>
              <li><a href="mailto:phisrilanka1@gmail.com" className="hover:underline">phisrilanka1@gmail.com</a></li>
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-300/30 bg-white/5 p-5 backdrop-blur lg:col-span-1">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300"><MapPin className="h-4 w-4" /> Head office</div>
            <p className="mt-3 text-sm leading-relaxed text-slate-200/85">
              673 Maradana Road,<br />
              Colombo 01000,<br />
              Sri Lanka.
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=673+Maradana+Road+Colombo+01000+Sri+Lanka"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:underline"
            >
              Open in Google Maps <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          <h2 className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white">Quick Links</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {downloads.map((d) => (
            <a
              key={d.href}
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-white p-4 text-sm font-semibold text-slate-700 transition-colors hover:border-amber-400 hover:text-amber-800 dark:border-amber-900/30 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-amber-600"
            >
              {d.label} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

/* ───── helpers ───── */

function RibbonStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="px-4 text-left first:pl-0">
      <dd className="font-serif text-2xl font-extrabold text-amber-200 sm:text-3xl">{k}</dd>
      <dt className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">{v}</dt>
    </div>
  );
}

function CrestCard({ icon, kicker, title, body }: { icon: React.ReactNode; kicker: string; title: string; body: string }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white p-8 shadow-sm transition-shadow hover:shadow-lg dark:border-amber-900/40 dark:bg-slate-900">
      <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-100/60 blur-2xl transition-colors group-hover:bg-amber-200/80 dark:bg-amber-900/20" aria-hidden />
      <div className="relative flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a2540] to-[#0a1224] text-amber-300">{icon}</div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400" dangerouslySetInnerHTML={{ __html: kicker }} />
      </div>
      <h3 className="relative mt-5 font-serif text-2xl font-extrabold text-slate-900 dark:text-white">{title}</h3>
      <p className="relative mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400" dangerouslySetInnerHTML={{ __html: body }} />
    </article>
  );
}
