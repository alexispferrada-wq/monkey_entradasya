export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invitaciones, eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { valido: false, razon: 'Token requerido e inválido' },
        { status: 400 }
      )
    }

    const [result] = await db
      .select({ invitacion: invitaciones, evento: eventos })
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
      return NextResponse.json(
        {
          valido: false,
          razon: 'Esta invitación ya fue utilizada.',
          nombre: invitacion.nombre,
          evento: evento.nombre,
          usadoEn: invitacion.usedAt,
        },
        { status: 409 }
      )
    }

    if (invitacion.estado === 'cancelada') {
      return NextResponse.json(
        {
          valido: false,
          razon: 'Esta invitación fue cancelada.',
          nombre: invitacion.nombre,
          evento: evento.nombre,
        },
        { status: 409 }
      )
    }

    const [updated] = await db
      .update(invitaciones)
      .set({ estado: 'usada', usedAt: new Date() })
      .where(eq(invitaciones.token, token))
      .returning()

    return NextResponse.json({
      valido: true,
      nombre: updated.nombre,
      email: updated.email,
      evento: evento.nombre,
      lugar: evento.lugar,
    })
  } catch (error) {
    console.error('[POST /api/scanner/validate]', error)
    return NextResponse.json(
      { valido: false, razon: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
