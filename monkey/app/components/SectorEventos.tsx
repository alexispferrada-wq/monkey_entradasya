'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Evento } from '@/lib/db/schema'

const SECTORES = [
  { key: 'MONKEY LOUNGE',  label: 'MONKEY LOUNGE ← 1 PISO',           emoji: '🍸' },
  { key: 'MONKEY GRILL',   label: 'MONKEY GRILL ← 2 PISO',            emoji: '🔥' },
  { key: 'TERRAZA',        label: 'TERRAZA SECTOR FUMADORES',       emoji: '🏖️🚬' },
]

function formatFecha(fecha: Date): string {
  return new Date(fecha).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'America/Santiago',
  })
}

function matchesSector(lugar: string, sectorKey: string) {
  if (!lugar) return false
  const l = lugar.toUpperCase().trim()
  const s = sectorKey.toUpperCase().trim()
  if (l === s) return true
  if (s === 'MONKEY LOUNGE' && (l.includes('LOUNGE') || l.includes('SALÓN') || l.includes('SALON'))) return true
  if (s === 'MONKEY GRILL' && l.includes('GRILL')) return true
  if (s === 'TERRAZA' && l.includes('TERRAZA')) return true
  return false
}

interface Props {
  eventos: Evento[]
}

function EventoCard({ evento }: { evento: Evento }) {
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
      <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '9/16' }}>
        {evento.imagenUrl ? (
          <Image
            src={evento.imagenUrl}
            alt={evento.nombre}
            fill
            quality={85}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
            <span className="font-display text-4xl text-primary/20 tracking-widest">MONKEY</span>
          </div>
        )}

        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1.5">
          {evento.tipo === 'cumpleanos' && (
            <span className="bg-purple-600/90 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide shadow-lg">
              🔒 Privado
            </span>
          )}
          {agotado ? (
            <span className="bg-red-600/90 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide shadow-lg">
              Agotado
            </span>
          ) : (
            <span className="bg-primary text-black text-xs font-black px-2 py-1 rounded-full uppercase tracking-wide shadow-lg">
              {evento.cuposDisponibles} cupos
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 z-10 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-6">
          <h2 className="font-display text-sm sm:text-base text-white tracking-wide uppercase leading-tight mb-1 line-clamp-2">
            {evento.nombre}
          </h2>
          <div className="flex items-center gap-1 text-xs text-zinc-400 mb-2">
            <span className="text-primary shrink-0">📅</span>
            <span className="capitalize truncate leading-tight">{formatFecha(evento.fecha)}</span>
          </div>
          <div className="mb-2.5">
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
          <div className={`w-full text-center font-display text-xs sm:text-sm py-2 px-2 rounded-xl tracking-wide uppercase min-h-[36px] flex items-center justify-center ${
            agotado ? 'bg-zinc-800/70 text-zinc-600' : 'bg-primary text-black'
          }`}>
            {agotado ? 'Sin cupos' : 'Ver invitación →'}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function SectorEventos({ eventos }: Props) {
  const [sectorActivo, setSectorActivo] = useState<string | null>(null)

  // Todos los eventos (regulares + cumpleaños) se muestran dentro del sector
  const eventosFiltrados = sectorActivo
    ? eventos.filter((e) => matchesSector(e.lugar, sectorActivo))
    : []

  return (
    <div className="space-y-6">

      {/* ── Selector de sectores ─────────────────────────────── */}
      {eventos.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {SECTORES.map((s) => {
              const count = eventos.filter((e) => matchesSector(e.lugar, s.key)).length
              const activo = sectorActivo === s.key
              return (
                <button
                  key={s.key}
                  onClick={() => setSectorActivo(activo ? null : s.key)}
                  className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 min-h-[56px] rounded-2xl font-bold text-sm tracking-wide uppercase transition-all duration-200 border active:scale-[0.98] ${
                    activo
                      ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20'
                      : 'bg-white/5 text-zinc-300 border-white/10 hover:border-primary/40 hover:text-white'
                  }`}
                >
                  <span className="text-xl shrink-0">{s.emoji}</span>
                  <span className="leading-tight text-left text-xs sm:text-sm">
                    {s.label}
                    {count > 0 && (
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-black ${
                        activo ? 'bg-black/20' : 'bg-primary/20 text-primary'
                      }`}>
                        {count}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {sectorActivo && (
            <div className="animate-slide-up">
              {eventosFiltrados.length === 0 ? (
                <div className="text-center py-12 glass-card rounded-2xl">
                  <p className="text-zinc-500">No hay eventos activos en este sector.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {eventosFiltrados.map((evento) => (
                    <EventoCard key={evento.id} evento={evento} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
