'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import {
  Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck, Fingerprint, Globe2,
  Lock, BadgeCheck, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

/* Five statutory domains — used as branding chips on the hero panel. */
const DOMAIN_CHIPS = [
  'Epidemiology', 'Food Safety', 'Environment & Vector',
  'School Health', 'Occupational & Disaster',
] as const;

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn, isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch {
      /* error is already set in auth context */
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ─────────────────────── Left — Heritage brand panel ─────────────────────── */}
      <aside className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[#071233] via-[#0a1f5c] to-[#091a4a] lg:flex lg:flex-col lg:justify-between">
        {/* Industrial grid backdrop */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(147,197,253,.6) 1px,transparent 1px),linear-gradient(to right,rgba(147,197,253,.6) 1px,transparent 1px)',
            backgroundSize: '56px 56px',
          }}
          aria-hidden
        />
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-indigo-400/15 blur-3xl" aria-hidden />

        {/* Top — back link + gov chip */}
        <div className="relative z-10 flex items-center justify-between p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
            <ShieldCheck className="h-3 w-3" /> Govt-secured
          </span>
        </div>

        {/* Centre — emblem + wordmark */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12">
          {/* Card-mounted emblem */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-amber-300/15 blur-xl" aria-hidden />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-white/40">
              <Image src="/phi-emblem.png" alt="PHI Union Emblem" width={88} height={88} className="drop-shadow-sm" priority />
            </div>
          </div>

          <h1 className="mt-7 text-center text-[2.4rem] font-extrabold tracking-[0.18em] text-white">
            PHI&nbsp;-&nbsp;PRO
          </h1>
          <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-200">
            Digital Health Enforcement &amp; Integrated Intelligence
          </p>
          <p className="mt-5 max-w-md text-center text-sm leading-relaxed text-blue-100/80">
            The audit-grade workspace for Sri Lanka&rsquo;s 1,793 Public Health Inspectors. Inspect, sample,
            grade and prosecute &mdash; signed by the Ministry, sealed by the audit chain.
          </p>

          {/* Statutory domain chips */}
          <ul className="mt-7 flex max-w-md flex-wrap items-center justify-center gap-1.5">
            {DOMAIN_CHIPS.map((d) => (
              <li key={d} className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-blue-100 backdrop-blur">
                <span className="h-1 w-1 rounded-full bg-amber-300" /> {d}
              </li>
            ))}
          </ul>

          {/* Trust ribbon */}
          <div className="mt-8 flex items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200/80">
            <span className="flex items-center gap-1.5"><Fingerprint className="h-3.5 w-3.5 text-amber-200" /> WebAuthn</span>
            <span className="flex items-center gap-1.5"><Lock          className="h-3.5 w-3.5 text-amber-200" /> AES-GCM at rest</span>
            <span className="flex items-center gap-1.5"><BadgeCheck    className="h-3.5 w-3.5 text-amber-200" /> Audit chain</span>
          </div>
        </div>

        {/* Bottom ribbon */}
        <div className="relative z-10 p-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-200/70">Ministry of Health</p>
          <p className="mt-0.5 text-[10px] text-blue-300/50">Democratic Socialist Republic of Sri Lanka &middot; Est. 1913</p>
        </div>
      </aside>

      {/* ─────────────────────── Right — Form ─────────────────────── */}
      <main className="flex w-full flex-col bg-white dark:bg-slate-950 lg:w-1/2">
        {/* Top Bar (mobile shows logo) */}
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Image src="/phi-emblem.png" alt="PHI" width={32} height={32} />
            <span className="text-lg font-bold text-slate-900 dark:text-white">PHI-PRO</span>
          </Link>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <Globe2 className="h-3 w-3 text-blue-700 dark:text-blue-300" />
            EN &middot; සිංහල &middot; தமிழ்
          </span>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-4 sm:px-8">
          <div className="w-full max-w-sm">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">Officer workspace</p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('auth.welcome') || 'Welcome back'}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Sign in with your MOH-issued account to access the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('auth.email') || 'Email address'}
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="officer.name@health.gov.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('auth.password') || 'Password'}
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-blue-700 hover:text-blue-600 dark:text-blue-400">
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
                    className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-11 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember + secure indicator */}
              <div className="flex items-center justify-between">
                <label className="inline-flex select-none items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox" checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600/20 dark:border-slate-600"
                  />
                  Keep me signed in on this device
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Lock className="h-3 w-3" /> Secure connection
                </span>
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/25 transition-all hover:shadow-xl hover:shadow-blue-900/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-lg disabled:hover:brightness-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.loading') || 'Signing in…'}
                  </>
                ) : (
                  <>
                    {t('auth.signIn') || 'Sign in'}
                    <ChevronRight className="h-4 w-4" />
                  </>
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
                href="/public/portal"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-600 dark:text-blue-400"
              >
                Open the citizen public portal &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="p-4 text-center text-[11px] text-slate-400 dark:text-slate-600">
          PHI-PRO &middot; Ministry of Health, Sri Lanka &middot;{' '}
          <a href="https://phi.lk" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-700">phi.lk</a>
        </div>
      </main>
    </div>
  );
}
