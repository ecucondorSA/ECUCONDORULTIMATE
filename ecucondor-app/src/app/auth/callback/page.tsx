'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');
        
        // Get the current URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        console.log('URL params:', Object.fromEntries(urlParams));
        console.log('Hash params:', Object.fromEntries(hashParams));

        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth callback error:', error);
          setError(error.message);
          setIsProcessing(false);
          return;
        }

        if (data.session) {
          console.log('✅ Auth callback successful, session found');
          console.log('User:', data.session.user.email);
          
          // Check for returnTo parameter
          const returnTo = urlParams.get('returnTo') || sessionStorage.getItem('returnTo') || '/dashboard';
          
          // Clean up storage
          sessionStorage.removeItem('returnTo');
          
          console.log('🔄 Redirecting to:', returnTo);
          
          // Small delay to ensure session is properly set
          setTimeout(() => {
            router.push(decodeURIComponent(returnTo));
          }, 500);
        } else {
          console.log('❌ No session found after callback');
          setError('No se pudo establecer la sesión. Inténtalo de nuevo.');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('❌ Callback processing error:', err);
        setError('Error procesando la autenticación. Inténtalo de nuevo.');
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  const handleRetryLogin = () => {
    router.push('/login');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ecucondor-primary">
        <div className="text-center max-w-md mx-auto p-6">
          {/* Loading Animation */}
          <div className="w-16 h-16 border-4 border-ecucondor-yellow/30 border-t-ecucondor-yellow rounded-full animate-spin mx-auto mb-6"></div>
          
          <h2 className="text-2xl font-bold text-ecucondor-primary mb-3">
            Procesando autenticación...
          </h2>
          
          <p className="text-ecucondor-muted mb-4">
            Por favor espera mientras verificamos tu cuenta.
          </p>
          
          <div className="bg-ecucondor-tertiary/20 border border-ecucondor-tertiary rounded-lg p-4">
            <p className="text-sm text-ecucondor-muted">
              Este proceso puede tomar unos segundos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ecucondor-primary">
        <div className="text-center max-w-md mx-auto p-6">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-ecucondor-primary mb-3">
            Error de autenticación
          </h2>
          
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
          
          <button
            onClick={handleRetryLogin}
            className="btn-ecucondor-primary px-6 py-3 rounded-lg font-medium"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  // This should not be reached, but just in case
  return null;
}