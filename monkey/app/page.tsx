import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import Link from 'next/link'
import SectorEventos from './components/SectorEventos'
import CarruselDestacados from './components/CarruselDestacados'

export const revalidate = 60


export default async function Home() {
  const eventosActivos = await db
    .select()
    .from(eventos)
    .where(and(eq(eventos.activo, true), isNull(eventos.deletedAt)))
    .orderBy(eventos.fecha)

  const destacados = eventosActivos.filter((e) => e.destacado)
  // restantes: todos los no-destacados (incluye cumpleaños) → SectorEventos los separa internamente
  const restantes = eventosActivos.filter((e) => !e.destacado)

  // Próximo show para el link dinámico
  const proximoShow = eventosActivos.find((e) => e.tipo === 'regular')
  const showSub = proximoShow
    ? proximoShow.precioBase > 0
      ? `$${proximoShow.precioBase.toLocaleString('es-CL')} p/p`
      : 'Gratis'
    : 'Ver shows'

  const RESERVA_LINKS = [
    { href: '/reservas/show',    emoji: '🎫', label: 'Reserva de Show',       sub: showSub,           color: '#F5C200' },
    { href: '/cumpleanos/nuevo', emoji: '🎂', label: 'Reserva de Cumpleaños', sub: 'Evento privado',  color: '#a855f7' },
    { href: '/reservas/normal',  emoji: '🌿', label: 'Reserva Normal',        sub: 'Gratis',          color: '#22c55e' },
  ]

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="py-8 sm:py-12 px-6 sm:px-10 flex items-center justify-center">
        <div className="flex items-center gap-5 sm:gap-8 md:gap-12 max-w-3xl mx-auto w-full">

          {/* Logo */}
          <div className="shrink-0">
            <img
              src="https://res.cloudinary.com/dqsz4ua73/image/upload/q_auto/f_auto/v1776194477/copy_of_gemini_generated_image_r0isfur0isfur0is_jc6xaa_7b01b6.png"
              alt="Monkey"
              className="w-28 sm:w-40 md:w-52 object-contain"
              style={{ filter: 'drop-shadow(0 4px 24px rgba(245,194,0,0.3))' }}
            />
          </div>

          {/* Texto */}
          <div className="min-w-0">
            <h1 className="uppercase leading-none font-black">
              <span className="jungle-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl">BIENVENIDOS</span>
              <span className="jungle-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl">A LA JUNGLA</span>
            </h1>
          </div>

        </div>
      </section>

      {/* Reservas rápidas */}
      <section className="pb-8 sm:pb-10 px-4 jungle-bg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary text-sm">📌</span>
            <span className="text-xs font-bold uppercase tracking-widest text-jungle">Reservas</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {RESERVA_LINKS.map(r => (
              <Link
                key={r.href}
                href={r.href}
                className="group flex items-center gap-4 card-jungle-glow rounded-2xl px-4 py-4 min-h-[64px] active:scale-[0.98] transition-all duration-200"
              >
                <span className="text-2xl shrink-0">{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold leading-tight">{r.label}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: r.color }}>{r.sub}</p>
                </div>
                <span className="text-jungle group-hover:text-yellow-400 transition-colors shrink-0 font-bold">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Carrusel destacados */}
      {destacados.length > 0 && <CarruselDestacados eventos={destacados} />}

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
