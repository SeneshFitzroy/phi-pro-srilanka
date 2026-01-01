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
          </h1>
          <p className="mt-2 text-lg font-medium text-muted-foreground">
            Digital Health Enforcement & Integrated Intelligence System
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            Unified digital platform for Sri Lanka&apos;s Public Health Inspectors — digitizing
            all 5 PHI domains with offline-first capabilities, GIS intelligence, and real-time
            analytics.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              PHI Login <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/public"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-input bg-background px-8 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Public Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Wifi, label: 'Offline-First', desc: 'Works in remote areas' },
            { icon: Globe, label: 'Trilingual', desc: 'SI / TA / EN' },
            { icon: MapPin, label: 'GIS Intelligence', desc: 'Disease hotspot mapping' },
            { icon: Shield, label: 'Role-Based', desc: '4 user roles' },
          ].map((feat) => (
            <div
              key={feat.label}
              className="rounded-xl border bg-card p-4 text-center shadow-sm"
            >
              <feat.icon className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 font-semibold">{feat.label}</p>
              <p className="text-xs text-muted-foreground">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5 Domains */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold">Five Core Domains</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              icon: FoodIcon,
              title: 'Food Safety',
              color: 'text-food bg-food-light',
              desc: 'H800 inspections, grading, sampling & enforcement',
            },
            {
              icon: SchoolIcon,
              title: 'School Health',
              color: 'text-school bg-school-light',
              desc: 'Medical exams, vaccinations, WASH surveys',
            },
            {
              icon: EpiIcon,
              title: 'Epidemiology',
              color: 'text-epidemiology bg-epidemiology-light',
              desc: 'Disease surveillance, investigation & outbreak response',
            },
            {
              icon: OccIcon,
              title: 'Occupational Health',
              color: 'text-occupational bg-occupational-light',
              desc: 'Factory inspections, worker health & safety',
            },
            {
              icon: AdminIcon,
              title: 'Administration',
              color: 'text-administration bg-administration-light',
              desc: 'Area surveys, statistics, monthly reports',
            },
          ].map((domain) => (
            <div
              key={domain.title}
              className="group rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`inline-flex rounded-lg p-2 ${domain.color}`}
              >
                <domain.icon className="h-6 w-6" />
              </div>