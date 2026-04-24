'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Send,
  Camera,
  MapPin,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ChevronRight,
  Shield,
  FileText,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import {
  computeH800Grade,
  gradeTailwind,
  H800GradingResult,
  FoodHygieneGrade,
} from '@phi-pro/shared';
import { createDocument } from '@/lib/firestore';
import { SyncStatus, InspectionStatus, PHIDomain } from '@phi-pro/shared';
import { FormScanner } from '@/components/form-scanner';

// ============================================================================
// H800 Section Definitions (Food Act Schedule 2011)
// Each section maps to Sri Lanka Food Act registered criteria
// ============================================================================

const SCORING_SECTIONS = [
  {
    id: 'premises',
    title: 'Premises & Structure',
    titleSi: 'ස්ථානය සහ ව්‍යුහය',
    maxScore: 30,
    color: 'text-blue-600',
    items: [
      { id: 'walls', label: 'Walls Condition', labelSi: 'බිත්ති තත්ත්වය', max: 5 },
      { id: 'floors', label: 'Floors Condition', labelSi: 'බිම් තත්ත්වය', max: 5 },
      { id: 'ceiling', label: 'Ceiling Condition', labelSi: 'සිවිලිම් තත්ත්වය', max: 5 },
      { id: 'ventilation', label: 'Ventilation', labelSi: 'වාතාශ්‍රය', max: 5 },
      { id: 'lighting', label: 'Lighting (min 220 lux)', labelSi: 'ආලෝකය', max: 5 },
      { id: 'pestProofing', label: 'Pest Proofing ⚠ CRITICAL', labelSi: 'කෘමි ආරක්ෂාව', max: 5 },
    ],
  },
  {
    id: 'hygiene',
    title: 'Personal Hygiene',
    titleSi: 'පුද්ගලික සනීපාරක්ෂාව',
    maxScore: 20,
    color: 'text-purple-600',
    items: [
      { id: 'uniforms', label: 'Staff Uniforms / Attire', labelSi: 'ඇඳුම', max: 5 },
      { id: 'handwashing', label: 'Hand Washing Practices', labelSi: 'අත් සෝදා ගැනීම', max: 5 },
      { id: 'healthCertificates', label: 'Health Certificates ⚠ CRITICAL', labelSi: 'සෞඛ්‍ය සහතිකය', max: 5 },
      { id: 'cleanliness', label: 'Personal Cleanliness', labelSi: 'පුද්ගලික සනීපාරක්ෂාව', max: 5 },
    ],
  },
  {
    id: 'foodHandling',
    title: 'Food Handling & Storage',
    titleSi: 'ආහාර හැසිරවීම සහ ගබඩා කිරීම',
    maxScore: 25,
    color: 'text-orange-600',
    items: [
      { id: 'coldStorage', label: 'Cold Storage (<5°C) ⚠ CRITICAL', labelSi: 'සීතල ගබඩා', max: 5 },
      { id: 'hotHolding', label: 'Hot Holding (>60°C) ⚠ CRITICAL', labelSi: 'රත් ගබඩා', max: 5 },
      { id: 'crossContamination', label: 'Cross-Contamination Prevention ⚠ CRITICAL', labelSi: 'හරස් දූෂණ', max: 5 },
      { id: 'rawCookedSeparation', label: 'Raw / Cooked Separation', labelSi: 'අමු/පිසූ වෙන් කිරීම', max: 5 },
      { id: 'dateLabeling', label: 'Date Labeling & FIFO', labelSi: 'දිනය ලේබල් කිරීම', max: 5 },
    ],
  },
  {
    id: 'equipment',
    title: 'Equipment & Utensils',
    titleSi: 'උපකරණ සහ භාජන',
    maxScore: 10,
    color: 'text-teal-600',
    items: [
      { id: 'eqCleanliness', label: 'Cleanliness', labelSi: 'පිරිසිදු බව', max: 3 },
      { id: 'calibration', label: 'Calibration (temp gauges)', labelSi: 'සංශෝධනය', max: 2 },
      { id: 'condition', label: 'General Condition', labelSi: 'සාමාන්‍ය තත්ත්වය', max: 3 },
      { id: 'rustFree', label: 'Rust-Free', labelSi: 'මල නැත', max: 2 },
    ],
  },
  {
    id: 'wasteSanitation',
    title: 'Waste & Sanitation',
    titleSi: 'අපද්‍රව්‍ය සහ සනීපාරක්ෂාව',
    maxScore: 10,
    color: 'text-rose-600',
    items: [
      { id: 'disposal', label: 'Waste Disposal System', labelSi: 'අපද්‍රව්‍ය ඉවත් කිරීම', max: 3 },
      { id: 'drainage', label: 'Drainage System ⚠ CRITICAL', labelSi: 'ජල පහසුකම', max: 2 },
      { id: 'toilets', label: 'Toilet Access & Cleanliness', labelSi: 'වැසිකිළි', max: 3 },
      { id: 'bins', label: 'Bin Condition (covered)', labelSi: 'බඳුන් තත්ත්වය', max: 2 },
    ],
  },
  {
    id: 'documentation',
    title: 'Documentation & Records',
    titleSi: 'ලේඛන සහ වාර්තා',
    maxScore: 5,
    color: 'text-green-600',
    items: [
      { id: 'supplierRecords', label: 'Supplier Records', labelSi: 'සැපයුම්කරු වාර්තා', max: 1 },
      { id: 'pestLog', label: 'Pest Control Log', labelSi: 'කෘමි ලොගය', max: 1 },
      { id: 'cleaningSchedule', label: 'Cleaning Schedule', labelSi: 'පිරිසිදු කිරීමේ කාලසූචිය', max: 1 },
      { id: 'staffTraining', label: 'Staff Training Records', labelSi: 'කාර්ය මණ්ඩල පුහුණු', max: 1 },
      { id: 'haccp', label: 'HACCP Plan / Food Safety Plan', labelSi: 'HACCP සැලැස්ම', max: 1 },
    ],
  },
] as const;

