'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'


export default function GrillForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
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
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [comprobanteUrl, setComprobanteUrl] = useState('')
  const [comprobantePublicId, setComprobantePublicId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadState('uploading')
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setUploadState('error')
        setError(data.error || 'Error al subir imagen.')
        return
      }
      setComprobanteUrl(data.url)
      setComprobantePublicId(data.publicId)
      setUploadState('done')
    } catch {
      setUploadState('error')
      setError('Error de conexión al subir la imagen.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.apellido.trim()) {
      setError('Ingresa tu nombre y apellido.')
      return
    }
    if (uploadState === 'uploading') {
      setError('Espera a que termine de subir el comprobante.')
      return
    }
    if (!comprobanteUrl) {
      setError('Debes adjuntar el comprobante de pago ($10.000).')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'grill',
        nombre: `${form.nombre.trim()} ${form.apellido.trim()}`,
        email: form.email,
        telefono: form.telefono,
        fecha: form.fecha,
        hora: form.hora,
        personas: parseInt(form.personas, 10),
        notas: form.notas,
        comprobantePagoUrl: comprobanteUrl,
        comprobantePublicId,
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
        <div className="text-5xl">🔥</div>
        <h2 className="font-display text-2xl text-white uppercase tracking-wide">
          ¡Solicitud enviada!
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Recibimos tu comprobante. Nuestro equipo lo revisará y te confirmaremos
          por correo a la brevedad.
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

      {/* Payment info */}
      <div className="flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-xl p-4">
        <span className="text-xl shrink-0">💳</span>
        <div>
          <p className="text-primary text-sm font-bold mb-0.5">Consumo mínimo: $10.000</p>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Transfiérelo a nombre de <strong className="text-zinc-300">Living Club</strong> y
            adjunta el comprobante abajo. El equipo lo revisará y confirmará tu reserva.
          </p>
        </div>
      </div>

      {/* 15-min warning */}
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
        <span className="text-lg shrink-0">⏰</span>
        <p className="text-amber-300 text-xs leading-relaxed">
          Reservas no presentadas dentro de 15 minutos de la hora acordada pueden ser liberadas.
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

      {/* Comprobante */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
          Comprobante de pago <span className="text-rose-400">*</span>
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`w-full rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
            uploadState === 'done'
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-primary/40 bg-primary/5 hover:bg-primary/10'
          }`}
        >
          {uploadState === 'uploading' && (
            <span className="text-primary text-sm">Subiendo comprobante...</span>
          )}
          {uploadState === 'done' && (
            <span className="text-green-400 text-sm font-bold">✓ Comprobante adjunto</span>
          )}
          {(uploadState === 'idle' || uploadState === 'error') && (
            <div className="space-y-1">
              <div className="text-2xl">📎</div>
              <p className="text-primary text-sm font-medium">Toca para subir comprobante</p>
              <p className="text-zinc-500 text-xs">JPG, PNG o PDF</p>
            </div>
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className="hidden"
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
          placeholder="Alguna petición especial, ocasión especial, etc."
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
        {loading ? 'Enviando solicitud...' : 'Enviar solicitud VIP →'}
      </button>
    </form>
  )
}
