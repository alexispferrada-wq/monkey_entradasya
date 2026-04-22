export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reservas, eventos } from '@/lib/db/schema'
import { enviarConfirmacionReserva, enviarNotificacionAdminReserva } from '@/lib/email'
import { eq, and, ne, sql } from 'drizzle-orm'
import { z } from 'zod'

const reservaSchema = z.object({
  tipo: z.enum(['terraza', 'grill', 'cumpleanos', 'show']),
  nombre: z.string().min(2).max(100),
  rut: z.string().min(8).max(15).optional(),
  email: z.string().email(),
  telefono: z.string().min(8),
  fecha: z.string(),
  hora: z.string(),
  personas: z.number().int().min(1).max(50),
  notas: z.string().optional(),
  comprobantePagoUrl: z.string().optional(),
  comprobantePublicId: z.string().optional(),
  nombreEvento: z.string().optional(),
  eventoId: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = reservaSchema.parse(body)

    let estado: 'pendiente' | 'comprobante_subido' | 'aprobada' = 'pendiente'
    let monto = 0
    let eventoIdGuardado: string | undefined = undefined
    let nombreEventoGuardado: string | undefined = undefined

    if (parsed.tipo === 'terraza') {
      estado = 'aprobada'

    } else if (parsed.tipo === 'grill') {
      monto = 10000
      if (!parsed.comprobantePagoUrl) {
        return NextResponse.json({ error: 'Comprobante de pago requerido para acceso VIP.' }, { status: 400 })
      }
      estado = 'comprobante_subido'

    } else if (parsed.tipo === 'cumpleanos') {
      monto = 10000
      estado = parsed.comprobantePagoUrl ? 'comprobante_subido' : 'pendiente'

    } else if (parsed.tipo === 'show') {
      if (!parsed.eventoId) {
        return NextResponse.json({ error: 'Debes seleccionar un evento para reservar.' }, { status: 400 })
      }

      const [evento] = await db
        .select()
        .from(eventos)
        .where(eq(eventos.id, parsed.eventoId))
        .limit(1)

      if (!evento || !evento.activo) {
        return NextResponse.json({ error: 'El evento seleccionado no está disponible.' }, { status: 400 })
      }

      // Control de capacidad
      if (evento.cuposReserva > 0) {
        const [{ totalPersonas }] = await db
          .select({ totalPersonas: sql<number>`COALESCE(SUM(${reservas.personas}), 0)` })
          .from(reservas)
          .where(
            and(
              eq(reservas.eventoId, evento.id),
              eq(reservas.tipo, 'show'),
              ne(reservas.estado, 'rechazada'),
            )
          )

        const usados = Number(totalPersonas) || 0
        const disponibles = evento.cuposReserva - usados

        if (disponibles <= 0) {
          return NextResponse.json(
            { error: `No hay cupos disponibles para "${evento.nombre}". Contáctanos por WhatsApp.`, disponibles: 0 },
            { status: 409 }
          )
        }
        if (disponibles < parsed.personas) {
          return NextResponse.json(
            {
              error: `Solo quedan ${disponibles} cupo${disponibles !== 1 ? 's' : ''} disponible${disponibles !== 1 ? 's' : ''} para este show. Reduce la cantidad de personas.`,
              disponibles,
            },
            { status: 409 }
          )
        }
      }

      monto = (evento.precioBase || 0) * parsed.personas

      if ((evento.precioBase || 0) > 0 && !parsed.comprobantePagoUrl) {
        return NextResponse.json(
          { error: `Debes adjuntar el comprobante de pago ($${monto.toLocaleString('es-CL')}).` },
          { status: 400 }
        )
      }

      estado = parsed.comprobantePagoUrl ? 'comprobante_subido' : 'pendiente'
      eventoIdGuardado = evento.id
      nombreEventoGuardado = evento.nombre
    }

    const notasConRut = parsed.rut
      ? `${parsed.notas ? `${parsed.notas.trim()}\n\n` : ''}RUT: ${parsed.rut.trim()}`
      : parsed.notas

    const [nuevaReserva] = await db.insert(reservas).values({
      tipo: parsed.tipo,
      estado,
      nombre: parsed.nombre,
      email: parsed.email.toLowerCase(),
      telefono: parsed.telefono,
      fecha: parsed.fecha,
      hora: parsed.hora,
      personas: parsed.personas,
      notas: notasConRut,
      monto,
      comprobantePagoUrl: parsed.comprobantePagoUrl,
      comprobantePublicId: parsed.comprobantePublicId,
      nombreEvento: nombreEventoGuardado || parsed.nombreEvento || (parsed.tipo === 'cumpleanos' ? `Cumpleaños de ${parsed.nombre}` : undefined),
      eventoId: eventoIdGuardado,
    }).returning()

    if (estado === 'aprobada') {
      await enviarConfirmacionReserva(nuevaReserva)
      await db.update(reservas).set({ emailEnviado: true }).where(eq(reservas.id, nuevaReserva.id))
    }

    enviarNotificacionAdminReserva(nuevaReserva).catch((err) =>
      console.error('[admin-email]', err)
    )

    return NextResponse.json({ ok: true, id: nuevaReserva.id, estado }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }
    console.error('[POST /api/reservas]', error)
    return NextResponse.json({ error: 'Error al procesar la reserva.' }, { status: 500 })
  }
}
