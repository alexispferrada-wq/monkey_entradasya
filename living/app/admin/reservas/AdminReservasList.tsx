'use client'

import { useState } from 'react'
import type { Reserva } from '@/lib/db/schema'

type Tab = 'pendientes' | 'aprobadas' | 'rechazadas'

const TIPO_LABEL: Record<string, string> = {
  terraza:    '🎟️ Acceso General',
  grill:      '🔥 Acceso VIP',
  cumpleanos: '🎂 Cumpleaños',
  show:       '🎫 Show',
}

const ESTADO_STYLE: Record<string, string> = {
  pendiente:          'bg-yellow-500/20 text-yellow-400',
  comprobante_subido: 'bg-blue-500/20 text-blue-400',
  aprobada:           'bg-green-500/20 text-green-400',
  rechazada:          'bg-rose-500/20 text-rose-400',
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente:          'Pendiente',
  comprobante_subido: 'Con comprobante',
  aprobada:           'Aprobada',
  rechazada:          'Rechazada',
}

function formatFecha(fecha: string, hora: string) {
  return `${fecha} — ${hora} hrs`
}

function ReservaCard({
  reserva,
  onEstado,
  loading,
}: {
  reserva: Reserva
  onEstado: (id: string, estado: 'aprobada' | 'rechazada') => void
  loading: string | null
}) {
  const isLoading = loading === reserva.id
  const pendiente = reserva.estado === 'pendiente' || reserva.estado === 'comprobante_subido'

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3 border border-white/10">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-white text-base truncate">{reserva.nombre}</p>
          <p className="text-zinc-500 text-xs truncate">{reserva.email}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${ESTADO_STYLE[reserva.estado]}`}>
            {ESTADO_LABEL[reserva.estado]}
          </span>
          <span className="text-xs text-zinc-500 font-medium">
            {TIPO_LABEL[reserva.tipo] ?? reserva.tipo}
          </span>
        </div>
      </div>

      {/* Nombre del show/evento si aplica */}
      {reserva.nombreEvento && (reserva.tipo === 'show' || reserva.tipo === 'cumpleanos') && (
        <p className="text-xs font-bold text-primary bg-primary/10 rounded-lg px-3 py-1.5">
          {reserva.tipo === 'show' ? '🎫' : '🎂'} {reserva.nombreEvento}
        </p>
      )}

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="text-base">📅</span>
          <span className="text-xs leading-tight">{formatFecha(reserva.fecha, reserva.hora)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="text-base">👥</span>
          <span className="text-xs">{reserva.personas} persona{reserva.personas !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="text-base">📱</span>
          <a
            href={`tel:${reserva.telefono}`}
            className="text-xs text-primary hover:underline"
          >
            {reserva.telefono}
          </a>
        </div>
        {reserva.monto > 0 && (
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-base">💳</span>
            <span className="text-xs text-primary font-bold">
              ${reserva.monto.toLocaleString('es-CL')}
            </span>
          </div>
        )}
      </div>

      {/* Notas */}
      {reserva.notas && (
        <p className="text-xs text-zinc-500 bg-white/5 rounded-lg px-3 py-2 leading-relaxed">
          {reserva.notas}
        </p>
      )}

      {/* Comprobante */}
      {reserva.comprobantePagoUrl && (
        <a
          href={reserva.comprobantePagoUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 rounded-lg px-3 py-2 transition-colors"
        >
          <span>📎</span>
          <span>Ver comprobante de pago</span>
          <span className="ml-auto">→</span>
        </a>
      )}

      {/* Actions */}
      {pendiente && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onEstado(reserva.id, 'rechazada')}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-500/15 text-rose-400 text-sm font-bold hover:bg-rose-500/25 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            ✕ Rechazar
          </button>
          <button
            onClick={() => onEstado(reserva.id, 'aprobada')}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500/15 text-green-400 text-sm font-bold hover:bg-green-500/25 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            ✓ Aprobar
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminReservasList({ reservas: iniciales }: { reservas: Reserva[] }) {
  const [reservas, setReservas] = useState(iniciales)
  const [loading, setLoading] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('pendientes')

  async function handleEstado(id: string, estado: 'aprobada' | 'rechazada') {
    if (!confirm(`¿Marcar como ${estado}?`)) return
    setLoading(id)
    try {
      const res = await fetch(`/api/admin/reservas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setReservas((prev) => prev.map((r) => (r.id === id ? data.reserva : r)))
    } catch {
      alert('Error al actualizar reserva')
    } finally {
      setLoading(null)
    }
  }

  const pendientes  = reservas.filter((r) => r.estado === 'pendiente' || r.estado === 'comprobante_subido')
  const aprobadas   = reservas.filter((r) => r.estado === 'aprobada')
  const rechazadas  = reservas.filter((r) => r.estado === 'rechazada')

  const currentList = tab === 'pendientes' ? pendientes : tab === 'aprobadas' ? aprobadas : rechazadas

  const tabs: { key: Tab; label: string; count: number; color: string }[] = [
    { key: 'pendientes',  label: 'Pendientes',  count: pendientes.length,  color: 'text-yellow-400' },
    { key: 'aprobadas',   label: 'Aprobadas',   count: aprobadas.length,   color: 'text-green-400'  },
    { key: 'rechazadas',  label: 'Rechazadas',  count: rechazadas.length,  color: 'text-rose-400'   },
  ]

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 rounded-2xl p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              tab === t.key
                ? 'bg-zinc-800 text-white shadow'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className={tab === t.key ? t.color : ''}>{t.count}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-sm">
          No hay reservas en esta categoría
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((r) => (
            <ReservaCard
              key={r.id}
              reserva={r}
              onEstado={handleEstado}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
