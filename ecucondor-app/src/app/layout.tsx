import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "../styles/mobile-first-responsive.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: {
    default: "EcuCondor - Intercambio de Divisas | Tu aliado financiero",
    template: "%s | EcuCondor"
  },
  description: "Plataforma FinTech líder para intercambio seguro de divisas entre USD, ARS y BRL. Tasas competitivas, transacciones rápidas y confianza garantizada en Ecuador, Argentina y Brasil.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '835x833', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '835x833', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '835x833', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  keywords: [
    'intercambio divisas',
    'cambio moneda',
    'USD ARS BRL',
    'fintech Ecuador',
    'transferencias internacionales',
    'casa de cambio',
    'EcuCondor',
    'divisas online',
    'cambio dolares',
    'pesos argentinos',
    'reales brasileños'
  ],
  authors: [{ name: 'EcuCondor Team' }],
  creator: 'EcuCondor',
  publisher: 'EcuCondor SAS',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_EC',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://ecucondor.com',
    siteName: 'EcuCondor',
    title: 'EcuCondor - Intercambio de Divisas Seguro',
    description: 'Plataforma FinTech para intercambio de divisas USD, ARS, BRL. Confianza y velocidad en cada transacción.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EcuCondor - Tu aliado en cambio de divisas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ecucondor',
    creator: '@ecucondor',
    title: 'EcuCondor - Intercambio de Divisas',
    description: 'Plataforma FinTech para intercambio seguro de USD, ARS y BRL',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://ecucondor.com',
    languages: {
      'es-EC': '/es',
      'es-AR': '/es-ar',
      'pt-BR': '/pt-br',
    },
  },
  category: 'finance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${outfit.variable} font-outfit antialiased bg-ecucondor-primary text-ecucondor-primary mobile-optimized`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #FFD700',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
