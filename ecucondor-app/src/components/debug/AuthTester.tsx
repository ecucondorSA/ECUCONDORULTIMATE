"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/supabase';

/**
 * Componente para probar el flujo de autenticación completo
 * Solo visible en desarrollo
 */
export function AuthTester() {
  const { user, session, loading } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const logTest = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `${timestamp}: ${message}`;
    setTestResults(prev => [...prev, entry]);
    console.log(`[AuthTester] ${entry}`);
  };

  const runAuthTest = async () => {
    setIsRunningTest(true);
    setTestResults([]);
    
    try {
      logTest('🧪 Starting authentication test...');
      
      // Test 1: Check current auth state
      logTest(`Current user: ${user ? user.email : 'None'}`);
      logTest(`Current session: ${session ? 'Active' : 'None'}`);
      logTest(`Loading state: ${loading}`);
      
      // Test 2: Check Supabase connection
      const { user: currentUser } = await authService.getCurrentUser();
      logTest(`Supabase getCurrentUser: ${currentUser ? currentUser.email : 'No user'}`);
      
      // Test 3: Check session
      const { session: currentSession } = await authService.getCurrentSession();
      logTest(`Supabase getCurrentSession: ${currentSession ? 'Active' : 'No session'}`);
      
      // Test 4: Check cookies
      if (typeof document !== 'undefined') {
        const cookies = document.cookie;
        const supabaseCookies = cookies
          .split(';')
          .filter(cookie => cookie.trim().startsWith('sb-'))
          .map(cookie => cookie.trim().split('=')[0]);
        
        logTest(`Supabase cookies found: ${supabaseCookies.length > 0 ? supabaseCookies.join(', ') : 'None'}`);
      }
      
      // Test 5: Test API endpoint
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        logTest(`API health check: ${data.status === 'healthy' ? '✅ OK' : '❌ Failed'}`);
      } catch (error) {
        logTest(`API health check: ❌ Error - ${error}`);
      }
      
      logTest('✅ Authentication test completed!');
      
    } catch (error) {
      logTest(`❌ Test failed: ${error}`);
    }
    
    setIsRunningTest(false);
  };

  const testLogin = async () => {
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    try {
      logTest(`🔐 Attempting login with ${testEmail}...`);
      const { data, error } = await authService.signIn(testEmail, testPassword);
      
      if (error) {
        logTest(`❌ Login failed: ${error.message}`);
      } else if (data.user) {
        logTest(`✅ Login successful! User: ${data.user.email}`);
      }
    } catch (error) {
      logTest(`❌ Login error: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Don't show in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-md max-h-96 overflow-auto">
      <div className="mb-4">
        <h3 className="font-bold text-sm mb-2">🔐 Auth Tester</h3>
        
        <div className="space-y-1 text-xs mb-3">
          <div>User: <span className="text-green-400">{user ? user.email : 'Not logged in'}</span></div>
          <div>Session: <span className="text-blue-400">{session ? 'Active' : 'None'}</span></div>
          <div>Loading: <span className="text-yellow-400">{loading ? 'Yes' : 'No'}</span></div>
        </div>
        
        <div className="flex gap-2 mb-3">
          <button 
            onClick={runAuthTest}
            disabled={isRunningTest}
            className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunningTest ? 'Testing...' : 'Run Test'}
          </button>
          
          <button 
            onClick={testLogin}
            className="bg-green-600 px-2 py-1 rounded text-xs hover:bg-green-700"
          >
            Test Login
          </button>
          
          <button 
            onClick={clearResults}
            className="bg-red-600 px-2 py-1 rounded text-xs hover:bg-red-700"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="font-semibold text-xs">Test Results:</h4>
        <div className="max-h-40 overflow-y-auto bg-gray-900 p-2 rounded text-xs">
          {testResults.length === 0 ? (
            <div className="text-gray-400">No tests run yet</div>
          ) : (
            testResults.map((result, i) => (
              <div key={i} className="mb-1">{result}</div>
            ))
          )}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        Development mode only
      </div>
    </div>
  );
}