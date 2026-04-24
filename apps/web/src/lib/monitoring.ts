// ============================================================================
// PHI-PRO Monitoring — Sentry (error tracking) + PostHog (analytics)
// Sentry: crash reports, error boundaries, performance traces
// PostHog: session analytics, feature flags, offline-sync failure events
// ============================================================================

import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';
import { SyncStatus } from '@phi-pro/shared';

let posthogInitialized = false;

// ---------------------------------------------------------------------------
// Initialize Sentry (called once at app startup in sentry.client.config.ts)
// ---------------------------------------------------------------------------

export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    integrations: [],
    beforeSend(event) {
      // Scrub PII from events — never send patient/student data to Sentry
      if (event.request?.data) {
        const sensitiveKeys = ['studentNic', 'parentNic', 'diagnosis', 'medicalHistory'];
        const data = event.request.data as Record<string, unknown>;
        for (const key of sensitiveKeys) {
          if (key in data) data[key] = '[Filtered]';
        }
      }
      return event;
    },
  });
}

// ---------------------------------------------------------------------------
// Initialize PostHog (called in Providers component)
// ---------------------------------------------------------------------------

export function initPostHog() {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

  if (!apiKey || posthogInitialized || typeof window === 'undefined') return;

  posthog.init(apiKey, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,       // never record sensitive form inputs
      maskInputOptions: { password: true },
    },
    loaded: (ph) => {
      if (process.env.NODE_ENV !== 'production') ph.opt_out_capturing();
    },
  });

  posthogInitialized = true;
}

// ---------------------------------------------------------------------------
// Identify user (call after Firebase auth resolves)
// ---------------------------------------------------------------------------

export function identifyUser(userId: string, role: string, mohArea?: string) {
  // Sentry user context — no PII, just role/area for grouping
  Sentry.setUser({ id: userId, role, area: mohArea });

  if (posthogInitialized) {
    posthog.identify(userId, { role, mohArea: mohArea ?? 'unknown' });
  }
}

// ---------------------------------------------------------------------------
// Track domain-specific events
// ---------------------------------------------------------------------------

export function trackInspectionSubmitted(domain: string, grade?: string, score?: number) {
  if (posthogInitialized) {
    posthog.capture('inspection_submitted', { domain, grade, score });
  }
}

export function trackSyncEvent(
  status: SyncStatus,
  collection: string,
  error?: string,
) {
  if (posthogInitialized) {
    posthog.capture('sync_event', { status, collection, error: error ?? null });
  }

  if (status === SyncStatus.FAILED && error) {
    Sentry.captureMessage(`Sync failure: ${collection}`, {
      level: 'warning',
      extra: { status, error },
    });
  }
}

export function trackOfflineModeEntered() {
  if (posthogInitialized) posthog.capture('offline_mode_entered');
}

export function trackPasskeyEnrolled() {
  if (posthogInitialized) posthog.capture('passkey_enrolled');
}

export function trackLanguageChanged(lang: string) {
  if (posthogInitialized) posthog.capture('language_changed', { language: lang });
}

export function trackFhirExport(type: string, recordCount: number) {
  if (posthogInitialized) {
    posthog.capture('fhir_exported', { type, recordCount });
  }
}

// ---------------------------------------------------------------------------
// Error capture (used in catch blocks throughout the app)
// ---------------------------------------------------------------------------

export function captureError(error: unknown, context?: Record<string, unknown>) {
  console.error(error);
  if (error instanceof Error) {
    Sentry.captureException(error, { extra: context });
  } else {
    Sentry.captureMessage(String(error), { extra: context });
  }
}

// ---------------------------------------------------------------------------
// Performance: wrap async operations with Sentry spans
// ---------------------------------------------------------------------------

export async function withPerfTrace<T>(
  name: string,
  operation: () => Promise<T>,
): Promise<T> {
  return Sentry.startSpan({ name, op: 'phi-pro' }, () => operation());
}

// Re-export for convenience
export { Sentry, posthog };
