'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/supabase';
import { AuthTester } from '@/components/debug/AuthTester';
import { ThemeDebugger } from '@/components/debug/ThemeDebugger';

/**
 * Página de prueba para verificar el flujo de autenticación
 * Solo disponible en desarrollo
 */
export default function TestAuthPage() {
  const { user, session, loading, signOut } = useAuth();
  const [manualTest, setManualTest] = useState({
    email: 'test@ecucondor.com',
    password: 'password123',
    isLoading: false,
    result: '',
    error: ''
  });

  // Redirect in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      window.location.href = '/';
    }
  }, []);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualTest(prev => ({ ...prev, isLoading: true, result: '', error: '' }));

    try {
      console.log('🔐 Starting manual login test...');
      const { data, error } = await authService.signIn(manualTest.email, manualTest.password);
      
      if (error) {
        setManualTest(prev => ({ 
          ...prev, 
          error: error.message, 
          isLoading: false 
        }));
        console.error('❌ Login failed:', error.message);
      } else if (data.user && data.session) {
        setManualTest(prev => ({ 
          ...prev, 
          result: `✅ Login successful! Redirecting to dashboard...`,
          isLoading: false 
        }));
        console.log('✅ Login successful, redirecting...');
        
        // Test the exact same redirect logic as login page
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error) {
      setManualTest(prev => ({ 
        ...prev, 
        error: `Connection error: ${error}`, 
        isLoading: false 
      }));
      console.error('❌ Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setManualTest(prev => ({ ...prev, result: 'Logged out successfully' }));
    } catch (error) {
      setManualTest(prev => ({ ...prev, error: `Logout error: ${error}` }));
    }
  };

  // Don't render in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">🧪 Authentication Test Page</h1>
          <p className="text-gray-600">Development mode only - Test login flow and authentication state</p>
        </div>

        {/* Current Auth State */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Authentication State</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-700">User</h3>
              <p className="text-sm text-gray-600 mt-1">
                {loading ? '⏳ Loading...' : user ? `✅ ${user.email}` : '❌ Not logged in'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-700">Session</h3>
              <p className="text-sm text-gray-600 mt-1">
                {loading ? '⏳ Loading...' : session ? '✅ Active' : '❌ No session'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-700">Loading State</h3>
              <p className="text-sm text-gray-600 mt-1">
                {loading ? '🔄 Loading' : '✅ Ready'}
              </p>
            </div>
          </div>
          
          {user && (
            <div className="mt-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Manual Login Test */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Login Test</h2>
          
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={manualTest.email}
                onChange={(e) => setManualTest(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="test@ecucondor.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={manualTest.password}
                onChange={(e) => setManualTest(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="password123"
              />
            </div>
            
            <button
              type="submit"
              disabled={manualTest.isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {manualTest.isLoading ? '🔄 Testing Login...' : '🔐 Test Login'}
            </button>
          </form>
          
          {manualTest.result && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700">{manualTest.result}</p>
            </div>
          )}
          
          {manualTest.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">{manualTest.error}</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="/login"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Go to Login Page
            </a>
            <a
              href="/dashboard"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Go to Dashboard
            </a>
            <a
              href="/register"
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Go to Register
            </a>
            <a
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go to Home
            </a>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Info</h2>
          <div className="text-sm space-y-2 font-mono bg-gray-50 p-4 rounded">
            <div>NODE_ENV: {process.env.NODE_ENV}</div>
            <div>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
            <div>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Debug Components */}
      <AuthTester />
      <ThemeDebugger />
    </div>
  );
}