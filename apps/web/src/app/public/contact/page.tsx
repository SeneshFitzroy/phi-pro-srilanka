import type { Metadata } from 'next';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { MapPin, Phone, Mail, Clock, ExternalLink, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | The Public Health Inspector\'s Union of Sri Lanka',
  description: 'Contact details and office address of the Public Health Inspector\'s Union of Sri Lanka — 673 Maradana Road, Colombo 01000.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicHeader />

      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">Get in Touch</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Contact Us</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">The Public Health Inspector&apos;s Union of Sri Lanka secretariat.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/50"><MapPin className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Office Address</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">673 Maradana Rd,<br />Colombo 01000,<br />Sri Lanka.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/50"><Phone className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Telephone</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  <a href="tel:+94112670759" className="hover:text-blue-700 dark:hover:text-blue-400">(+94) 112 670 759</a><br />
                  <a href="tel:+94112635675" className="hover:text-blue-700 dark:hover:text-blue-400">(+94) 11-263 5675</a>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/50"><Mail className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Email</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  <a href="mailto:info@phi.lk" className="hover:text-blue-700 dark:hover:text-blue-400">info@phi.lk</a><br />
                  <a href="mailto:phisrilanka1@gmail.com" className="hover:text-blue-700 dark:hover:text-blue-400">phisrilanka1@gmail.com</a>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/50"><Clock className="h-5 w-5 text-blue-700 dark:text-blue-400" /></div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Office Hours</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Monday – Friday · 8:30 a.m. – 4:15 p.m.</p>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=673+Maradana+Road+Colombo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
            >
              <MapPin className="h-4 w-4" /> Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Public services callout */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/40">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Public Health Services</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              For routine public health matters, please use the online portal — no login required:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Submit a Complaint', href: '/public/complaints' },
                { label: 'Check Food Hygiene Grades', href: '/public/food-grades' },
                { label: 'Disease Outbreak Alerts', href: '/public/alerts' },
                { label: 'Verify a Certificate', href: '/public/verify' },
                { label: 'Pay a Fee or Fine', href: '/public/payments' },
                { label: 'Find a PHI near you', href: '/public/find-phi' },
              ].map((s) => (
                <a key={s.href} href={s.href} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {s.label}
                </a>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-300">
              <p className="flex items-center gap-2 font-bold"><MessageSquare className="h-4 w-4" /> Health Emergency?</p>
              <p className="mt-1">Call the Ministry of Health hotline <strong>1390</strong> or the Public Health Emergency line <a href="tel:+94112695112" className="font-bold underline">+94 11 269 5112</a>.</p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
