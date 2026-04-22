export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import {
  verifyToken,
  signAccessToken,
  hashUserAgent,
  ADMIN_ACCESS_COOKIE_NAME,
  ADMIN_REFRESH_COOKIE_NAME,
  ACCESS_COOKIE_OPTIONS,
} from '@/lib/auth-tokens'

/**
 * POST /api/auth/refresh
 * Validates the refresh token cookie, verifies the UA fingerprint,
 * and issues a new 15-min access token.
 */
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(ADMIN_REFRESH_COOKIE_NAME)?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'No hay refresh token.' }, { status: 401 })
  }

  try {
    const payload = await verifyToken(refreshToken)
    const ua = req.headers.get('user-agent') || ''
    const currentUaHash = await hashUserAgent(ua)

    // Reject if the device/browser changed
    if (payload.uaHash && payload.uaHash !== currentUaHash) {
      const res = NextResponse.json({ error: 'Sesión inválida. Inicia sesión de nuevo.' }, { status: 401 })
      res.cookies.delete(ADMIN_ACCESS_COOKIE_NAME)
      res.cookies.delete(ADMIN_REFRESH_COOKIE_NAME)
      return res
    }

    const newAccessToken = await signAccessToken(payload.user, currentUaHash)
    const res = NextResponse.json({ ok: true })
    res.cookies.set(ADMIN_ACCESS_COOKIE_NAME, newAccessToken, ACCESS_COOKIE_OPTIONS)
    return res
  } catch {
    const res = NextResponse.json({ error: 'Refresh token inválido o expirado.' }, { status: 401 })
    res.cookies.delete(ADMIN_ACCESS_COOKIE_NAME)
    res.cookies.delete(ADMIN_REFRESH_COOKIE_NAME)
    return res
  }
}
