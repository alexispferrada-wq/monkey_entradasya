import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 0

function formatFecha(fecha: Date): string {
  return new Date(fecha).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatHora(fecha: Date): string {
  return new Date(fecha).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function Home() {
  const eventosActivos = await db
    .select()
    .from(eventos)
    .where(eq(eventos.activo, true))
    .orderBy(eventos.fecha)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 text-sm text-slate-400 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Invitaciones disponibles
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            Eventos{' '}
            <span className="gradient-text">exclusivos</span>
            <br />para ti
          </h1>
          <p className="text-slate-400 text-xl max-w-xl mx-auto">
            Solicita tu invitación gratuita. Solo necesitas tu correo y en minutos
            tendrás tu acceso QR.
          </p>
        </div>
      </section>

      {/* Lista de eventos */}
      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {eventosActivos.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-card flex items-center justify-center text-4xl">
                🎭
              </div>
              <h2 className="text-2xl font-bold text-slate-300 mb-2">
                No hay eventos disponibles
              </h2>
              <p className="text-slate-500">Vuelve pronto, pronto habrá nuevos eventos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventosActivos.map((evento) => {
                const agotado = evento.cuposDisponibles <= 0
                const porcentaje = Math.round(
                  ((evento.cuposTotal - evento.cuposDisponibles) / evento.cuposTotal) * 100
                )

                return (
                  <div
                    key={evento.id}
                    className="glass-card rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group animate-slide-up"
                  >
                    {/* Imagen */}
                    <div className="relative h-52 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                      {evento.imagenUrl ? (
                        <Image
                          src={evento.imagenUrl}
                          alt={evento.nombre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-6xl opacity-20">🎉</div>
                        </div>
                      )}
                      {/* Badge estado */}
                      <div className="absolute top-3 right-3">
                        {agotado ? (
                          <span className="bg-rose-500/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Agotado
                          </span>
                        ) : (
                          <span className="bg-green-500/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                            {evento.cuposDisponibles} cupos
                          </span>
                        )}
                      </div>
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-white mb-1">{evento.nombre}</h2>
                      {evento.descripcion && (
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                          {evento.descripcion}
                        </p>
                      )}

                      <div className="space-y-2 mb-5">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span>📅</span>
                          <span className="capitalize">{formatFecha(evento.fecha)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span>🕐</span>
                          <span>{formatHora(evento.fecha)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span>📍</span>
                          <span>{evento.lugar}</span>
                        </div>
                      </div>

                      {/* Barra de ocupación */}
                      <div className="mb-5">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Ocupación</span>
                          <span>{porcentaje}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${porcentaje}%`,
                              background: porcentaje > 80
                                ? 'linear-gradient(90deg, #f43f5e, #fb923c)'
                                : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            }}
                          />
                        </div>
                      </div>

                      <Link
                        href={`/${evento.slug}`}
                        className={`block text-center font-bold py-3 px-6 rounded-xl transition-all duration-300 ${
                          agotado
                            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed pointer-events-none'
                            : 'btn-primary'
                        }`}
                      >
                        {agotado ? 'Sin cupos disponibles' : 'Solicitar invitación →'}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
