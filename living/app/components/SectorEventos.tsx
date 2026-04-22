'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Evento } from '@/lib/db/schema'

function formatFecha(fecha: Date) {
  const d = new Date(fecha)
  return {
    dia:  d.toLocaleDateString('es-CL', { weekday: 'short', timeZone: 'America/Santiago' }).toUpperCase(),
    num:  d.toLocaleDateString('es-CL', { day: '2-digit', timeZone: 'America/Santiago' }),
    mes:  d.toLocaleDateString('es-CL', { month: 'short', timeZone: 'America/Santiago' }).toUpperCase(),
    hora: d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' }),
    full: d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Santiago' }),
  }
}

interface Props { eventos: Evento[] }

function TicketCard({ evento }: { evento: Evento }) {
  const agotado   = evento.cuposDisponibles <= 0
  const esPagado  = evento.precioBase > 0
  const fecha     = formatFecha(evento.fecha)
  const porcentaje = Math.round(
    ((evento.cuposTotal - evento.cuposDisponibles) / evento.cuposTotal) * 100
  )
  const urgente = evento.cuposDisponibles > 0 && evento.cuposDisponibles <= 10
  const href = agotado ? '#' : `/${evento.slug}`

  return (
    <Link href={href} className={`block group ${agotado ? 'pointer-events-none' : ''}`}>
      <article className="ticket-card rounded-2xl overflow-hidden">

        {/* Imagen */}
        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
          {evento.imagenUrl ? (
            <Image
              src={evento.imagenUrl}
              alt={evento.nombre}
              fill
              quality={80}
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 hero-overlay flex items-center justify-center">
              <span className="font-display text-5xl golden-text tracking-widest opacity-30">LIVING</span>
            </div>
          )}
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badges flotantes */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
            {evento.tipo === 'cumpleanos' && (
              <span className="pill-dark !text-purple-400 !border-purple-500/30">🔒 Privado</span>
            )}
            {agotado ? (
              <span className="pill-dark !text-red-400 !border-red-500/30">Agotado</span>
            ) : urgente ? (
              <span className="pill-dark !text-amber-400 !border-amber-500/40">🔥 Últimos cupos</span>
            ) : null}
          </div>

          {/* Precio badge */}
          {!agotado && (
            <div className="absolute bottom-3 left-3 z-10">
              {esPagado ? (
                <span className="price-badge">
                  ${evento.precioBase.toLocaleString('es-CL')}
                </span>
              ) : (
                <span className="price-badge" style={{ background: 'linear-gradient(135deg, #22C55E, #16a34a)' }}>
                  GRATIS
                </span>
              )}
            </div>
          )}
        </div>

        {/* Cuerpo */}
        <div className="p-4">

          {/* Nombre */}
          <h2 className="font-display text-base sm:text-lg text-white tracking-wide uppercase leading-tight mb-3 line-clamp-2">
            {evento.nombre}
          </h2>

          {/* Separador tipo ticket perforado */}
          <div className="ticket-perf mb-3" />

          {/* Info fecha + lugar */}
          <div className="flex items-center gap-3 mb-3">
            {/* Fecha caja */}
            <div
              className="shrink-0 w-11 rounded-lg flex flex-col items-center justify-center py-1.5 text-center"
              style={{ background: 'rgba(245,194,0,0.08)', border: '1px solid rgba(245,194,0,0.2)' }}
            >
              <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest leading-none">{fecha.dia}</span>
              <span className="font-display text-xl text-primary leading-tight">{fecha.num}</span>
              <span className="text-[9px] font-bold text-primary/60 uppercase tracking-widest leading-none">{fecha.mes}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-300 truncate capitalize leading-snug">{fecha.full}</p>
              <p className="text-xs text-zinc-600 truncate mt-0.5">
                <span className="text-zinc-500">🕙</span> {fecha.hora} · {evento.lugar}
              </p>
            </div>
          </div>

          {/* Barra de ocupación */}
          {!agotado && evento.cuposTotal > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-zinc-600 mb-1">
                <span>{evento.cuposDisponibles} cupos disponibles</span>
                <span>{porcentaje}% ocupado</span>
              </div>
              <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${porcentaje}%`,
                    background: porcentaje > 85
                      ? 'linear-gradient(90deg, #ef4444, #f97316)'
                      : porcentaje > 60
                      ? 'linear-gradient(90deg, #f97316, #FFE600)'
                      : 'linear-gradient(90deg, #22C55E, #FFE600)',
                  }}
                />
              </div>
            </div>
          )}

          {/* CTA */}
          <div className={`w-full text-center font-display text-sm py-2.5 px-4 rounded-xl tracking-widest uppercase min-h-[44px] flex items-center justify-center gap-2 transition-all duration-200 ${
            agotado
              ? 'bg-zinc-900 text-zinc-600 border border-zinc-800'
              : 'living-gradient text-black group-hover:opacity-90 group-hover:scale-[1.02]'
          }`}>
            {agotado ? 'Sin disponibilidad' : esPagado ? '🎫 Comprar Entrada' : '🎟 Obtener Invitación'}
          </div>
        </div>

      </article>
    </Link>
  )
}

export default function SectorEventos({ eventos }: Props) {
  if (eventos.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {eventos.map((evento) => (
        <TicketCard key={evento.id} evento={evento} />
      ))}
    </div>
  )
}
