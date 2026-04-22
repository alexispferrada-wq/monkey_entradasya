import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import Link from 'next/link'
import SectorEventos from './components/SectorEventos'
import CarruselDestacados from './components/CarruselDestacados'

export const revalidate = 60

const HERO_BG  = 'https://res.cloudinary.com/dqsz4ua73/image/upload/q_auto/f_auto/v1776805260/Gemini_Generated_Image_p8isr8p8isr8p8is_1_vconvd.png'

export default async function Home() {
  const eventosActivos = await db
    .select()
    .from(eventos)
    .where(and(eq(eventos.activo, true), isNull(eventos.deletedAt)))
    .orderBy(eventos.fecha)

  const destacados = eventosActivos.filter((e) => e.destacado)
  const restantes  = eventosActivos.filter((e) => !e.destacado)

  const proximoShow = eventosActivos.find((e) => e.tipo === 'regular')
  const precioShow  = (proximoShow?.precioBase ?? 0) > 0
    ? `desde $${proximoShow!.precioBase.toLocaleString('es-CL')}`
    : null

  return (
    <div className="min-h-screen">

      {/* ── HERO — Dancehall Yard Party ──────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 1,
        }}
      >
        {/* Overlay oscuro para legibilidad del contenido */}
        <div className="absolute inset-0" style={{
          background:
            'linear-gradient(180deg, rgba(2,1,8,0.55) 0%, rgba(3,2,2,0.30) 40%, rgba(3,2,2,0.50) 70%, rgba(3,2,2,0.85) 100%)',
        }} />
        {/* Vignette lateral */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 90% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.50) 100%)',
        }} />

        {/* ── CONTENIDO CENTRADO ─────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-16 sm:pt-28">

          {/* Badge — Dancehall Massive */}
          <div className="club-badge mb-6" style={{
            borderColor:'rgba(232,0,110,0.40)',
            background:'rgba(3,0,2,0.88)',
            boxShadow:'0 0 20px rgba(232,0,110,0.15), 0 0 40px rgba(0,0,0,0.60)',
          }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor:'#E8006E', boxShadow:'0 0 8px rgba(232,0,110,1)' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color:'rgba(255,180,220,0.80)' }}>
              Dancehall Massive · Santiago de Chile
            </span>
          </div>

          {/* LIVING CLUB — bold dancehall type */}
          <div className="select-none mb-1" style={{ lineHeight:'0.88' }}>
            <div style={{
              fontFamily:"'Bebas Neue',sans-serif", fontWeight:900,
              fontSize:'clamp(4.5rem,15vw,10rem)', letterSpacing:'0.03em', lineHeight:'0.88',
            }}>
              <span className="living-title-l">LIV</span><span className="living-title-i">IN</span><span className="living-title-g">G</span>
            </div>
            <div style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize:'clamp(0.9rem,3.2vw,1.9rem)',
              letterSpacing:'0.55em',
              color:'rgba(255,255,255,0.45)',
              marginTop:'4px',
            }}>
              C&nbsp;L&nbsp;U&nbsp;B
            </div>
          </div>

          {/* Divisor tricolor Jamaica */}
          <div className="flex items-center gap-1 my-4">
            <div style={{ width:28, height:2, borderRadius:1, background:'#FFD600' }} />
            <div style={{ width:28, height:2, borderRadius:1, background:'#111' }} />
            <div style={{ width:28, height:2, borderRadius:1, background:'#E8006E' }} />
            <div style={{ width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,0.25)', margin:'0 2px' }} />
            <div style={{ width:28, height:2, borderRadius:1, background:'#E8006E' }} />
            <div style={{ width:28, height:2, borderRadius:1, background:'#111' }} />
            <div style={{ width:28, height:2, borderRadius:1, background:'#FFD600' }} />
          </div>

          {/* Tagline */}
          <p className="text-[10px] tracking-[0.30em] uppercase mb-8 font-bold" style={{ color:'rgba(255,180,220,0.50)' }}>
            Riddim · Sound System · Cultura Dancehall
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
            <Link
              href={proximoShow ? `/${proximoShow.slug}` : '#lineup'}
              className="btn-primary text-base px-8 py-3.5 rounded-2xl shimmer-bar"
            >
              🎫&nbsp; Comprar Entrada
              {precioShow && <span className="ml-2 opacity-75 text-sm">{precioShow}</span>}
            </Link>
            <a href="#lineup" className="btn-secondary text-base px-8 py-3.5 rounded-2xl">
              📅&nbsp; Ver Shows
            </a>
          </div>

          {/* Scroll */}
          <div className="mt-12 bounce-slow flex flex-col items-center gap-1.5 opacity-25">
            <span className="text-[9px] uppercase tracking-[0.28em]" style={{ color:'#E8006E' }}>Explorar</span>
            <div style={{ width:1, height:28, background:'linear-gradient(to bottom, transparent, #E8006E)' }} />
          </div>
        </div>
      </section>

      {/* ── ACCESO RÁPIDO — solo entradas ────────────────────────── */}
      <section className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href={proximoShow ? `/${proximoShow.slug}` : '#lineup'}
            className="group ticket-card flex items-center gap-5 px-6 py-6 active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ background:'rgba(255,184,0,0.10)', border:'1px solid rgba(255,184,0,0.22)' }}>
              🎫
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-tight">Comprar Entrada</p>
              <p className="text-xs mt-1 font-semibold" style={{ color:'#FFB800' }}>
                {precioShow ?? 'Ver shows disponibles'}
              </p>
            </div>
            <span className="text-zinc-600 group-hover:text-amber-400 transition-colors font-bold text-xl shrink-0">→</span>
          </Link>
        </div>
      </section>

      {/* ── DANCEHALL VIBE STRIP ────────────────────────────────── */}
      <section className="px-4 pb-6">
        <div className="max-w-5xl mx-auto rounded-2xl p-5 sm:p-6 ticket-card">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-zinc-300">Living Dancehall Vibe</span>
            <span className="h-px flex-1 min-w-[80px]" style={{ background:'linear-gradient(90deg, rgba(221,59,34,0.55), rgba(246,196,0,0.55), rgba(76,175,80,0.55))' }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="pill-dark" style={{ borderColor:'rgba(221,59,34,0.35)', color:'rgba(255,220,200,0.82)' }}>Sound System pesado</div>
            <div className="pill-dark" style={{ borderColor:'rgba(246,196,0,0.35)', color:'rgba(255,233,155,0.82)' }}>Riddims toda la noche</div>
            <div className="pill-dark" style={{ borderColor:'rgba(76,175,80,0.35)', color:'rgba(194,255,198,0.82)' }}>Cultura dancehall real</div>
          </div>
        </div>
      </section>

      <div className="divider-warm mx-6 sm:mx-12 my-2" />

      {/* ── CARRUSEL DESTACADOS ───────────────────────────────────── */}
      {destacados.length > 0 && (
        <section className="py-6">
          <div className="max-w-5xl mx-auto px-4 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-700 flex items-center gap-2">
              <span style={{ color:'#FFB800' }}>★</span> Eventos destacados
            </p>
          </div>
          <CarruselDestacados eventos={destacados} />
        </section>
      )}

      {/* ── LINEUP ───────────────────────────────────────────────── */}
      <section className="py-8 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-700 mb-1">
                Próximas sesiones dancehall
              </p>
              <h2 className="font-display text-2xl sm:text-3xl tracking-widest uppercase">
                <span className="living-title-l">Dancehall </span><span className="living-title-i">Line</span><span className="living-title-g">up</span>
                <span className="text-zinc-700 ml-2">2026</span>
              </h2>
            </div>
          </div>

          {eventosActivos.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full ticket-card flex items-center justify-center text-4xl">
                🌴
              </div>
              <h3 className="font-display text-3xl text-zinc-500 mb-2 tracking-widest uppercase">Próximamente</h3>
              <p className="text-zinc-700 text-sm">Vuelve pronto, hay nuevos eventos en camino.</p>
            </div>
          ) : (
            <SectorEventos eventos={restantes} />
          )}
        </div>
      </section>

      {/* ── CLUB LIVING BANNER ───────────────────────────────────── */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="divider-warm mb-8" />
          <Link href="/club" className="ticket-card block rounded-2xl p-6 sm:p-8 group">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background:'rgba(255,184,0,0.08)', border:'1px solid rgba(255,184,0,0.20)' }}>
                🌴
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-display text-2xl tracking-widest uppercase mb-1">
                  <span className="living-title-l">Club </span>
                  <span className="living-title-i">Livin</span>
                  <span className="living-title-g">g</span>
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Únete gratis · Acumula puntos · Beneficios exclusivos para la comunidad dancehall
                </p>
              </div>
              <div className="shrink-0 pill-dark group-hover:border-amber/30 transition-colors">
                Unirse gratis →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <div className="jungle-divider mx-8 mb-6" />
      <footer className="pb-12 px-4 text-center space-y-1.5">
        <p className="text-zinc-700 text-[10px] tracking-[0.25em] uppercase">
          © {new Date().getFullYear()} Living Club · Santiago, Chile
        </p>
        <p className="text-zinc-800 text-[10px] tracking-widest uppercase">
          Dancehall culture · Entradas y reservas · living.entradasya.cl
        </p>
      </footer>

    </div>
  )
}
