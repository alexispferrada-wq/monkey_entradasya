export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tickets, eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getPaymentClient } from '@/lib/mercadopago'
import { generateQR } from '@/lib/qr'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MP envía topic=payment con data.id
    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ ok: true })
    }

    const paymentId = String(body.data.id)
    const payment = getPaymentClient()
    const paymentData = await payment.get({ id: paymentId })

    const ticketId   = paymentData.external_reference
    const mpStatus   = paymentData.status
    const statusDetail = paymentData.status_detail

    if (!ticketId) return NextResponse.json({ ok: true })

    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1)

    if (!ticket) return NextResponse.json({ ok: true })

    if (mpStatus === 'approved' && ticket.estado !== 'pagado') {
      // Generar QR de entrada
      const { url: qrImageUrl, publicId: qrPublicId } = await generateQR(ticket.token)

      await db
        .update(tickets)
        .set({
          estado:         'pagado',
          mpPaymentId:    paymentId,
          mpStatus,
          mpStatusDetail: statusDetail,
          qrImageUrl,
          qrPublicId,
          paidAt:         new Date(),
        })
        .where(eq(tickets.id, ticketId))

      // Descontar cupos del evento
      await db
        .update(eventos)
        .set({
          cuposDisponibles: Math.max(0, (ticket.cantidad ?? 1) > 0
            ? (await db.select({ c: eventos.cuposDisponibles }).from(eventos).where(eq(eventos.id, ticket.eventoId)).then(r => r[0]?.c ?? 0)) - ticket.cantidad
            : 0),
        })
        .where(eq(eventos.id, ticket.eventoId))
    } else if (['cancelled', 'rejected', 'refunded', 'charged_back'].includes(mpStatus ?? '')) {
      await db
        .update(tickets)
        .set({
          estado:         mpStatus === 'refunded' ? 'reembolsado' : 'cancelado',
          mpPaymentId:    paymentId,
          mpStatus,
          mpStatusDetail: statusDetail,
        })
        .where(eq(tickets.id, ticketId))
    } else {
      await db
        .update(tickets)
        .set({ mpPaymentId: paymentId, mpStatus, mpStatusDetail: statusDetail })
        .where(eq(tickets.id, ticketId))
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[POST /api/pagos/webhook]', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
