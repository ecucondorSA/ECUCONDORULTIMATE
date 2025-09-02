import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Accede a tu cuenta EcuCondor para realizar intercambios de divisas seguros y rápidos entre USD, ARS y BRL.',
  openGraph: {
    title: 'Iniciar Sesión - EcuCondor',
    description: 'Accede a tu cuenta para intercambio de divisas',
    url: '/login',
  },
  robots: {
    index: false, // No indexar páginas de login por seguridad
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}