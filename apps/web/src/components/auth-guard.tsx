'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@phi-pro/shared';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

const publicPaths = ['/', '/login', '/public', '/forgot-password'];

export function AuthGuard({ children, allowedRoles, requireAuth = true }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const isPublicPath = publicPaths.some(
      (p) => pathname === p || pathname.startsWith('/public/'),
    );

    if (!isAuthenticated && requireAuth && !isPublicPath) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && (pathname === '/login' || pathname === '/')) {
      router.push('/dashboard');
      return;
    }

    // Block PUBLIC role from any dashboard route
    if (isAuthenticated && user?.role === UserRole.PUBLIC && pathname.startsWith('/dashboard')) {
      router.push('/public');
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, pathname, router, requireAuth, allowedRoles, user]);

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0a1f5c] via-[#0d2878] to-[#0f3080]">
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[400px] w-[400px] rounded-full bg-blue-400/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center gap-6">
          {/* Logo + spinner ring */}
          <div className="relative flex items-center justify-center">
            {/* Outer decorative ring */}
            <div className="absolute h-36 w-36 rounded-full border border-white/10" />
            {/* Spinning progress arc */}
            <svg
              className="absolute h-36 w-36 -rotate-90 animate-[spin_1.4s_linear_infinite]"
              viewBox="0 0 144 144"
            >
              <circle
                cx="72" cy="72" r="68"
                fill="none"
                stroke="url(#grad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="100 330"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
                  <stop offset="100%" stopColor="#93c5fd" />
                </linearGradient>
              </defs>
            </svg>
            {/* Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/phi-emblem.png"
              alt="PHI-PRO"
              width={80}
              height={80}
              className="relative z-10 drop-shadow-2xl"
            />
          </div>

          {/* Wordmark */}
          <div className="text-center">
            <p className="text-2xl font-extrabold tracking-widest text-white">PHI-PRO</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.25em] text-blue-300/80">
              Digital Health Enforcement
            </p>
          </div>

          {/* Loading bar */}
          <div className="relative h-0.5 w-48 overflow-hidden rounded-full bg-white/10">
            <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-blue-400 to-blue-200 animate-[loading_1.4s_ease-in-out_infinite]" />
          </div>

          <p className="text-[11px] font-medium text-blue-300/60">Loading system…</p>
        </div>

        {/* Bottom branding */}
        <div className="absolute bottom-8 text-center">
          <p className="text-[10px] text-blue-400/40">Ministry of Health · Sri Lanka</p>
        </div>

        <style>{`
          @keyframes loading {
            0%   { left: -33%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
