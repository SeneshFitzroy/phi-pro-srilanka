'use client';

// Officer Resources — combines the previous /public/duty (statutory duties)
// and /public/downloads (forms, newsletters, circulars) into a single
// authenticated page. Only PHI / SPHI / MOH_ADMIN see this; the public
// routes redirect citizens to the public portal.

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen, FileText, Download, FileSpreadsheet, FileBadge,
  UtensilsCrossed, Activity, School, HardHat, Home, Droplets, Bug,
  Stethoscope, ScrollText, GraduationCap, ArrowLeft, Search,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { buildPdf, buildXlsx, downloadBlob, slugify } from '@/lib/resource-files';

const duties = [
  { icon: UtensilsCrossed, title: 'Food Safety & Hygiene',           points: [
    'Inspection and grading of food premises under the Food Act No. 26 of 1980 (H800 form, 100-point system).',
    'Routine and complaint-driven food sampling and submission to the Government Analyst.',
    'Licensing of food handlers, eating houses, bakeries and food trade establishments.',
    'Enforcement action — improvement notices, prohibition notices and prosecution.',
  ] },
  { icon: Activity, title: 'Communicable Disease Control',          points: [
    'Notification and investigation of communicable diseases (H399 form).',
    'Contact tracing, isolation advice and follow-up of cases.',
    'Outbreak investigation and containment in the field.',
    'Maintaining surveillance returns for the Epidemiology Unit.',
  ] },
  { icon: Bug, title: 'Vector Control',                              points: [
    'Anti-mosquito and anti-larval operations under the Dengue regulations.',
    'Premises inspection for breeding sites and issuing of notices.',
    'Community mobilisation for source reduction campaigns.',
  ] },
  { icon: Home, title: 'Environmental Sanitation',                   points: [
    'Supervision of solid waste, wastewater and excreta disposal under the National Environmental Act.',
    'Inspection of housing, markets, public latrines and burial grounds.',
    'Control of nuisances and unsanitary conditions.',
  ] },
  { icon: Droplets, title: 'Water Quality & WASH',                   points: [
    'Sampling of drinking water sources and chlorination supervision.',
    'Inspection of wells, tube-wells and pipe-borne supplies.',
    'Promotion of safe water, sanitation and hygiene (WASH).',
  ] },
  { icon: HardHat, title: 'Occupational Health',                     points: [
    'Inspection of factories and workplaces under the Factories Ordinance No. 45 of 1942.',
    'Assessment of occupational hazards, ventilation, lighting and welfare facilities.',
    'Worker health surveys and advice to employers.',
  ] },
  { icon: School, title: 'School Health',                            points: [
    'School medical inspections, defect identification and referral.',
    'Support to the school immunisation programme.',
    'Inspection of school WASH facilities, canteens and the environment.',
  ] },
  { icon: Stethoscope, title: 'Maternal & Child Health Support',     points: [
    'Support to public health midwives in field health work.',
    'Health promotion at clinics and community level.',
    'Assistance with nutrition and growth-monitoring programmes.',
  ] },
  { icon: GraduationCap, title: 'Health Education',                  points: [
    'Conducting health education sessions for the public, schools and food handlers.',
    'Awareness campaigns on prevention of communicable and non-communicable diseases.',
    'Distribution of IEC material.',
  ] },
  { icon: ScrollText, title: 'Law Enforcement & Administration',     points: [
    'Enforcement of public health legislation and local authority by-laws.',
    'Preparation of monthly returns, area surveys and GN division mapping.',
    'Court work — preparation of charge sheets and giving evidence.',
  ] },
];

type Doc = { title: string; desc: string; kind: 'PDF' | 'DOC' | 'XLS'; group: string };
const docs: Doc[] = [
  { group: 'Membership',  title: 'Union Membership Application Form',       desc: 'Application for new membership of the PHI Union of Sri Lanka.',                 kind: 'PDF' },
  { group: 'Membership',  title: 'Welfare Fund Nomination Form',            desc: 'Nominee declaration for the members\' welfare fund.',                          kind: 'PDF' },
  { group: 'Governance',  title: 'Constitution of the Union',               desc: 'Rules and constitution of the Public Health Inspector\'s Union.',             kind: 'PDF' },
  { group: 'Governance',  title: 'AGM 2024 — Minutes & Resolutions',        desc: 'Minutes of the most recent Annual General Meeting.',                          kind: 'PDF' },
  { group: 'Newsletters', title: 'PHI Union Newsletter — Latest Issue',     desc: 'Quarterly newsletter of the Union.',                                          kind: 'PDF' },
  { group: 'Newsletters', title: 'Newsletter Archive (2016–2024)',          desc: 'Back issues of the Union newsletter.',                                        kind: 'PDF' },
  { group: 'Field Forms', title: 'H800 — Food Premises Inspection Form',    desc: 'Official 100-point food premises grading form (also digital in PHI-PRO).',    kind: 'PDF' },
  { group: 'Field Forms', title: 'H399 — Communicable Disease Notification', desc: 'Notification form for communicable diseases (also digital in Epidemiology).', kind: 'PDF' },
  { group: 'Field Forms', title: 'Monthly Return Template',                 desc: 'PHI monthly work return spreadsheet.',                                        kind: 'XLS' },
  { group: 'Circulars',   title: 'MOH Circular — Food Sampling Procedure',  desc: 'Standard operating procedure for food sampling.',                             kind: 'PDF' },
  { group: 'Circulars',   title: 'MOH Circular — Dengue Vector Control',    desc: 'Guidelines for anti-larval and source-reduction operations.',                 kind: 'PDF' },
];

