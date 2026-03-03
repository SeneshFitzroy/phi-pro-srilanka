'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, CheckCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // simulate network
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900" />

          <div className="p-8">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Check Your Email</h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  We&apos;ve sent a password reset link to{' '}
                  <strong className="text-slate-700 dark:text-slate-200">{email}</strong>.
                  Check your inbox and spam folder.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => setSent(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Try Another Email
                  </button>
                  <Link
                    href="/login"
                    className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition-all hover:shadow-xl hover:brightness-110"
                  >
                    Back to Login
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
                    Forgot Password?
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Enter your email address and we&apos;ll send you a link to reset your password
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        placeholder="phi@health.gov.lk"
                        className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition-all hover:shadow-xl hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 transition-colors hover:text-blue-600 dark:text-blue-400"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Login
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