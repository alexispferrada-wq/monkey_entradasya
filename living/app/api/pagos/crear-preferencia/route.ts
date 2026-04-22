export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { tickets, eventos } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { getPreferenceClient } from '@/lib/mercadopago'

const schema = z.object({
  eventoId:  z.string().uuid(),
  nombre:    z.string().min(2).max(100),
  email:     z.string().email(),
  telefono:  z.string().min(8).max(20),
  cantidad:  z.number().int().min(1).max(10),
})

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://living.entradasya.cl'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const [evento] = await db
      .select()
      .from(eventos)
      .where(and(eq(eventos.id, data.eventoId), eq(eventos.activo, true), isNull(eventos.deletedAt)))
      .limit(1)

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado.' }, { status: 404 })
    }
    if (evento.precioBase <= 0) {
      return NextResponse.json({ error: 'Este evento no requiere pago.' }, { status: 400 })
    }
    if (evento.cuposDisponibles < data.cantidad) {
      return NextResponse.json({ error: 'No hay suficientes cupos disponibles.' }, { status: 409 })
    }

    const montoTotal = evento.precioBase * data.cantidad

    // Crear ticket en estado pendiente_pago
    const [ticket] = await db
      .insert(tickets)
      .values({
        eventoId:   data.eventoId,
        nombre:     data.nombre,
        email:      data.email,
        telefono:   data.telefono,
        cantidad:   data.cantidad,
        precioUnit: evento.precioBase,
        montoTotal,
        estado:     'pendiente_pago',
      })
      .returning()

    // Crear preferencia de pago en MercadoPago
    const preference = getPreferenceClient()
    const result = await preference.create({
      body: {
        external_reference: ticket.id,
        items: [
          {
            id:           evento.id,
            title:        `${data.cantidad}x Entrada — ${evento.nombre}`,
            description:  evento.descripcion ?? evento.nombre,
            quantity:     data.cantidad,
            unit_price:   evento.precioBase,
            currency_id:  'CLP',
          },
        ],
        payer: {
          name:  data.nombre,
          email: data.email,
          phone: { number: data.telefono },
        },
        back_urls: {
          success: `${BASE_URL}/pagos/exito?ticket=${ticket.id}`,
          failure: `${BASE_URL}/pagos/falla?ticket=${ticket.id}`,
          pending: `${BASE_URL}/pagos/pendiente?ticket=${ticket.id}`,
        },
        auto_return:           'approved',
        notification_url:      `${BASE_URL}/api/pagos/webhook`,
        statement_descriptor:  'LIVING CLUB',
      },
    })

    // Guardar el preference_id en el ticket
    await db
      .update(tickets)
      .set({ mpPreferenceId: result.id })
      .where(eq(tickets.id, ticket.id))

    return NextResponse.json({
      preferenceId: result.id,
      initPoint:    result.init_point,
      ticketId:     ticket.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos.', issues: error.issues }, { status: 422 })
    }
    console.error('[POST /api/pagos/crear-preferencia]', error)
    return NextResponse.json({ error: 'Error al crear preferencia de pago.' }, { status: 500 })
  }
}
