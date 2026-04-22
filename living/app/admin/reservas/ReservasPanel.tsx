'use client'

import { useState } from 'react'
import type { Reserva } from '@/lib/db/schema'

const TIPO_LABEL: Record<string, { label: string; emoji: string; color: string }> = {
  terraza:    { label: 'Acceso general', emoji: '🎟️', color: '#22c55e' },
  grill:      { label: 'Acceso VIP',     emoji: '🔥', color: '#F5C200' },
  cumpleanos: { label: 'Cumpleaños',    emoji: '🎂', color: '#a855f7' },
}

const ESTADO_LABEL: Record<string, { label: string; color: string }> = {
  pendiente:          { label: 'Pendiente',           color: '#6b7280' },
  comprobante_subido: { label: 'Comprobante subido',  color: '#F5C200' },
  aprobada:           { label: 'Aprobada ✓',          color: '#22c55e' },
  rechazada:          { label: 'Rechazada',           color: '#ef4444' },
}

interface Props {
  reservasIniciales: Reserva[]
}

export default function ReservasPanel({ reservasIniciales }: Props) {
  const [reservas, setReservas]     = useState(reservasIniciales)
  const [filtro,   setFiltro]       = useState<string>('pendiente,comprobante_subido')
  const [modal,    setModal]        = useState<Reserva | null>(null)
  const [notas,    setNotas]        = useState('')
  const [loading,  setLoading]      = useState(false)
  const [imgModal, setImgModal]     = useState<string | null>(null)

  const filtroEstados = filtro === 'todos' ? null : filtro.split(',')

  const lista = reservas.filter(r =>
    !r.deletedAt && (filtroEstados ? filtroEstados.includes(r.estado) : true)
  )

  async function procesar(id: string, accion: 'aprobar' | 'rechazar') {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reservas/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ accion, adminNotas: notas || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'Error'); return }

      setReservas(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, estado: data.estado, adminAt: new Date(), eventoId: data.eventoId ?? r.eventoId }
            : r
        )
      )
      setModal(null)
      setNotas('')
    } catch {
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar esta reserva?')) return
    await fetch(`/api/admin/reservas/${id}`, { method: 'DELETE' })
    setReservas(prev => prev.filter(r => r.id !== id))
  }

  const pendientes = reservas.filter(r => !r.deletedAt && (r.estado === 'pendiente' || r.estado === 'comprobante_subido')).length

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { k: 'pendiente,comprobante_subido', label: 'Por revisar',   n: reservas.filter(r => !r.deletedAt && ['pendiente','comprobante_subido'].includes(r.estado)).length,  color: '#F5C200' },
          { k: 'aprobada',   label: 'Aprobadas',     n: reservas.filter(r => !r.deletedAt && r.estado === 'aprobada').length,   color: '#22c55e' },
          { k: 'rechazada',  label: 'Rechazadas',    n: reservas.filter(r => !r.deletedAt && r.estado === 'rechazada').length,  color: '#ef4444' },
          { k: 'todos',      label: 'Total',          n: reservas.filter(r => !r.deletedAt).length, color: '#6b7280' },
        ].map(s => (
          <button
            key={s.k}
            onClick={() => setFiltro(s.k)}
            className={`glass-card rounded-xl p-4 text-center transition-all ${filtro === s.k ? 'border-primary/40' : 'border-white/8 hover:border-white/20'}`}
          >
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.n}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {pendientes > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 mb-5 text-yellow-400 text-sm font-medium">
          ⚠️ Tienes <strong>{pendientes}</strong> reserva{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''} de revisión.
        </div>
      )}

      {lista.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">No hay reservas en esta categoría.</div>
      ) : (
        <div className="space-y-3">
          {lista.map(r => {
            const tipo   = TIPO_LABEL[r.tipo]   ?? { label: r.tipo,   emoji: '?', color: '#6b7280' }
            const estado = ESTADO_LABEL[r.estado] ?? { label: r.estado, color: '#6b7280' }
            return (
              <div key={r.id} className="glass-card rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xl">{tipo.emoji}</span>
                      <span className="font-bold text-white">{r.nombre}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${tipo.color}22`, color: tipo.color }}>
                        {tipo.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${estado.color}22`, color: estado.color }}>
                        {estado.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-400 mb-2">
                      <span>📅 {r.fecha} — {r.hora}</span>
                      <span>👥 {r.personas} persona{r.personas !== 1 ? 's' : ''}</span>
                      <span className="truncate">✉️ {r.email}</span>
                      <span>📞 {r.telefono}</span>
                    </div>

                    {r.nombreEvento && (
                      <p className="text-xs text-purple-400 mb-1">🎂 Evento: <strong>{r.nombreEvento}</strong></p>
                    )}
                    {r.notas && (
                      <p className="text-xs text-zinc-500 italic">"{r.notas}"</p>
                    )}
                    {r.adminNotas && (
                      <p className="text-xs text-zinc-500 mt-1">Nota admin: {r.adminNotas}</p>
                    )}
                    {r.eventoId && (
                      <a href={`/admin/eventos/${r.eventoId}`} className="text-xs text-primary hover:underline mt-1 inline-block">
                        Ver evento creado →
                      </a>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    {r.comprobantePagoUrl && (
                      <button
                        onClick={() => setImgModal(r.comprobantePagoUrl!)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-all"
                      >
                        Ver comprobante
                      </button>
                    )}
                    {(r.estado === 'pendiente' || r.estado === 'comprobante_subido') && (
                      <button
                        onClick={() => { setModal(r); setNotas('') }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all"
                      >
                        Revisar →
                      </button>
                    )}
                    <button
                      onClick={() => eliminar(r.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-zinc-500 hover:border-red-500/30 hover:text-red-400 transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal revisar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-6 border border-white/10" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-1">Revisar reserva</h2>
            <p className="text-zinc-500 text-sm mb-4">
              <strong className="text-white">{modal.nombre}</strong> — {TIPO_LABEL[modal.tipo]?.label} · {modal.fecha} {modal.hora}
            </p>

            {modal.comprobantePagoUrl && (
              <div className="mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={modal.comprobantePagoUrl}
                  alt="Comprobante"
                  className="rounded-xl max-h-48 w-full object-contain bg-black/30 cursor-zoom-in"
                  onClick={() => setImgModal(modal.comprobantePagoUrl!)}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Nota (opcional)</label>
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                rows={2}
                placeholder="Motivo de rechazo o nota de aprobación..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-600 text-sm resize-none focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => procesar(modal.id, 'aprobar')}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-50"
              >
                {loading ? '...' : '✓ Aprobar'}
              </button>
              <button
                onClick={() => procesar(modal.id, 'rechazar')}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                {loading ? '...' : '✗ Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal imagen comprobante */}
      {imgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={() => setImgModal(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgModal} alt="Comprobante" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  )
}
