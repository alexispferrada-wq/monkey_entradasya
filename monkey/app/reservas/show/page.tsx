import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { reservas, eventos } from '@/lib/db/schema'
import { eq, and, ne, sql, isNull } from 'drizzle-orm'
import ShowForm, { type ShowEvento } from './ShowForm'

export const revalidate = 30

export const metadata: Metadata = {
  title: 'Reserva Show — Monkey Restobar',
  description: 'Reserva tu lugar en los shows y eventos de Monkey Restobar.',
}

function formatFechaDisplay(date: Date): string {
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Santiago',
  })
}

function formatFechaReserva(date: Date): string {
  const d = new Date(date.toLocaleString('en-US', { timeZone: 'America/Santiago' }))
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export default async function ReservaShowPage() {
  // Traer eventos activos regulares (no cumpleaños, no eliminados)
  const eventosActivos = await db
    .select()
    .from(eventos)
    .where(
      and(
        eq(eventos.activo, true),
        eq(eventos.tipo, 'regular'),
        isNull(eventos.deletedAt),
      )
    )
    .orderBy(eventos.fecha)

  // Para cada evento, calcular cupos usados por reservas de show no rechazadas
  const showEventos: ShowEvento[] = await Promise.all(
    eventosActivos.map(async (ev) => {
      let cuposRestantes = -1 // -1 = sin límite

      if (ev.cuposReserva > 0) {
        const [{ totalPersonas }] = await db
          .select({ totalPersonas: sql<number>`COALESCE(SUM(${reservas.personas}), 0)` })
          .from(reservas)
          .where(
            and(
              eq(reservas.eventoId, ev.id),
              eq(reservas.tipo, 'show'),
              ne(reservas.estado, 'rechazada'),
            )
          )

        const usados = Number(totalPersonas) || 0
        cuposRestantes = Math.max(0, ev.cuposReserva - usados)
      }

      const fechaDate = new Date(ev.fecha)

      return {
        id: ev.id,
        nombre: ev.nombre,
        fechaDisplay: formatFechaDisplay(fechaDate),
        fechaReserva: formatFechaReserva(fechaDate),
        precioBase: ev.precioBase ?? 0,
        cuposReserva: ev.cuposReserva ?? 0,
        cuposRestantes,
      }
    })
  )

  return (
    <main className="min-h-screen pt-20 pb-safe-bottom bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/reservas"
            className="inline-flex items-center gap-1.5 text-zinc-500 text-sm hover:text-white transition-colors mb-5"
          >
            ← Volver
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🎫</span>
            <div>
              <h1 className="font-display text-2xl text-white uppercase tracking-wide">
                Reserva de Show
              </h1>
              <span className="text-primary text-xs font-bold uppercase tracking-wide">
                {showEventos.length > 0
                  ? `${showEventos.length} show${showEventos.length !== 1 ? 's' : ''} disponible${showEventos.length !== 1 ? 's' : ''}`
                  : 'Próximamente'}
              </span>
            </div>
          </div>
          <p className="text-zinc-500 text-sm mt-2">
            Elige el show y completa tus datos. Confirmaremos tu reserva por correo.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <ShowForm eventos={showEventos} />
        </div>

      </div>
    </main>
  )
}
