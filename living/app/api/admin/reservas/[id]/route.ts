export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reservas, eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { enviarConfirmacionReserva, enviarRechazoReserva } from '@/lib/email'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { estado, adminNotas, motivoRechazo } = await req.json()

    const [reserva] = await db.select().from(reservas).where(eq(reservas.id, id)).limit(1)
    if (!reserva) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

    let eventoId = reserva.eventoId

    if (estado === 'aprobada' && reserva.tipo === 'cumpleanos' && !eventoId) {
      const slug = `cumple-${reserva.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`
      
      const [nuevoEvento] = await db.insert(eventos).values({
        nombre: reserva.nombreEvento || `Cumpleaños de ${reserva.nombre}`,
        descripcion: `Reserva de cumpleaños. Solicita tu QR para ingresar.`,
        fecha: new Date(`${reserva.fecha}T${reserva.hora}:00-03:00`),
        lugar: 'Evento Living Club',
        cuposTotal: reserva.personas,
        cuposDisponibles: reserva.personas,
        activo: true,
        destacado: false,
        slug,
      }).returning()

      eventoId = nuevoEvento.id
    }

    const [reservaActualizada] = await db.update(reservas).set({
      estado,
      adminNotas,
      adminAt: new Date(),
      eventoId,
    }).where(eq(reservas.id, id)).returning()

    if (estado === 'aprobada' && !reserva.emailEnviado) {
      await enviarConfirmacionReserva(reservaActualizada)
      await db.update(reservas).set({ emailEnviado: true }).where(eq(reservas.id, id))
    } else if (estado === 'rechazada') {
      await enviarRechazoReserva(reservaActualizada, motivoRechazo)
    }

    return NextResponse.json({ ok: true, reserva: reservaActualizada })
  } catch (error) {
    console.error('[PUT /api/admin/reservas]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}