import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Dashboard protection - redirect to login if not authenticated
  if (pathname.startsWith('/dashboard')) {
    // Check for Supabase auth session cookies (new format)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    let authCookie = null
    
    if (supabaseUrl) {
      // Extract project ref from Supabase URL
      const projectRef = supabaseUrl.split('//')[1]?.split('.')[0]
      if (projectRef) {
        authCookie = request.cookies.get(`sb-${projectRef}-auth-token`)
      }
    }
    
    // Fallback: check common Supabase cookie patterns
    if (!authCookie) {
      const cookieNames = Array.from(request.cookies.getAll().map(c => c.name))
      const supabaseCookie = cookieNames.find(name => 
        name.startsWith('sb-') && name.endsWith('-auth-token')
      )
      if (supabaseCookie) {
        authCookie = request.cookies.get(supabaseCookie)
      }
    }
    
    if (!authCookie?.value) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(loginUrl)
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