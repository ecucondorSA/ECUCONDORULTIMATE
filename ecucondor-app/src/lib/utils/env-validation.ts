/**
 * Environment variables validation utility
 * Ensures all required environment variables are present and valid
 */

interface RequiredEnvVars {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string; // Only required on server
}

interface OptionalEnvVars {
  NODE_ENV: string;
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_WHATSAPP_NUMBER?: string;
  NEXT_PUBLIC_PAYMENT_EMAIL?: string;
}

export function validateClientEnv(): RequiredEnvVars & Partial<OptionalEnvVars> {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  };

  // Validate required variables
  const missingVars = [];
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missingVars.join(', ')}\n` +
      `📋 Please check your .env.local file and ensure all variables are set.\n` +
      `📖 See .env.example for reference.`
    );
  }

  // Validate URL formats
  if (env.NEXT_PUBLIC_SUPABASE_URL && !env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
  }

  return env as RequiredEnvVars & Partial<OptionalEnvVars>;
}

export function validateServerEnv(): RequiredEnvVars & { SUPABASE_SERVICE_ROLE_KEY: string } {
  const clientEnv = validateClientEnv();
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      '❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable\n' +
      '🔒 This is required for server-side operations\n' +
      '📖 Please add it to your .env.local file'
    );
  }

  return {
    ...clientEnv,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

// Export validated environment variables
export const clientEnv = validateClientEnv();

// For server components only
export const getServerEnv = () => validateServerEnv();