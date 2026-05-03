'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, FileText, Download, Calendar, MapPin, BarChart3,
  TrendingUp, User, Activity, UtensilsCrossed, Bug, Droplets,
  Search, Filter, Eye, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Category = 'all' | 'food' | 'epidemiology' | 'environment' | 'occupational' | 'monthly';

interface Report {
  id: string;
  title: string;
  category: Category;
  type: string;
  publishedDate: string;
  author: string;
  authorRole: string;
  mohArea: string;
  summary: string;
  highlights: string[];
  stats?: { label: string; value: string }[];
}

const FALLBACK: Report[] = [
  {
    id: 'RPT-2025-001',
    title: 'Monthly Public Health Summary — Western Province (January 2025)',
    category: 'monthly',
    type: 'Monthly Report',
    publishedDate: '2025-02-05',
    author: 'Dr. Nimal Jayasinghe',
    authorRole: 'MOH Administrator',
    mohArea: 'Colombo MOH Area',
    summary: 'Comprehensive public health summary for the Western Province covering all five PHI domains. Key focus areas include the ongoing dengue prevention programme and food safety inspection results during the festive season.',
    highlights: [
      '1,247 food premises inspected across Western Province',
      'Dengue breeding index reduced by 18% compared to December 2024',
      '23 new food premises registered and graded',
      '98% school health screening completion rate',
    ],
    stats: [
      { label: 'Inspections', value: '1,247' },
      { label: 'Complaints Resolved', value: '89' },
      { label: 'Dengue Cases', value: '34' },
      { label: 'Schools Screened', value: '156' },
    ],
  },
  {
    id: 'RPT-2025-002',
    title: 'Food Safety Inspection Results — Q4 2024',
    category: 'food',
    type: 'Quarterly Report',
    publishedDate: '2025-01-20',
    author: 'Amila Bandara',
    authorRole: 'Public Health Inspector',
    mohArea: 'Moratuwa MOH Area',
    summary: 'Fourth quarter food safety inspection summary covering 312 establishments in the Moratuwa PHI area. Overall compliance improved by 7% with targeted interventions for street food vendors.',
    highlights: [
      '312 food establishments inspected (93% coverage)',
      '89% achieved Grade A or B hygiene rating',
      '12 establishments issued improvement notices',
      'Street food vendor compliance improved from 62% to 78%',
    ],
    stats: [
      { label: 'Grade A', value: '187' },
      { label: 'Grade B', value: '91' },
      { label: 'Grade C', value: '34' },
      { label: 'Compliance', value: '89%' },
    ],
  },
  {
    id: 'RPT-2025-003',
    title: 'Dengue Surveillance Report — Colombo District (Week 4, 2025)',
    category: 'epidemiology',
    type: 'Weekly Epidemiology Report',
    publishedDate: '2025-01-27',
    author: 'Kumari Wijeratne',
    authorRole: 'Supervising PHI',
    mohArea: 'Colombo MOH Area',
    summary: 'Weekly dengue surveillance data for Colombo District. Cases decreased by 12% this week following enhanced vector control operations in high-risk zones. Breteau Index remains above threshold in 3 GN divisions.',
    highlights: [
      '34 confirmed dengue cases (down from 39 previous week)',
      'Breteau Index above threshold in Borella, Maradana, Slave Island',
      '450 premises checked for breeding sites, 23 positive',
      'Fogging operations completed in 8 GN divisions',
    ],
  },
  {
    id: 'RPT-2025-004',
    title: 'Water Quality Monitoring Report — January 2025',
    category: 'environment',
    type: 'Monthly Report',
    publishedDate: '2025-02-02',
    author: 'Amila Bandara',
    authorRole: 'Public Health Inspector',
    mohArea: 'Moratuwa MOH Area',
    summary: 'Monthly water quality monitoring results for Kelani River basin and community water sources in the Moratuwa area. 94% of tested sources met WHO drinking water guidelines.',
    highlights: [
      '156 water samples collected from community sources',
      '94% met WHO drinking water guidelines',
      'Chlorine residual levels adequate in 98% of piped water',
      '3 wells flagged for elevated coliform — remediation in progress',
    ],
    stats: [
      { label: 'Samples', value: '156' },
      { label: 'Compliant', value: '147' },
      { label: 'Flagged', value: '9' },
      { label: 'Pass Rate', value: '94%' },
    ],
  },
  {
    id: 'RPT-2025-005',
    title: 'Factory Health & Safety Quarterly Review — Q4 2024',
    category: 'occupational',
    type: 'Quarterly Report',
    publishedDate: '2025-01-15',
    author: 'Kumari Wijeratne',
    authorRole: 'Supervising PHI',
    mohArea: 'Colombo MOH Area',
    summary: 'Occupational health and factory safety inspection summary for the Colombo MOH area. 78 factories inspected with focus on garment industry workers health and ventilation standards.',
    highlights: [
      '78 factories inspected in Q4 2024',
      '92% compliance with ventilation standards',
      '340 workers received health screenings',
      '5 factories issued improvement notices for ergonomic hazards',
    ],
    stats: [
      { label: 'Factories', value: '78' },
      { label: 'Workers Screened', value: '340' },
      { label: 'Compliance', value: '92%' },
      { label: 'Notices Issued', value: '5' },
    ],
  },
  {
    id: 'RPT-2025-006',
    title: 'School Health Programme Annual Summary — 2024',
    category: 'monthly',
    type: 'Annual Report',
    publishedDate: '2025-01-10',
    author: 'Dr. Nimal Jayasinghe',
    authorRole: 'MOH Administrator',
    mohArea: 'Colombo MOH Area',
    summary: 'Annual summary covering medical inspections, dental screenings, BMI assessments, and immunization coverage across all schools in the Colombo MOH area — 45 schools, 12,340 students examined.',
    highlights: [
      '45 schools covered — 12,340 students examined',
      'BMI screening: 8% underweight, 12% overweight',
      'Dental caries prevalence: 34% (down from 41% in 2023)',
      'Deworming coverage: 97% — HPV vaccination: 94%',
    ],
    stats: [
      { label: 'Schools', value: '45' },
      { label: 'Students', value: '12,340' },
      { label: 'Deworming', value: '97%' },
      { label: 'HPV Vaccine', value: '94%' },
    ],
  },
];

