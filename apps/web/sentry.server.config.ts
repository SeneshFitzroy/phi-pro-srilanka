import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.15 : 1.0,
  beforeSend(event) {
    const SCRUB_KEYS = ['studentNic', 'parentNic', 'ownerNic', 'diagnosis', 'medicalHistory', 'password'];
    function scrub(obj: unknown): unknown {
      if (!obj || typeof obj !== 'object') return obj;
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        result[k] = SCRUB_KEYS.includes(k) ? '[Filtered]' : scrub(v);
      }
      return result;
    }
    if (event.extra) event.extra = scrub(event.extra) as typeof event.extra;
    return event;
  },
});
