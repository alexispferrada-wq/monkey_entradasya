export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eventos, invitaciones } from '@/lib/db/schema'
import { eq, count, and, sql } from 'drizzle-orm'
import { eventoUpdateSchema } from '@/lib/schemas'
import { handleError } from '@/lib/errors'
import { logAudit } from '@/lib/audit'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [evento] = await db.select().from(eventos).where(eq(eventos.id, id)).limit(1)
  if (!evento) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'No encontrado.' } }, { status: 404 })

  const [{ total, usadas }] = await db
    .select({
      total: count(invitaciones.id),
      usadas: sql`count(*) FILTER (WHERE ${invitaciones.estado} = 'usada')`,
    })
    .from(invitaciones)
    .where(eq(invitaciones.eventoId, id))

  return NextResponse.json({ ...evento, totalInvitaciones: total, usadas })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
      ...(validated.destacado !== undefined && { destacado: validated.destacado }),
      ...(validated.imagenUrl !== undefined && { imagenUrl: validated.imagenUrl }),
      ...(validated.precioBase !== undefined && { precioBase: validated.precioBase }),
      ...(validated.cuposReserva !== undefined && { cuposReserva: validated.cuposReserva }),
    }

    const [updated] = await db
      .update(eventos)
      .set(updateData)
      .where(eq(eventos.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (error: unknown) {
    return NextResponse.json(handleError(error), { status: 400 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.formData()
  const method = body.get('_method')

  if (method === 'delete') {
    const [eventoAEliminar] = await db.select({ nombre: eventos.nombre }).from(eventos).where(eq(eventos.id, id)).limit(1)
    await db.update(eventos).set({ deletedAt: new Date(), activo: false }).where(eq(eventos.id, id))
    await logAudit(req, 'delete_evento', 'evento', id, { nombre: eventoAEliminar?.nombre })
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [eventoAEliminar] = await db.select({ nombre: eventos.nombre }).from(eventos).where(eq(eventos.id, id)).limit(1)
  await db.update(eventos).set({ deletedAt: new Date(), activo: false }).where(eq(eventos.id, id))
  await logAudit(req, 'delete_evento', 'evento', id, { nombre: eventoAEliminar?.nombre })
  return NextResponse.json({ ok: true })
}
