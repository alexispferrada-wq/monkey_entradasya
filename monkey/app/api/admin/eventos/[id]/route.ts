export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eventos, invitaciones } from '@/lib/db/schema'
import { eq, count, and, sql } from 'drizzle-orm'
import { eventoUpdateSchema } from '@/lib/schemas'
import { handleError } from '@/lib/errors'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [evento] = await db.select().from(eventos).where(eq(eventos.id, params.id)).limit(1)
  if (!evento) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'No encontrado.' } }, { status: 404 })

  const [{ total, usadas }] = await db
    .select({
      total: count(invitaciones.id),
      usadas: sql`count(*) FILTER (WHERE ${invitaciones.estado} = 'usada')`,
    })
    .from(invitaciones)
    .where(eq(invitaciones.eventoId, params.id))

  return NextResponse.json({ ...evento, totalInvitaciones: total, usadas })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const validated = eventoUpdateSchema.parse(body)

    const updateData: Record<string, unknown> = {
      ...(validated.nombre && { nombre: validated.nombre }),
      ...(validated.descripcion !== undefined && { descripcion: validated.descripcion }),
      ...(validated.fecha && { fecha: validated.fecha }),
      ...(validated.lugar && { lugar: validated.lugar }),
      ...(validated.cuposTotal !== undefined && { cuposTotal: validated.cuposTotal }),
      ...(validated.cuposDisponibles !== undefined && { cuposDisponibles: validated.cuposDisponibles }),
      ...(validated.activo !== undefined && { activo: validated.activo }),
      ...(validated.imagenUrl !== undefined && { imagenUrl: validated.imagenUrl }),
    }

    const [updated] = await db
      .update(eventos)
      .set(updateData)
      .where(eq(eventos.id, params.id))
      .returning()

    return NextResponse.json(updated)
  } catch (error: unknown) {
    return NextResponse.json(handleError(error), { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.delete(eventos).where(eq(eventos.id, params.id))
  return NextResponse.json({ ok: true })
}
