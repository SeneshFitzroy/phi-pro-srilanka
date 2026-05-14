'use client';

/**
 * Government-grade splash screen.
 * - Shows ONCE per browser session (sessionStorage flag)
 * - Skipped on /dashboard/* (logged-in flow) and any /public/* sub-page
 *   so users only see it on their first landing
 * - Auto-dismisses after 1.6s; user can also tap to dismiss
 * - Honours prefers-reduced-motion
 */

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'phipro-splash-shown';
const DISPLAY_MS = 1600;

export function GovtSplash() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show only on the landing route, only once per browser session
    if (pathname !== '/') return;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;

    setShow(true);
    sessionStorage.setItem(SESSION_KEY, '1');

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const total = reduced ? 600 : DISPLAY_MS;

    const fadeAt = setTimeout(() => setFading(true), total - 350);
    const closeAt = setTimeout(() => setShow(false), total);
    return () => { clearTimeout(fadeAt); clearTimeout(closeAt); };
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-label="Loading PHI-PRO"
      onClick={() => setShow(false)}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-blue-950 transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 40%, #1e40af 0%, #1e3a8a 45%, #0c1f5c 100%)',
      }}
    >
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,0.4) 1px,transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative flex flex-col items-center px-6 text-center">
        {/* Pulsing ring around emblem */}
        <div className="relative">
          <span
            aria-hidden
            className="absolute inset-0 -m-2 rounded-full border-2 border-sky-300/60 motion-safe:animate-ping"
          />
          <span
            aria-hidden
            className="absolute inset-0 -m-6 rounded-full border border-sky-200/30"
          />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-2xl ring-4 ring-sky-300/40">
            <Image
              src="/phi-emblem.png"
              alt="PHI Union of Sri Lanka emblem"
              width={112}
              height={112}
              priority
              className="h-24 w-24 object-contain drop-shadow"
            />
          </div>
        </div>

        <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.35em] text-sky-200">
          Ministry of Health · Sri Lanka
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          PHI&#8209;PRO
        </h1>
        <p className="mt-1 text-xs font-medium text-blue-100/85">
          Digital Health Enforcement &amp; Integrated Intelligence
        </p>

        {/* Loading bar */}
        <div className="mt-7 h-0.5 w-44 overflow-hidden rounded-full bg-white/15">
          <span className="block h-full w-1/3 origin-left animate-[splashbar_1.4s_ease-in-out_infinite] bg-gradient-to-r from-sky-200 via-white to-sky-200" />
        </div>
        <p className="mt-3 text-[10px] tracking-[0.2em] text-sky-100/70">EST. 1913 &middot; PHI.LK</p>
      </div>

      <style jsx>{`
        @keyframes splashbar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(220%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
