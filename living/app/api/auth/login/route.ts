export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_ACCESS_COOKIE_NAME } from '@/lib/auth-tokens'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { usuario, password } = body

    const adminUser = process.env.LIVING_ADMIN_USER || process.env.ADMIN_USER
    const adminPassword = process.env.LIVING_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD

    if (!adminUser || !adminPassword) {
      return NextResponse.json({ error: 'Configuración de admin incompleta' }, { status: 500 })
    }

    if (usuario !== adminUser || password !== adminPassword) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(ADMIN_ACCESS_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}

/*
// ── SEGURIDAD COMPLETA (comentada temporalmente) ──────────────────────────────
// import { ZodError } from 'zod'
// import { loginSchema } from '@/lib/schemas'
// import { verifyPassword } from '@/lib/auth'
// import { handleError, ValidationError } from '@/lib/errors'
// import {
//   signAccessToken,
//   signRefreshToken,
//   hashUserAgent,
//   ACCESS_COOKIE_OPTIONS,
//   REFRESH_COOKIE_OPTIONS,
// } from '@/lib/auth-tokens'
//
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json()
//     const { usuario, password } = loginSchema.parse(body)
//
//     const adminUser = process.env.ADMIN_USER
//     const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
//     const adminPassword = process.env.NODE_ENV !== 'production' ? process.env.ADMIN_PASSWORD : undefined
//
//     if (!adminUser || (!adminPasswordHash && !adminPassword)) {
//       return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 })
//     }
//
//     const usuarioValido = usuario === adminUser
//     let passwordValid = false
//     if (adminPasswordHash) {
//       passwordValid = usuarioValido && await verifyPassword(password, adminPasswordHash)
//     } else if (adminPassword) {
//       passwordValid = usuarioValido && password === adminPassword
//     }
//
//     if (!usuarioValido || !passwordValid) {
//       return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
//     }
//
//     const ua = req.headers.get('user-agent') || ''
//     const uaHash = await hashUserAgent(ua)
//     const accessToken = await signAccessToken(usuario, uaHash)
//     const { token: refreshToken } = await signRefreshToken(usuario, uaHash)
//
//     const res = NextResponse.json({ ok: true })
//     res.cookies.set('admin_token', accessToken, ACCESS_COOKIE_OPTIONS)
//     res.cookies.set('admin_refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS)
//     return res
//   } catch (error) {
//     if (error instanceof ValidationError) {
//       return NextResponse.json({ error: error.message, details: error.details }, { status: 400 })
//     }
//     if (error instanceof ZodError) {
//       return NextResponse.json(handleError(error), { status: 400 })
//     }
//     return NextResponse.json(handleError(error), { status: 500 })
//   }
// }
*/
