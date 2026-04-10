export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { ZodError } from 'zod'
import { loginSchema } from '@/lib/schemas'
import { verifyPassword } from '@/lib/auth'
import { handleError, ValidationError } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input
    const { usuario, password } = loginSchema.parse(body)

    const adminUser = process.env.ADMIN_USER
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUser) {
      console.error('ADMIN_USER env var not configured')
      return NextResponse.json(
        { error: 'Configuración de servidor incompleta' },
        { status: 500 }
      )
    }

    if (!adminPasswordHash && !adminPassword) {
      console.error('Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD env vars configured')
      return NextResponse.json(
        { error: 'Configuración de servidor incompleta' },
        { status: 500 }
      )
    }

    // Check username
    if (usuario !== adminUser) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // Check password
    let passwordValid = false
    
    if (adminPasswordHash) {
      // Use bcrypt-hashed password (recommended)
      passwordValid = await verifyPassword(password, adminPasswordHash)
    } else if (adminPassword) {
      // Fall back to plain-text password (temporary, for migration)
      passwordValid = password === adminPassword
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!)
    const token = await new SignJWT({ user: usuario })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(secret)

    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    })
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
