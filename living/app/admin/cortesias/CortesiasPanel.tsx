'use client'

import { useState } from 'react'
import type { Cortesia } from '@/lib/db/schema'

type Item    = Cortesia & { eventoNombre: string | null }
type Evento  = { id: string; nombre: string; fecha: Date }

const ESTADO_COLOR: Record<string, string> = {
  pendiente: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  aprobada:  'text-green-400 border-green-500/30 bg-green-500/10',
  rechazada: 'text-red-400 border-red-500/30 bg-red-500/10',
  usada:     'text-zinc-500 border-zinc-700 bg-zinc-800/50',
}

const FILTROS = ['todos', 'pendiente', 'aprobada', 'rechazada'] as const

const formatFecha = (d: Date) =>
  new Date(d).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })

const formatEvento = (d: Date) =>
  new Date(d).toLocaleDateString('es-CL', {
    weekday: 'short', day: 'numeric', month: 'short',
    timeZone: 'America/Santiago',
  })

export default function CortesiasPanel({
  lista,
  eventos,
}: {
  lista: Item[]
  eventos: Evento[]
}) {
  const [items, setItems]         = useState(lista)
  const [filtro, setFiltro]       = useState<typeof FILTROS[number]>('todos')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [notasMap, setNotasMap]   = useState<Record<string, string>>({})

  // ── Formulario nueva cortesía ──────────────────────────────
  const [showForm, setShowForm]     = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError]   = useState('')
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', cantidad: 1,
    eventoId: '', mensaje: '',
  })

  async function crearCortesia(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      const res = await fetch('/api/cortesias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          eventoId: form.eventoId || undefined,
          mensaje:  form.mensaje  || undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setFormError(d.error ?? 'Error al crear.')
        return
      }
      // Aprobar automáticamente
      const { id } = await res.json()
      const res2 = await fetch(`/api/admin/cortesias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'aprobar', adminNotas: 'Creada y aprobada desde admin' }),
      })
      if (res2.ok) {
        // Recargar para mostrar el nuevo item
        window.location.reload()
      }
    } catch {
      setFormError('Error de conexión.')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Aprobar / rechazar ─────────────────────────────────────
  async function accionar(id: string, accion: 'aprobar' | 'rechazar') {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/cortesias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion, adminNotas: notasMap[id] }),
      })
      if (res.ok) {
        setItems(prev => prev.map(i =>
          i.id === id
            ? { ...i, estado: accion === 'aprobar' ? 'aprobada' : 'rechazada', adminAt: new Date() }
            : i
        ))
      }
    } finally {
      setLoadingId(null)
    }
  }

  const filtrados = filtro === 'todos' ? items : items.filter(i => i.estado === filtro)

  return (
    <div className="space-y-6">

      {/* ── Botón nueva cortesía ─────────────────────────────── */}
      <button
        onClick={() => setShowForm(v => !v)}
        className="btn-primary rounded-xl px-5 py-2.5 text-sm"
      >
        {showForm ? '✕ Cancelar' : '+ Nueva Cortesía'}
      </button>

      {/* ── Formulario crear cortesía ─────────────────────────── */}
      {showForm && (
        <form onSubmit={crearCortesia} className="ticket-card rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg text-white tracking-widest uppercase mb-2">
            Nueva Cortesía
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Nombre *</label>
              <input
                required
                type="text"
                placeholder="Nombre completo"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                className="input-glass"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Email *</label>
              <input
                required
                type="email"
                placeholder="email@ejemplo.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-glass"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Teléfono *</label>
              <input
                required
                type="tel"
                placeholder="+56 9 1234 5678"
                value={form.telefono}
                onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                className="input-glass"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Cantidad</label>
              <select
                value={form.cantidad}
                onChange={e => setForm(f => ({ ...f, cantidad: Number(e.target.value) }))}
                className="input-glass"
              >
                {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Evento</label>
              <select
                value={form.eventoId}
                onChange={e => setForm(f => ({ ...f, eventoId: e.target.value }))}
                className="input-glass"
              >
                <option value="">Sin evento específico</option>
                {eventos.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.nombre} — {formatEvento(ev.fecha)}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Nota interna</label>
              <input
                type="text"
                placeholder="Razón o referencia (opcional)"
                value={form.mensaje}
                onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                className="input-glass"
              />
            </div>
          </div>

          {formError && <p className="text-red-400 text-sm">{formError}</p>}

          <button
            type="submit"
            disabled={formLoading}
            className="btn-primary w-full rounded-xl py-3 text-sm disabled:opacity-60"
          >
            {formLoading ? 'Creando...' : '🎟 Crear y aprobar cortesía'}
          </button>
          <p className="text-zinc-700 text-xs">La cortesía se crea y aprueba automáticamente — el QR queda disponible de inmediato.</p>
        </form>
      )}

      {/* ── Filtros ───────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {FILTROS.map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
              filtro === f
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                : 'border-white/8 text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {f}{f !== 'todos' && ` (${items.filter(i => i.estado === f).length})`}
          </button>
        ))}
      </div>

      {/* ── Lista ─────────────────────────────────────────────── */}
      {filtrados.length === 0 && (
        <div className="text-center py-16 text-zinc-600 text-sm">
          No hay cortesías en este estado.
        </div>
      )}

      {filtrados.map(item => (
        <div key={item.id} className="ticket-card rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold">{item.nombre}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${ESTADO_COLOR[item.estado]}`}>
                  {item.estado}
                </span>
                <span className="text-zinc-600 text-xs">
                  {item.cantidad} {item.cantidad === 1 ? 'entrada' : 'entradas'}
                </span>
              </div>
              <p className="text-zinc-400 text-sm">{item.email} · {item.telefono}</p>
              {item.eventoNombre && (
                <p className="text-xs" style={{ color:'#FFB800' }}>🎭 {item.eventoNombre}</p>
              )}
              {item.mensaje && (
                <p className="text-zinc-500 text-xs italic">"{item.mensaje}"</p>
              )}
              <p className="text-zinc-700 text-xs">{formatFecha(item.createdAt)}</p>
            </div>

            {item.estado === 'aprobada' && item.qrImageUrl && (
              <img src={item.qrImageUrl} alt="QR" className="w-16 h-16 rounded-lg shrink-0" />
            )}
          </div>

          {item.estado === 'pendiente' && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <input
                type="text"
                placeholder="Nota interna (opcional)"
                value={notasMap[item.id] ?? ''}
                onChange={e => setNotasMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                className="input-glass text-sm !min-h-0 py-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => accionar(item.id, 'aprobar')}
                  disabled={loadingId === item.id}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest text-black transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background:'linear-gradient(135deg,#FFB800,#FF5A1F)' }}
                >
                  {loadingId === item.id ? '...' : '✓ Aprobar'}
                </button>
                <button
                  onClick={() => accionar(item.id, 'rechazar')}
                  disabled={loadingId === item.id}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all disabled:opacity-50"
                >
                  ✕ Rechazar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
