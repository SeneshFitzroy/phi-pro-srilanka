import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MessageSquare,
  AlertTriangle,
  CreditCard,
  CheckCircle,
  ArrowRight,
  FileText,
} from 'lucide-react';

export default function PublicPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/phi-emblem.png" alt="PHI" width={32} height={32} />
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
              icon: FileText,
              title: 'Published Health Reports',
              desc: 'View official PHI inspection reports, surveillance data, and public health statistics.',
              href: '/public/reports',
              color: 'text-indigo-600 bg-indigo-50',
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
            {
              icon: CheckCircle,
              title: 'Verify Certificate',
              desc: 'Scan QR code or enter certificate number to verify authenticity.',
              href: '/public/verify',
              color: 'text-green-600 bg-green-50',
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`inline-flex rounded-lg p-2.5 ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              <span className="mt-3 inline-flex items-center text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Open <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="mt-12 border-t bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PHI-PRO &mdash; Ministry of Health, Sri Lanka &bull;{' '}
          <a href="https://phi.lk" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">phi.lk</a>
        </div>
      </footer>
    </div>
  );
}
