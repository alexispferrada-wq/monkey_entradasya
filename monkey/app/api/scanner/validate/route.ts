export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invitaciones, eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { handleError, NotFoundError, ValidationError } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { valido: false, razon: 'Token requerido e inválido' },
        { status: 400 }
      )
    }

    // Use transaction to prevent race conditions
    const resultado = await db.transaction(async (tx) => {
      // Buscar invitación (with SELECT FOR UPDATE equivalent)
      const [result] = await tx
        .select({
          invitacion: invitaciones,
          evento: eventos,
        })
        .from(invitaciones)
        .innerJoin(eventos, eq(invitaciones.eventoId, eventos.id))
        .where(eq(invitaciones.token, token))
        .limit(1)

      if (!result) {
        throw new NotFoundError('Invitación', token)
      }

      const { invitacion, evento } = result

      // Check if already used
      if (invitacion.estado === 'usada') {
        return {
          valido: false,
          razon: 'Esta invitación ya fue utilizada.',
          nombre: invitacion.nombre,
          evento: evento.nombre,
          usadoEn: invitacion.usedAt,
        }
      }

      // Check if cancelled
      if (invitacion.estado === 'cancelada') {
        return {
          valido: false,
          razon: 'Esta invitación fue cancelada.',
          nombre: invitacion.nombre,
          evento: evento.nombre,
        }
      }

      // Mark as used atomically within transaction
      const [updated] = await tx
        .update(invitaciones)
        .set({ estado: 'usada', usedAt: new Date() })
        .where(eq(invitaciones.token, token))
        .returning()

      return {
        valido: true,
        nombre: updated.nombre,
        email: updated.email,
        evento: evento.nombre,
        lugar: evento.lugar,
      }
    })

    // Return based on validation result
    if (!resultado.valido) {
      return NextResponse.json(resultado, { status: 409 })
    }

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('[POST /api/scanner/validate]', error)

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { valido: false, razon: 'QR no reconocido. No corresponde a ninguna invitación.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
