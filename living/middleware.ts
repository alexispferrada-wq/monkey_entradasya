import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters, checkRateLimit } from '@/lib/ratelimit'
import { ADMIN_ACCESS_COOKIE_NAME } from '@/lib/auth-tokens'

const PUBLIC_PATHS = ['/admin/login', '/api/auth']

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
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

  // ── Auth guard (admin pages + admin API) ─────────────────────────────────────
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Verificación simple: cookie presente
  const token = req.cookies.get(ADMIN_ACCESS_COOKIE_NAME)?.value
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }
    const res = NextResponse.redirect(new URL('/admin/login', req.url))
    res.cookies.delete(ADMIN_ACCESS_COOKIE_NAME)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}

/*
// ── SEGURIDAD COMPLETA (comentada temporalmente) ──────────────────────────────
// import {
//   verifyToken,
//   signAccessToken,
//   hashUserAgent,
//   ACCESS_COOKIE_OPTIONS,
// } from '@/lib/auth-tokens'
//
// function clearSessionAndRedirect(req: NextRequest): NextResponse {
//   const res = NextResponse.redirect(new URL('/admin/login', req.url))
//   res.cookies.delete('admin_token')
//   res.cookies.delete('admin_refresh_token')
//   return res
// }
//
//   // CSRF: Origin check for admin mutations
//   if (pathname.startsWith('/api/admin') && ['POST','PUT','DELETE','PATCH'].includes(req.method)) {
//     const origin = req.headers.get('origin')
//     const host = req.headers.get('host')
//     if (origin && host) {
//       try {
//         if (new URL(origin).host !== host) {
//           return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 })
//         }
//       } catch {
//         return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 })
//       }
//     }
//   }
//
//   // JWT verification + User-Agent fingerprint
//   const accessToken  = req.cookies.get('admin_token')?.value
//   const refreshToken = req.cookies.get('admin_refresh_token')?.value
//   const ua = req.headers.get('user-agent') || ''
//
//   if (accessToken) {
//     try {
//       const payload = await verifyToken(accessToken)
//       if (payload.uaHash) {
//         const currentHash = await hashUserAgent(ua)
//         if (payload.uaHash !== currentHash) return clearSessionAndRedirect(req)
//       }
//       return NextResponse.next()
//     } catch (err: unknown) {
//       const isExpired = (err as { code?: string }).code === 'ERR_JWT_EXPIRED'
//       if (!isExpired) return clearSessionAndRedirect(req)
//     }
//   }
//
//   if (refreshToken) {
//     try {
//       const payload = await verifyToken(refreshToken)
//       const currentHash = await hashUserAgent(ua)
//       if (payload.uaHash && payload.uaHash !== currentHash) return clearSessionAndRedirect(req)
//       const newAccessToken = await signAccessToken(payload.user, currentHash)
//       const response = NextResponse.next()
//       response.cookies.set('admin_token', newAccessToken, ACCESS_COOKIE_OPTIONS)
//       return response
//     } catch {}
//   }
//
//   if (pathname.startsWith('/api/')) {
//     return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
//   }
//   return clearSessionAndRedirect(req)
*/
