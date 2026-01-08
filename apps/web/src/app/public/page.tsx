import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MessageSquare,
  AlertTriangle,
  CreditCard,
  CheckCircle,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function PublicPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">PHI-PRO</span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            PHI Login
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold">Public Portal</h1>
          <p className="mt-2 text-muted-foreground">
            Access public health information, check food hygiene grades, submit complaints, and
            more.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Search,
              title: 'Check Food Hygiene Grade',
              desc: 'Search restaurants and food establishments by name or area to view their hygiene grade.',
              href: '/public/food-grades',
              color: 'text-food bg-food-light',
            },
            {
              icon: MessageSquare,
              title: 'Submit a Complaint',
              desc: 'Report food safety issues, disease concerns, or workplace hazards anonymously.',
              href: '/public/complaints',
              color: 'text-blue-600 bg-blue-50',
            },
            {
              icon: AlertTriangle,
              title: 'Disease Alerts',
              desc: 'View active disease outbreak alerts and safety advisories in your area.',
              href: '/public/alerts',
              color: 'text-epidemiology bg-epidemiology-light',
            },
            {
              icon: CreditCard,
              title: 'Pay Fine / Fee',
              desc: 'Pay permit fees, compliance fines, or renewal charges online via GovPay.',
              href: '/public/payments',
              color: 'text-amber-600 bg-amber-50',
            },