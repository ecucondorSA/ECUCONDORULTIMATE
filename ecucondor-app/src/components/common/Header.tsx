'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface HeaderProps {
  showLogout?: boolean;
}

export default function Header({ showLogout = false }: HeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.firstName) {
      return user.user_metadata.firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-yellow-400">EcuCondor</h1>
              <span className="text-sm text-gray-400 hidden sm:block">
                Tu aliado en cambio de divisas
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/calculator"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Calculadora
                </Link>
              </>
            )}

            {/* User Menu */}
            {showLogout && user && (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-gray-400">Hola, </span>
                  <span className="text-gray-200 font-medium">
                    {getUserDisplayName()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="bg-gray-700 border border-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-red-600 hover:text-white hover:border-red-500 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
                </button>
              </div>
            )}

            {/* Login/Register buttons for non-authenticated users */}
            {!user && !showLogout && (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}