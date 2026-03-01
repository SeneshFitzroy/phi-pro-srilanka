import Link from 'next/link';
import {
  UtensilsCrossed,
  School,
  Activity,
  HardHat,
  ClipboardList,
  ArrowRight,
  Shield,
  Globe,
  Wifi,
  MapPin,
  ChevronRight,
  BarChart3,
  Lock,
  Smartphone,
} from 'lucide-react';

const domains = [
  {
    icon: UtensilsCrossed,
    title: 'Food Safety',
    color: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    desc: 'H800 inspections, grading, sampling & enforcement',
    stats: '12,000+ inspections/year',
  },
  {
    icon: School,
    title: 'School Health',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50 dark:bg-blue-950/30',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    desc: 'Medical exams, vaccinations, WASH surveys',
    stats: '5,000+ schools covered',
  },
  {
    icon: Activity,
    title: 'Epidemiology',
    color: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50 dark:bg-red-950/30',
    textColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800',
    desc: 'Disease surveillance, investigation & outbreak response',
    stats: 'Real-time alerts',
  },
  {
    icon: HardHat,
    title: 'Occupational Health',
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50 dark:bg-amber-950/30',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800',
    desc: 'Factory inspections, worker health & safety',
    stats: '2,500+ factories',
  },
  {
    icon: ClipboardList,
    title: 'Administration',
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50 dark:bg-violet-950/30',
    textColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-200 dark:border-violet-800',
    desc: 'Area surveys, GN mapping, statistics & reports',
    stats: 'Comprehensive analytics',
  },
];

const features = [
  {
    icon: Wifi,
    title: 'Offline-First Architecture',
    desc: 'Works reliably in remote PHI areas with poor connectivity. Data syncs automatically when online.',
  },
  {
    icon: Globe,
    title: 'Trilingual Support',
    desc: 'Full support for Sinhala, Tamil, and English — ensuring accessibility across all regions.',
  },
  {
    icon: MapPin,
    title: 'GIS Intelligence',
    desc: 'Interactive maps for disease hotspot visualization, food safety zones, and area-based analytics.',
  },
  {
    icon: Lock,
    title: 'Role-Based Access',
    desc: 'Four user roles — MOH Admin, SPHI, PHI, and Public — with domain-specific permissions.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    desc: 'Live dashboards with trend analysis, performance metrics, and automated monthly reports.',
  },
  {
    icon: Smartphone,
    title: 'Progressive Web App',
    desc: 'Install on any device. Native-like experience with push notifications and home screen access.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-md shadow-green-500/25">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">PHI-PRO</span>
              <span className="hidden text-[10px] font-medium leading-tight text-slate-500 dark:text-slate-400 sm:block">Sri Lanka Health Enforcement</span>
            </div>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/public"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Public Portal
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-5 text-sm font-semibold text-white shadow-md shadow-green-500/25 transition-all hover:shadow-lg hover:shadow-green-500/30 hover:brightness-110"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMmM1NWUiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoNnptMC0xMHY2aC02VjI0aDZ6bTEwIDEwdjZoLTZ2LTZoNnptLTIwIDB2NmgtNnYtNmg2em0xMC0xMHY2aC02VjI0aDZ6bS0yMCAwdjZoLTZ2LTZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50 dark:opacity-20" />
        
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Digital Health Enforcement Platform
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Empowering Sri Lanka&apos;s{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                Public Health
              </span>{' '}
              Inspectors
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              The unified digital platform that digitizes all 5 PHI domains — from food safety 
              inspections to disease surveillance — with offline-first capabilities, GIS intelligence,
              and real-time analytics.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-8 text-base font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:brightness-110 sm:w-auto"
              >
                PHI Login
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/public"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 text-base font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 sm:w-auto"
              >
                Public Portal
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500 dark:text-slate-500">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>Ministry of Health</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-500" />
                <span>Sinhala &bull; Tamil &bull; English</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-500" />
                <span>Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core Domains */}
      <section className="relative border-t border-slate-200 bg-slate-50/50 py-20 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Five Core Domains
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Complete digital coverage of every PHI responsibility area
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {domains.map((domain) => (
              <div
                key={domain.title}
                className={`group relative overflow-hidden rounded-2xl border ${domain.borderColor} ${domain.bgLight} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className={`inline-flex rounded-xl bg-gradient-to-br ${domain.color} p-2.5 shadow-sm`}>
                  <domain.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className={`mt-4 font-bold ${domain.textColor}`}>{domain.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {domain.desc}
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-500">
                  {domain.stats}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Built for the Field
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Every feature designed for the real challenges PHIs face daily
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
              >
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors group-hover:border-emerald-200 group-hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:group-hover:border-emerald-800 dark:group-hover:bg-emerald-950/30">
                  <feat.icon className="h-5 w-5 text-slate-600 transition-colors group-hover:text-emerald-600 dark:text-slate-400 dark:group-hover:text-emerald-400" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-200 bg-gradient-to-br from-emerald-500 to-green-600 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to Modernize Public Health Enforcement?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-emerald-100">
            Join the digital transformation of Sri Lanka&apos;s public health inspection service.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-base font-semibold text-emerald-700 shadow-lg transition-all hover:bg-emerald-50 hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/public"
              className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-white/30 px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Public Services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">PHI-PRO</span>
            </div>
            <div className="text-center text-sm text-slate-500 dark:text-slate-500">
              &copy; {new Date().getFullYear()} Digital Health Enforcement &amp; Integrated Intelligence System
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              Ministry of Health, Sri Lanka
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
