'use client';

/**
 * Shared chrome for all public-facing (no-login) pages.
 *
 * Mirrors the navigation of the official PHI Union of Sri Lanka site (phi.lk):
 *   Home · About · Find PHI · Duty of PHI · News & Events · Downloads · Press Release · Contact · Members Login
 *
 * Branding uses ONLY the two official marks of the Union:
 *   - /phi-logo.png    → the horizontal trilingual wordmark (emblem + name)
 *   - /phi-emblem.png  → the round membership emblem
 * No other organisation logos appear anywhere in the application.
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Mail, ArrowRight } from 'lucide-react';

const GoogleTranslateWidget = dynamic(
  () => import('@/components/google-translate').then((m) => ({ default: m.GoogleTranslateWidget })),
  { ssr: false },
);

export const PUBLIC_NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/public/about' },
  { label: 'Find PHI', href: '/public/find-phi' },
  { label: 'Duty of PHI', href: '/public/duty' },
  { label: 'News & Events', href: '/public/news' },
  { label: 'Downloads', href: '/public/downloads' },
  { label: 'Press Release', href: '/public/press' },
  { label: 'Contact', href: '/public/contact' },
] as const;

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm dark:bg-slate-950/95">
      {/* Top contact strip */}
      <div className="hidden border-b border-slate-100 bg-gradient-to-r from-blue-800 to-slate-900 text-white sm:block dark:border-slate-800">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-[11px] sm:px-6 lg:px-8">
          <span className="font-medium tracking-wide">
            The Public Health Inspector&apos;s Union of Sri Lanka — Est. 1913
          </span>
          <div className="flex items-center gap-4">
            <a href="tel:+94112635675" className="flex items-center gap-1.5 hover:text-blue-200">
              <Phone className="h-3 w-3" /> (+94) 11-2635675
            </a>
            <a href="mailto:info@phi.lk" className="flex items-center gap-1.5 hover:text-blue-200">
              <Mail className="h-3 w-3" /> info@phi.lk
            </a>
          </div>
        </div>
      </div>

      {/* Logo + language */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="The Public Health Inspector's Union of Sri Lanka — home">
          {/* Official wordmark (emblem + trilingual name) — the main logo */}
          <span className="hidden sm:inline-flex dark:rounded-md dark:bg-white/95 dark:px-2 dark:py-1">
            <Image
              src="/phi-logo.png"
              alt="The Public Health Inspector's Union of Sri Lanka"
              width={718}
              height={142}
              className="h-11 w-auto drop-shadow-sm"
              priority
            />
          </span>
          {/* Compact emblem on small screens */}
          <Image
            src="/phi-emblem.png"
            alt="PHI Union of Sri Lanka emblem"
            width={48}
            height={48}
            className="h-11 w-11 shrink-0 drop-shadow-sm sm:hidden"
            priority
          />
          <span className="text-[13px] font-extrabold uppercase leading-tight tracking-tight text-slate-900 sm:hidden dark:text-white">
            The Public Health Inspector&apos;s Union of Sri Lanka
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="hidden overflow-hidden sm:block">
            <GoogleTranslateWidget />
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Main nav bar */}
      <nav className="border-t border-slate-100 bg-gradient-to-r from-[#5e1212] to-[#7a1a1a] dark:border-slate-800">
        <div className="mx-auto hidden max-w-7xl items-center gap-1 px-4 sm:px-6 lg:flex lg:px-8">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 text-sm font-semibold transition-colors ${
                isActive(item.href)
                  ? 'bg-black/25 text-white'
                  : 'text-rose-50/90 hover:bg-black/15 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-auto my-2 inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-1.5 text-sm font-bold text-[#7a1a1a] transition-all hover:bg-rose-50"
          >
            Members Login <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3 sm:hidden">
            <GoogleTranslateWidget />
          </div>
          <div className="flex flex-col">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-semibold ${
                  isActive(item.href)
                    ? 'bg-[#7a1a1a] text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-gradient-to-r from-blue-700 to-blue-900 px-3 py-2.5 text-center text-sm font-bold text-white"
            >
              Members Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Image src="/phi-emblem.png" alt="PHI Union emblem" width={44} height={44} className="h-11 w-11" />
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                The Public Health Inspector&apos;s Union of Sri Lanka
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Established 1913 · www.phi.lk</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            &ldquo;Environmental health management focusing on control of communicable &amp; non-communicable
            diseases, resuscitation of health and enforcement of health regulations.&rdquo;
          </p>
          <Image
            src="/phi-logo.png"
            alt="The Public Health Inspector's Union of Sri Lanka"
            width={300}
            height={59}
            className="mt-5 h-auto w-64 opacity-90 dark:hidden"
          />
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {PUBLIC_NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="hover:text-blue-700 dark:hover:text-blue-400">{i.label}</Link>
              </li>
            ))}
            <li><Link href="/login" className="hover:text-blue-700 dark:hover:text-blue-400">Members Login</Link></li>
          </ul>
        </div>

        {/* Contact + useful links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>673 Maradana Rd, Colombo 01000, Sri Lanka</li>
            <li><a href="tel:+94112670759" className="hover:text-blue-700 dark:hover:text-blue-400">(+94) 112 670 759</a></li>
            <li><a href="tel:+94112635675" className="hover:text-blue-700 dark:hover:text-blue-400">(+94) 11-263 5675</a></li>
            <li><a href="mailto:info@phi.lk" className="hover:text-blue-700 dark:hover:text-blue-400">info@phi.lk</a></li>
          </ul>
          <h3 className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Useful Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><a href="https://health.gov.lk" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 dark:hover:text-blue-400">Ministry of Health</a></li>
            <li><a href="https://www.epid.gov.lk" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 dark:hover:text-blue-400">Epidemiology Unit</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5 dark:border-slate-800">
        <p className="text-center text-[11px] text-slate-500 dark:text-slate-500">
          &copy; {new Date().getFullYear()} The Public Health Inspector&apos;s Union of Sri Lanka · www.phi.lk
          &nbsp;·&nbsp; PHI-PRO Digital Enforcement Hub
        </p>
      </div>
    </footer>
  );
}
