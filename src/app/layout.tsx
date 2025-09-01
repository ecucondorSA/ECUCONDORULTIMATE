import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ECUCONDOR - Tu Puente Financiero Global',
  description: 'La plataforma más segura para tus transacciones internacionales entre Argentina, Brasil y Ecuador. Transacciones seguras, rápidas y confiables.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} font-sans`}>{children}</body>
    </html>
  )
}