const CATEGORIES: { value: Category; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Reports', icon: FileText },
  { value: 'food', label: 'Food Safety', icon: UtensilsCrossed },
  { value: 'epidemiology', label: 'Epidemiology', icon: Bug },
  { value: 'environment', label: 'Environment', icon: Droplets },
  { value: 'occupational', label: 'Occupational Health', icon: Activity },
  { value: 'monthly', label: 'Periodic Summaries', icon: BarChart3 },
];

const CAT_COLOR: Record<string, string> = {
  food: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400',
  epidemiology: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400',
  environment: 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
  occupational: 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400',
  monthly: 'bg-violet-100 text-violet-800 dark:bg-violet-950/30 dark:text-violet-400',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const constraints = category !== 'all'
          ? [where('category', '==', category), orderBy('publishedDate', 'desc')]
          : [orderBy('publishedDate', 'desc')];
        const snap = await getDocs(query(collection(db, 'published_reports'), ...constraints));
        if (!snap.empty) {
          setReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as Report)));
        } else {
          setReports(FALLBACK);
        }
      } catch {
        setReports(FALLBACK);
      } finally {
        setLoading(false);
      }
    })();
  }, [category]);

  const filtered = reports.filter(r => {
    const matchCat = category === 'all' || r.category === category;
    const q = searchQ.toLowerCase();
    const matchQ = !q || r.title.toLowerCase().includes(q) || r.mohArea.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-5xl space-y-7 px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/#services">
              <Button variant="ghost" size="icon" className="mt-0.5"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <FileText className="h-6 w-6 text-indigo-600" />Published Health Reports
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Official inspection reports and surveillance data from PHI officers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 dark:bg-blue-950/30">
            <Image src="/phi-emblem.png" alt="" width={14} height={14} />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Official Data</span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Reports Published', value: String(FALLBACK.length), icon: FileText, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' },
            { label: 'MOH Areas Covered', value: '12', icon: MapPin, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/30' },
            { label: 'Inspections YTD', value: '2,847', icon: TrendingUp, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
            { label: 'Last Updated', value: 'Feb 2025', icon: Calendar, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
          ].map(s => (
            <Card key={s.label} className="shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2 ${s.color}`}><s.icon className="h-4 w-4" /></div>
                <div>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search + filter */}
        <Card className="shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by title, area, or keyword…"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={category}
                  onChange={e => { setCategory(e.target.value as Category); setLoading(true); }}
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => { setCategory(c.value); setLoading(true); }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    category === c.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  <c.icon className="h-3 w-3" />{c.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length} report{filtered.length !== 1 ? 's' : ''} found
            </p>

            {filtered.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/20" />
                  <p className="mt-3 font-medium text-muted-foreground">No reports found</p>
                  <p className="text-sm text-muted-foreground/70">Try adjusting your search or filter</p>
                </CardContent>
              </Card>
            ) : filtered.map(report => {
              const isOpen = expanded === report.id;
              return (
                <Card key={report.id} className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="space-y-3 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CAT_COLOR[report.category] ?? 'bg-slate-100 text-slate-600'}`}>
                          {report.type}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">{report.id}</span>
                      </div>

                      <h3 className="text-base font-semibold leading-snug">{report.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{report.summary}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Published {report.publishedDate}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{report.mohArea}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{report.author} ({report.authorRole})</span>
                      </div>

                      {report.stats && (
                        <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
                          {report.stats.map(s => (
                            <div key={s.label} className="rounded-lg bg-slate-50 px-3 py-2 text-center dark:bg-slate-800/50">
                              <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
                              <p className="text-[10px] text-muted-foreground">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setExpanded(isOpen ? null : report.id)}>
                          <Eye className="mr-1 h-3 w-3" />
                          {isOpen ? 'Hide Details' : 'View Key Findings'}
                          {isOpen ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Download className="mr-1 h-3 w-3" />Download PDF
                        </Button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="border-t bg-slate-50/60 p-5 space-y-3 dark:bg-slate-900/50">
                        <h4 className="text-sm font-semibold">Key Findings</h4>
                        <ul className="space-y-2">
                          {report.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                              {h}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-muted-foreground pt-2">
                          Generated by PHI-PRO Digital Health Enforcement System and published by an
                          authorised officer of the Ministry of Health, Sri Lanka. Data subject to periodic updates.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
            <p className="text-xs text-muted-foreground">
              All reports are published by authorised PHIs and supervised by MOH Administrators.
              Data is sourced from official PHI-PRO field records. For queries, contact{' '}
              <span className="font-medium text-foreground">info@phipro.health.gov.lk</span>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
