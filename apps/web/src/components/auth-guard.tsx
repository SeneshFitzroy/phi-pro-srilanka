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
          <img src="/phi-emblem.png" alt="PHI-PRO" width={48} height={48} className="rounded-2xl shadow-lg" />
          <div className="absolute -inset-1 animate-spin rounded-2xl border-2 border-transparent border-t-blue-700" />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading PHI-PRO...</p>
      </div>
    );
  }

  return <>{children}</>;
}