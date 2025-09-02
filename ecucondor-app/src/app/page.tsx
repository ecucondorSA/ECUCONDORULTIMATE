'use client';

import { companyInfo } from '@/data/rates';
import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/common/JsonLd';
import Navigation from '@/components/landing/Navigation';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ContactForm from '@/components/common/ContactForm';
import WhatsAppWidget from '@/components/common/WhatsAppWidget';
import ErrorBoundary, { DataErrorBoundary, FormErrorBoundary } from '@/components/common/ErrorBoundary';
import { LazySection } from '@/components/common/LazyWrapper';
import { financialServiceSchema, faqSchema } from '@/data/seoData';

export default function Home() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "EcuCondor",
    alternateName: "EcuCondor SAS",
    description: "Plataforma FinTech para intercambio seguro de divisas entre USD, ARS y BRL",
    url: "https://ecucondor.com",
    logo: "https://ecucondor.com/logo.png",
    sameAs: [
      companyInfo.socialMedia.facebook,
      companyInfo.socialMedia.twitter,
      companyInfo.socialMedia.instagram
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Quito",
      addressCountry: "EC"
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: companyInfo.contact.phone,
      email: companyInfo.contact.email,
      contactType: "customer service",
      availableLanguage: ["Spanish", "Portuguese"]
    },
    serviceType: [
      "Currency Exchange",
      "Money Transfer",
      "Financial Technology",
      "Digital Banking"
    ],
    areaServed: [
      {
        "@type": "Country",
        name: "Ecuador"
      },
      {
        "@type": "Country", 
        name: "Argentina"
      },
      {
        "@type": "Country",
        name: "Brazil"
      }
    ]
  };


  return (
    <>
      <JsonLd data={financialServiceSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={organizationSchema} />
      <div className="min-h-screen bg-black text-white font-sans">
        {/* Navigation */}
        <ErrorBoundary>
          <Navigation />
        </ErrorBoundary>

        {/* Hero Section */}
        <DataErrorBoundary>
          <HeroSection />
        </DataErrorBoundary>

        {/* Features Section */}
        <ErrorBoundary>
          <FeaturesSection />
        </ErrorBoundary>

        {/* Testimonials Section */}
        <LazySection 
          fallback={<div className="py-24 bg-black"><div className="max-w-7xl mx-auto px-4"><div className="h-64 bg-gray-800 rounded animate-pulse"></div></div></div>}
          rootMargin="200px"
        >
          <section className="py-24 bg-black" id="testimonials">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold mb-6 text-white">
                Lo Que Dicen Nuestros Clientes
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Miles de usuarios confían en ECUCONDOR para transformar sus finanzas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Columna izquierda: 2 testimonios */}
              <div className="space-y-8">
                <div className="bg-black rounded-2xl p-8 border-2 border-yellow-500/50 hover:border-yellow-400 transition-all duration-500 animate-fade-in shadow-2xl hover:shadow-yellow-500/30 transform hover:scale-105 hover:-translate-y-2">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-black font-bold text-xl">CM</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Carlos Mendoza</h4>
                      <p className="text-yellow-400">Empresario - TechStart Argentina</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    &ldquo;ECUCONDOR ha revolucionado completamente la forma en que manejamos nuestras transacciones internacionales. La rapidez y seguridad son incomparables.&rdquo;
                  </p>
                  <div className="flex text-yellow-400 mt-4">
                    <span>⭐⭐⭐⭐⭐</span>
                  </div>
                </div>

                <div className="bg-black rounded-2xl p-8 border-2 border-yellow-500/50 hover:border-yellow-400 transition-all duration-500 animate-fade-in shadow-2xl hover:shadow-yellow-500/30 transform hover:scale-105 hover:-translate-y-2">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-black font-bold text-xl">AS</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Ana Silva</h4>
                      <p className="text-yellow-400">Migrante Ecuatoriana - EcuCondor 2 años</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    &ldquo;Me encanta la plataforma, la veo diario así estoy al tanto de la cotización actual, son los mejores, 100% recomendado.&rdquo;
                  </p>
                  <div className="flex text-yellow-400 mt-4">
                    <span>⭐⭐⭐⭐⭐</span>
                  </div>
                </div>
              </div>

              {/* Columna central: imagen */}
              <div className="flex items-center justify-center">
                <Image 
                  src="/assets/ChatGPT Image 1 sept 2025, 04_01_58.png" 
                  alt="Clientes felices ECUCONDOR"
                  width={400}
                  height={600}
                  className="rounded-2xl border-2"
                  style={{
                    borderColor: 'transparent',
                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)'
                  }}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>

              {/* Columna derecha: 2 testimonios */}
              <div className="space-y-8">
                <div className="bg-black rounded-2xl p-8 border-2 border-yellow-500/50 hover:border-yellow-400 transition-all duration-500 animate-fade-in shadow-2xl hover:shadow-yellow-500/30 transform hover:scale-105 hover:-translate-y-2">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-black font-bold text-xl">MR</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Miguel Rodríguez</h4>
                      <p className="text-yellow-400">CEO - Fintech Solutions</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    &ldquo;ECUCONDOR no es solo una plataforma financiera, es un socio estratégico. Su tecnología avanzada nos ha dado una ventaja competitiva increíble en el mercado.&rdquo;
                  </p>
                  <div className="flex text-yellow-400 mt-4">
                    <span>⭐⭐⭐⭐⭐</span>
                  </div>
                </div>

                <div className="bg-black rounded-2xl p-8 border-2 border-yellow-500/50 hover:border-yellow-400 transition-all duration-500 animate-fade-in shadow-2xl hover:shadow-yellow-500/30 transform hover:scale-105 hover:-translate-y-2">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <span className="text-black font-bold text-xl">JS</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">João Silva</h4>
                      <p className="text-yellow-400">São Paulo, Brasil</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    &ldquo;Excelente serviço. Rápido, confiável e com um atendimento ao cliente impecável. Recomendo!&rdquo;
                  </p>
                  <div className="flex text-yellow-400 mt-4">
                    <span>⭐⭐⭐⭐⭐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </LazySection>

        {/* About Section */}
        <LazySection 
          fallback={<div className="py-16 bg-gray-50"><div className="max-w-7xl mx-auto px-4"><div className="h-64 bg-gray-200 rounded animate-pulse"></div></div></div>}
          rootMargin="100px"
        >
        <section className="py-16 bg-gray-50" id="about">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Imagen a la izquierda */}
              <div className="animate-fade-in">
                <Image 
                  src="/assets/image.png" 
                  alt="ECUCONDOR - Plataforma Financiera"
                  width={300}
                  height={400}
                  className="rounded-2xl border-2 shadow-2xl"
                  style={{ borderColor: 'transparent' }}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>

              {/* 2 Tarjetas a la derecha */}
              <div className="space-y-6">
                {/* Tarjeta 1: Acerca de ECUCONDOR */}
                <div
                  className="bg-white rounded-2xl p-6 border-2 shadow-2xl transform hover:scale-105 transition-all duration-500"
                  style={{
                    borderColor: '#FFD700',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.15)'
                  }}
                >
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">
                    Acerca de ECUCONDOR
                  </h2>
                  <p className="text-base text-gray-600 leading-relaxed">
                    ECUCONDOR S.A.S es líder en transacciones internacionales. Ofrecemos soluciones financieras seguras,
                    eficientes y adaptadas a tus necesidades.
                  </p>
                </div>

                {/* Tarjeta 2: Nuestra Misión */}
                <div
                  className="bg-white rounded-2xl p-6 border-2 shadow-2xl transform hover:scale-105 transition-all duration-500"
                  style={{
                    borderColor: '#FFD700',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.15)'
                  }}
                >
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Nuestra Misión</h3>
                  <p className="text-base text-gray-600 mb-4 leading-relaxed">
                    Democratizar el acceso a servicios financieros de alta calidad, haciendo que las herramientas de inversión
                    y gestión financiera estén disponibles para tod@s.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-3" style={{ background: '#FFD700' }}></div>
                      <span className="text-gray-700 text-sm">Transparencia total en todas las operaciones</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-3" style={{ background: '#FFD700' }}></div>
                      <span className="text-gray-700 text-sm">Tecnología e innovación</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-3" style={{ background: '#FFD700' }}></div>
                      <span className="text-gray-700 text-sm">Soporte 24/7 en español y portugués</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </LazySection>

        {/* Contact Section */}
        <section className="py-24 bg-gradient-to-br from-gray-900 to-black" id="contacto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Información de contacto */}
              <div className="text-white">
                <h2 className="text-4xl font-bold mb-6 text-yellow-400">
                  ¿Listo para Revolucionar tus Finanzas?
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Únete a miles de usuarios que ya están transformando su futuro financiero con ECUCONDOR. 
                  Contáctanos y descubre cómo podemos ayudarte.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-400">Oficina Principal</h4>
                      <p className="text-gray-300">Quito, Ecuador</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-400">Teléfono</h4>
                      <p className="text-gray-300">+54 (911) 6659-9559</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-400">Email</h4>
                      <p className="text-gray-300">Ecucondor@gmail.com</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 text-center"
                  >
                    🚀 Comenzar Ahora
                  </Link>
                  <a
                    href="https://wa.me/+5491166599559"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 text-center"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>

              {/* Formulario de contacto */}
              <div>
                <FormErrorBoundary>
                  <ContactForm />
                </FormErrorBoundary>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black text-white py-16" id="contact">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Sobre ECUCONDOR</h3>
                <p className="text-gray-300 mb-4">
                  ECUCONDOR S.A.S es líder en transacciones internacionales. Ofrecemos soluciones financieras seguras,
                  eficientes y adaptadas a tus necesidades.
                </p>
                <div className="flex space-x-4">
                  <a href={companyInfo.socialMedia.twitter} className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a href={companyInfo.socialMedia.instagram} className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><Link href="/calculator" className="hover:text-white transition-colors">Nuestros Servicios</Link></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Ver Tasas Actuales</a></li>
                  <li><a href="#contact" className="hover:text-white transition-colors">Soporte al Cliente</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Ayuda Personalizada</h4>
                <p className="text-gray-300 mb-4 text-sm">
                  ¿Tienes dudas? Contáctanos por WhatsApp para una atención inmediata y personalizada.
                </p>
                <a
                  href="https://wa.me/+5491166599559"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 inline-block"
                >
                  Chatea con Nosotros
                </a>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Contacto Directo</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <a href="mailto:Ecucondor@gmail.com" className="hover:text-white transition-colors">Ecucondor@gmail.com</a>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <a href="tel:+5491166599559" className="hover:text-white transition-colors">+54 (911) 6659-9559</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center">
              {/* Signature */}
              <div className="mb-6">
                <p className="text-ecucondor-yellow text-lg font-medium">
                  Con mucha alegría,<br />
                  E.M 😊🎉
                </p>
              </div>
              
              <p className="text-gray-400">
                2024 ECUCONDOR S.A.S. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* WhatsApp Widget */}
      <WhatsAppWidget />
    </>
  );
}