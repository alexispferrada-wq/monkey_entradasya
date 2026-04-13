export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reservas } from '@/lib/db/schema'
import { enviarConfirmacionReserva } from '@/lib/email'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const reservaSchema = z.object({
  tipo: z.enum(['terraza', 'grill', 'cumpleanos']),
  nombre: z.string().min(2).max(100),
  email: z.string().email(),
  telefono: z.string().min(8),
  fecha: z.string(),
  hora: z.string(),
  personas: z.number().int().min(1),
  notas: z.string().optional(),
  comprobantePagoUrl: z.string().optional(),
  comprobantePublicId: z.string().optional(),
  nombreEvento: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = reservaSchema.parse(body)

    let estado: 'pendiente' | 'comprobante_subido' | 'aprobada' = 'pendiente'
    let monto = 0

    if (parsed.tipo === 'grill') {
      monto = 10000
      if (!parsed.comprobantePagoUrl) {
        return NextResponse.json({ error: 'Comprobante de pago requerido para Grill.' }, { status: 400 })
      }
      estado = 'comprobante_subido'
    } else if (parsed.tipo === 'cumpleanos') {
      monto = 10000
      if (parsed.comprobantePagoUrl) {
        estado = 'comprobante_subido'
      } else {
        estado = 'pendiente'
      }
    } else if (parsed.tipo === 'terraza') {
      estado = 'aprobada'
    }

    const [nuevaReserva] = await db.insert(reservas).values({
      tipo: parsed.tipo,
      estado,
      nombre: parsed.nombre,
      email: parsed.email.toLowerCase(),
      telefono: parsed.telefono,
      fecha: parsed.fecha,
      hora: parsed.hora,
      personas: parsed.personas,
      notas: parsed.notas,
      monto,
      comprobantePagoUrl: parsed.comprobantePagoUrl,
      comprobantePublicId: parsed.comprobantePublicId,
      nombreEvento: parsed.nombreEvento || `Cumpleaños de ${parsed.nombre}`,
    }).returning()

    if (estado === 'aprobada') {
      await enviarConfirmacionReserva(nuevaReserva)
      await db.update(reservas).set({ emailEnviado: true }).where(eq(reservas.id, nuevaReserva.id))
    }

    return NextResponse.json({ ok: true, id: nuevaReserva.id, estado }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }
    console.error('[POST /api/reservas]', error)
    return NextResponse.json({ error: 'Error al procesar la reserva.' }, { status: 500 })
  }
}