'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, authService } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session with error handling for build time
    const getInitialSession = async () => {
      try {
        const { session } = await authService.getCurrentSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.warn('Auth initialization failed during build:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle successful authentication
        if (event === 'SIGNED_IN' && session) {
          console.log('🔐 AuthContext: User signed in successfully');
          console.log('🌍 AuthContext: Current pathname:', window.location.pathname);
          console.log('🔍 AuthContext: Current search params:', window.location.search);
          
          // Check if user was redirected from a protected page or is on login page
          if (window.location.pathname === '/login') {
            const urlParams = new URLSearchParams(window.location.search);
            const returnTo = urlParams.get('returnTo');
            
            // Default to dashboard if no returnTo parameter
            const redirectUrl = returnTo ? decodeURIComponent(returnTo) : '/dashboard';
            
            console.log('🔄 AuthContext: Post-login redirect to:', redirectUrl);
            console.log('📍 AuthContext: returnTo param:', returnTo);
            
            // Small delay to ensure state is updated
            setTimeout(() => {
              console.log('🚀 AuthContext: Executing redirect now...');
              window.location.replace(redirectUrl);
            }, 200);
          } else {
            console.log('⏭️ AuthContext: Not on login page, skipping redirect');
          }
        }
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Force redirect to login if user was signed out
          if (window.location.pathname.startsWith('/dashboard')) {
            window.location.href = '/login';
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}