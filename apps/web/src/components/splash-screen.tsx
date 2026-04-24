'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'gone'>('visible');

  useEffect(() => {
    // Only show once per browser session
    if (sessionStorage.getItem('phi-pro-splashed')) {
      setPhase('gone');
      return;
    }
    sessionStorage.setItem('phi-pro-splashed', '1');

    const fade = setTimeout(() => setPhase('fading'), 1800);
    const hide = setTimeout(() => setPhase('gone'), 2350);
    return () => { clearTimeout(fade); clearTimeout(hide); };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
      style={{ opacity: phase === 'fading' ? 0 : 1, transition: 'opacity 0.55s ease' }}
    >
      <div className="flex flex-col items-center gap-5">
        <Image
          src="/phi-emblem.png"
          alt="PHI-PRO"
          width={112}
          height={112}
          priority
          className="drop-shadow-md"
        />
        <div className="text-center">
          <p className="text-2xl font-extrabold tracking-tight text-slate-900">PHI-PRO</p>
          <p className="mt-0.5 text-sm text-slate-500">Sri Lanka Health Enforcement</p>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-500"
            style={{ animation: 'phi-progress 1.8s ease forwards' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes phi-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
