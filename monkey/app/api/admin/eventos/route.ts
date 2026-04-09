import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  const lista = await db.select().from(eventos).orderBy(desc(eventos.fecha))
  return NextResponse.json(lista)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, descripcion, fecha, lugar, cuposTotal, slug, activo, imagenUrl } = body

    if (!nombre || !fecha || !lugar || !slug) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
    }

    const cupos = Number(cuposTotal) || 100

    const [nuevo] = await db
      .insert(eventos)
      .values({
        nombre,
        descripcion: descripcion || null,
        fecha: new Date(fecha),
        lugar,
        cuposTotal: cupos,
        cuposDisponibles: cupos,
        slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        activo: activo !== false,
        imagenUrl: imagenUrl || null,
      })
      .returning()

    return NextResponse.json(nuevo, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno'
    if (msg.includes('unique')) {
      return NextResponse.json({ error: 'El slug ya existe. Usa uno diferente.' }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
