'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        // Land the user back on /login after they finish the reset flow.
        url: typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://phipro.lk/login',
      });
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      // Firebase intentionally does NOT distinguish "user not found" from a
      // valid reset to prevent account enumeration — but we still surface
      // network / configuration errors clearly to the user.
      if (msg.includes('auth/invalid-email')) {
        setError('That email address looks invalid. Please check and try again.');
      } else if (msg.includes('auth/network-request-failed')) {
        setError('Network error. Check your internet connection and try again.');
      } else if (msg.includes('auth/too-many-requests')) {
        setError('Too many attempts. Please wait a few minutes before trying again.');
      } else if (msg.includes('auth/user-not-found')) {
        // Firebase only throws this in very old SDKs — we treat it as success
        // anyway to avoid leaking whether the email is registered.
        setSent(true);
      } else {
        setError('We could not send the reset link. Please try again or contact your MOH Administrator.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="h-1 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900" />

          <div className="p-8">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Check your email</h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  If <strong className="text-slate-700 dark:text-slate-200">{email}</strong> is registered, a
                  password reset link is on its way. The email arrives from <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] dark:bg-slate-800">noreply@phi-pro.firebaseapp.com</code> — check your spam folder if you don&apos;t see it within a minute.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => { setSent(false); setError(null); }}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Try another email
                  </button>
                  <Link
                    href="/login"
                    className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition-all hover:shadow-xl hover:brightness-110"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 shadow-lg shadow-blue-900/25">
                    <Lock className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                    Forgot your password?
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Enter the email tied to your PHI-PRO account. We&apos;ll send you a secure link to set a new one.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="phi@health.gov.lk"
                        className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(null); }}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition-all hover:shadow-xl hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending reset link…
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 transition-colors hover:text-blue-600 dark:text-blue-400"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          PHI-PRO &bull; Ministry of Health, Sri Lanka &bull; Est. 1913
        </p>
      </div>
    </div>
  );
}
