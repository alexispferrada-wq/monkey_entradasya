import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 60

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
        <div className="max-w-3xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2 text-sm text-zinc-400 mb-10 border-primary/20">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Invitaciones disponibles — entrada gratuita
          </div>

          {/* Título */}
          <h1 className="font-sans text-5xl sm:text-6xl md:text-7xl mb-8 tracking-wide leading-tight uppercase font-bold">
            <span className="gradient-text">Eventos y Reservas</span>
          </h1>

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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {eventosActivos.map((evento) => {
                const agotado = evento.cuposDisponibles <= 0
                const porcentaje = Math.round(
                  ((evento.cuposTotal - evento.cuposDisponibles) / evento.cuposTotal) * 100
                )

                return (
                  <Link
                    key={evento.id}
                    href={agotado ? '#' : `/${evento.slug}`}
                    className={`group block ${agotado ? 'pointer-events-none' : ''}`}
                  >
                    {/* Card tipo poster vertical 9:16 */}
                    <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '9/16' }}>

                      {/* Imagen de fondo — ocupa todo */}
                      {evento.imagenUrl ? (
                        <Image
                          src={evento.imagenUrl}
                          alt={evento.nombre}
                          fill
                          quality={100}
                          className="object-cover"
                          style={{ filter: 'contrast(1.1) saturate(1.05)' }}
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                          <span className="font-display text-4xl text-primary/20 tracking-widest">MONKEY</span>
                        </div>
                      )}

                      {/* Badge estado — arriba derecha */}
                      <div className="absolute top-3 right-3 z-10">
                        {agotado ? (
                          <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                            Agotado
                          </span>
                        ) : (
                          <span className="bg-primary text-black text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
                            {evento.cuposDisponibles} cupos
                          </span>
                        )}
                      </div>

                      {/* Info superpuesta en la parte inferior */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-10 bg-black/60 backdrop-blur-sm">
                        <h2 className="font-display text-sm md:text-lg text-white tracking-wide uppercase leading-tight mb-1 line-clamp-2">
                          {evento.nombre}
                        </h2>
                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-zinc-400 mb-2">
                          <span className="text-primary">📅</span>
                          <span className="capitalize truncate">{formatFecha(evento.fecha)}</span>
                        </div>

                        {/* Barra de ocupación */}
                        <div className="mb-3">
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${porcentaje}%`,
                                background: porcentaje > 80
                                  ? 'linear-gradient(90deg, #dc2626, #f97316)'
                                  : 'linear-gradient(90deg, #F5C200, #F97316)',
                              }}
                            />
                          </div>
                        </div>

                        <div
                          className={`w-full text-center font-display text-xs md:text-sm py-2 px-3 rounded-xl tracking-wider uppercase ${
                            agotado
                              ? 'bg-zinc-800/70 text-zinc-600'
                              : 'bg-primary text-black'
                          }`}
                        >
                          {agotado ? 'Sin cupos' : 'Ver invitación →'}
                        </div>
                      </div>
                    </div>
                  </Link>
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
