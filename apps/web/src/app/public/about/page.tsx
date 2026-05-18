import type { Metadata } from 'next';
import Image from 'next/image';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import {
  Shield, Globe, History, Users, ExternalLink, Award, BookOpen, Building2, Sparkles,
  HeartPulse, BadgeCheck, GraduationCap, Layers, Stethoscope, Microscope, Phone, Mail,
  MapPin, Languages, ShieldCheck, Briefcase, Activity, Quote,
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

const partnerBodies: Array<{ region: string; country: string; name: string; abbr: string; url: string }> = [
  { region: 'Sri Lanka', country: 'Sri Lanka', name: 'Ministry of Health',                                       abbr: 'MOH',    url: 'https://www.health.gov.lk/' },
  { region: 'Sri Lanka', country: 'Sri Lanka', name: 'Epidemiology Unit',                                        abbr: 'Epid',   url: 'https://www.epid.gov.lk/' },
  { region: 'Sri Lanka', country: 'Sri Lanka', name: 'Health Promotion Bureau',                                  abbr: 'HPB',    url: 'https://www.hpb.health.gov.lk/' },
  { region: 'Sri Lanka', country: 'Sri Lanka', name: 'Family Health Bureau',                                     abbr: 'FHB',    url: 'https://fhb.health.gov.lk/' },
  { region: 'Sri Lanka', country: 'Sri Lanka', name: 'National Institute of Health Sciences',                    abbr: 'NIHS',   url: 'https://nihs.health.gov.lk/' },
  { region: 'Sri Lanka', country: 'Sri Lanka', name: 'College of Community Physicians of Sri Lanka',             abbr: 'CCPSL',  url: 'https://ccpsl.lk/' },
];

const milestones = [
  { year: '1913',          text: 'Sanitary Branch of the Medical Department established. Six Sanitary Inspectors were appointed after six months\' training at the Colombo Medical College.' },
  { year: '1934 – 1935',   text: 'Sanitary Inspectors lead front-line control activities during the devastating malaria epidemic that swept the island.' },
  { year: '1937',          text: 'On the inauguration of the Malaria Control and Health Scheme, the designation changes from Sanitary Inspector to Sanitary Assistant.' },
  { year: '1 July 1954',   text: 'Implementing the recommendations of Dr Cumpston\'s Report, the cadre is renamed Public Health Inspector (PHI).' },
  { year: '1960s – 1990s', text: 'Eradication of smallpox (Wasuriya), control of communicable diseases, the building of a safe-food culture and the school-health programme — all led by PHIs island-wide.' },
  { year: 'Today',         text: 'Roughly 1,793 PHIs and Administrative PHIs serve as the front-line prevention team for 21.9 million citizens across all 26 districts.' },
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
  'Principal Public Health Inspector',
  'Supervising PHI — Provincial',
  'Supervising PHI — District',
  'Supervising PHI — Divisional',
  'Public Health Inspector Class I',
  'Public Health Inspector Class II',
  'Public Health Inspector Class III',
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
  { label: 'PHI service manual',           href: 'https://phi.lk/wp-content/uploads/manual.pdf' },
  { label: 'Union membership form',        href: 'https://phi.lk/membership' },
  { label: 'Food Act No. 26 of 1980',      href: 'https://www.health.gov.lk/foodact' },
  { label: 'Quarantine Ordinance',          href: 'https://www.health.gov.lk/quarantine' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      {/* Hero — compact, no CTA buttons */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-blue-950/30">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-700/20" aria-hidden />
        <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-700/20" aria-hidden />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              <Shield className="h-3 w-3" /> About the Union &middot; Est. 1913
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.6rem] dark:text-white">
              The Public Health Inspector&rsquo;s Union of Sri Lanka
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
              For more than a century the Public Health Inspector has been the front-line preventive officer of the
              Ministry of Health. From the Sanitary Branch of 1913 to the digital enforcement of today, generations
              of PHIs have eradicated smallpox, contained dengue, made street food safer and brought immunisation to
              every village. The Union represents them &mdash; one voice, one register, one professional standard.
            </p>

            <figure className="mt-5 max-w-xl border-l-4 border-blue-700 pl-4 italic text-slate-700 dark:border-blue-400 dark:text-slate-300">
              <Quote className="mb-2 h-5 w-5 text-blue-700 dark:text-blue-400" />
              &ldquo;Prevention is better than cure.&rdquo;
              <figcaption className="mt-2 text-xs not-italic text-slate-500">Motto of the PHI service</figcaption>
            </figure>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              <Stat icon={<Award      className="h-4 w-4" />} k="112+"   v="years of service" />
              <Stat icon={<Users      className="h-4 w-4" />} k="1,793"  v="officers nationally" />
              <Stat icon={<HeartPulse className="h-4 w-4" />} k="21.9 M" v="citizens protected" />
              <Stat icon={<MapPin     className="h-4 w-4" />} k="26"     v="districts covered" />
              <Stat icon={<Building2  className="h-4 w-4" />} k="354"    v="MOH divisions" />
              <Stat icon={<GraduationCap className="h-4 w-4" />} k="6"   v="training centres" />
            </div>
          </div>
        </div>
      </section>

      {/* History (long-form) */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Story</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Trace the lineage of preventive health in Sri Lanka — from Sanitary Inspectors in 1913 to the
              digitally-enabled PHI of today.
            </p>
          </div>
          <div className="lg:col-span-2">
            <div className="space-y-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <p>
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
            </div>
          </div>
        </div>

        <ol className="relative mt-12 space-y-6 border-l-2 border-blue-200 pl-6 dark:border-blue-900">
          {milestones.map((m) => (
            <li key={m.year} className="relative">
              <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-700 dark:border-slate-900" />
              <p className="text-sm font-bold text-blue-700 dark:text-blue-400">{m.year}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{m.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Mission / Vision / Values */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <ValueCard
              tone="blue"
              icon={<Shield className="h-5 w-5 text-white" />}
              title="Our Mission"
              body="Environmental health management focused on the control of communicable and non-communicable diseases, the restoration of health and the enforcement of health regulations — at the citizen&rsquo;s doorstep."
            />
            <ValueCard
              tone="amber"
              icon={<Globe className="h-5 w-5 text-white" />}
              title="Our Vision"
              body="A healthy nation built on a safe environment — where every Sri Lankan, from city to remote village, benefits from preventive health that is professional, evidence-led and free at the point of need."
            />
            <ValueCard
              tone="emerald"
              icon={<BadgeCheck className="h-5 w-5 text-white" />}
              title="Our Values"
              body="Integrity in enforcement, compassion in community work, science in decision-making and solidarity within the cadre. Every officer is bound by the PHI service code of conduct."
            />
          </div>
        </div>
      </section>

      {/* Scope of work */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What a PHI Does</h2>
        </div>
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          The PHI is a uniformed officer of the Ministry of Health whose duties span six interlocking pillars of
          preventive public health. The platform you are using digitises all of them.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 text-white">
                {p.icon}
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Training */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-700 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Training Pipeline</h2>
          </div>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Trainee PHIs complete a two-year Higher Diploma at the National Institute of Health Sciences in Kalutara,
            with regional practicums across the island. Entry requires GCE (O/L) credit passes in Sinhala/Tamil,
            Mathematics, Science and English, and GCE (A/L) passes in Biology or Combined Mathematics.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trainingCentres.map((c) => (
              <div key={`${c.name}-${c.loc}`} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</p>
                </div>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{c.loc}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{c.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ranks */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Service Ranks</h2>
        </div>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ranks.map((r, i) => (
            <li key={r} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">{i + 1}</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Platform features (industrial / professional) */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-300">PHI-PRO platform</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Digital Enforcement, Industrial Scale</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-blue-100/90">
            PHI-PRO is the official digital workspace commissioned to modernise PHI operations. It carries the
            statutory work of every officer from inspection through prosecution &mdash; secure, auditable and built
            for the field.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors hover:bg-white/10">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-base font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-100/80">{f.body}</p>
              </div>
            ))}
          </div>
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
              <a href={`tel:${o.tel.replace(/\s/g, '')}`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300">
                <Phone className="h-3 w-3" /> {o.tel}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Partner bodies */}
      <section className="border-t border-slate-200 bg-slate-50/70 py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-2 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-700 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Partner Agencies</h2>
          </div>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Ministry of Health agencies and professional bodies that PHIs work alongside every day. Links open in a
            new tab.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partnerBodies.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
              >
                <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-bold tracking-tight text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                  {p.abbr}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {p.region} &middot; {p.country}
                  </p>
                  <p className="mt-0.5 break-words text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                    {p.name}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-700 group-hover:underline dark:text-blue-400">
                    Visit site <ExternalLink className="h-3 w-3" />
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">Reach the Union</p>
            <h3 className="mt-1 text-xl font-bold">Talk to a real person</h3>
            <p className="mt-2 text-sm text-blue-100/90">
              The Union secretariat operates Monday – Friday, 09:00 – 16:00 (IST). For after-hours public-health
              emergencies, please call the Ministry hotline <strong>1390</strong>.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-bold"><Phone className="h-4 w-4" /> Telephone</div>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><a href="tel:+94112635675" className="hover:underline">(+94) 11 263 5675</a> &middot; main</li>
              <li><a href="tel:+94112670759" className="hover:underline">(+94) 11 267 0759</a> &middot; secretariat</li>
            </ul>
            <div className="mt-4 flex items-center gap-2 text-sm font-bold"><Mail className="h-4 w-4" /> Email</div>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><a href="mailto:info@phi.lk" className="hover:underline">info@phi.lk</a></li>
              <li><a href="mailto:phisrilanka1@gmail.com" className="hover:underline">phisrilanka1@gmail.com</a></li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-bold"><MapPin className="h-4 w-4" /> Head office</div>
            <p className="mt-3 text-sm leading-relaxed text-blue-100/90">
              673 Maradana Road,<br />
              Colombo 01000,<br />
              Sri Lanka.
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=673+Maradana+Road+Colombo+01000+Sri+Lanka"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-200 hover:underline"
            >
              Open in Google Maps <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quick Links</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {downloads.map((d) => (
            <a
              key={d.href}
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700"
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
function Stat({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">{icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{v}</span>
      </div>
      <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{k}</p>
    </div>
  );
}

function ValueCard({ icon, title, body, tone }: { icon: React.ReactNode; title: string; body: string; tone: 'blue' | 'amber' | 'emerald' }) {
  const accents = {
    blue:    { ring: 'border-blue-100 dark:border-blue-900/50',       grad: 'from-blue-600 to-blue-900' },
    amber:   { ring: 'border-amber-100 dark:border-amber-900/50',     grad: 'from-amber-500 to-orange-600' },
    emerald: { ring: 'border-emerald-100 dark:border-emerald-900/50', grad: 'from-emerald-500 to-teal-700' },
  } as const;
  return (
    <div className={`rounded-2xl border bg-white p-8 dark:bg-slate-900 ${accents[tone].ring}`}>
      <div className={`inline-flex rounded-xl bg-gradient-to-br p-2.5 ${accents[tone].grad}`}>{icon}</div>
      <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400" dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}
