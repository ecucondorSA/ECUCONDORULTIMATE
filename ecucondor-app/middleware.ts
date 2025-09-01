import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          req.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value
          })),
        setAll: cookies => {
          cookies.forEach(cookie => {
            res.cookies.set(cookie.name, cookie.value, cookie.options)
          })
        }
      }
    }
  )
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
