// ============================================================================
// Google reCAPTCHA v3 — invisible bot/abuse scoring for public forms.
// No-op unless NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set, so the app works without it.
// Usage: const token = await getRecaptchaToken('submit_complaint');
//        // send `token` with the form; verify server-side against the secret.
// ============================================================================

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === 'undefined' || !SITE_KEY) return Promise.reject(new Error('reCAPTCHA not configured'));
  if (window.grecaptcha) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/** Returns a reCAPTCHA v3 token for the given action, or null if not configured / unavailable. */
export async function getRecaptchaToken(action: string): Promise<string | null> {
  if (!SITE_KEY) return null;
  try {
    await loadScript();
    return await new Promise<string>((resolve, reject) => {
      window.grecaptcha!.ready(() => {
        window.grecaptcha!.execute(SITE_KEY!, { action }).then(resolve, reject);
      });
    });
  } catch {
    return null;
  }
}

export const isRecaptchaConfigured = (): boolean => !!SITE_KEY;
