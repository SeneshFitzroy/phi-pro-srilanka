'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
      <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#071233] via-[#0a1f5c] to-[#091a4a]">
        {/* Industrial grid backdrop */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(147,197,253,.6) 1px,transparent 1px),linear-gradient(to right,rgba(147,197,253,.6) 1px,transparent 1px)',
            backgroundSize: '56px 56px',
          }}
          aria-hidden
        />
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[520px] w-[520px] rounded-full bg-blue-400/10 blur-3xl" />
        </div>
        {/* Concentric pulse rings */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <div className="absolute h-64 w-64 rounded-full border border-blue-300/15 animate-[pulse-ring_3.5s_ease-out_infinite]" />
          <div className="absolute h-80 w-80 rounded-full border border-blue-300/10 animate-[pulse-ring_3.5s_ease-out_infinite] [animation-delay:1.2s]" />
        </div>

        <div className="relative flex flex-col items-center gap-7">
          {/* Logo + spinner ring */}
          <div className="relative flex items-center justify-center">
            {/* Outer decorative double-ring */}
            <div className="absolute h-44 w-44 rounded-full border border-blue-200/15" />
            <div className="absolute h-36 w-36 rounded-full border border-blue-200/25" />
            {/* Spinning progress arc */}
            <svg className="absolute h-44 w-44 -rotate-90 animate-[spin_1.6s_linear_infinite]" viewBox="0 0 176 176">
              <circle cx="88" cy="88" r="84" fill="none" stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="130 400" />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
                  <stop offset="100%" stopColor="#bfdbfe" />
                </linearGradient>
              </defs>
            </svg>
            {/* Logo card — inline SVG monogram paints on first frame so the
                splash never shows a blank white square while the PNG is in
                flight. The Image overlays the SVG once the asset has decoded. */}
            <div className="relative z-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-white/95 shadow-2xl ring-1 ring-white/40">
              {/* Instant SVG monogram (rendered with HTML, zero network cost) */}
              <svg
                viewBox="0 0 72 72"
                aria-hidden
                className="absolute inset-0 h-full w-full p-2"
              >
                <defs>
                  <linearGradient id="phi-mono" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>
                <circle cx="36" cy="36" r="32" fill="url(#phi-mono)" />
                <text
                  x="36"
                  y="46"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="800"
                  fontSize="22"
                  fill="#ffffff"
                  letterSpacing="-0.5"
                >PHI</text>
              </svg>
              {/* Real emblem fades in on top when the PNG finishes loading */}
              <Image
                src="/phi-emblem.png"
                alt="PHI-PRO"
                width={72}
                height={72}
                priority
                className="relative z-10 drop-shadow-sm"
              />
            </div>
          </div>

          {/* Wordmark */}
          <div className="text-center">
            <p className="text-3xl font-extrabold tracking-[0.25em] text-white">PHI&nbsp;-&nbsp;PRO</p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-200/90">
              Digital Health Enforcement
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-blue-300/60">
              Officer workspace &middot; secured
            </p>
          </div>

          {/* Status chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold text-blue-100/80">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/20 bg-white/5 px-2.5 py-1 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Auth check
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/20 bg-white/5 px-2.5 py-1 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300 [animation-delay:0.3s]" /> Loading modules
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/20 bg-white/5 px-2.5 py-1 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300 [animation-delay:0.6s]" /> Syncing audit chain
            </span>
          </div>

          {/* Loading bar */}
          <div className="relative h-0.5 w-56 overflow-hidden rounded-full bg-white/10">
            <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-blue-400 via-blue-200 to-blue-400 animate-[loading_1.4s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Bottom branding */}
        <div className="absolute bottom-6 flex flex-col items-center gap-1 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-200/70">Ministry of Health</p>
          <p className="text-[10px] text-blue-300/40">Democratic Socialist Republic of Sri Lanka</p>
        </div>

        <style>{`
          @keyframes loading {
            0%   { left: -33%; }
            100% { left: 100%; }
          }
          @keyframes pulse-ring {
            0%   { transform: scale(0.85); opacity: .45; }
            70%  { transform: scale(1.12); opacity: 0; }
            100% { transform: scale(1.12); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
