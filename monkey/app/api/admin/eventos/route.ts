import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { eventoCreateSchema } from '@/lib/schemas'
import { handleError } from '@/lib/errors'

export async function GET() {
  const lista = await db.select().from(eventos).orderBy(desc(eventos.fecha))
  return NextResponse.json(lista)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = eventoCreateSchema.parse(body)
    const cupos = validated.cuposTotal ?? validated.cupos

    const [nuevo] = await db
      .insert(eventos)
      .values({
        nombre: validated.nombre,
        descripcion: validated.descripcion || null,
        fecha: validated.fecha,
        lugar: validated.lugar,
        cuposTotal: cupos,
        cuposDisponibles: cupos,
        slug: validated.slug,
        activo: validated.activo,
        imagenUrl: validated.imagenUrl || null,
      })
      .returning()

    return NextResponse.json(nuevo, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno'
    if (msg.includes('unique')) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'El slug ya existe. Usa uno diferente.' } },
        { status: 409 }
      )
    }
    return NextResponse.json(handleError(error), { status: 400 })
  }
}
