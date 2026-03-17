import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const url = req.nextUrl.clone()

  // Extract subdomain: "landings.birdiechart.golf" → "landings"
  const subdomain = host.split('.')[0]
  const rootDomains = ['birdiechart', 'www', 'localhost', 'vercel']
  const isRootDomain = rootDomains.some((d) => subdomain === d || host.startsWith('localhost'))

  if (!isRootDomain && subdomain && !url.pathname.startsWith('/club/')) {
    // Rewrite subdomain traffic to /club/[slug]
    url.pathname = `/club/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|icons|manifest.json|.*\\..*).*)'],
}
