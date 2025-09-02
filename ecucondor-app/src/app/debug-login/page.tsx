'use client';

import React, { useState } from 'react';
import { authService } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function DebugLoginPage() {
  const { user, session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleDebugLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      console.log('🔐 Debug Login Starting...');
      setResult('🔄 Attempting Supabase login...');
      
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        console.error('❌ Login error:', error);
        setError(`Login failed: ${error.message}`);
        setResult('');
      } else if (data.user && data.session) {
        console.log('✅ Login successful!', data);
        setResult(`✅ Login successful! User: ${data.user.email}, Session: ${data.session.access_token?.slice(0, 20)}...`);
        
        // Show cookies
        setTimeout(() => {
          const cookies = document.cookie;
          console.log('🍪 Cookies after login:', cookies);
          setResult(prev => prev + `\n\n🍪 Cookies: ${cookies}`);
          
          // Try to redirect after showing results
          setTimeout(() => {
            setResult(prev => prev + '\n\n🚀 Attempting redirect to dashboard...');
            
            // Different redirect methods to test
            console.log('Method 1: window.location.href');
            window.location.href = '/dashboard';
          }, 2000);
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Login exception:', error);
      setError(`Connection error: ${error}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <h1 className="text-2xl font-bold mb-4">🔍 Debug Login Test</h1>
          <p className="text-gray-600 mb-6">Direct Supabase login testing without middleware interference</p>
          
          {/* Current Auth State */}
          <div className="bg-gray-50 p-4 rounded mb-6">
            <h3 className="font-semibold mb-2">Current Auth State:</h3>
            <div className="text-sm space-y-1">
              <div>Loading: {loading ? '🔄 Yes' : '✅ No'}</div>
              <div>User: {user ? `✅ ${user.email}` : '❌ None'}</div>
              <div>Session: {session ? '✅ Active' : '❌ None'}</div>
            </div>
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleDebugLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="test@ecucondor.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="password123"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '🔄 Testing Login...' : '🧪 Debug Login'}
            </button>
          </form>
          
          {/* Results */}
          {result && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-semibold text-green-800">Results:</h4>
              <pre className="text-sm text-green-700 whitespace-pre-wrap">{result}</pre>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <h4 className="font-semibold text-red-800">Error:</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t space-x-4">
            <a 
              href="/login" 
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go to Real Login
            </a>
            <a 
              href="/dashboard" 
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Try Dashboard Direct
            </a>
            <button 
              onClick={() => {
                console.log('🍪 Current cookies:', document.cookie);
                alert(`Cookies: ${document.cookie}`);
              }}
              className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Show Cookies
            </button>
          </div>
        </div>

        {/* Environment Debug */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Environment Debug</h2>
          <div className="text-sm font-mono space-y-1">
            <div>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Missing'}</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing'}</div>
            <div>Window location: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}