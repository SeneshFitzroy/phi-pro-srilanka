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
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/public"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Public Portal
            </Link>
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-primary">PHI-PRO</span>