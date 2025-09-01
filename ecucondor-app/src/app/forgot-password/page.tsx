'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await authService.resetPassword(email);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    }
    
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Image */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ecucondor-yellow-600 to-ecucondor-yellow-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Revisa tu correo
            </h1>
            <p className="text-xl text-white/90 max-w-md">
              Te hemos enviado las instrucciones para restablecer tu contraseña
            </p>
          </div>
        </div>

        {/* Right side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-ecucondor-primary">
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-ecucondor-primary mb-4">
                ¡Correo enviado!
              </h2>
              <p className="text-ecucondor-muted mb-6">
                Hemos enviado las instrucciones para restablecer tu contraseña a <span className="text-ecucondor-yellow font-medium">{email}</span>
              </p>
              <div className="space-y-4">
                <p className="text-sm text-ecucondor-muted">
                  ¿No recibiste el correo? Revisa tu carpeta de spam o solicita un nuevo enlace en unos minutos.
                </p>
                <Link 
                  href="/login" 
                  className="inline-block btn-ecucondor-primary py-3 px-6 rounded-lg font-medium transition-all"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ecucondor-yellow-600 to-ecucondor-yellow-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-xl text-white/90 max-w-md">
              No te preocupes, te ayudamos a recuperar el acceso a tu cuenta de Ecucondor
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Recuperación rápida</h3>
              <p className="text-sm text-white/80">En menos de 5 minutos</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold">Proceso seguro</h3>
              <p className="text-sm text-white/80">Enlace temporal cifrado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-ecucondor-primary">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-neon-gold mb-2">Ecucondor</h2>
            <p className="text-ecucondor-muted">Recuperar contraseña</p>
          </div>

          {/* Info Card */}
          <div className="mb-6 p-4 bg-ecucondor-secondary/50 border border-ecucondor-tertiary rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-ecucondor-yellow mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-ecucondor-secondary font-medium mb-1">
                  Recuperación de contraseña
                </p>
                <p className="text-xs text-ecucondor-muted">
                  Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ecucondor-secondary mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent transition-colors text-ecucondor-primary placeholder-ecucondor-muted"
                placeholder="tu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-ecucondor-primary py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link href="/login" className="text-ecucondor-yellow hover:text-ecucondor-yellow-600 font-medium transition-colors flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}