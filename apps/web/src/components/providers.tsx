'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/auth-context';
import { I18nProvider } from '@/contexts/i18n-context';
import { SyncProvider } from '@/contexts/sync-context';
import { AccessibilityMenu } from '@/components/accessibility-menu';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { initPostHog } from '@/lib/monitoring';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => { initPostHog(); }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>
        <AuthProvider>
          <SyncProvider>
            {children}
            <AccessibilityMenu />
            <Toaster position="top-right" richColors closeButton />
            {/* polite live region — sonner already announces toasts; this is a safety net */}
            <div aria-live="polite" aria-atomic="true" className="sr-only" />
          </SyncProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}