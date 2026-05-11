import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { UtensilsCrossed, Activity, School, HardHat, Home, Droplets, Bug, Stethoscope, ScrollText, GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Duty of PHI | The Public Health Inspector\'s Union of Sri Lanka',
  description:
    'The statutory duties and functions of a Public Health Inspector in Sri Lanka — food safety, communicable disease control, environmental sanitation, school and occupational health.',
};

const duties = [
  {
    icon: UtensilsCrossed,
    title: 'Food Safety & Hygiene',
    points: [
      'Inspection and grading of food premises under the Food Act No. 26 of 1980 (H800 form, 100-point system).',
      'Routine and complaint-driven food sampling and submission to the Government Analyst.',
      'Licensing of food handlers, eating houses, bakeries and food trade establishments.',
      'Enforcement action — improvement notices, prohibition notices and prosecution.',
    ],
  },
  {
    icon: Activity,
    title: 'Communicable Disease Control',
    points: [
      'Notification and investigation of communicable diseases (H399 form).',
      'Contact tracing, isolation advice and follow-up of cases.',
      'Outbreak investigation and containment in the field.',
      'Maintaining surveillance returns for the Epidemiology Unit.',
    ],
  },
  {
    icon: Bug,
    title: 'Vector Control',
    points: [
      'Anti-mosquito and anti-larval operations under the Dengue / Mosquito-borne diseases regulations.',
      'Premises inspection for breeding sites and issuing of notices.',
      'Community mobilisation for source reduction campaigns.',
    ],
  },
  {
    icon: Home,
    title: 'Environmental Sanitation',
    points: [
      'Supervision of solid waste, wastewater and excreta disposal under the National Environmental Act.',
      'Inspection of housing, markets, public latrines and burial grounds.',
      'Control of nuisances and unsanitary conditions.',
    ],
  },
  {
    icon: Droplets,
    title: 'Water Quality & WASH',
    points: [
      'Sampling of drinking water sources and chlorination supervision.',
      'Inspection of wells, tube-wells and pipe-borne supplies.',
      'Promotion of safe water, sanitation and hygiene (WASH).',
    ],
  },
  {
    icon: HardHat,
    title: 'Occupational Health',
    points: [
      'Inspection of factories and workplaces under the Factories Ordinance No. 45 of 1942.',
      'Assessment of occupational hazards, ventilation, lighting and welfare facilities.',
      'Worker health surveys and advice to employers.',
    ],
  },
  {
    icon: School,
    title: 'School Health',
    points: [
      'School medical inspections, defect identification and referral.',
      'Support to the school immunisation programme.',
      'Inspection of school WASH facilities, canteens and the environment.',
    ],
  },
  {
    icon: Stethoscope,
    title: 'Maternal & Child Health Support',
    points: [
      'Support to public health midwives in field health work.',
      'Health promotion at clinics and community level.',
      'Assistance with nutrition and growth-monitoring programmes.',
    ],
  },
  {
    icon: GraduationCap,
    title: 'Health Education',
    points: [
      'Conducting health education sessions for the public, schools and food handlers.',
      'Awareness campaigns on prevention of communicable and non-communicable diseases.',
      'Distribution of information, education and communication (IEC) material.',
    ],
  },
  {
    icon: ScrollText,
    title: 'Law Enforcement & Administration',
    points: [
      'Enforcement of public health legislation and local authority by-laws.',
      'Preparation of monthly returns, area surveys and Grama Niladhari division mapping.',
      'Court work — preparation of charge sheets and giving evidence.',
    ],
  },
];

export default function DutyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">Role &amp; Responsibilities</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Duties of a Public Health Inspector</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
            The Public Health Inspector is the principal grassroots officer of preventive health under the Ministry
            of Health, working from the Medical Officer of Health (MOH) area. The PHI&apos;s duties span food safety,
            disease control, environmental health, school and occupational health, and the enforcement of public
            health law.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {duties.map((d) => (
            <div key={d.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 p-2.5"><d.icon className="h-5 w-5 text-white" /></div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{d.title}</h2>
              </div>
              <ul className="mt-4 space-y-2">
                {d.points.map((p) => (
                  <li key={p} className="flex gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