type SectionId = (typeof SCORING_SECTIONS)[number]['id'];
type SectionScores = Record<SectionId, Record<string, number>>;

const buildEmptyScores = (): SectionScores =>
  Object.fromEntries(
    SCORING_SECTIONS.map((s) => [s.id, Object.fromEntries(s.items.map((i) => [i.id, 0]))]),
  ) as SectionScores;

// ============================================================================
// Performance colour helpers (local UI — algorithm is in shared package)
// ============================================================================
function perfBadge(level: string) {
  const MAP: Record<string, string> = {
    EXCELLENT: 'bg-green-100 text-green-700',
    GOOD: 'bg-amber-100 text-amber-700',
    FAIR: 'bg-orange-100 text-orange-700',
    POOR: 'bg-red-100 text-red-700',
  };
  return MAP[level] ?? 'bg-gray-100 text-gray-700';
}

// ============================================================================
// Page component
// ============================================================================
export default function NewFoodInspectionPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [scores, setScores] = useState<SectionScores>(buildEmptyScores());
  const [premisesInfo, setPremisesInfo] = useState({
    premisesName: '',
    ownerName: '',
    address: '',
    gnDivision: '',
    registrationNo: '',
    riskLevel: 'HIGH',
    foodType: '',
  });
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const [enforceNotice, setEnforceNotice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [criticalViolationsText, setCriticalViolationsText] = useState('');

  // ── The H800 grading algorithm runs live on every keystroke ──────────────
  const grading: H800GradingResult = useMemo(
    () => computeH800Grade(scores as Record<string, Record<string, number>>),
    [scores],
  );
  // ─────────────────────────────────────────────────────────────────────────

  const handleScoreChange = useCallback(
    (sectionId: SectionId, itemId: string, value: number, max: number) => {
      const clamped = Math.min(Math.max(0, isNaN(value) ? 0 : value), max);
      setScores((prev) => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], [itemId]: clamped },
      }));
    },
    [],
  );

  const sectionScored = useCallback(
    (sectionId: string) =>
      Object.values(scores[sectionId as SectionId] ?? {}).reduce((s, v) => s + v, 0),
    [scores],
  );

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const draft = buildFormPayload('DRAFT');
      await createDocument('food_inspections', draft);
      toast.success('Draft saved — will sync when online');
    } catch {
      toast.error('Save failed — stored locally');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!premisesInfo.premisesName || !premisesInfo.ownerName) {
      toast.error('Please fill in premises name and owner name');
      return;
    }
    setIsSaving(true);
    try {
      const payload = buildFormPayload('SUBMITTED');
      await createDocument('food_inspections', payload);
      toast.success(
        `Inspection submitted — Grade ${grading.grade} (${grading.totalScore}/100)`,
      );
      router.push('/dashboard/food');
    } catch {
      toast.error('Submission failed — saved locally');
    } finally {
      setIsSaving(false);
    }
  };

  function buildFormPayload(status: 'DRAFT' | 'SUBMITTED') {
    return {
      formCode: 'H800',
      domain: PHIDomain.FOOD_SAFETY,
      status: status === 'DRAFT' ? InspectionStatus.DRAFT : InspectionStatus.SUBMITTED,
      syncStatus: SyncStatus.PENDING,
      createdBy: user?.uid ?? 'anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...premisesInfo,
      sectionScores: scores,
      totalScore: grading.totalScore,
      grade: grading.grade,
      gradingResult: {
        sectionResults: grading.sectionResults,
        criticalViolations: grading.criticalViolations,
        gradeCapped: grading.gradeCapped,
        gradeCappedReason: grading.gradeCappedReason,
        autoRecommendedNotice: grading.autoRecommendedNotice,
        algorithmVersion: grading.algorithmVersion,
        computedAt: grading.computedAt,
      },
      enforceNotice: enforceNotice || grading.autoRecommendedNotice,
      followUpDate,
      criticalViolationsText,
      notes,
    };
  }

  const gradeClasses = gradeTailwind(grading.grade);

  // Handle AI scan result — merge extracted scores into state
  const handleScanResult = useCallback(
    (result: { sections: Record<string, Record<string, number>>; premisesName?: string; ownerName?: string; address?: string }) => {
      if (result.sections) {
        setScores((prev) => {
          const merged = { ...prev };
          for (const [sectionId, items] of Object.entries(result.sections)) {
            if (merged[sectionId as SectionId]) {
              merged[sectionId as SectionId] = { ...merged[sectionId as SectionId], ...items };
            }
          }
          return merged;
        });
      }
      if (result.premisesName) setPremisesInfo((p) => ({ ...p, premisesName: result.premisesName ?? p.premisesName }));
      if (result.ownerName) setPremisesInfo((p) => ({ ...p, ownerName: result.ownerName ?? p.ownerName }));
      if (result.address) setPremisesInfo((p) => ({ ...p, address: result.address ?? p.address }));
    },
    [],
  );

  return (
    <div className="space-y-6 pb-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/food">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">New Food Inspection — H800</h1>
            <p className="text-sm text-muted-foreground">
              100-Point Automated Grading · Sri Lanka Food Act 1980
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="bg-[#0066cc] hover:bg-[#0055aa] text-white">
            <Send className="mr-2 h-4 w-4" /> Submit
          </Button>
        </div>
      </div>

      {/* ── LIVE GRADE DASHBOARD ──────────────────────────────────────── */}
      <Card className={`border-2 ${gradeClasses}`}>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Grade badge */}
            <div className="flex items-center gap-4">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl border-4 ${gradeClasses} text-4xl font-extrabold shadow`}
              >
                {grading.totalScore > 0 ? grading.grade : '—'}
              </div>
              <div>
                <p className="text-2xl font-bold">{grading.totalScore} / 100</p>
                <p className="text-sm font-semibold">{grading.gradeLabel}</p>
                {grading.gradeCapped && (
                  <p className="mt-1 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                    ⚠ Grade capped: {grading.gradeCappedReason}
                  </p>
                )}
              </div>
            </div>

            {/* Threshold reference */}
            <div className="flex gap-6 text-sm font-semibold">
              <div className="text-center">
                <div className="rounded-lg bg-green-100 px-3 py-1 text-green-700">A: 90–100</div>
                <div className="mt-1 text-xs text-muted-foreground">Excellent</div>
              </div>
              <div className="text-center">
                <div className="rounded-lg bg-amber-100 px-3 py-1 text-amber-700">B: 75–89</div>
                <div className="mt-1 text-xs text-muted-foreground">Good</div>
              </div>
              <div className="text-center">
                <div className="rounded-lg bg-red-100 px-3 py-1 text-red-700">C: 0–74</div>
                <div className="mt-1 text-xs text-muted-foreground">Needs Improvement</div>
              </div>
            </div>

            {/* Algorithm toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAlgorithm((v) => !v)}
              className="gap-2"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              {showAlgorithm ? 'Hide' : 'Show'} Algorithm
            </Button>
          </div>

          {/* Improvement gap */}
          {grading.nextGrade && grading.totalScore > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>
                <strong>{grading.percentFromNextGrade} more points</strong> needed for Grade{' '}
                {grading.nextGrade}
              </span>
            </div>
          )}

          {/* Critical violations banner */}
          {grading.criticalViolations.length > 0 && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="mb-1 flex items-center gap-1 text-sm font-bold text-red-700">
                <XCircle className="h-4 w-4" /> Critical Violations Detected
              </p>
              {grading.criticalViolations.map((v, i) => (
                <p key={i} className="text-xs text-red-600">• {v}</p>
              ))}
            </div>
          )}

          {/* Auto enforcement recommendation */}
          {grading.autoRecommendedNotice !== 'NONE' && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
              <Shield className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-amber-700">
                Auto-recommended: {grading.autoRecommendedNotice} Notice
              </span>
              {grading.followUpDays > 0 && (
                <span className="text-amber-600">· Follow-up in {grading.followUpDays} days</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── ALGORITHM TRANSPARENCY PANEL ──────────────────────────────── */}
      {showAlgorithm && (
        <Card className="border border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-blue-800">
              <Zap className="h-5 w-5 text-amber-500" />
              H800 Grading Algorithm — Deterministic Decision Logic
              <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-normal text-blue-600">
                v{grading.algorithmVersion}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md bg-white p-3 font-mono text-xs leading-relaxed text-gray-800 shadow-sm">
              <p className="font-bold text-blue-700">// STEP 1: Section scoring</p>
              {grading.sectionResults.map((r) => (
                <p key={r.sectionId}>
                  {r.sectionId.padEnd(14)} = {String(r.scored).padStart(2)} / {r.maxScore}{' '}
                  ({r.percentage}%){' '}
                  <span
                    className={`inline-block rounded px-1 py-0 text-[10px] font-bold ${perfBadge(r.performanceLevel)}`}
                  >
                    {r.performanceLevel}
                  </span>
                </p>
              ))}
              <p className="mt-1 font-bold text-blue-700">
                // STEP 2: Sum → totalScore = {grading.totalScore} / 100
              </p>
              <p className="font-bold text-blue-700">
                // STEP 3: Grade threshold check
              </p>
              <p>
                {'  '}if score {'≥'} 90 → Grade A{' '}
                {grading.grade === FoodHygieneGrade.A && !grading.gradeCapped && '← APPLIED'}
              </p>
              <p>
                {'  '}if score {'≥'} 75 → Grade B{' '}
                {grading.grade === FoodHygieneGrade.B && !grading.gradeCapped && '← APPLIED'}
              </p>
              <p>{'  '}else        → Grade C</p>
              {grading.gradeCapped && (
                <p className="font-bold text-red-700">
                  // STEP 4: Critical violation → grade capped to C
                  <br />
                  {'//'} {grading.gradeCappedReason}
                </p>
              )}
              <p className="mt-1 font-bold text-green-700">
                // RESULT: Grade {grading.grade} · {grading.totalScore}/100 ·{' '}
                {grading.gradeLabel}
              </p>
              <p className="font-bold text-amber-700">
                // ENFORCEMENT: {grading.autoRecommendedNotice}
                {grading.followUpDays > 0 && ` (follow up in ${grading.followUpDays} days)`}
              </p>
            </div>

            {/* Section bar chart */}
            <div className="space-y-2">
              <p className="font-semibold text-blue-800">Section Breakdown</p>
              {grading.sectionResults.map((r) => (
                <div key={r.sectionId} className="flex items-center gap-2">
                  <span className="w-40 truncate text-xs">{r.sectionName}</span>
                  <div className="flex-1 rounded-full bg-gray-200 h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${r.percentage}%`,
                        backgroundColor: r.percentage >= 90 ? '#22c55e' : r.percentage >= 75 ? '#eab308' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className="w-16 text-right text-xs font-bold">
                    {r.scored}/{r.maxScore}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-blue-600 italic">
              Computed at: {grading.computedAt} · All grades are deterministic per Sri Lanka Food
              Act Regulations 2011
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── PREMISES INFORMATION ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-[#0066cc]" /> Premises Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="premisesName">Premises Name *</Label>
              <Input
                id="premisesName"
                value={premisesInfo.premisesName}
                onChange={(e) => setPremisesInfo((p) => ({ ...p, premisesName: e.target.value }))}
                placeholder="e.g., Saman Hotel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                value={premisesInfo.ownerName}
                onChange={(e) => setPremisesInfo((p) => ({ ...p, ownerName: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNo">Registration No.</Label>
              <Input
                id="registrationNo"
                value={premisesInfo.registrationNo}
                onChange={(e) => setPremisesInfo((p) => ({ ...p, registrationNo: e.target.value }))}
                placeholder="H801-XXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={premisesInfo.address}
                onChange={(e) => setPremisesInfo((p) => ({ ...p, address: e.target.value }))}
                placeholder="Full address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gnDivision">GN Division</Label>
              <Input
                id="gnDivision"
                value={premisesInfo.gnDivision}
                onChange={(e) => setPremisesInfo((p) => ({ ...p, gnDivision: e.target.value }))}
                placeholder="e.g., 547A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foodType">Food Type</Label>
              <select
                id="foodType"
                value={premisesInfo.foodType}
                onChange={(e) => setPremisesInfo((p) => ({ ...p, foodType: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select type...</option>
                <option value="restaurant">Restaurant</option>
                <option value="bakery">Bakery</option>
                <option value="hotel">Hotel</option>
                <option value="grocery">Grocery Store</option>
                <option value="meat_fish">Meat / Fish Shop</option>
                <option value="tea_shop">Tea Shop</option>
                <option value="street_vendor">Street Vendor</option>
                <option value="food_factory">Food Factory</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <select
                id="riskLevel"
                value={premisesInfo.riskLevel}
                onChange={(e) => setPremisesInfo((p) => ({ ...p, riskLevel: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="HIGH">High Risk (Quarterly)</option>
                <option value="MEDIUM">Medium Risk (Biannual)</option>
                <option value="LOW">Low Risk (Annual)</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" className="gap-2" type="button">
                <MapPin className="h-4 w-4" /> Capture GPS
              </Button>
              <Button variant="outline" className="gap-2" type="button">
                <Camera className="h-4 w-4" /> Add Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── AI FORM SCANNER ──────────────────────────────────────────── */}
      <FormScanner onScanned={handleScanResult} />

      {/* ── SCORING SECTIONS ─────────────────────────────────────────── */}
      {SCORING_SECTIONS.map((section) => {
        const scored = sectionScored(section.id);
        const pct = Math.round((scored / section.maxScore) * 100);
        const sectionResult = grading.sectionResults.find((r) => r.sectionId === section.id);

        return (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className={`text-base ${section.color}`}>
                    {section.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{section.titleSi}</p>
                </div>
                <div className="flex items-center gap-3">
                  {sectionResult && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${perfBadge(sectionResult.performanceLevel)}`}
                    >
                      {sectionResult.performanceLevel}
                    </span>
                  )}
                  <span className={`text-sm font-bold ${section.color}`}>
                    {scored} / {section.maxScore}
                  </span>
                </div>
              </div>
              {/* Section progress bar */}
              <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor:
                      pct >= 90 ? '#22c55e' : pct >= 75 ? '#eab308' : '#ef4444',
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.items.map((item) => {
                  const val = scores[section.id][item.id] ?? 0;
                  const isCritical = item.label.includes('⚠');
                  const isCriticalFail = isCritical && val === 0;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${isCriticalFail ? 'bg-red-50' : ''}`}
                    >
                      {isCriticalFail ? (
                        <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                      ) : val === item.max && item.max > 0 ? (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      )}
                      <label className={`flex-1 text-sm ${isCritical ? 'font-medium' : ''}`}>
                        {item.label}
                        <span className="ml-1 text-[10px] text-muted-foreground">{item.labelSi}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={item.max}
                          value={val === 0 ? '' : val}
                          onChange={(e) =>
                            handleScoreChange(
                              section.id,
                              item.id,
                              parseInt(e.target.value) || 0,
                              item.max,
                            )
                          }
                          className={`w-16 text-center text-sm font-bold ${isCriticalFail ? 'border-red-300' : ''}`}
                          placeholder="0"
                        />
                        <span className="w-10 text-xs text-muted-foreground">/ {item.max}</span>
                        <div className="w-20 rounded-full bg-secondary h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${item.max > 0 ? (val / item.max) * 100 : 0}%`,
                              backgroundColor:
                                val === item.max
                                  ? '#22c55e'
                                  : val > item.max / 2
                                  ? '#eab308'
                                  : '#ef4444',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3">
                <Label className="text-xs text-muted-foreground">Section Observations</Label>
                <textarea
                  value={notes[section.id] || ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [section.id]: e.target.value }))}
                  placeholder="Record observations for this section..."
                  className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[56px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* ── ENFORCEMENT ACTIONS ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Enforcement Actions
          </CardTitle>
          {grading.autoRecommendedNotice !== 'NONE' && (
            <p className="text-xs text-amber-600">
              Algorithm recommends: <strong>{grading.autoRecommendedNotice}</strong> notice
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Notice Type</Label>
              <select
                value={enforceNotice || grading.autoRecommendedNotice}
                onChange={(e) => setEnforceNotice(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="NONE">No notice required</option>
                <option value="WARNING">Warning Letter</option>
                <option value="IMPROVEMENT">Improvement Notice (7 days)</option>
                <option value="CLOSURE">Closure Notice (Immediate)</option>
                <option value="COURT_SUMMONS">Court Summons (14 days)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Follow-up Date</Label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Critical Violations / Improvement Items</Label>
              <textarea
                value={criticalViolationsText}
                onChange={(e) => setCriticalViolationsText(e.target.value)}
                placeholder="List critical violations requiring immediate action..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── BOTTOM SUMMARY BAR ────────────────────────────────────────── */}
      <div className="sticky bottom-0 flex items-center justify-between rounded-xl border-2 bg-card p-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 ${gradeTailwind(grading.grade)} text-2xl font-extrabold`}
          >
            {grading.totalScore > 0 ? grading.grade : '—'}
          </div>
          <div>
            <p className="font-bold text-base">
              {grading.totalScore}/100 — Grade {grading.grade}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Auto-calculated · Food Act Regulations 2011 · v{grading.algorithmVersion}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-[#0066cc] hover:bg-[#0055aa] text-white"
          >
            <Send className="mr-2 h-4 w-4" /> Submit Inspection
          </Button>
        </div>
      </div>
    </div>
  );
}
