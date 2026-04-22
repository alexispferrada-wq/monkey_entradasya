'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'


export default function NormalForm() {
  const router = useRouter()
  const [sector, setSector] = useState<'general' | 'preferente'>('general')
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha: '',
    hora: '',
    personas: '2',
    notas: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.apellido.trim()) {
      setError('Ingresa tu nombre y apellido.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'terraza',
        nombre: `${form.nombre.trim()} ${form.apellido.trim()}`,
        email: form.email,
        telefono: form.telefono,
        fecha: form.fecha,
        hora: form.hora,
        personas: parseInt(form.personas, 10),
        notas: [
          sector === 'preferente' ? 'Preferencia: acceso preferente.' : '',
          form.notas.trim(),
        ].filter(Boolean).join(' ') || undefined,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Error al enviar la reserva.')
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h2 className="font-display text-2xl text-white uppercase tracking-wide">
          ¡Reserva confirmada!
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Tu reserva está confirmada. Te enviamos un correo con los detalles.
          Recuerda llegar con al menos 15 minutos de anticipación.
        </p>
        <button
          onClick={() => router.push('/')}
          className="btn-primary w-full mt-2"
        >
          Volver al inicio
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* 15-min warning */}
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <span className="text-xl shrink-0">⏰</span>
        <p className="text-amber-300 text-sm leading-relaxed">
          <strong>Importante:</strong> Las reservas se mantienen hasta 15 minutos
          después de la hora acordada. Llegando tarde la mesa puede ser liberada.
        </p>
      </div>

      {/* Nombre + Apellido */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
            Nombre
          </label>
          <input
            type="text"
            required
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Juan"
            className="input-glass w-full"
            autoComplete="given-name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
            Apellido
          </label>
          <input
            type="text"
            required
            value={form.apellido}
            onChange={(e) => set('apellido', e.target.value)}
            placeholder="García"
            className="input-glass w-full"
            autoComplete="family-name"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
          Correo electrónico
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="juan@correo.com"
          className="input-glass w-full"
          autoComplete="email"
          inputMode="email"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
          Teléfono / WhatsApp
        </label>
        <input
          type="tel"
          required
          value={form.telefono}
          onChange={(e) => set('telefono', e.target.value)}
          placeholder="+56 9 1234 5678"
          className="input-glass w-full"
          autoComplete="tel"
          inputMode="tel"
        />
      </div>

      {/* Fecha + Hora */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
            Fecha
          </label>
          <input
            type="date"
            required
            value={form.fecha}
            onChange={(e) => set('fecha', e.target.value)}
            className="input-glass w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
            Hora
          </label>
          <input
            type="time"
            required
            value={form.hora}
            onChange={(e) => set('hora', e.target.value)}
            className="input-glass w-full"
          />
        </div>
      </div>

      {/* Sector */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">
          Tipo de acceso <span className="normal-case text-zinc-600">(opcional)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSector('general')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
              sector === 'general'
                ? 'border-green-500/60 bg-green-500/10 text-green-400'
                : 'border-white/10 text-zinc-500 hover:border-white/20'
            }`}
          >
            <span className="text-xl">🌿</span>
            <span>General</span>
            <span className="font-semibold text-green-400/70 text-[10px]">Sin preferencia</span>
          </button>
          <button
            type="button"
            onClick={() => setSector('preferente')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
              sector === 'preferente'
                ? 'border-primary/60 bg-primary/10 text-primary'
                : 'border-white/10 text-zinc-500 hover:border-white/20'
            }`}
          >
            <span className="text-xl">🍸</span>
            <span>Preferente</span>
            <span className="font-semibold text-primary/70 text-[10px]">Sujeto a disponibilidad</span>
          </button>
        </div>
      </div>

      {/* Personas */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
          Número de personas
        </label>
        <input
          type="number"
          required
          min="1"
          max="20"
          value={form.personas}
          onChange={(e) => set('personas', e.target.value)}
          className="input-glass w-full"
          inputMode="numeric"
        />
      </div>

      {/* Notas */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
          Notas adicionales <span className="normal-case text-zinc-600">(opcional)</span>
        </label>
        <textarea
          value={form.notas}
          onChange={(e) => set('notas', e.target.value)}
          placeholder="Alguna petición especial, alergias, etc."
          className="input-glass w-full resize-none"
          rows={3}
        />
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? 'Enviando reserva...' : 'Confirmar reserva gratuita'}
      </button>
    </form>
  )
}
