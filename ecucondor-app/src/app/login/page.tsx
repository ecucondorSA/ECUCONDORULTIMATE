'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        router.push('/dashboard');
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    }
    
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await authService.signInWithGoogle();
      
      if (error) {
        setError(error.message);
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ecucondor-yellow-600 to-ecucondor-yellow-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Bienvenido a Ecucondor
            </h1>
            <p className="text-xl text-white/90 max-w-md">
              La plataforma FinTech líder para intercambio seguro de divisas entre Argentina, Brasil y Ecuador
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold">Seguro</h3>
              <p className="text-sm text-white/80">Transacciones protegidas</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold">Rápido</h3>
              <p className="text-sm text-white/80">Transferencias instantáneas</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Transparente</h3>
              <p className="text-sm text-white/80">Tarifas claras</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-ecucondor-primary">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-neon-gold mb-2">Ecucondor</h2>
            <p className="text-ecucondor-muted">Ingresa a tu cuenta</p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full mb-6 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg border border-gray-300 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? 'Conectando...' : 'Continuar con Google'}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ecucondor-tertiary"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-ecucondor-primary text-ecucondor-muted">o</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ecucondor-secondary mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent transition-colors text-ecucondor-primary placeholder-ecucondor-muted"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-ecucondor-tertiary text-ecucondor-yellow focus:ring-ecucondor-yellow" />
                <span className="ml-2 text-sm text-ecucondor-muted">Recordarme</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-ecucondor-yellow hover:text-ecucondor-yellow-600 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-ecucondor-primary py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-ecucondor-muted">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-ecucondor-yellow hover:text-ecucondor-yellow-600 font-medium transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}