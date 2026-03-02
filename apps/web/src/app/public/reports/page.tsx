'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  MapPin,
  BarChart3,
  Shield,
  TrendingUp,
  Activity,
  UtensilsCrossed,
  Bug,
  Droplets,
  Search,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ── Published Reports Data ────────────────────────────────────────────────
// In production, this would be fetched from the Firestore `published_reports` collection

type ReportCategory = 'all' | 'food' | 'epidemiology' | 'environment' | 'occupational' | 'monthly';

interface PublishedReport {
  id: string;
  title: string;
  category: ReportCategory;
  type: string;
  publishedDate: string;
  author: string;
  authorRole: string;
  mohArea: string;
  summary: string;
  highlights: string[];
  stats?: { label: string; value: string }[];
}

const PUBLISHED_REPORTS: PublishedReport[] = [
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
    summary: 'Annual summary of the school health programme covering medical inspections, dental screenings, BMI assessments, and immunization coverage across all schools in the Colombo MOH area.',
    highlights: [
      '45 schools covered — 12,340 students examined',
      'BMI screening: 8% underweight, 12% overweight',
      'Dental caries prevalence: 34% (down from 41% in 2023)',
      'Deworming coverage: 97%',
      'HPV vaccination coverage for Grade 6 girls: 94%',
    ],
    stats: [
      { label: 'Schools', value: '45' },
      { label: 'Students', value: '12,340' },
      { label: 'Deworming', value: '97%' },
      { label: 'HPV Vaccine', value: '94%' },
    ],
  },
];

const CATEGORIES: { value: ReportCategory; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Reports', icon: FileText },
  { value: 'food', label: 'Food Safety', icon: UtensilsCrossed },
  { value: 'epidemiology', label: 'Epidemiology', icon: Bug },
  { value: 'environment', label: 'Environment', icon: Droplets },
  { value: 'occupational', label: 'Occupational Health', icon: Activity },
  { value: 'monthly', label: 'Periodic Summaries', icon: BarChart3 },
];

const categoryColor: Record<string, string> = {
  food: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400',
  epidemiology: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400',
  environment: 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
  occupational: 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400',
  monthly: 'bg-violet-100 text-violet-800 dark:bg-violet-950/30 dark:text-violet-400',
};

export default function PublishedReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('all');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const filtered = PUBLISHED_REPORTS.filter((r) => {
    const matchCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mohArea.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Link href="/public">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-600" />
              Published Health Reports
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View published inspection reports, surveillance data, and health statistics from PHI officers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1">
              <Shield className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Official Data</span>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Reports Published', value: '24', icon: FileText, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' },
            { label: 'Areas Covered', value: '12', icon: MapPin, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
            { label: 'Inspections YTD', value: '2,847', icon: TrendingUp, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
            { label: 'Last Updated', value: 'Feb 2025', icon: Calendar, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search reports by title, area, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4 text-muted-foreground mr-1" />
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ReportCategory)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  <cat.icon className="h-3 w-3" />
                  {cat.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Results */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {filtered.length} report{filtered.length !== 1 ? 's' : ''} found
          </p>

          {filtered.map((report) => {
            const isExpanded = expandedReport === report.id;
            return (
              <Card
                key={report.id}
                className="overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="p-0">
                  {/* Report Header */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              categoryColor[report.category] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {report.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {report.id}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold leading-snug">
                          {report.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {report.summary}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Published: {report.publishedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {report.mohArea}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {report.author} ({report.authorRole})
                      </span>
                    </div>

                    {/* Stats Row */}
                    {report.stats && (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-2">
                        {report.stats.map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded-lg bg-slate-50 dark:bg-slate-800/50 py-2 px-3 text-center"
                          >
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                              {stat.value}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Expand/Collapse */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          setExpandedReport(isExpanded ? null : report.id)
                        }
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        {isExpanded ? 'Hide Details' : 'View Details'}
                        {isExpanded ? (
                          <ChevronUp className="ml-1 h-3 w-3" />
                        ) : (
                          <ChevronDown className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Download className="mr-1 h-3 w-3" />
                        Download PDF
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t bg-slate-50/50 dark:bg-slate-900/50 p-5 space-y-3">
                      <h4 className="text-sm font-semibold">Key Findings</h4>
                      <ul className="space-y-2">
                        {report.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                            {h}
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2 text-xs text-muted-foreground">
                        <p>
                          This report was generated by the PHI-PRO Digital Health Enforcement System
                          and published by an authorized officer of the Ministry of Health, Sri Lanka.
                          Data is subject to periodic updates and corrections.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 font-medium text-muted-foreground">No reports found</p>
                <p className="text-sm text-muted-foreground/70">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Disclaimer */}
        <Card className="border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/10 border-0 shadow-sm">
          <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-indigo-800 dark:text-indigo-300">
              About Published Reports
            </p>
            <p>
              These reports are published by authorized Public Health Inspectors (PHIs) and
              supervised by MOH Administrators. All data is sourced from official PHI-PRO
              field records. Reports are published quarterly, monthly, or weekly depending on
              the domain. For questions, contact your nearest MOH office or email{' '}
              <span className="font-medium">info@phipro.health.gov.lk</span>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
