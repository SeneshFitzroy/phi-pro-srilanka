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
        </div>
      </div>

      {/* Live Grade Display */}
      <Card className={`border-2 ${gradeInfo.color}`}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-xl border-2 ${gradeInfo.color} text-3xl font-bold`}>
              {totalScore > 0 ? gradeInfo.grade : '—'}
            </div>
            <div>
              <p className="text-lg font-bold">{totalScore}/100 Points</p>
              <p className="text-sm text-muted-foreground">{gradeInfo.label}</p>
            </div>
          </div>
          <div className="flex gap-4 text-center text-sm">
            <div><p className="font-bold text-green-600">A: 90-100</p></div>
            <div><p className="font-bold text-amber-600">B: 75-89</p></div>
            <div><p className="font-bold text-red-600">C: &lt;75</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Premises Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-food" /> Premises Information
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
                <option value="meat_fish">Meat/Fish Shop</option>
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
              <Button variant="outline" className="gap-2">
                <MapPin className="h-4 w-4" /> Capture GPS
              </Button>
              <Button variant="outline" className="gap-2">
                <Camera className="h-4 w-4" /> Add Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Sections */}
      {scoringSections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <span className="text-sm font-bold text-food">
                {sectionTotal(section.id)}/{section.maxScore}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{section.titleSi}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <label className="flex-1 text-sm">{item.label}</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={item.max}
                      value={scores[item.id] ?? ''}
                      onChange={(e) => handleScoreChange(item.id, parseInt(e.target.value) || 0, item.max)}
                      className="w-20 text-center"
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground w-12">/ {item.max}</span>
                    <div className="w-24 rounded-full bg-secondary h-2">
                      <div
                        className="h-2 rounded-full bg-food transition-all"
                        style={{ width: `${((scores[item.id] || 0) / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Label className="text-xs text-muted-foreground">Section Notes</Label>
              <textarea
                value={notes[section.id] || ''}
                onChange={(e) => setNotes((prev) => ({ ...prev, [section.id]: e.target.value }))}
                placeholder="Add observations..."
                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Enforcement Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Enforcement Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Notice Type</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">No notice required</option>
                <option value="IMPROVEMENT">Improvement Notice (7 days)</option>
                <option value="CLOSURE">Closure Notice (Immediate)</option>
                <option value="WARNING">Warning Letter</option>
                <option value="COURT_SUMMONS">Court Summons</option>
              </select>
            </div>
            <div className="space-y-2">