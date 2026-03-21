import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Subdomain rewriting: "landings.birdiechart.golf" → "/club/landings/..."
  const subdomain = host.split('.')[0]
  const rootDomains = ['birdiechart', 'www', 'localhost', 'vercel']
  const isRootDomain = rootDomains.some((d) => subdomain === d || host.startsWith('localhost'))

  if (!isRootDomain && subdomain && !url.pathname.startsWith('/club/')) {
    url.pathname = `/club/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes (main app + club auth pages)
  const publicRoutes = ['/login', '/signup', '/join']
  const isPublicMain = publicRoutes.some((r) => pathname.startsWith(r))
  const isClubAuth = /^\/club\/[^/]+(\/login|\/signup)/.test(pathname)
  const isPublic = isPublicMain || isClubAuth

  if (!user && !isPublic) {
    const redirectUrl = request.nextUrl.clone()
    // Club routes redirect to club login
    const clubMatch = pathname.match(/^\/club\/([^/]+)/)
    if (clubMatch) {
      redirectUrl.pathname = `/club/${clubMatch[1]}/login`
    } else {
      redirectUrl.pathname = '/login'
    }
    return NextResponse.redirect(redirectUrl)
  }

  if (user && (pathname === '/login' || pathname === '/signup')) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/chart'
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from club login/signup
  const clubAuthMatch = pathname.match(/^\/club\/([^/]+)\/(login|signup)$/)
  if (user && clubAuthMatch) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = `/club/${clubAuthMatch[1]}`
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|api|.*\\.svg|.*\\.png).*)'],
}
