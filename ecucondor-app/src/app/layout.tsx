import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "../styles/ecucondor-theme.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ecucondor - Plataforma de Intercambio de Divisas",
  description: "Plataforma FinTech para intercambio seguro de divisas entre Argentina, Brasil y Ecuador",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${outfit.variable} font-outfit antialiased bg-ecucondor-primary text-ecucondor-primary`}
      >
        {children}
      </body>
    </html>
  );
}
