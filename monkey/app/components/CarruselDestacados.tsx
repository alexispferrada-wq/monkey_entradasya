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
  // Con 1 evento: card al 85% centrado (no se ve nada de los lados)
  // Con 2+ eventos: card al 65% → 17.5% de peek en cada lado
  const GAP = 12
  const CARD_RATIO = eventos.length === 1 ? 0.85 : 0.65
  const cardWidth = containerW * CARD_RATIO
  // Para centrar el card `current`:
  // translateX = (containerW - cardWidth)/2 - current*(cardWidth+GAP)
  const sideSpace = (containerW - cardWidth) / 2
  const translateX = containerW > 0
    ? sideSpace - current * (cardWidth + GAP)
    : 0

  return (
    <section className="pb-10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 px-4 max-w-5xl mx-auto">
        <span className="text-primary text-lg">⭐</span>
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          {eventos.length > 1 ? 'Eventos destacados' : 'Evento destacado'}
        </span>
        {eventos.length > 1 && (
          <span className="ml-auto text-xs text-zinc-500 font-mono">
            {current + 1} / {eventos.length}
          </span>
        )}
      </div>

      {/* Pista del carrusel */}
      <div ref={containerRef} className="overflow-hidden">
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
                  className={`group block ${agotado || !isActive ? 'pointer-events-none' : ''}`}
                >
                  {/* Flyer 3:4 */}
                  <div
                    className="relative rounded-3xl overflow-hidden bg-black w-full transition-shadow duration-500"
                    style={{
                      aspectRatio: '3/4',
                      boxShadow: isActive
                        ? '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,194,0,0.15)'
                        : 'none',
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
                        <span className="font-display text-6xl text-primary/20 tracking-widest">MONKEY</span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
                      {evento.tipo === 'cumpleanos' && (
                        <span className="bg-purple-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                          🔒 Privado
                        </span>
                      )}
                      {agotado ? (
                        <span className="bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                          Agotado
                        </span>
                      ) : (
                        <span className="bg-primary text-black text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                          {evento.cuposDisponibles} cupos
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                        {evento.lugar}
                      </p>
                      <h2 className="font-display text-2xl text-white tracking-wide uppercase leading-tight mb-2">
                        {evento.nombre}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-zinc-300 mb-4">
                        <span>📅</span>
                        <span className="capitalize">{formatFecha(evento.fecha)}</span>
                      </div>
                      {isActive && !agotado && (
                        <span className="inline-block bg-primary text-black font-display text-sm py-2.5 px-6 rounded-xl tracking-wider uppercase">
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

      {/* Dots + flechas */}
      {eventos.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-5 px-4">
          <button
            onClick={prev}
            className="w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all text-lg"
            aria-label="Anterior"
          >
            ‹
          </button>

          <div className="flex gap-2">
            {eventos.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setIsAutoPlaying(false) }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-primary' : 'w-1.5 bg-zinc-600'
                }`}
                aria-label={`Ir al evento ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all text-lg"
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      )}
    </section>
  )
}
