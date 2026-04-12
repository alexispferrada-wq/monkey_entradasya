import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters, checkRateLimit } from '@/lib/ratelimit'
import {
  verifyToken,
  signAccessToken,
  hashUserAgent,
  ACCESS_COOKIE_OPTIONS,
} from '@/lib/auth-tokens'

const PUBLIC_PATHS = ['/admin/login', '/api/auth']

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
}

function clearSessionAndRedirect(req: NextRequest): NextResponse {
  const res = NextResponse.redirect(new URL('/admin/login', req.url))
  res.cookies.delete('admin_token')
  res.cookies.delete('admin_refresh_token')
  return res
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const clientIp = getClientIp(req)

  // ── Rate limiting ────────────────────────────────────────────────────────────
  if (pathname === '/api/invitaciones' && req.method === 'POST') {
    const rl = await checkRateLimit(rateLimiters?.invitations, clientIp)
    if (!rl.allowed)
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 })
  }

  if (pathname === '/api/scanner/validate' && req.method === 'POST') {
    const rl = await checkRateLimit(rateLimiters?.scanner, clientIp)
    if (!rl.allowed)
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 })
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const rl = await checkRateLimit(rateLimiters?.login, clientIp)
    if (!rl.allowed)
      return NextResponse.json({ error: 'Demasiados intentos de login. Intenta más tarde.' }, { status: 429 })
  }

  if (pathname === '/api/chat' && req.method === 'POST') {
    const rl = await checkRateLimit(rateLimiters?.chat, clientIp)
    if (!rl.allowed)
      return NextResponse.json({ error: 'Demasiadas solicitudes al chat. Intenta más tarde.' }, { status: 429 })
  }

  // ── CSRF: Origin check for admin mutations ───────────────────────────────────
  if (
    pathname.startsWith('/api/admin') &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)
  ) {
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    if (origin && host) {
      try {
        if (new URL(origin).host !== host) {
          return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 })
      }
    }
  }

  // ── Auth guard (admin pages + admin API) ─────────────────────────────────────
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next()

  const accessToken  = req.cookies.get('admin_token')?.value
  const refreshToken = req.cookies.get('admin_refresh_token')?.value
  const ua = req.headers.get('user-agent') || ''

  // Try access token first
  if (accessToken) {
    try {
      const payload = await verifyToken(accessToken)

      // Verify user-agent fingerprint (session hijack detection)
      if (payload.uaHash) {
        const currentHash = await hashUserAgent(ua)
        if (payload.uaHash !== currentHash) {
          return clearSessionAndRedirect(req)
        }
      }

      return NextResponse.next()
    } catch (err: unknown) {
      const isExpired = (err as { code?: string }).code === 'ERR_JWT_EXPIRED'
      if (!isExpired) {
        // Tampered or wrong-secret token
        return clearSessionAndRedirect(req)
      }
      // Expired — fall through to refresh token check
    }
  }

  // Auto-renew via refresh token
  if (refreshToken) {
    try {
      const payload = await verifyToken(refreshToken)
      const currentHash = await hashUserAgent(ua)

      // Reject if the browser/device changed since login
      if (payload.uaHash && payload.uaHash !== currentHash) {
        return clearSessionAndRedirect(req)
      }

      // Issue a fresh 15-min access token inline (no DB needed, Edge-compatible)
      const newAccessToken = await signAccessToken(payload.user, currentHash)
      const response = NextResponse.next()
      response.cookies.set('admin_token', newAccessToken, ACCESS_COOKIE_OPTIONS)
      return response
    } catch {
      // Refresh token expired or invalid
    }
  }

  // No valid tokens — for API calls return 401 JSON; for pages redirect to login
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  }
  return clearSessionAndRedirect(req)
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
