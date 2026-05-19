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
  applicationName: 'PHI-PRO',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PHI-PRO',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e4ba6' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Modern web-app capability hint (apple-mobile-web-app-capable is
            deprecated; Next still emits it via metadata.appleWebApp.capable
            for iOS compatibility, so we add the standards-track equivalent
            here for Android / Chrome). */}
        <meta name="mobile-web-app-capable" content="yes" />
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