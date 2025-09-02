import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Dashboard protection - redirect to login if not authenticated
  if (pathname.startsWith('/dashboard')) {
    console.log('🛡️ Middleware: Checking dashboard access for:', pathname);
    
    // Get all cookies for debugging
    const allCookies = request.cookies.getAll();
    console.log('🍪 All cookies:', allCookies.map(c => `${c.name}=${c.value ? 'present' : 'empty'}`));
    
    let isAuthenticated = false;
    
    // Method 1: Check for standard Supabase auth cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
      console.log('🔑 Project ref:', projectRef);
      
      if (projectRef) {
        // Check multiple possible Supabase cookie patterns
        const possibleCookieNames = [
          `sb-${projectRef}-auth-token`,
          `sb-${projectRef}-auth-token.0`,
          `sb-${projectRef}-auth-token.1`,
          `supabase-auth-token`,
          `supabase.auth.token`
        ];
        
        for (const cookieName of possibleCookieNames) {
          const cookie = request.cookies.get(cookieName);
          if (cookie?.value && cookie.value !== 'null' && cookie.value !== '{}') {
            console.log(`✅ Found valid auth cookie: ${cookieName}`);
            isAuthenticated = true;
            break;
          }
        }
      }
    }
    
    // Method 2: Fallback - check any cookie starting with 'sb-' that looks like auth data
    if (!isAuthenticated) {
      const supabaseCookies = allCookies.filter(cookie => 
        cookie.name.startsWith('sb-') && 
        cookie.value && 
        cookie.value !== 'null' && 
        cookie.value !== '{}' &&
        cookie.value.length > 10 // Auth tokens are usually longer
      );
      
      if (supabaseCookies.length > 0) {
        console.log('🔍 Found Supabase cookies via fallback:', supabaseCookies.map(c => c.name));
        
        // Try to detect if any cookie contains JWT-like content
        for (const cookie of supabaseCookies) {
          try {
            const parsed = JSON.parse(cookie.value);
            if (parsed.access_token || parsed.refresh_token) {
              console.log(`✅ Found valid session data in: ${cookie.name}`);
              isAuthenticated = true;
              break;
            }
          } catch {
            // Check if it looks like a JWT token
            if (cookie.value.includes('.') && cookie.value.split('.').length === 3) {
              console.log(`✅ Found JWT-like token in: ${cookie.name}`);
              isAuthenticated = true;
              break;
            }
          }
        }
      }
    }
    
    // Method 3: Final fallback - check for any authentication indicators
    if (!isAuthenticated) {
      const authCookies = allCookies.filter(cookie => 
        (cookie.name.toLowerCase().includes('auth') || 
         cookie.name.toLowerCase().includes('session') ||
         cookie.name.toLowerCase().includes('token')) &&
        cookie.value && 
        cookie.value !== 'null' &&
        cookie.value.length > 20
      );
      
      if (authCookies.length > 0) {
        console.log('🔍 Found potential auth cookies:', authCookies.map(c => c.name));
        isAuthenticated = true;
      }
    }
    
    if (!isAuthenticated) {
      console.log('❌ No authentication found, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    } else {
      console.log('✅ Authentication detected, allowing dashboard access');
    }
  }

  // Clone the response
  const response = NextResponse.next()

  // Add performance and security headers
  response.headers.set('X-Robots-Tag', 'index, follow')
  
  // Prevent .vercel.app domains from being indexed if using custom domain
  if (request.nextUrl.hostname.includes('.vercel.app') && 
      process.env.NEXT_PUBLIC_BASE_URL && 
      !process.env.NEXT_PUBLIC_BASE_URL.includes('.vercel.app')) {
    
    // Redirect .vercel.app to custom domain
    const customDomain = process.env.NEXT_PUBLIC_BASE_URL
    const redirectUrl = new URL(pathname, customDomain)
    return NextResponse.redirect(redirectUrl, 301)
  }

  // Add cache headers for static assets
  if (pathname.startsWith('/_next/static/') || 
      pathname.startsWith('/assets/') ||
      pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }
  }

  // Add security headers for HTML pages
  if (pathname === '/' || 
      pathname.startsWith('/calculator') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register')) {
    
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Add preload hints for critical resources
    response.headers.set('Link', [
      '</assets/fonts/outfit.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
      '</assets/images/logo.svg>; rel=preload; as=image',
    ].join(', '))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}