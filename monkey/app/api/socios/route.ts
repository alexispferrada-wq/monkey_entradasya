export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { socios } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { isDisposableEmail } from '@/lib/email-validation'

const crearSocioSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email(),
  telefono: z.string().optional(),
})

// POST /api/socios — registro público de nuevo socio
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, email, telefono } = crearSocioSchema.parse(body)
    const emailNorm = email.toLowerCase()

    if (isDisposableEmail(emailNorm)) {
      return NextResponse.json(
        { error: 'No se permiten correos temporales o descartables.' },
        { status: 400 }
      )
    }

    const [existente] = await db
      .select({ id: socios.id })
      .from(socios)
      .where(eq(socios.email, emailNorm))
      .limit(1)

    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe un socio con este email.' },
        { status: 409 }
      )
    }

    const [nuevo] = await db
      .insert(socios)
      .values({ nombre, email: emailNorm, telefono, puntos: 0, nivel: 'bronze' })
      .returning()

    return NextResponse.json(nuevo, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: err.errors }, { status: 400 })
    }
    console.error('[POST /api/socios]', err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
