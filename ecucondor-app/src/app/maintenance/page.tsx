'use client';

import { useEffect } from 'react';

export default function MaintenancePage() {
  useEffect(() => {
    // Redirect to the static maintenance page
    window.location.href = '/maintenance.html';
  }, []);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-xl">Redirigiendo a página de mantenimiento...</p>
      </div>
    </div>
  );
}