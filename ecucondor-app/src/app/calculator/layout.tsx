import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Divisas',
  description: 'Calcula el intercambio de divisas en tiempo real entre USD, ARS y BRL. Tasas actualizadas, comisiones transparentes y cálculos precisos.',
  keywords: [
    'calculadora divisas',
    'convertidor monedas',
    'USD a ARS',
    'USD a BRL',
    'ARS a BRL',
    'tasas de cambio',
    'calculadora fintech',
    'intercambio en línea'
  ],
  openGraph: {
    title: 'Calculadora de Divisas - EcuCondor',
    description: 'Calcula intercambios de divisas USD, ARS, BRL con tasas en tiempo real',
    url: '/calculator',
  },
  alternates: {
    canonical: '/calculator',
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}