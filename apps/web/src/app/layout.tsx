import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PHI-PRO | Digital Health Enforcement & Integrated Intelligence System',
  description:
    'Unified digital platform for Sri Lanka\'s Public Health Inspectors — covering Food Safety, School Health, Epidemiology, Occupational Health, and Administration.',
  keywords: [
    'PHI',
    'Public Health Inspector',
    'Sri Lanka',
    'Food Safety',
    'Epidemiology',
    'School Health',
    'Occupational Health',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e4ba6' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Zero-flicker language init: runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('i18nextLng');if(l&&['en','si','ta'].includes(l)){document.documentElement.setAttribute('lang',l==='si'?'si':l==='ta'?'ta':'en');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}