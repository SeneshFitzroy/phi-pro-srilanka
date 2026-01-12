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
  CheckCircle,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

// H800 100-point scoring sections
const scoringSections = [
  {
    id: 'premises',
    title: 'Premises & Structure',
    titleSi: 'ස්ථානය සහ ව්‍යුහය',
    maxScore: 30,
    items: [
      { id: 'walls', label: 'Walls Condition', max: 5 },
      { id: 'floors', label: 'Floors Condition', max: 5 },
      { id: 'ceiling', label: 'Ceiling Condition', max: 5 },
      { id: 'ventilation', label: 'Ventilation', max: 5 },
      { id: 'lighting', label: 'Lighting', max: 5 },
      { id: 'pestProofing', label: 'Pest Proofing', max: 5 },
    ],
  },
  {
    id: 'hygiene',
    title: 'Personal Hygiene',
    titleSi: 'පුද්ගලික සනීපාරක්ෂාව',
    maxScore: 20,
    items: [
      { id: 'uniforms', label: 'Staff Uniforms/Attire', max: 5 },
      { id: 'handwashing', label: 'Hand Washing Practices', max: 5 },
      { id: 'healthCerts', label: 'Health Certificates', max: 5 },
      { id: 'cleanliness', label: 'Personal Cleanliness', max: 5 },
    ],
  },
  {
    id: 'foodHandling',
    title: 'Food Handling & Storage',
    titleSi: 'ආහාර හැසිරවීම සහ ගබඩා කිරීම',
    maxScore: 25,
    items: [
      { id: 'coldStorage', label: 'Cold Storage (<5°C)', max: 5 },
      { id: 'hotHolding', label: 'Hot Holding (>60°C)', max: 5 },
      { id: 'crossContamination', label: 'Cross-Contamination Prevention', max: 5 },
      { id: 'rawCookedSeparation', label: 'Raw/Cooked Separation', max: 5 },
      { id: 'dateLabeling', label: 'Date Labeling', max: 5 },
    ],
  },
  {
    id: 'equipment',
    title: 'Equipment & Utensils',
    titleSi: 'උපකරණ සහ භාජන',
    maxScore: 10,
    items: [
      { id: 'eqCleanliness', label: 'Cleanliness', max: 3 },
      { id: 'calibration', label: 'Calibration', max: 2 },
      { id: 'condition', label: 'General Condition', max: 3 },
      { id: 'rustFree', label: 'Rust-Free', max: 2 },
    ],
  },
  {
    id: 'waste',
    title: 'Waste & Sanitation',
    titleSi: 'අපද්‍රව්‍ය සහ සනීපාරක්ෂාව',
    maxScore: 10,
    items: [
      { id: 'disposal', label: 'Waste Disposal', max: 3 },
      { id: 'drainage', label: 'Drainage System', max: 2 },
      { id: 'toilets', label: 'Toilet Access & Cleanliness', max: 3 },
      { id: 'bins', label: 'Bin Condition', max: 2 },
    ],
  },
  {
    id: 'documentation',
    title: 'Documentation & Records',
    titleSi: 'ලේඛන සහ වාර්තා',
    maxScore: 5,
    items: [
      { id: 'supplierRecords', label: 'Supplier Records', max: 1 },
      { id: 'pestLog', label: 'Pest Control Log', max: 1 },
      { id: 'cleaningSchedule', label: 'Cleaning Schedule', max: 1 },
      { id: 'staffTraining', label: 'Staff Training Records', max: 1 },
      { id: 'haccp', label: 'HACCP Compliance', max: 1 },
    ],
  },
];

function getGrade(score: number): { grade: string; color: string; label: string } {
  if (score >= 90) return { grade: 'A', color: 'text-green-600 bg-green-100 border-green-200', label: 'Excellent - Grade A' };
  if (score >= 75) return { grade: 'B', color: 'text-amber-600 bg-amber-100 border-amber-200', label: 'Good - Grade B' };
  return { grade: 'C', color: 'text-red-600 bg-red-100 border-red-200', label: 'Needs Improvement - Grade C' };
}

type Scores = Record<string, number>;

export default function NewFoodInspectionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [scores, setScores] = useState<Scores>({});
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

  const handleScoreChange = useCallback((itemId: string, value: number, max: number) => {
    const clamped = Math.min(Math.max(0, value), max);
    setScores((prev) => ({ ...prev, [itemId]: clamped }));
  }, []);

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((sum, v) => sum + (v || 0), 0);
  }, [scores]);

  const gradeInfo = useMemo(() => getGrade(totalScore), [totalScore]);

  const sectionTotal = useCallback(
    (sectionId: string) => {
      const section = scoringSections.find((s) => s.id === sectionId);
      if (!section) return 0;
      return section.items.reduce((sum, item) => sum + (scores[item.id] || 0), 0);
    },
    [scores],
  );

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would save to Firestore
      toast.success('Draft saved successfully');
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
      toast.success(`Inspection submitted — Grade ${gradeInfo.grade} (${totalScore}/100)`);
      router.push('/dashboard/food');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/food">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">New Food Inspection (H800)</h1>
            <p className="text-sm text-muted-foreground">100-Point Scoring System with Auto-Grading</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="bg-food hover:bg-food-dark">
            <Send className="mr-2 h-4 w-4" /> Submit
          </Button>