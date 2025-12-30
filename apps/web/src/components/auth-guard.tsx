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
  }, [isLoading, isAuthenticated, user, pathname, router, allowedRoles, requireAuth]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
