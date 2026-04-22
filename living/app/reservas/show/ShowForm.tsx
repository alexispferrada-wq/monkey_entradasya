'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'


export type ShowEvento = {
  id: string
  nombre: string
  fechaDisplay: string   // Ej: "sábado 30 de mayo de 2025"
  fechaReserva: string   // 'DD/MM/YYYY' para el API
  precioBase: number
  cuposReserva: number
  cuposRestantes: number // -1 = sin límite
}

export default function ShowForm({ eventos }: { eventos: ShowEvento[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedId, setSelectedId] = useState(eventos[0]?.id ?? '')
  const selectedEvento = eventos.find((e) => e.id === selectedId) ?? eventos[0]

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
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

  const personas = Math.max(1, parseInt(form.personas, 10) || 1)
  const totalMonto = selectedEvento ? selectedEvento.precioBase * personas : 0

  const maxPersonas =
    selectedEvento && selectedEvento.cuposRestantes >= 0
      ? Math.min(20, selectedEvento.cuposRestantes)
      : 20

  const sinCupos =
    selectedEvento &&
    selectedEvento.cuposRestantes >= 0 &&
    selectedEvento.cuposRestantes <= 0

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
        setError(data.error || 'Error al subir la imagen.')
        return
      }
      setComprobanteUrl(data.url)
      setComprobantePublicId(data.publicId)
      setUploadState('done')
    } catch {
      setUploadState('error')
      setError('Error de conexión al subir el comprobante.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEvento) { setError('Selecciona un show para reservar.'); return }
    if (!form.nombre.trim() || !form.apellido.trim()) { setError('Ingresa tu nombre y apellido.'); return }
    if (uploadState === 'uploading') { setError('Espera a que termine de subir el comprobante.'); return }
    if (selectedEvento.precioBase > 0 && !comprobanteUrl) {
      setError(`Debes adjuntar el comprobante de pago ($${totalMonto.toLocaleString('es-CL')}).`)
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'show',
        eventoId: selectedEvento.id,
        nombre: `${form.nombre.trim()} ${form.apellido.trim()}`,
        email: form.email,
        telefono: form.telefono,
        fecha: selectedEvento.fechaReserva,
        hora: form.hora,
        personas,
        notas: form.notas || undefined,
        comprobantePagoUrl: comprobanteUrl || undefined,
        comprobantePublicId: comprobantePublicId || undefined,
        nombreEvento: selectedEvento.nombre,
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

  /* ── Sin shows ─────────────────────────────────────────── */
  if (eventos.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-4">
        <div className="text-4xl">🎫</div>
        <h2 className="font-display text-xl text-white uppercase tracking-wide">
          Sin shows programados
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Próximamente habrá nuevos shows disponibles.<br />
          Síguenos en redes para enterarte primero.
        </p>
        <button onClick={() => router.push('/')} className="btn-primary w-full">
          Volver al inicio
        </button>
      </div>
    )
  }

  /* ── Éxito ──────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-4">
        <div className="text-5xl">🎫</div>
        <h2 className="font-display text-2xl text-white uppercase tracking-wide">
          ¡Solicitud enviada!
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          {selectedEvento?.precioBase > 0
            ? 'Recibimos tu comprobante. El equipo lo revisará y te confirmaremos por correo a la brevedad.'
            : 'Tu reserva para el show fue recibida. Te confirmaremos por correo a la brevedad.'}
        </p>
        <button onClick={() => router.push('/')} className="btn-primary w-full">
          Volver al inicio
        </button>
      </div>
    )
  }

  /* ── Formulario ─────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Selector desplegable de show */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
          Elige el show
        </label>
        <select
          className="input-glass w-full"
          value={selectedId}
          onChange={e => { setSelectedId(e.target.value); setError('') }}
        >
          {eventos.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.nombre} · {ev.fechaDisplay}
              {ev.precioBase > 0 ? ` · $${ev.precioBase.toLocaleString('es-CL')} p/p` : ' · Gratis'}
            </option>
          ))}
        </select>
      </div>

      {/* Info del evento seleccionado */}
      {selectedEvento && (
        <div className="rounded-xl bg-primary/10 border border-primary/30 p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-primary font-bold text-sm leading-snug">{selectedEvento.nombre}</p>
            <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
              selectedEvento.precioBase > 0
                ? 'bg-primary/20 text-primary'
                : 'bg-green-500/20 text-green-400'
            }`}>
              {selectedEvento.precioBase > 0
                ? `$${selectedEvento.precioBase.toLocaleString('es-CL')} p/p`
                : 'Gratis'}
            </span>
          </div>
          <p className="text-zinc-400 text-xs">{selectedEvento.fechaDisplay}</p>
          {selectedEvento.cuposRestantes >= 0 && (
            <p className={`text-xs font-bold mt-1 ${selectedEvento.cuposRestantes < 10 ? 'text-rose-400' : 'text-zinc-500'}`}>
              {selectedEvento.cuposRestantes <= 0
                ? '⚠️ Sin cupos disponibles'
                : `${selectedEvento.cuposRestantes} cupos disponibles`}
            </p>
          )}
        </div>
      )}

      {/* Sin cupos → bloquear form */}
      {sinCupos ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center">
          <p className="text-rose-400 text-sm font-bold">Sin cupos disponibles</p>
          <p className="text-zinc-500 text-xs mt-1">Contáctanos por WhatsApp para consultar alternativas.</p>
        </div>
      ) : (
        <>
          {/* Aviso 15 minutos */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
            <span className="text-lg shrink-0">⏰</span>
            <p className="text-amber-300 text-xs leading-relaxed">
              <strong>Importante:</strong> Las reservas tienen una espera de 15 minutos después
              de la hora acordada. Pasado ese tiempo, la mesa puede ser liberada.
            </p>
          </div>

          {/* Nombre + Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
                Nombre
              </label>
              <input
                type="text" required
                value={form.nombre} onChange={(e) => set('nombre', e.target.value)}
                placeholder="Juan" className="input-glass w-full" autoComplete="given-name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
                Apellido
              </label>
              <input
                type="text" required
                value={form.apellido} onChange={(e) => set('apellido', e.target.value)}
                placeholder="García" className="input-glass w-full" autoComplete="family-name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
              Correo electrónico
            </label>
            <input
              type="email" required
              value={form.email} onChange={(e) => set('email', e.target.value)}
              placeholder="juan@correo.com" className="input-glass w-full"
              autoComplete="email" inputMode="email"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
              Teléfono / WhatsApp
            </label>
            <input
              type="tel" required
              value={form.telefono} onChange={(e) => set('telefono', e.target.value)}
              placeholder="+56 9 1234 5678" className="input-glass w-full"
              autoComplete="tel" inputMode="tel"
            />
          </div>

          {/* Hora de llegada */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
              Hora de llegada estimada
            </label>
            <input
              type="time" required
              value={form.hora} onChange={(e) => set('hora', e.target.value)}
              className="input-glass w-full"
            />
          </div>

          {/* Personas */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
              Número de personas
            </label>
            <input
              type="number" required
              min="1" max={maxPersonas}
              value={form.personas} onChange={(e) => set('personas', e.target.value)}
              className="input-glass w-full" inputMode="numeric"
            />
            {selectedEvento && selectedEvento.cuposRestantes >= 0 && selectedEvento.cuposRestantes < 20 && (
              <p className="text-xs text-zinc-500 mt-1">
                Máximo {selectedEvento.cuposRestantes} persona{selectedEvento.cuposRestantes !== 1 ? 's' : ''} disponibles
              </p>
            )}
          </div>

          {/* Comprobante (solo si el show es pagado) */}
          {selectedEvento && selectedEvento.precioBase > 0 && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-xl p-4">
                <span className="text-xl shrink-0">💳</span>
                <div>
                  <p className="text-primary text-sm font-bold mb-0.5">
                    Total a transferir: ${totalMonto.toLocaleString('es-CL')}
                  </p>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    ${selectedEvento.precioBase.toLocaleString('es-CL')} × {personas} persona{personas !== 1 ? 's' : ''}.{' '}
                    Transfiérelo a <strong className="text-zinc-300">Living Club</strong> y adjunta el comprobante abajo.
                    El equipo lo verificará y confirmará tu reserva.
                  </p>
                </div>
              </div>

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
                  type="file" ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
              Notas adicionales{' '}
              <span className="normal-case text-zinc-600">(opcional)</span>
            </label>
            <textarea
              value={form.notas} onChange={(e) => set('notas', e.target.value)}
              placeholder="Alguna petición especial, ocasión, etc."
              className="input-glass w-full resize-none" rows={3}
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
            {loading
              ? 'Enviando...'
              : selectedEvento && selectedEvento.precioBase > 0
              ? `Enviar solicitud — $${totalMonto.toLocaleString('es-CL')} →`
              : 'Confirmar reserva →'}
          </button>
        </>
      )}
    </form>
  )
}
