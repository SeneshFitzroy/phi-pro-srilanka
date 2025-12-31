import Link from 'next/link';
import {
  UtensilsCrossed as FoodIcon,
  School as SchoolIcon,
  Activity as EpiIcon,
  HardHat as OccIcon,
  ClipboardList as AdminIcon,
  ArrowRight,
  Shield,
  Globe,
  Wifi,
  MapPin,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">PHI-PRO</span>