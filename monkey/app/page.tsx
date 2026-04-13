import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import Image from 'next/image'
import Link from 'next/link'
import SectorEventos from './components/SectorEventos'

export const revalidate = 60

function formatFecha(fecha: Date): string {
  return new Date(fecha).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function Home() {
  const eventosActivos = await db
    .select()
    .from(eventos)
    .where(and(eq(eventos.activo, true), isNull(eventos.deletedAt)))
    .orderBy(eventos.fecha)

  const destacado = eventosActivos.find((e) => e.destacado)
  const restantes = eventosActivos.filter((e) => !e.destacado)

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2 text-sm text-zinc-400 mb-10 border-primary/20">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Invitaciones disponibles — entrada gratuita
          </div>
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

      {/* Flyer destacado */}
      {destacado && (
        <section className="pb-10 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary text-lg">⭐</span>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Evento destacado</span>
            </div>
            <Link
              href={destacado.cuposDisponibles <= 0 ? '#' : `/${destacado.slug}`}
              className={`group block ${destacado.cuposDisponibles <= 0 ? 'pointer-events-none' : ''}`}
            >
              <div className="relative rounded-3xl overflow-hidden bg-black w-full" style={{ aspectRatio: '16/7' }}>
                {destacado.imagenUrl ? (
                  <Image
                    src={destacado.imagenUrl}
                    alt={destacado.nombre}
                    fill
                    quality={100}
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                    <span className="font-display text-7xl text-primary/20 tracking-widest">MONKEY</span>
                  </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {destacado.cuposDisponibles <= 0 ? (
                    <span className="bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                      Agotado
                    </span>
                  ) : (
                    <span className="bg-primary text-black text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {destacado.cuposDisponibles} cupos
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{destacado.lugar}</p>
                  <h2 className="font-display text-2xl md:text-4xl text-white tracking-wide uppercase leading-tight mb-2">
                    {destacado.nombre}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-zinc-300 mb-4">
                    <span>📅</span>
                    <span className="capitalize">{formatFecha(destacado.fecha)}</span>
                  </div>
                  {destacado.cuposDisponibles > 0 && (
                    <span className="inline-block bg-primary text-black font-display text-sm py-2.5 px-6 rounded-xl tracking-wider uppercase">
                      Ver invitación →
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Sectores + eventos */}
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
            <SectorEventos eventos={restantes} />
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
            <img src="/monkey-logo.png" alt="Monkey" className="w-12 h-12 object-contain" />
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
