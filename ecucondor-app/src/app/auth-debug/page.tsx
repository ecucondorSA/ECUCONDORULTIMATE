'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/supabase';

export default function AuthDebugPage() {
  const { user, session, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [manualSession, setManualSession] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get manual session
        const { session: currentSession } = await authService.getCurrentSession();
        setManualSession(currentSession);

        // Get all cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [name, value] = cookie.trim().split('=');
          acc[name] = value;
          return acc;
        }, {} as Record<string, string>);

        // Get localStorage items
        const localStorageItems: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            try {
              localStorageItems[key] = JSON.parse(localStorage.getItem(key) || '');
            } catch {
              localStorageItems[key] = localStorage.getItem(key);
            }
          }
        }

        setDebugInfo({
          pathname: window.location.pathname,
          search: window.location.search,
          cookies,
          localStorage: localStorageItems,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Debug error:', error);
      }
    };

    checkAuth();
    
    // Refresh every 2 seconds
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, []);

  const testDashboardAccess = () => {
    console.log('🧪 Testing dashboard access...');
    window.location.href = '/dashboard';
  };

  const clearAllAuth = async () => {
    await authService.signOut();
    localStorage.clear();
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-ecucondor-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-ecucondor-primary mb-6">
          🔍 Auth Debug Panel
        </h1>

        <div className="grid gap-6">
          {/* Auth Context State */}
          <div className="ecucondor-card p-6">
            <h2 className="text-xl font-bold text-ecucondor-primary mb-4">
              📊 Auth Context State
            </h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {loading ? '✅ Yes' : '❌ No'}</div>
              <div><strong>User:</strong> {user ? '✅ Present' : '❌ None'}</div>
              <div><strong>Session:</strong> {session ? '✅ Present' : '❌ None'}</div>
              {user && (
                <div className="mt-3 p-3 bg-green-100 rounded">
                  <strong>User Details:</strong>
                  <pre className="text-xs mt-1">{JSON.stringify(user, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Manual Session Check */}
          <div className="ecucondor-card p-6">
            <h2 className="text-xl font-bold text-ecucondor-primary mb-4">
              🔄 Manual Session Check
            </h2>
            <div className="text-sm">
              <div><strong>Manual Session:</strong> {manualSession ? '✅ Present' : '❌ None'}</div>
              {manualSession && (
                <div className="mt-3 p-3 bg-blue-100 rounded">
                  <strong>Session Details:</strong>
                  <pre className="text-xs mt-1">{JSON.stringify(manualSession, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Cookies */}
          <div className="ecucondor-card p-6">
            <h2 className="text-xl font-bold text-ecucondor-primary mb-4">
              🍪 Cookies
            </h2>
            <div className="space-y-2 text-xs">
              {Object.entries(debugInfo.cookies || {}).map(([name, value]) => {
                const valueStr = String(value || '');
                return (
                  <div key={name} className="border-b pb-2">
                    <strong>{name}:</strong>
                    <div className="text-gray-600 break-all">
                      {name.startsWith('sb-') ? (
                        <div className="bg-yellow-100 p-2 rounded mt-1">
                          <div>Length: {valueStr.length}</div>
                          <div>Contains access_token: {valueStr.includes('access_token') ? '✅' : '❌'}</div>
                          <div>Contains user: {valueStr.includes('user') ? '✅' : '❌'}</div>
                          <details className="mt-2">
                            <summary className="cursor-pointer">Show Full Value</summary>
                            <pre className="text-xs mt-1 bg-white p-2 rounded">{valueStr}</pre>
                          </details>
                        </div>
                      ) : (
                        valueStr.substring(0, 100) + (valueStr.length > 100 ? '...' : '')
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LocalStorage */}
          <div className="ecucondor-card p-6">
            <h2 className="text-xl font-bold text-ecucondor-primary mb-4">
              💾 LocalStorage
            </h2>
            <div className="space-y-2 text-xs">
              {Object.entries(debugInfo.localStorage || {}).map(([key, value]) => (
                <div key={key} className="border-b pb-2">
                  <strong>{key}:</strong>
                  <pre className="text-gray-600 mt-1">{JSON.stringify(value, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>

          {/* Debug Info */}
          <div className="ecucondor-card p-6">
            <h2 className="text-xl font-bold text-ecucondor-primary mb-4">
              🔧 Debug Info
            </h2>
            <div className="text-sm space-y-1">
              <div><strong>Pathname:</strong> {debugInfo.pathname}</div>
              <div><strong>Search:</strong> {debugInfo.search}</div>
              <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="ecucondor-card p-6">
            <h2 className="text-xl font-bold text-ecucondor-primary mb-4">
              🎯 Actions
            </h2>
            <div className="space-x-4">
              <button
                onClick={testDashboardAccess}
                className="btn-ecucondor-primary px-4 py-2 rounded"
              >
                Test Dashboard Access
              </button>
              <button
                onClick={clearAllAuth}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Clear All Auth Data
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="btn-ecucondor-secondary px-4 py-2 rounded"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}