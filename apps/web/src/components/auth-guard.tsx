'use client';

import { useEffect } from 'react';
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

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, pathname, router, requireAuth, allowedRoles, user]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/phi-emblem.png" alt="PHI-PRO" width={64} height={64} className="drop-shadow-lg" />
          <div className="absolute -inset-2 animate-spin rounded-full border-2 border-transparent border-t-blue-700 border-r-blue-400/30" />
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-500">PHI-PRO</p>
        <p className="text-xs text-slate-400">Loading system...</p>
      </div>
    );
  }

  return <>{children}</>;
}