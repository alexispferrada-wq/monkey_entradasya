'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Evento } from '@/lib/db/schema'

interface Props {
  evento?: Evento
}

// Convierte un Date UTC a string "YYYY-MM-DDTHH:mm" en hora Santiago
function fechaToSantiagoInput(fecha: Date | string): string {
  return new Date(fecha)
    .toLocaleString('sv-SE', { timeZone: 'America/Santiago' })
    .slice(0, 16)
    .replace(' ', 'T')
}

// Convierte "YYYY-MM-DDTHH:mm" (hora local Santiago) a ISO UTC
function santiagoInputToISO(localStr: string): string {
  const asUTC = new Date(localStr + 'Z')
  const santiagoStr = asUTC.toLocaleString('sv-SE', { timeZone: 'America/Santiago' })
  const santiagoDate = new Date(santiagoStr.replace(' ', 'T') + 'Z')
  const offsetMs = asUTC.getTime() - santiagoDate.getTime()
  return new Date(asUTC.getTime() + offsetMs).toISOString()
}

export default function EventoForm({ evento }: Props) {
  const isEdit = !!evento
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const SECTORES = [
    'GENERAL',
    'VIP',
    'OPEN',
  ] as const

  const [form, setForm] = useState({
    nombre: evento?.nombre || '',
    descripcion: evento?.descripcion || '',
    fecha: evento?.fecha
      ? fechaToSantiagoInput(evento.fecha)
      : '',
    lugar: evento?.lugar || 'GENERAL',
    cuposTotal: evento?.cuposTotal?.toString() || '100',
    cuposDisponibles: evento?.cuposDisponibles?.toString() || '100',
    precioBase: evento?.precioBase?.toString() || '0',
    cuposReserva: evento?.cuposReserva?.toString() || '0',
    slug: evento?.slug || '',
    imagenUrl: evento?.imagenUrl || '',
    activo: evento?.activo ?? true,
    destacado: evento?.destacado ?? false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedSlug, setSavedSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [uploadInfo, setUploadInfo] = useState<{ width: number; height: number; format: string; bytes: number } | null>(null)
  const [previewLocal, setPreviewLocal] = useState<string | null>(null)

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
  }

  function handleNombreChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nombre = e.target.value
    setForm((f) => ({
      ...f,
      nombre,
      slug: isEdit ? f.slug : slugify(nombre),
    }))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview local instantáneo
    const objectUrl = URL.createObjectURL(file)
    setPreviewLocal(objectUrl)
    setUploadState('uploading')
    setUploadInfo(null)

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        setUploadState('error')
        setError(typeof data.error === 'string' ? data.error : data.error?.message || 'Error al subir imagen.')
        return
      }

      setForm((f) => ({ ...f, imagenUrl: data.url }))
      setUploadState('done')
      setUploadInfo({ width: data.width, height: data.height, format: data.format, bytes: data.bytes })
    } catch {
      setUploadState('error')
      setError('Error de conexión al subir la imagen.')
    }
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (uploadState === 'uploading') {
      setError('Espera a que termine de subir la imagen.')
      return
    }
    setLoading(true)
    setError('')

    const url = isEdit ? `/api/admin/eventos/${evento!.id}` : '/api/admin/eventos'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        fecha: form.fecha ? santiagoInputToISO(form.fecha) : form.fecha,
        cuposTotal: Number(form.cuposTotal),
        cuposDisponibles: Number(form.cuposDisponibles),
        precioBase: Number(form.precioBase),
        cuposReserva: Number(form.cuposReserva),
        destacado: form.destacado,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : data.error?.message || 'Error al guardar.')
      setLoading(false)
      return
    }

    // Mostrar el link del evento en vez de redirigir
    setSavedSlug(data.slug || form.slug)
    setLoading(false)
  }

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este evento? Se borrarán todas las invitaciones asociadas.')) return
    setLoading(true)
    setError('')

    const res = await fetch(`/api/admin/eventos/${evento!.id}`, { method: 'DELETE' })
    const data = await res.json()

    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : data.error?.message || 'No fue posible eliminar el evento.')
      setLoading(false)
      return
    }

    await router.push('/admin')
    router.refresh()
  }

  const imagenPreview = previewLocal || form.imagenUrl

  // ── Panel de éxito: muestra el link para compartir ──────────────────────
  if (savedSlug) {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : 'https://living.entradasya.cl'
    const eventoUrl = `${baseUrl}/${savedSlug}`

    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-4xl">
          ✅
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-1">
            {isEdit ? '¡Cambios guardados!' : '¡Evento creado!'}
          </h2>
          <p className="text-slate-400 text-sm">
            {form.nombre} está listo. Comparte este link:
          </p>
        </div>

        {/* Link grande y copiable */}
        <div className="bg-black/50 border border-primary/40 rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-bold">
            Link del evento — comparte esto
          </p>
          <p className="font-display text-xl text-primary tracking-wide break-all mb-4">
            {eventoUrl}
          </p>
          <button
            onClick={() => copyLink(eventoUrl)}
            className="btn-primary w-full py-4 text-lg font-black"
          >
            {copied ? '✓ ¡Copiado!' : '📋 Copiar link'}
          </button>
        </div>

        {/* Abrir directamente */}
        <a
          href={eventoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-slate-400 hover:text-white text-sm transition-colors underline underline-offset-4"
        >
          Ver página del evento ↗
        </a>

        {/* Volver al admin */}
        <button
          onClick={() => { window.location.href = '/admin' }}
          className="block w-full text-slate-600 hover:text-slate-400 text-sm transition-colors"
        >
          ← Volver al dashboard
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Nombre del evento <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={form.nombre}
          onChange={handleNombreChange}
          placeholder="Ej: Noche de Gala EntradasYa"
          required
          className="input-glass"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
        <textarea
          value={form.descripcion}
          onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
          placeholder="Describe el evento brevemente..."
          rows={3}
          className="input-glass resize-none"
        />
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Fecha y hora <span className="text-rose-400">*</span>
        </label>
        <input
          type="datetime-local"
          value={form.fecha}
          onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
          required
          className="input-glass"
        />
      </div>

      {/* Sector */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Sector <span className="text-rose-400">*</span>
        </label>
        <select
          value={form.lugar}
          onChange={(e) => setForm((f) => ({ ...f, lugar: e.target.value }))}
          required
          className="input-glass"
        >
          {SECTORES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Cupos */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Cupos totales <span className="text-rose-400">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={form.cuposTotal}
            onChange={(e) => setForm((f) => ({ ...f, cuposTotal: e.target.value }))}
            required
            className="input-glass"
          />
        </div>
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cupos disponibles
            </label>
            <input
              type="number"
              min="0"
              value={form.cuposDisponibles}
              onChange={(e) => setForm((f) => ({ ...f, cuposDisponibles: e.target.value }))}
              className="input-glass"
            />
            <p className="text-slate-600 text-xs mt-1">Ajusta si hubo cancelaciones</p>
          </div>
        )}
      </div>

      {/* Reservas de Show — Precio y Cupos */}
      <div className="glass-card rounded-xl p-4 space-y-4 border border-primary/20">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Configuración de reservas de Show</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Precio por persona
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.precioBase}
                onChange={(e) => setForm((f) => ({ ...f, precioBase: e.target.value }))}
                className="input-glass pl-7"
                placeholder="0"
              />
            </div>
            <p className="text-slate-600 text-xs mt-1">0 = entrada gratuita</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cupo máx. de reservas
            </label>
            <input
              type="number"
              min="0"
              value={form.cuposReserva}
              onChange={(e) => setForm((f) => ({ ...f, cuposReserva: e.target.value }))}
              className="input-glass"
              placeholder="0"
            />
            <p className="text-slate-600 text-xs mt-1">0 = sin límite</p>
          </div>
        </div>
      </div>

      {/* Imagen — Upload a Cloudinary */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Imagen del evento
        </label>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
            uploadState === 'uploading'
              ? 'border-primary/60 bg-primary/5'
              : uploadState === 'done'
              ? 'border-green-500/40 bg-green-500/5'
              : uploadState === 'error'
              ? 'border-rose-500/40 bg-rose-500/5'
              : 'border-white/10 hover:border-primary/40 hover:bg-primary/5'
          }`}
        >
          {imagenPreview ? (
            <div className="relative">
              <img
                src={imagenPreview}
                alt="Preview"
                className="w-full h-52 object-cover"
              />
              {/* Overlay en uploading */}
              {uploadState === 'uploading' && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                  <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-white text-sm font-medium">Subiendo a Cloudinary...</p>
                </div>
              )}
              {/* Badge done */}
              {uploadState === 'done' && uploadInfo && (
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="bg-green-500/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ✓ Subida en máxima calidad
                  </span>
                  <span className="bg-black/70 text-slate-300 text-xs px-2 py-1 rounded-full">
                    {uploadInfo.width}×{uploadInfo.height} · {uploadInfo.format.toUpperCase()} · {formatBytes(uploadInfo.bytes)}
                  </span>
                </div>
              )}
              {/* Cambiar imagen */}
              <div className="absolute top-2 right-2">
                <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full hover:bg-black/90 transition-colors">
                  Cambiar imagen
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-12 h-12 mb-3 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                🖼️
              </div>
              <p className="text-slate-300 font-medium text-sm">Haz clic para subir imagen</p>
              <p className="text-slate-600 text-xs mt-1">JPG, PNG, WEBP — se guarda en máxima calidad</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Slug (URL del evento) <span className="text-rose-400">*</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm shrink-0">living.entradasya.cl/</span>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
            placeholder="noche-de-gala"
            required
            className="input-glass"
          />
        </div>
      </div>

      {/* Activo + Destacado */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, activo: !f.activo }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.activo ? 'bg-primary' : 'bg-slate-700'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              form.activo ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
          <label className="text-sm text-slate-300">
            Evento {form.activo ? 'activo (visible en el sitio)' : 'inactivo (oculto)'}
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, destacado: !f.destacado }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.destacado ? 'bg-yellow-500' : 'bg-slate-700'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              form.destacado ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
          <label className="text-sm text-slate-300">
            {form.destacado ? '⭐ Flyer destacado en el inicio' : 'No destacado'}
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl p-3 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || uploadState === 'uploading'}
          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </>
          ) : uploadState === 'uploading' ? (
            'Esperando imagen...'
          ) : (
            isEdit ? 'Guardar cambios' : 'Crear evento'
          )}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all text-sm"
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  )
}
