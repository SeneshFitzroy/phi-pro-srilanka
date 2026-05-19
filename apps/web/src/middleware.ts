// ============================================================================
// PHI-PRO Edge Middleware — Trilingual Routing + Security Headers
// Runtime: Vercel Edge (runs at CDN edge, <1s response globally)
// Handles: EN/SI/TA language routing + security hardening
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.json).*)',
  ],
};

const SUPPORTED_LANGS = ['en', 'si', 'ta'] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

// Map Accept-Language header to supported lang
function detectLang(req: NextRequest): Lang {
  // 1. Cookie preference (localStorage synced server-side via cookie)
  const cookieLang = req.cookies.get('phi-pro-lang')?.value;
  if (cookieLang && SUPPORTED_LANGS.includes(cookieLang as Lang)) {
    return cookieLang as Lang;
  }

  // 2. Accept-Language header
  const acceptLang = req.headers.get('accept-language') ?? '';
  if (acceptLang.includes('si')) return 'si';
  if (acceptLang.includes('ta')) return 'ta';

  // 3. Default English
  return 'en';
}

export default function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // ── Detect language and set header for SSR ────────────────────────────────
  const lang = detectLang(req);
  response.headers.set('x-phi-pro-lang', lang);

  // ── Security Headers (OWASP recommended) ─────────────────────────────────
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://translate.googleapis.com https://translate.google.com https://www.gstatic.com https://maps.gstatic.com https://www.google.com https://www.recaptcha.net https://translate-pa.googleapis.com https://apis.google.com https://maps.googleapis.com https://*.googleapis.com https://www.sandbox.payhere.lk https://www.payhere.lk",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://translate.googleapis.com https://www.gstatic.com https://maps.gstatic.com",
      "font-src 'self' data: https://fonts.gstatic.com https://www.gstatic.com https://maps.gstatic.com https://cdn.jsdelivr.net",
      "img-src 'self' data: blob: https://*.mapbox.com https://*.googleapis.com https://*.gstatic.com https://*.googleusercontent.com https://*.ggpht.com https://maps.gstatic.com https://translate.google.com https://www.gstatic.com https://fonts.gstatic.com https://streetviewpixels-pa.googleapis.com",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://apis.google.com https://api.anthropic.com https://api.openai.com https://api.open-meteo.com wss://*.firebaseio.com https://us.i.posthog.com https://us.posthog.com https://us-assets.i.posthog.com https://*.sentry.io https://*.mapbox.com https://translate-pa.googleapis.com https://*.firebaseapp.com https://www.google.com https://maps.googleapis.com https://streetviewpixels-pa.googleapis.com",
      "worker-src 'self' blob:",
      "frame-src 'self' https://translate.google.com https://www.google.com https://*.firebaseapp.com https://accounts.google.com https://www.sandbox.payhere.lk https://www.payhere.lk",
      "frame-ancestors 'none'",
    ].join('; '),
  );
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    // camera/microphone allowed for the app's own origin only — needed for
    // photo hazard checks, voice dictation and (planned) live object detection.
    'Permissions-Policy',
    'camera=(self), microphone=(self), geolocation=(self), payment=(self)',
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );

  // ── Cache-Control: fast for static, no-store for auth routes ─────────────
  const path = req.nextUrl.pathname;
  if (path.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store');
  }

  return response;
}
