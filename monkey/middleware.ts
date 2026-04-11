import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { rateLimiters, checkRateLimit } from '@/lib/ratelimit'

const PUBLIC_PATHS = ['/admin/login', '/api/auth']

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const clientIp = getClientIp(req)

  // Rate limiting for public API endpoints
  if (pathname === '/api/invitaciones' && req.method === 'POST') {
    const rateLimit = await checkRateLimit(rateLimiters?.invitations, clientIp)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta más tarde.' },
        { status: 429 }
      )
    }
  }

  if (pathname === '/api/scanner/validate' && req.method === 'POST') {
    const rateLimit = await checkRateLimit(rateLimiters?.scanner, clientIp)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta más tarde.' },
        { status: 429 }
      )
    }
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const rateLimit = await checkRateLimit(rateLimiters?.login, clientIp)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos de login. Intenta más tarde.' },
        { status: 429 }
      )
    }
  }

  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // Permitir login y auth API sin token
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next()

  const token = req.cookies.get('admin_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/admin/login', req.url))
    res.cookies.delete('admin_token')
    return res
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
