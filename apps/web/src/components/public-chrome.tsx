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
import { Menu, X, Phone, Mail, ArrowRight, ExternalLink, Globe } from 'lucide-react';

const GoogleTranslateWidget = dynamic(
  () => import('@/components/google-translate').then((m) => ({ default: m.GoogleTranslateWidget })),
  { ssr: false },
);

// Public navigation — citizen-facing only. PHI-Officer-only resources
// (Duty of PHI, Downloads) live inside the authenticated dashboard sidebar.
//
// Order follows the citizen action funnel: land → act → find → read → learn.
//   • Contact is folded into the Find PHI page (no separate /public/contact)
//   • Press Release is folded into News & Press (no separate /public/press)
//   • /public/portal is the citizen services hub (complaints, payments, …)
export const PUBLIC_NAV = [
  { label: 'Home',           href: '/' },
  { label: 'Public Portal',  href: '/public/portal' },
  { label: 'Find PHI',       href: '/public/find-phi' },
  { label: 'News & Press',   href: '/public/news' },
  { label: 'About',          href: '/public/about' },
] as const;

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm dark:bg-slate-950/95">
      {/* Top contact strip */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-800 to-slate-900 text-white dark:border-slate-800">
        <div className="mx-auto flex min-h-9 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1 text-[11px] sm:px-6 lg:px-8">
          <span className="font-medium tracking-wide">
            <span className="hidden sm:inline">The Public Health Inspector&apos;s Union of Sri Lanka — </span>Est. 1913
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href="tel:+94112635675" className="hidden items-center gap-1.5 hover:text-blue-200 sm:flex">
              <Phone className="h-3 w-3" /> (+94) 11-2635675
            </a>
            <a href="mailto:info@phi.lk" className="hidden items-center gap-1.5 hover:text-blue-200 sm:flex">
              <Mail className="h-3 w-3" /> info@phi.lk
            </a>
          </div>
        </div>
      </div>

      {/* Logo row — language picker sits on the right of the same bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          aria-label="The Public Health Inspector's Union of Sri Lanka — home"
        >
          {/* Official wordmark (emblem + trilingual name) — the main logo */}
          <span className="hidden sm:inline-flex dark:rounded-md dark:bg-white/95 dark:p-1.5">
            <Image
              src="/phi-logo.png"
              alt="The Public Health Inspector's Union of Sri Lanka"
              width={718}
              height={142}
              className="h-12 w-auto drop-shadow-sm md:h-14 lg:h-[60px]"
              priority
            />
          </span>
          {/* Compact emblem on small screens */}
          <Image
            src="/phi-emblem.png"
            alt="PHI Union of Sri Lanka emblem"
            width={56}
            height={56}
            className="h-11 w-11 shrink-0 drop-shadow-sm sm:hidden"
            priority
          />
          <span className="max-w-[14rem] text-[12px] font-extrabold uppercase leading-tight tracking-tight text-slate-900 sm:hidden dark:text-white">
            The Public Health Inspector&apos;s Union of Sri Lanka
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex" aria-label="Site language">
            <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
            <div className="rounded-md border border-slate-300 bg-white px-2 py-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <GoogleTranslateWidget />
            </div>
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
      <nav className="border-t border-blue-900/30 bg-gradient-to-r from-blue-800 to-blue-950">
        <div className="mx-auto hidden max-w-7xl items-center gap-1 px-4 sm:px-6 lg:flex lg:px-8">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-sm px-6 py-3.5 text-sm font-semibold tracking-wide transition-colors ${
                isActive(item.href)
                  ? 'bg-black/25 text-white'
                  : 'text-blue-100/90 hover:bg-black/15 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/login"
            className="ml-auto my-2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-white px-5 py-2 text-sm font-bold text-blue-900 transition-all hover:bg-blue-50"
          >
            Members Login <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-3 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:hidden dark:border-slate-700 dark:bg-slate-900" aria-label="Site language">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Language</span>
            <div className="ml-auto"><GoogleTranslateWidget /></div>
          </div>
          <div className="flex flex-col">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-semibold ${
                  isActive(item.href)
                    ? 'bg-blue-800 text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-md bg-gradient-to-r from-blue-700 to-blue-900 px-3 py-2.5 text-center text-sm font-bold text-white"
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
          <Image
            src="/phi-logo.png"
            alt="The Public Health Inspector's Union of Sri Lanka"
            width={300}
            height={59}
            className="h-auto w-72 opacity-95 dark:hidden"
          />
          {/* Dark-mode fallback: emblem only since the wordmark is dark-on-light */}
          <div className="hidden items-center gap-3 dark:flex">
            <Image src="/phi-emblem.png" alt="PHI Union emblem" width={48} height={48} className="h-12 w-12" />
            <p className="text-sm font-extrabold text-white">
              The Public Health Inspector&apos;s Union of Sri Lanka
            </p>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            &ldquo;Environmental health management focusing on control of communicable &amp; non-communicable
            diseases, resuscitation of health and enforcement of health regulations.&rdquo;
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {PUBLIC_NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="hover:text-blue-700 dark:hover:text-blue-300">{i.label}</Link>
              </li>
            ))}
            <li><Link href="/login" className="hover:text-blue-700 dark:hover:text-blue-300">Members Login</Link></li>
          </ul>
        </div>

        {/* Contact + useful links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <a
                href="https://www.google.com/maps/search/?api=1&query=673+Maradana+Road+Colombo+01000+Sri+Lanka"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1 hover:text-blue-700 dark:hover:text-blue-400"
              >
                673 Maradana Rd, Colombo 01000, Sri Lanka <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
              </a>
            </li>
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
