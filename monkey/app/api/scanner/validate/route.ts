import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invitaciones, eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Token requerido.' }, { status: 400 })
    }

    // Buscar invitación
    const [result] = await db
      .select({
        invitacion: invitaciones,
        evento: eventos,
      })
      .from(invitaciones)
      .innerJoin(eventos, eq(invitaciones.eventoId, eventos.id))
      .where(eq(invitaciones.token, token))
      .limit(1)

    if (!result) {
      return NextResponse.json(
        { valido: false, razon: 'QR no reconocido. No corresponde a ninguna invitación.' },
        { status: 404 }
      )
    }

    const { invitacion, evento } = result

    if (invitacion.estado === 'usada') {
      return NextResponse.json({
        valido: false,
        razon: 'Esta invitación ya fue utilizada.',
        nombre: invitacion.nombre,
        evento: evento.nombre,
        usadoEn: invitacion.usedAt,
      })
    }

    if (invitacion.estado === 'cancelada') {
      return NextResponse.json({
        valido: false,
        razon: 'Esta invitación fue cancelada.',
        nombre: invitacion.nombre,
        evento: evento.nombre,
      })
    }

    // Marcar como usada
    await db
      .update(invitaciones)
      .set({ estado: 'usada', usedAt: new Date() })
      .where(eq(invitaciones.token, token))

    return NextResponse.json({
      valido: true,
      nombre: invitacion.nombre,
      email: invitacion.email,
      evento: evento.nombre,
      lugar: evento.lugar,
    })
  } catch (error) {
    console.error('[POST /api/scanner/validate]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
