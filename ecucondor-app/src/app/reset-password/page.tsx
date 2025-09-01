'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  useEffect(() => {
    // Handle auth callback for password reset
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        setError('Enlace de recuperación inválido o expirado');
      }
    };

    handleAuthCallback();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              ¡Contraseña actualizada!
            </h1>
            <p className="text-xl text-white/90 max-w-md">
              Tu contraseña ha sido cambiada exitosamente. Serás redirigido al inicio de sesión.
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
                ¡Listo!
              </h2>
              <p className="text-ecucondor-muted mb-6">
                Tu contraseña ha sido actualizada correctamente. Serás redirigido automáticamente.
              </p>
              <Link 
                href="/login" 
                className="inline-block btn-ecucondor-primary py-3 px-6 rounded-lg font-medium transition-all"
              >
                Ir al inicio de sesión
              </Link>
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
              Nueva contraseña
            </h1>
            <p className="text-xl text-white/90 max-w-md">
              Crea una nueva contraseña segura para tu cuenta de Ecucondor
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold">Segura</h3>
              <p className="text-sm text-white/80">Mínimo 8 caracteres</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Fácil de recordar</h3>
              <p className="text-sm text-white/80">Usa algo memorable</p>
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
            <p className="text-ecucondor-muted">Restablecer contraseña</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ecucondor-secondary mb-2">
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent transition-colors text-ecucondor-primary placeholder-ecucondor-muted"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ecucondor-secondary mb-2">
                Confirmar nueva contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-ecucondor-secondary border border-ecucondor-tertiary rounded-lg focus:ring-2 focus:ring-ecucondor-yellow focus:border-transparent transition-colors text-ecucondor-primary placeholder-ecucondor-muted"
                placeholder="Repite tu nueva contraseña"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-ecucondor-muted">Tu contraseña debe tener:</p>
              <ul className="text-xs text-ecucondor-muted space-y-1">
                <li className="flex items-center">
                  <svg className={`w-3 h-3 mr-2 ${password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Al menos 8 caracteres
                </li>
                <li className="flex items-center">
                  <svg className={`w-3 h-3 mr-2 ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Una letra mayúscula
                </li>
                <li className="flex items-center">
                  <svg className={`w-3 h-3 mr-2 ${/[0-9]/.test(password) ? 'text-green-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Un número
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-ecucondor-primary py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
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