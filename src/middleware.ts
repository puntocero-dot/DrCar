import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return url && url.startsWith('http') && !url.includes('your_supabase')
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://upload.wikimedia.org https://api.qrserver.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; ')
  )
  return res
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const res = applySecurityHeaders(NextResponse.next())
  const host = req.headers.get('host') || ''
  const pathname = url.pathname

  // Subdomain detection logic
  const isRentalSubdomain = host.startsWith('rentas.')
  const isDashboardSubdomain = host.startsWith('taller.') || host.startsWith('dashboard.')

  // Multi-tenancy Rewrites & Cross-subdomain Redirections
  if (isRentalSubdomain) {
    if (!pathname.startsWith('/ready2drivesv') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      url.pathname = `/ready2drivesv${pathname === '/' ? '' : pathname}`
      return applySecurityHeaders(NextResponse.rewrite(url))
    }
  }

  if (isDashboardSubdomain) {
    // If on taller. subdomain and trying to access rental module, redirect to rentas. subdomain
    // Only redirect if we can safely assume subdomains are working (e.g. not on a simple local IP or raw localhost without subdomains)
    if (pathname.startsWith('/ready2drivesv')) {
      const rentalHost = host.replace(/^(taller|dashboard)\./, 'rentas.')
      // Avoid redirecting if specified or if on a simple host that might break
      if (host.includes('.') && !host.startsWith('localhost:')) {
        return NextResponse.redirect(new URL(pathname, `https://${rentalHost}`))
      }
      // If on localhost, just let it pass through to the internal route
    }

    if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/login') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      // If accessing root of dashboard subdomain, keep it so auth logic handles it
      if (pathname !== '/') {
        url.pathname = `/dashboard${pathname}`
        return NextResponse.rewrite(url)
      }
    }
  }

  // --- Original Auth Logic ---
  if (!isSupabaseConfigured()) {
    return res
  }

  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Public routes redirection logic
  // Allow the root "/" to be the unified landing page on the main domain
  if (pathname === '/login') {
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        const rolePath = profile.role === 'superadmin' ? 'superadmin' : profile.role
        return NextResponse.redirect(new URL(`/dashboard/${rolePath}`, req.url))
      }
    }
    return res
  }

  // Public routes — explicitly bypass auth for paint-visualizer
  if (
    pathname.startsWith('/paint-visualizer') &&
    !pathname.startsWith('/paint-visualizer/configure')
  ) {
    return res
  }

  // Protected routes
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
