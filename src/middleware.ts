import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return url && url.startsWith('http') && !url.includes('your_supabase')
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const res = NextResponse.next()
  const host = req.headers.get('host') || ''
  const pathname = url.pathname

  // Subdomain detection logic
  const isRentalSubdomain = host.startsWith('rentas.')
  const isDashboardSubdomain = host.startsWith('taller.') || host.startsWith('dashboard.')

  // Multi-tenancy Rewrites & Cross-subdomain Redirections
  if (isRentalSubdomain) {
    if (!pathname.startsWith('/ready2drivesv') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      url.pathname = `/ready2drivesv${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
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
