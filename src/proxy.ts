import { type NextRequest, NextResponse, type ProxyConfig } from 'next/server'

const MAINTENANCE_ROUTE = '/manutencao'
const TEMPORARY_REDIRECT_STATUS = 307

const NOT_REDIRECTED_IN_MAINTENANCE = [
  MAINTENANCE_ROUTE,
  '/favicon.ico',
  '/icon.svg',
  '/robots.txt',
]

const isInMaintenance = process.env.NEXT_PUBLIC_IN_MAINTENANCE === 'true'

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  if (isInMaintenance) {
    if (NOT_REDIRECTED_IN_MAINTENANCE.includes(path)) {
      return NextResponse.next()
    }

    return NextResponse.redirect(
      new URL(MAINTENANCE_ROUTE, req.url),
      TEMPORARY_REDIRECT_STATUS,
    )
  }

  return NextResponse.next()
}

export const config: ProxyConfig = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
