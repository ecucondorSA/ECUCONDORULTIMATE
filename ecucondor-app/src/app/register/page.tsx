'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import VideoBackground from '@/components/auth/VideoBackground';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const registerFeatures = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Comunidad',
      description: 'Miles de usuarios activos'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Verificado',
      description: 'Proceso KYC seguro'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: 'Tarifas bajas',
      description: 'ARS a USD sin comisiones'
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await authService.signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
      });
      
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

  const handleGoogleRegister = async () => {
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
      <VideoBackground
        title="Únete a EcuCondor"
        subtitle="Crea tu cuenta y accede a la mejor plataforma de intercambio de divisas en Latinoamérica"
        features={registerFeatures}
      />

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-ecucondor-primary">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-neon-gold mb-2">Ecucondor</h2>
            <p className="text-ecucondor-muted">Crea tu cuenta</p>
          </div>

          {/* Google Register Button */}
          <button
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className="w-full mb-6 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg border border-gray-300 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? 'Conectando...' : 'Registrarse con Google'}
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

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                  Nombre
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent transition-colors text-white placeholder-ecucondor-muted"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                  Apellido
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent transition-colors text-white placeholder-ecucondor-muted"
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent transition-colors text-white placeholder-ecucondor-muted"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-white mb-2">
                País
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent transition-colors text-white"
              >
                <option value="">Selecciona tu país</option>
                <option value="AR">Argentina</option>
                <option value="BR">Brasil</option>
                <option value="EC">Ecuador</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent transition-colors text-white placeholder-ecucondor-muted"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent transition-colors text-white placeholder-ecucondor-muted"
                placeholder="Repite tu contraseña"
              />
            </div>

            <div className="flex items-start">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
                className="mt-1 rounded border-ecucondor-tertiary text-ecucondor-yellow focus:ring-ecucondor-yellow"
              />
              <label htmlFor="acceptTerms" className="ml-3 text-sm text-ecucondor-muted">
                Acepto los{' '}
                <Link href="/terms" className="text-ecucondor-yellow hover:text-ecucondor-yellow-600 transition-colors">
                  Términos y Condiciones
                </Link>
                {' '}y la{' '}
                <Link href="/privacy" className="text-ecucondor-yellow hover:text-ecucondor-yellow-600 transition-colors">
                  Política de Privacidad
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-ecucondor-primary py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-ecucondor-muted">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-ecucondor-yellow hover:text-ecucondor-yellow-600 font-medium transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}