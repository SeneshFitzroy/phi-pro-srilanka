import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { FileText, Download, FileSpreadsheet, FileBadge } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Downloads | The Public Health Inspector\'s Union of Sri Lanka',
  description: 'Membership forms, newsletters, circulars and field forms of the Public Health Inspector\'s Union of Sri Lanka.',
};

type Doc = { title: string; desc: string; kind: 'PDF' | 'DOC' | 'XLS'; group: string };

const docs: Doc[] = [
  { group: 'Membership', title: 'Union Membership Application Form', desc: 'Application for new membership of the PHI Union of Sri Lanka.', kind: 'PDF' },
  { group: 'Membership', title: 'Welfare Fund Nomination Form', desc: 'Nominee declaration for the members’ welfare fund.', kind: 'PDF' },
  { group: 'Governance', title: 'Constitution of the Union', desc: 'Rules and constitution of the Public Health Inspector’s Union.', kind: 'PDF' },
  { group: 'Governance', title: 'AGM 2024 — Minutes & Resolutions', desc: 'Minutes of the most recent Annual General Meeting.', kind: 'PDF' },
  { group: 'Newsletters', title: 'PHI Union Newsletter — Latest Issue', desc: 'Quarterly newsletter of the Union.', kind: 'PDF' },
  { group: 'Newsletters', title: 'Newsletter Archive (2016–2024)', desc: 'Back issues of the Union newsletter.', kind: 'PDF' },
  { group: 'Field Forms', title: 'H800 — Food Premises Inspection Form', desc: 'Official 100-point food premises grading form (also available digitally in PHI-PRO).', kind: 'PDF' },
  { group: 'Field Forms', title: 'H399 — Communicable Disease Notification Form', desc: 'Notification form for communicable diseases.', kind: 'PDF' },
  { group: 'Field Forms', title: 'Monthly Return Template', desc: 'PHI monthly work return spreadsheet.', kind: 'XLS' },
  { group: 'Circulars', title: 'MOH Circular — Food Sampling Procedure', desc: 'Standard operating procedure for food sampling.', kind: 'PDF' },
  { group: 'Circulars', title: 'MOH Circular — Dengue Vector Control Operations', desc: 'Guidelines for anti-larval and source-reduction operations.', kind: 'PDF' },
];

const iconFor = (k: Doc['kind']) => (k === 'XLS' ? FileSpreadsheet : k === 'DOC' ? FileBadge : FileText);

export default function DownloadsPage() {
  const groups = Array.from(new Set(docs.map((d) => d.group)));
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">Resources</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Downloads</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Forms, newsletters, circulars and field documents. Members may also obtain copies from the Union secretariat at 673 Maradana Road, Colombo 01000.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        {groups.map((g) => (
          <div key={g}>
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{g}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {docs.filter((d) => d.group === g).map((d) => {
                const Icon = iconFor(d.kind);
                return (
                  <div key={d.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-blue-50 p-2.5 dark:bg-blue-950/50"><Icon className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{d.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{d.desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-950/40"
                    >
                      <Download className="h-3.5 w-3.5" /> {d.kind} · Download
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <PublicFooter />
    </div>
  );
}
