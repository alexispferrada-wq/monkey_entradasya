'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Lugar = 'GENERAL' | 'VIP' | 'OPEN'

const LUGARES: { id: Lugar; label: string; sub: string; precio: number; emoji: string }[] = [
  { id: 'GENERAL', label: 'Modalidad General', sub: 'Evento abierto · Gratis', precio: 0, emoji: '🎉' },
  { id: 'VIP',     label: 'Modalidad VIP', sub: 'Acceso preferente · $10.000', precio: 10000, emoji: '🔥' },
  { id: 'OPEN',    label: 'Modalidad Open', sub: 'Formato flexible · Gratis', precio: 0, emoji: '✨' },
]


export default function CumpleanosForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [lugar, setLugar] = useState<Lugar>('GENERAL')
  const [form, setForm] = useState({
    organizadorNombre:   '',
    organizadorEmail:    '',
    organizadorTelefono: '',
    cumpleañeroNombre:   '',
    edad:                '',
    cantidadInvitados:   '',
    fecha:               '',
    hora:                '21:00',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const edad = parseInt(form.edad)
    const cantidadInvitados = parseInt(form.cantidadInvitados)

    if (isNaN(edad) || edad < 1) { setError('Ingresa una edad válida.'); return }
    if (isNaN(cantidadInvitados) || cantidadInvitados < 1) { setError('Ingresa una cantidad de invitados válida.'); return }

    setLoading(true)

    try {
      const res = await fetch('/api/cumpleanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizadorNombre:   form.organizadorNombre.trim(),
          organizadorEmail:    form.organizadorEmail.trim().toLowerCase(),
          organizadorTelefono: form.organizadorTelefono.trim(),
          cumpleañeroNombre:   form.cumpleañeroNombre.trim(),
          edad,
          cantidadInvitados,
          lugar,
          fecha: form.fecha,
          hora:  form.hora,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error. Intenta de nuevo.')
        setLoading(false)
        return
      }

      router.push(`/cumpleanos/confirmado?slug=${data.slug}`)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  const lugarInfo = LUGARES.find(l => l.id === lugar)!

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Datos del cumpleañero */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">🎂 El cumpleañero/a</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del cumpleañero/a</label>
            <input
              type="text" required value={form.cumpleañeroNombre}
              onChange={e => set('cumpleañeroNombre', e.target.value)}
              placeholder="Ej: María González"
              className="input-glass"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Edad que cumple</label>
            <input
              type="number" required min="1" max="120" value={form.edad}
              onChange={e => set('edad', e.target.value)}
              placeholder="25"
              className="input-glass"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Cantidad de invitados</label>
            <input
              type="number" required min="1" max="500" value={form.cantidadInvitados}
              onChange={e => set('cantidadInvitados', e.target.value)}
              placeholder="30"
              className="input-glass"
            />
            <p className="text-zinc-600 text-xs mt-1">Máximo de cupos disponibles para el evento</p>
          </div>
        </div>
      </div>

      {/* Lugar */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">📍 Elige el lugar</h2>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Sector del evento</label>
          <select
            className="input-glass w-full"
            value={lugar}
            onChange={e => setLugar(e.target.value as Lugar)}
          >
            {LUGARES.map(l => (
              <option key={l.id} value={l.id}>
                {l.emoji} {l.label} — {l.sub}{l.id === 'GENERAL' ? ' ⭐ Recomendado' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Info del sector seleccionado */}
        <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
          lugarInfo.precio > 0
            ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
            : lugar === 'GENERAL'
              ? 'border-primary/30 bg-primary/5 text-primary'
              : 'border-green-500/30 bg-green-500/5 text-green-400'
        }`}>
          <span className="text-lg shrink-0">{lugarInfo.emoji}</span>
          <div>
            <p className="font-bold">{lugarInfo.label}</p>
            <p className="text-xs mt-0.5 opacity-80">
              {lugar === 'GENERAL' && 'Acceso general para evento privado.'}
              {lugar === 'VIP' && 'Acceso preferente con consumo mínimo de $10.000 por persona.'}
              {lugar === 'OPEN' && 'Formato flexible según tipo de evento.'}
            </p>
          </div>
        </div>
      </div>

      {/* Fecha y hora */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">📅 Fecha y hora</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Fecha del evento</label>
            <input
              type="date" required value={form.fecha}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => set('fecha', e.target.value)}
              className="input-glass"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Hora de inicio</label>
            <input
              type="time" required value={form.hora}
              onChange={e => set('hora', e.target.value)}
              className="input-glass"
            />
          </div>
        </div>
      </div>

      {/* Datos del organizador */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">👤 Tus datos (organizador/a)</h2>
        <p className="text-zinc-500 text-xs">Te enviaremos la clave del evento y el enlace a este correo.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre y apellidos</label>
            <input
              type="text" required value={form.organizadorNombre}
              onChange={e => set('organizadorNombre', e.target.value)}
              placeholder="Ej: Juan Pérez González"
              className="input-glass"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Teléfono</label>
            <input
              type="tel" required value={form.organizadorTelefono}
              onChange={e => set('organizadorTelefono', e.target.value)}
              placeholder="+56 9 1234 5678"
              className="input-glass"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Correo electrónico</label>
            <input
              type="email" required value={form.organizadorEmail}
              onChange={e => set('organizadorEmail', e.target.value)}
              placeholder="tu@correo.com"
              className="input-glass"
            />
            <p className="text-zinc-600 text-xs mt-1">La clave del evento llegará a este correo</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm">
          ❌ {error}
        </div>
      )}

      <button
        type="submit" disabled={loading}
        className="w-full min-h-[52px] py-3 px-4 rounded-xl font-black text-black bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base tracking-wider uppercase active:scale-[0.99]"
      >
        {loading ? 'Creando tu evento...' : '🎂 Crear mi evento de cumpleaños →'}
      </button>

      <p className="text-zinc-600 text-xs text-center leading-relaxed">
        Al solicitar el evento aceptas nuestros términos. Por razones de seguridad y control, en el ingreso al local se podría solicitar carnet de identidad a los asistentes para verificar su identidad.
      </p>
    </form>
  )
}
