'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Eye,
  EyeOff,
  Globe,
  UtensilsCrossed,
  School,
  Activity,
  HardHat,
  ClipboardList,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/i18n-context';

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'si', label: 'සිං', name: 'Sinhala' },
  { code: 'ta', label: 'தமி', name: 'Tamil' },
];

const domainIcons = [
  { icon: UtensilsCrossed, color: 'text-emerald-400', label: 'Food Safety' },
  { icon: School, color: 'text-blue-400', label: 'School Health' },
  { icon: Activity, color: 'text-red-400', label: 'Epidemiology' },
  { icon: HardHat, color: 'text-amber-400', label: 'Occupational' },
  { icon: ClipboardList, color: 'text-violet-400', label: 'Administration' },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn, isLoading, error } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch {
      // error is already set in auth context
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoNnptMC0xMHY2aC02VjI0aDZ6bTEwIDEwdjZoLTZ2LTZoNnptLTIwIDB2NmgtNnYtNmg2em0xMC0xMHY2aC02VjI0aDZ6bS0yMCAwdjZoLTZ2LTZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        
        {/* Top */}
        <div className="relative z-10 p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 shadow-xl backdrop-blur-sm">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white">PHI-PRO</h1>
          <p className="mt-2 text-center text-lg font-medium text-emerald-100">
            Digital Health Enforcement &<br />Integrated Intelligence System
          </p>

          {/* Domain Icons Row */}
          <div className="mt-10 flex items-center gap-6">
            {domainIcons.map((d) => (
              <div key={d.label} className="flex flex-col items-center gap-1.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-transform hover:scale-110">
                  <d.icon className={`h-5 w-5 ${d.color}`} />
                </div>
                <span className="text-[10px] font-medium text-white/60">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 p-8 text-center">
          <p className="text-sm text-white/50">
            Ministry of Health, Sri Lanka &bull; PHI Service
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex w-full flex-col bg-white dark:bg-slate-950 lg:w-1/2">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">PHI-PRO</span>
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            <Globe className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                  language === lang.code
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-4 sm:px-8">
          <div className="w-full max-w-sm">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t('auth.welcome') || 'Welcome back'}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Sign in to access your PHI dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('auth.email') || 'Email address'}
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="phi@health.gov.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('auth.password') || 'Password'}
                  </label>
                  <Link href="/forgot-password" className="text-xs font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
                    {t('auth.forgotPassword') || 'Forgot password?'}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-11 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/50">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-lg disabled:hover:brightness-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.loading') || 'Signing in...'}
                  </>
                ) : (
                  t('auth.signIn') || 'Sign In'
                )}
              </button>
            </form>

            {/* Public portal link */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400 dark:bg-slate-950 dark:text-slate-500">
                    or
                  </span>
                </div>
              </div>
              <Link
                href="/public"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400"
              >
                {t('public.title') || 'Access Public Portal'} &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-600">
          Ministry of Health, Sri Lanka &bull; Public Health Inspector Service
        </div>
      </div>
    </div>
  );
}
