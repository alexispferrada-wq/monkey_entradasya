'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'

type Evento = {
  id: string
  slug: string
  nombre: string
  fecha: Date
  lugar: string
  imagenUrl: string | null
  cuposDisponibles: number
  destacado: boolean | null
  tipo?: string
}

function formatFecha(fecha: Date): string {
  return new Date(fecha).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'America/Santiago',
  })
}

export default function CarruselDestacados({ eventos }: { eventos: Evento[] }) {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)

  // Medir el contenedor para calcular transformaciones en píxeles
  useEffect(() => {
    const medir = () => {
      if (containerRef.current) setContainerW(containerRef.current.offsetWidth)
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? eventos.length - 1 : c - 1))
    setIsAutoPlaying(false)
  }, [eventos.length])

  const next = useCallback(() => {
    setCurrent((c) => (c === eventos.length - 1 ? 0 : c + 1))
    setIsAutoPlaying(false)
  }, [eventos.length])

  useEffect(() => {
    if (!isAutoPlaying || eventos.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((c) => (c === eventos.length - 1 ? 0 : c + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, eventos.length])

  if (eventos.length === 0) return null

  // ── Cálculo del carrusel peek ──────────────────────────────
  // Con 1 evento: card al 26.88% centrado (-30% adicional)
  // Con 2+ eventos: card al 21.504% → más laterales visibles (-30% adicional)
  const GAP = 12
  const CARD_RATIO = eventos.length === 1 ? 0.2688 : 0.21504
  const cardWidth = containerW * CARD_RATIO
  // Para centrar el card `current`:
  // translateX = (containerW - cardWidth)/2 - current*(cardWidth+GAP)
  const sideSpace = (containerW - cardWidth) / 2
  const translateX = containerW > 0
    ? sideSpace - current * (cardWidth + GAP)
    : 0

  return (
    <section className="pb-10 perspective relative">
      {/* Header mejorado */}
      <div className="flex items-center gap-2 mb-6 px-4 max-w-5xl mx-auto">
        <span className="text-3xl animate-bounce">⭐</span>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-jungle block mb-0.5">
            {eventos.length > 1 ? 'Eventos destacados' : 'Evento destacado'}
          </span>
          <div className="h-0.5 w-12 bg-gradient-to-r from-yellow-400 to-transparent rounded-full" />
        </div>
        {eventos.length > 1 && (
          <span className="ml-auto text-xs text-zinc-400 font-mono bg-black/50 px-3 py-1 rounded-full border border-yellow-400/30">
            {current + 1} / {eventos.length}
          </span>
        )}
      </div>

      {/* Pista del carrusel con perspectiva 3D */}
      <div ref={containerRef} className="overflow-hidden perspective" style={{ perspective: '1000px' }}>
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(.25,.8,.25,1)]"
          style={{
            gap: GAP,
            transform: `translateX(${translateX}px)`,
          }}
        >
          {eventos.map((evento, i) => {
            const agotado = evento.cuposDisponibles <= 0
            const isActive = i === current
            return (
              <div
                key={evento.id}
                className="flex-shrink-0 transition-all duration-500"
                style={{
                  width: cardWidth || '65%',
                  opacity: isActive ? 1 : 0.35,
                  transform: isActive ? 'scale(1)' : 'scale(0.88)',
                  transformOrigin: 'center',
                  filter: isActive ? 'none' : 'brightness(0.55)',
                }}
                onClick={() => {
                  if (!isActive) {
                    setCurrent(i)
                    setIsAutoPlaying(false)
                  }
                }}
              >
                <Link
                  href={agotado ? '#' : `/${evento.slug}`}
                  className={`group block relative ${agotado || !isActive ? 'pointer-events-none' : ''}`}
                >
                  {/* Flyer 3:4 */}
                  <div
                    className="relative rounded-3xl overflow-hidden bg-black w-full transition-all duration-500"
                    style={{
                      aspectRatio: '3/4',
                      boxShadow: isActive
                        ? '0 0 60px rgba(245,194,0,0.6), 0 0 120px rgba(245,194,0,0.3), 0 24px 60px rgba(0,0,0,0.9), 0 0 0 3px rgba(245,194,0,0.3)'
                        : '0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,194,0,0.1)',
                      border: isActive ? '2px solid rgba(245,194,0,0.3)' : '1px solid rgba(245,194,0,0.05)',
                    }}
                  >
                    {evento.imagenUrl ? (
                      <Image
                        src={evento.imagenUrl}
                        alt={evento.nombre}
                        fill
                        quality={90}
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 640px) 80vw, 500px"
                        priority={i === 0}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                        <span className="font-display text-3xl text-primary/20 tracking-widest">LIVING</span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1">
                      {evento.tipo === 'cumpleanos' && (
                        <span className="bg-purple-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          🔒 Privado
                        </span>
                      )}
                      {agotado ? (
                        <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Agotado
                        </span>
                      ) : (
                        <span className="bg-primary text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {evento.cuposDisponibles} cupos
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 truncate">
                        {evento.lugar}
                      </p>
                      <h2 className="font-display text-sm text-white tracking-wide uppercase leading-tight mb-1 line-clamp-2">
                        {evento.nombre}
                      </h2>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-300 mb-2.5">
                        <span>📅</span>
                        <span className="capitalize truncate">{formatFecha(evento.fecha)}</span>
                      </div>
                      {isActive && !agotado && (
                        <span className="inline-block bg-primary text-black font-display text-xs py-1.5 px-3 rounded-lg tracking-wider uppercase">
                          Ver invitación →
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dots + flechas mejoradas */}
      {eventos.length > 1 && (
        <div className="flex items-center justify-center gap-6 mt-7 px-4">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-400/50 flex items-center justify-center text-yellow-300 hover:text-yellow-200 hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-500/30 transition-all text-xl font-bold group"
            aria-label="Anterior"
          >
            <span className="group-hover:scale-125 transition-transform">‹</span>
          </button>

          <div className="flex gap-2.5 items-center p-1.5 rounded-full bg-black/70 border border-yellow-400/20">
            {eventos.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setIsAutoPlaying(false) }}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === current 
                    ? 'w-7 h-2.5 bg-gradient-to-r from-yellow-400 to-yellow-300 shadow-lg shadow-yellow-500/50' 
                    : 'w-2 h-2 bg-zinc-600 hover:bg-zinc-500'
                }`}
                aria-label={`Ir al evento ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-400/50 flex items-center justify-center text-yellow-300 hover:text-yellow-200 hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-500/30 transition-all text-xl font-bold group"
            aria-label="Siguiente"
          >
            <span className="group-hover:scale-125 transition-transform">›</span>
          </button>
        </div>
      )}
    </section>
  )
}
