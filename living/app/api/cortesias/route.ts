export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { cortesias, eventos } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

const schema = z.object({
  eventoId: z.string().uuid().optional(),
  nombre:   z.string().min(2).max(100),
  email:    z.string().email(),
  telefono: z.string().min(8).max(20),
  cantidad: z.number().int().min(1).max(4).default(1),
  mensaje:  z.string().max(300).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    // Validar evento si se especificó
    if (data.eventoId) {
      const [evento] = await db
        .select({ id: eventos.id })
        .from(eventos)
        .where(and(eq(eventos.id, data.eventoId), eq(eventos.activo, true), isNull(eventos.deletedAt)))
        .limit(1)
      if (!evento) {
        return NextResponse.json({ error: 'Evento no encontrado.' }, { status: 404 })
      }
    }

    const [cortesia] = await db
      .insert(cortesias)
      .values({
        eventoId: data.eventoId ?? null,
        nombre:   data.nombre,
        email:    data.email,
        telefono: data.telefono,
        cantidad: data.cantidad,
        mensaje:  data.mensaje ?? null,
        estado:   'pendiente',
      })
      .returning()

    return NextResponse.json({ ok: true, id: cortesia.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos.', issues: error.issues }, { status: 422 })
    }
    console.error('[POST /api/cortesias]', error)
    return NextResponse.json({ error: 'Error al solicitar cortesía.' }, { status: 500 })
  }
}
