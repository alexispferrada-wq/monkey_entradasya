import Link from 'next/link'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { reservas, eventos } from '@/lib/db/schema'
import { eq, and, ne, sql, isNull } from 'drizzle-orm'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Reservas — Monkey Restobar',
  description: 'Reserva tu mesa en Monkey Restobar. Terraza gratuita, shows con preventa o celebra tu cumpleaños.',
}

export default async function ReservasPage() {
  // Próximo show activo para mostrar en la card
  const [proximoShow] = await db
    .select()
    .from(eventos)
    .where(and(eq(eventos.activo, true), eq(eventos.tipo, 'regular'), isNull(eventos.deletedAt)))
    .orderBy(eventos.fecha)
    .limit(1)

  // Cupos restantes del próximo show
  let cuposRestantes: number | null = null
  if (proximoShow && proximoShow.cuposReserva > 0) {
    const [{ totalPersonas }] = await db
      .select({ totalPersonas: sql<number>`COALESCE(SUM(${reservas.personas}), 0)` })
      .from(reservas)
      .where(and(eq(reservas.eventoId, proximoShow.id), eq(reservas.tipo, 'show'), ne(reservas.estado, 'rechazada')))
    cuposRestantes = Math.max(0, proximoShow.cuposReserva - (Number(totalPersonas) || 0))
  }

  const showSub = proximoShow
    ? proximoShow.precioBase > 0
      ? `$${proximoShow.precioBase.toLocaleString('es-CL')} p/p`
      : 'Gratis'
    : 'Próximamente'

  return (
    <main className="min-h-screen pt-20 pb-safe-bottom bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">📋</div>
          <h1 className="font-display text-3xl text-primary uppercase tracking-widest mb-2">
            Reservas
          </h1>
          <p className="text-zinc-400 text-sm">
            Elige el tipo de reserva que necesitas
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4">

          {/* Mesa Normal — Terraza */}
          <Link href="/reservas/normal" className="group block">
            <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-green-500/40 active:scale-[0.98] transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">🏖️</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-lg text-white uppercase tracking-wide">
                      Mesa Normal
                    </h2>
                    <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                      Gratis
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Reserva tu mesa para el fin de semana. Sin costo, sujeto a disponibilidad.
                    Llega a la hora indicada.
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-green-400 text-sm font-bold">
                    Reservar mesa →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Show / Evento */}
          <Link href="/reservas/show" className="group block">
            <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-primary/40 active:scale-[0.98] transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">🎫</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-lg text-white uppercase tracking-wide">
                      Reserva de Show
                    </h2>
                    <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                      {showSub}
                    </span>
                  </div>
                  {proximoShow ? (
                    <>
                      <p className="text-zinc-300 text-sm font-medium">{proximoShow.nombre}</p>
                      <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                        {new Date(proximoShow.fecha).toLocaleDateString('es-CL', {
                          weekday: 'long', day: 'numeric', month: 'long',
                          timeZone: 'America/Santiago',
                        })}
                        {cuposRestantes !== null && cuposRestantes < 20 && (
                          <span className={`ml-2 font-bold ${cuposRestantes < 10 ? 'text-rose-400' : 'text-zinc-400'}`}>
                            · {cuposRestantes} cupos
                          </span>
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Shows con artistas. Requiere comprobante de pago cuando hay preventa.
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1 text-primary text-sm font-bold">
                    Ver shows disponibles →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Cumpleaños */}
          <Link href="/cumpleanos/nuevo" className="group block">
            <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-purple-500/40 active:scale-[0.98] transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">🎂</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-lg text-white uppercase tracking-wide">
                      Cumpleaños
                    </h2>
                    <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                      Privado
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Celebra tu cumpleaños con nosotros. Creamos un evento privado con
                    QR personal para cada invitado.
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-purple-400 text-sm font-bold">
                    Organizar celebración →
                  </div>
                </div>
              </div>
            </div>
          </Link>

        </div>

        {/* Footer note */}
        <p className="text-center text-zinc-600 text-xs mt-8 leading-relaxed">
          ¿Dudas? Escríbenos por WhatsApp o preséntate directamente en Monkey Restobar.<br />
          Av. Concha y Toro 1060, Local 3
        </p>

      </div>
    </main>
  )
}