const iconFor = (k: Doc['kind']) => (k === 'XLS' ? FileSpreadsheet : k === 'DOC' ? FileBadge : FileText);

type Tab = 'duty' | 'downloads';

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('duty');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = searchParams.get('tab');
    if (q === 'downloads' || q === 'duty') setTab(q);
  }, [searchParams]);

  const handleDownload = (d: Doc) => {
    try {
      if (d.kind === 'XLS') {
        const blob = buildXlsx('Monthly Return', ['No.', 'Activity', 'Target', 'Achieved', 'Remarks'], [
          [1, 'Food premises inspected (H800)', 40, '', ''],
          [2, 'Food samples taken (H802)', 12, '', ''],
          [3, 'Communicable disease notifications (H399)', '', '', ''],
          [4, 'School medical inspections', 6, '', ''],
          [5, 'Factory / workplace inspections', 8, '', ''],
          [6, 'Anti-larval premises inspections', 150, '', ''],
          [7, 'Health education sessions', 10, '', ''],
          [8, 'Court / enforcement actions', '', '', ''],
        ]);
        downloadBlob(blob, `${slugify(d.title)}.xlsx`);
      } else {
        const blob = buildPdf(d.title, [
          d.desc,
          `Category: ${d.group}`,
          'This is an official PHI-PRO reference copy generated for field use. Always verify against the latest gazette / MOH circular before relying on it for enforcement.',
          'Issued by: Public Health Inspectorate of Sri Lanka.',
          `Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}.`,
        ]);
        downloadBlob(blob, `${slugify(d.title)}.pdf`);
      }
      toast.success(`Downloaded ${d.title}.`);
    } catch {
      toast.error('Could not generate the file. Please try again.');
    }
  };

  const groups = Array.from(new Set(docs.map((d) => d.group)));
  const filteredDocs = docs.filter((d) =>
    !search.trim()
    || d.title.toLowerCase().includes(search.toLowerCase())
    || d.desc.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <BookOpen className="h-6 w-6 text-blue-700 dark:text-blue-300" /> Officer Resources
          </h1>
          <p className="text-sm text-muted-foreground">
            Statutory duties of the PHI cadre · Union forms, newsletters, circulars and downloadable field forms — restricted to PHI, SPHI and MOH staff.
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <Button
          variant={tab === 'duty' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('duty')}
          className={tab === 'duty' ? 'bg-blue-700 hover:bg-blue-800' : ''}
        >
          <ScrollText className="mr-1.5 h-3.5 w-3.5" /> Duty of PHI
        </Button>
        <Button
          variant={tab === 'downloads' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('downloads')}
          className={tab === 'downloads' ? 'bg-blue-700 hover:bg-blue-800' : ''}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" /> Downloads
        </Button>
      </div>

      {tab === 'duty' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {duties.map((d) => (
            <Card key={d.title}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="inline-flex rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 p-2.5"><d.icon className="h-5 w-5 text-white" /></div>
                  <h2 className="text-base font-bold">{d.title}</h2>
                </div>
                <ul className="mt-3 space-y-2">
                  {d.points.map((p) => (
                    <li key={p} className="flex gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />{p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search forms, newsletters, circulars…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {groups.map((g) => {
            const items = filteredDocs.filter((d) => d.group === g);
            if (items.length === 0) return null;
            return (
              <div key={g}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{g}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((d) => {
                    const Icon = iconFor(d.kind);
                    return (
                      <Card key={d.title}>
                        <CardContent className="flex h-full flex-col p-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-blue-50 p-2.5 dark:bg-blue-950/50"><Icon className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{d.title}</p>
                              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d.desc}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownload(d)}
                            className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-950/40"
                          >
                            <Download className="h-3.5 w-3.5" /> {d.kind} · Download
                          </button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
