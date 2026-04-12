export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { loginSchema } from '@/lib/schemas'
import { verifyPassword } from '@/lib/auth'
import { handleError, ValidationError } from '@/lib/errors'
import {
  signAccessToken,
  signRefreshToken,
  hashUserAgent,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from '@/lib/auth-tokens'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const { usuario, password } = loginSchema.parse(body)

    const adminUser = process.env.ADMIN_USER
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
    // Fallback de solo desarrollo: ADMIN_PASSWORD solo funciona fuera de producción
    const adminPassword = process.env.NODE_ENV !== 'production' ? process.env.ADMIN_PASSWORD : undefined

    if (!adminUser || (!adminPasswordHash && !adminPassword)) {
      console.error('ADMIN_USER y ADMIN_PASSWORD_HASH son requeridos en producción')
      return NextResponse.json(
        { error: 'Configuración de servidor incompleta' },
        { status: 500 }
      )
    }

    // Validar usuario y contraseña sin revelar cuál falló (evitar enumeración)
    const usuarioValido = usuario === adminUser
    let passwordValid = false

    if (adminPasswordHash) {
      passwordValid = usuarioValido && await verifyPassword(password, adminPasswordHash)
    } else if (adminPassword) {
      passwordValid = usuarioValido && password === adminPassword
    }

    if (!usuarioValido || !passwordValid) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // Fingerprint de User-Agent para detección de sesiones sospechosas
    const ua = req.headers.get('user-agent') || ''
    const uaHash = await hashUserAgent(ua)

    // Access token: 15 min; Refresh token: 7 días
    const accessToken = await signAccessToken(usuario, uaHash)
    const { token: refreshToken } = await signRefreshToken(usuario, uaHash)

    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_token', accessToken, ACCESS_COOKIE_OPTIONS)
    res.cookies.set('admin_refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS)
    return res
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
        },
        { status: 400 }
      )
    }

    if (error instanceof ZodError) {
      return NextResponse.json(handleError(error), { status: 400 })
    }

    return NextResponse.json(
      handleError(error),
      { status: 500 }
    )
  }
}
