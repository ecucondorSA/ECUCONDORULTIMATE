'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginDebugPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState('');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    addLog('🚀 LoginDebugPage mounted');
    addLog(`📊 Initial state - User: ${user?.email || 'null'}, Session: ${session ? 'exists' : 'null'}, Loading: ${loading}`);
  }, [user, session, loading]);

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setLogs([]);

    try {
      addLog('🔐 Starting Supabase login...');
      addLog(`📧 Email: ${email}`);
      
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        addLog(`❌ Login error: ${error.message}`);
        setError(error.message);
      } else if (data.user && data.session) {
        addLog('✅ Login successful!');
        addLog(`👤 User: ${data.user.email}`);
        addLog(`🎫 Session: ${data.session.access_token?.slice(0, 20)}...`);
        
        // Check cookies
        const cookies = document.cookie;
        addLog(`🍪 Cookies: ${cookies}`);
        
        // Get returnTo parameter
        const urlParams = new URLSearchParams(window.location.search);
        const returnToParam = urlParams.get('returnTo') || '/dashboard';
        const returnTo = decodeURIComponent(returnToParam);
        
        addLog(`📍 ReturnTo param: ${returnToParam}`);
        addLog(`📍 Decoded returnTo: ${returnTo}`);
        
        // Wait and check auth context
        setTimeout(() => {
          addLog('⏰ After 1 second timeout...');
          addLog(`👤 Context User: ${user?.email || 'still null'}`);
          addLog(`🎫 Context Session: ${session ? 'exists' : 'still null'}`);
          
          addLog('🚀 Attempting redirect...');
          
          // Test different redirect methods
          setTimeout(() => {
            addLog('Method 1: window.location.href');
            window.location.href = returnTo;
          }, 2000);
        }, 1000);
      }
    } catch (err) {
      addLog(`❌ Exception: ${err}`);
      setError(`Connection error: ${err}`);
    }
    
    setIsLoading(false);
  };

  const testDashboardDirect = () => {
    addLog('🧪 Testing direct dashboard navigation...');
    router.push('/dashboard');
  };

  const testWindowLocation = () => {
    addLog('🧪 Testing window.location.href to dashboard...');
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-4">🔍 LOGIN DEBUG - PRODUCTION</h1>
          <p className="text-gray-300 mb-6">Debug del problema de login en producción</p>
          
          {/* Current State */}
          <div className="bg-gray-700 p-4 rounded mb-6">
            <h3 className="font-semibold mb-2">📊 Estado Actual:</h3>
            <div className="text-sm space-y-1">
              <div>Loading: {loading ? '🔄 Yes' : '✅ No'}</div>
              <div>User: {user ? `✅ ${user.email}` : '❌ None'}</div>
              <div>Session: {session ? '✅ Active' : '❌ None'}</div>
              <div>URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</div>
            </div>
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleTestLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded text-white"
                placeholder="tu@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded text-white"
                placeholder="tu password"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? '🔄 Testing Login...' : '🧪 TEST LOGIN'}
            </button>
          </form>

          {/* Quick Tests */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={testDashboardDirect}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Test router.push('/dashboard')
            </button>
            <button
              onClick={testWindowLocation}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test window.location.href
            </button>
            <a
              href="/dashboard"
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 inline-block text-center"
            >
              Direct Link to Dashboard
            </a>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 p-4 rounded mb-6">
              <h4 className="font-semibold text-red-400">❌ Error:</h4>
              <p className="text-red-300">{error}</p>
            </div>
          )}
          
          {/* Logs */}
          <div className="bg-gray-700 p-4 rounded">
            <h4 className="font-semibold mb-2">📋 Debug Logs:</h4>
            <div className="text-sm space-y-1 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-400">No logs yet...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="font-mono text-green-300">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}