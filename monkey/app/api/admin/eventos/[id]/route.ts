import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eventos, invitaciones } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [evento] = await db.select().from(eventos).where(eq(eventos.id, params.id)).limit(1)
  if (!evento) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })

  const [{ total }] = await db
    .select({ total: count() })
    .from(invitaciones)
    .where(eq(invitaciones.eventoId, params.id))

  const [{ usadas }] = await db
    .select({ usadas: count() })
    .from(invitaciones)
    .where(eq(invitaciones.eventoId, params.id))

  return NextResponse.json({ ...evento, totalInvitaciones: total, usadas })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { nombre, descripcion, fecha, lugar, cuposTotal, cuposDisponibles, slug, activo, imagenUrl } = body

    const [updated] = await db
      .update(eventos)
      .set({
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(fecha && { fecha: new Date(fecha) }),
        ...(lugar && { lugar }),
        ...(cuposTotal !== undefined && { cuposTotal: Number(cuposTotal) }),
        ...(cuposDisponibles !== undefined && { cuposDisponibles: Number(cuposDisponibles) }),
        ...(slug && { slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
        ...(activo !== undefined && { activo }),
        ...(imagenUrl !== undefined && { imagenUrl }),
      })
      .where(eq(eventos.id, params.id))
      .returning()

    return NextResponse.json(updated)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.delete(eventos).where(eq(eventos.id, params.id))
  return NextResponse.json({ ok: true })
}
