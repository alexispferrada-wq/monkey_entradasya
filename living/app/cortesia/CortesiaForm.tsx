'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Evento { id: string; nombre: string; fecha: Date }

export default function CortesiaForm({ eventos }: { eventos: Evento[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const body = {
      nombre:   fd.get('nombre') as string,
      email:    fd.get('email') as string,
      telefono: fd.get('telefono') as string,
      cantidad: Number(fd.get('cantidad')),
      mensaje:  fd.get('mensaje') as string || undefined,
      eventoId: fd.get('eventoId') as string || undefined,
    }

    try {
      const res = await fetch('/api/cortesias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al enviar solicitud.')
        return
      }
      router.push('/cortesia/confirmado')
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const formatFecha = (fecha: Date) =>
    new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'short', day: 'numeric', month: 'short',
      timeZone: 'America/Santiago',
    })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Evento */}
      {eventos.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
            Evento <span className="text-zinc-700">(opcional)</span>
          </label>
          <select name="eventoId" className="input-glass">
            <option value="">Sin evento específico</option>
            {eventos.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.nombre} — {formatFecha(ev.fecha)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Nombre */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
          Nombre completo *
        </label>
        <input
          name="nombre"
          type="text"
          required
          placeholder="Tu nombre"
          className="input-glass"
          autoComplete="name"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
          Email *
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="tu@email.com"
          className="input-glass"
          autoComplete="email"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
          WhatsApp / Teléfono *
        </label>
        <input
          name="telefono"
          type="tel"
          required
          placeholder="+56 9 1234 5678"
          className="input-glass"
          autoComplete="tel"
        />
      </div>

      {/* Cantidad */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
          Cantidad de cortesías
        </label>
        <select name="cantidad" className="input-glass" defaultValue="1">
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'entrada' : 'entradas'}</option>
          ))}
        </select>
      </div>

      {/* Mensaje */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
          Mensaje <span className="text-zinc-700">(opcional)</span>
        </label>
        <textarea
          name="mensaje"
          rows={3}
          placeholder="Cuéntanos algo si quieres..."
          className="input-glass resize-none"
          style={{ height: 'auto', minHeight: '80px' }}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full rounded-2xl text-base py-4 disabled:opacity-60"
      >
        {loading ? 'Enviando...' : '🎟 Solicitar Cortesía'}
      </button>

      <p className="text-zinc-700 text-xs text-center">
        Al enviar aceptas que Living Club procese tus datos para gestionar tu solicitud.
      </p>
    </form>
  )
}
