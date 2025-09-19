import { createClient } from '@supabase/supabase-js';

// Client-side Supabase instance with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign up with email and password
  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  },

  // Sign in with Google
  async signInWithGoogle() {
    // Store the current returnTo parameter if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo');
    if (returnTo) {
      sessionStorage.setItem('returnTo', returnTo);
    }

    // Get the correct redirect URL based on environment
    const getRedirectUrl = () => {
      // Always check the actual hostname instead of NODE_ENV
      const hostname = window.location.hostname;
      
      if (hostname === 'ecucondor.com' || hostname.includes('vercel.app')) {
        return 'https://ecucondor.com/auth/callback';
      }
      
      // For localhost or other development environments
      return `${window.location.origin}/auth/callback`;
    };

    const redirectUrl = getRedirectUrl();
    console.log('🔄 Google OAuth redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset password
  async resetPassword(email: string) {
    // Get the correct redirect URL based on environment
    const getRedirectUrl = () => {
      // Always check the actual hostname instead of NODE_ENV
      const hostname = window.location.hostname;
      
      if (hostname === 'ecucondor.com' || hostname.includes('vercel.app')) {
        return 'https://ecucondor.com/reset-password';
      }
      
      // For localhost or other development environments
      return `${window.location.origin}/reset-password`;
    };

    const redirectUrl = getRedirectUrl();
    console.log('🔄 Password reset redirect URL:', redirectUrl);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { data, error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
};