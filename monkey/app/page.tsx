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

          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2 text-sm text-zinc-400 mb-10 border-primary/20">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Invitaciones disponibles — entrada gratuita
          </div>

          {/* Título */}
          <h1 className="font-display text-7xl sm:text-8xl md:text-9xl mb-4 tracking-wide leading-none uppercase">
            <span className="gradient-text">Eventos</span>
          </h1>
          <h2 className="font-display text-4xl sm:text-5xl text-white tracking-widest mb-8 uppercase">
            Monkey Restobar
          </h2>

          <div className="jungle-divider max-w-sm mx-auto mb-8" />

          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Solicita tu invitación gratuita. Solo necesitas tu correo
            y en minutos tendrás tu código QR de acceso.
          </p>
        </div>
      </section>

      {/* Lista de eventos */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          {eventosActivos.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-card flex items-center justify-center text-4xl border-primary/20">
                🎭
              </div>
              <h2 className="font-display text-4xl text-zinc-300 mb-3 tracking-wide">
                Próximamente
              </h2>
              <p className="text-zinc-600">Vuelve pronto, hay nuevos eventos en camino.</p>
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
                    className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group animate-slide-up"
                  >
                    {/* Imagen */}
                    <div className="relative h-60 bg-black overflow-hidden">
                      {evento.imagenUrl ? (
                        <Image
                          src={evento.imagenUrl}
                          alt={evento.nombre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                          <span className="font-display text-6xl text-primary/20 tracking-widest">MONKEY</span>
                        </div>
                      )}

                      {/* Badge estado */}
                      <div className="absolute top-3 right-3 z-10">
                        {agotado ? (
                          <span className="bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Agotado
                          </span>
                        ) : (
                          <span className="bg-primary text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                            {evento.cuposDisponibles} cupos
                          </span>
                        )}
                      </div>

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                      <h2 className="font-display text-2xl text-white mb-1 tracking-wide uppercase">
                        {evento.nombre}
                      </h2>
                      {evento.descripcion && (
                        <p className="text-zinc-500 text-sm mb-4 line-clamp-2">
                          {evento.descripcion}
                        </p>
                      )}

                      <div className="space-y-1.5 mb-5">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <span className="text-primary">📅</span>
                          <span className="capitalize">{formatFecha(evento.fecha)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <span className="text-primary">🕐</span>
                          <span>{formatHora(evento.fecha)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <span className="text-primary">📍</span>
                          <span>{evento.lugar}</span>
                        </div>
                      </div>

                      {/* Barra de ocupación */}
                      <div className="mb-5">
                        <div className="flex justify-between text-xs text-zinc-600 mb-1">
                          <span>Ocupación</span>
                          <span>{porcentaje}%</span>
                        </div>
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${porcentaje}%`,
                              background: porcentaje > 80
                                ? 'linear-gradient(90deg, #dc2626, #f97316)'
                                : 'linear-gradient(90deg, #F5C200, #F97316)',
                            }}
                          />
                        </div>
                      </div>

                      <Link
                        href={`/${evento.slug}`}
                        className={`block text-center font-display text-lg py-3 px-6 rounded-xl transition-all duration-300 tracking-wider uppercase ${
                          agotado
                            ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed pointer-events-none'
                            : 'btn-primary'
                        }`}
                      >
                        {agotado ? 'Sin cupos' : 'Solicitar invitación'}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Club Monkey banner */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/club"
            className="glass-card rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 border-primary/20 hover:border-primary/50 transition-all duration-300 group"
          >
            <div className="text-5xl">🐒</div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-display text-2xl text-primary tracking-widest uppercase mb-1">Club Monkey</h3>
              <p className="text-zinc-400 text-sm">Únete gratis · Acumula puntos · Accede a beneficios exclusivos y tu tarjeta digital de socio</p>
            </div>
            <div className="shrink-0 text-zinc-600 group-hover:text-primary transition-colors text-2xl">→</div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center pb-10 text-zinc-700 text-xs tracking-widest uppercase">
        Monkey Restobar · Av. Concha y Toro 1060, Local 3
      </div>
    </div>
  )
}
