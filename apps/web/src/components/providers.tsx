'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/auth-context';
import { I18nProvider } from '@/contexts/i18n-context';
import { SyncProvider } from '@/contexts/sync-context';
import { SplashScreen } from '@/components/splash-screen';
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
            <SplashScreen />
            {children}
            <Toaster position="top-right" richColors closeButton />
          </SyncProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}