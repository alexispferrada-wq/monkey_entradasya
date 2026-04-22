'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ReservaForm() {
  const router = useRouter()
  const [tipo, setTipo] = useState<'terraza' | 'grill' | 'cumpleanos'>('terraza')
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha: '',
    hora: '',
    personas: '2',
    notas: '',
    nombreEvento: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [comprobanteUrl, setComprobanteUrl] = useState('')
  const [comprobantePublicId, setComprobantePublicId] = useState('')

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
    if (uploadState === 'uploading') {
      setError('Espera a que termine de subir el comprobante.')
      return
    }
    if ((tipo === 'grill' || tipo === 'cumpleanos') && !comprobanteUrl) {
      setError('Debes subir el comprobante de pago.')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo,
        ...form,
        personas: parseInt(form.personas, 10),
        comprobantePagoUrl: comprobanteUrl,
        comprobantePublicId: comprobantePublicId,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al crear la reserva.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-4">
        <div className="text-4xl">✅</div>
        <h2 className="text-2xl font-black text-white">¡Reserva recibida!</h2>
        <p className="text-zinc-400">
          {tipo === 'terraza' 
            ? 'Tu solicitud de acceso general está confirmada. Te hemos enviado un correo con los detalles.' 
            : 'Hemos recibido tu solicitud y comprobante. Nuestro equipo lo revisará y te confirmaremos por correo pronto.'}
        </p>
        <button onClick={() => router.push('/')} className="btn-primary w-full mt-4">Volver al inicio</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Sector / Tipo</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'terraza', label: 'Acceso General (Gratis)' },
            { id: 'grill', label: 'Acceso VIP ($10.000)' },
            { id: 'cumpleanos', label: 'Evento Privado ($10.000)' },
          ].map((op) => (
            <button key={op.id} type="button" onClick={() => { setTipo(op.id as any); setComprobanteUrl(''); setUploadState('idle') }} className={`p-3 rounded-xl border text-sm font-bold transition-all ${ tipo === op.id ? 'border-primary bg-primary/20 text-primary' : 'border-white/10 text-zinc-400 hover:border-primary/50' }`}>
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-slate-300 mb-2">Nombre</label><input type="text" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="input-glass w-full" /></div>
        <div><label className="block text-sm font-medium text-slate-300 mb-2">Correo</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-glass w-full" /></div>
        <div><label className="block text-sm font-medium text-slate-300 mb-2">Teléfono</label><input type="tel" required value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="input-glass w-full" /></div>
        <div><label className="block text-sm font-medium text-slate-300 mb-2">Personas</label><input type="number" min="1" required value={form.personas} onChange={e => setForm({...form, personas: e.target.value})} className="input-glass w-full" /></div>
        <div><label className="block text-sm font-medium text-slate-300 mb-2">Fecha</label><input type="date" required value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="input-glass w-full" /></div>
        <div><label className="block text-sm font-medium text-slate-300 mb-2">Hora</label><input type="time" required value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} className="input-glass w-full" /></div>
      </div>

      {tipo === 'cumpleanos' && (
        <div><label className="block text-sm font-medium text-slate-300 mb-2">Nombre del cumpleañero/a</label><input type="text" value={form.nombreEvento} onChange={e => setForm({...form, nombreEvento: e.target.value})} placeholder="Ej. Cumpleaños de Juan" className="input-glass w-full" /><p className="text-xs text-zinc-500 mt-1">Se creará un evento con este nombre para tus invitados.</p></div>
      )}

      {(tipo === 'grill' || tipo === 'cumpleanos') && (
        <div className="p-4 border border-primary/30 bg-primary/5 rounded-xl">
          <p className="text-sm text-primary mb-3 font-medium">Valor de reserva: $10.000. Sube tu comprobante de pago.</p>
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-primary/40 rounded-xl p-4 text-center cursor-pointer hover:bg-primary/10 transition-colors">
            {uploadState === 'uploading' ? <span className="text-primary text-sm">Subiendo...</span> : uploadState === 'done' ? <span className="text-green-400 text-sm font-bold">✓ Comprobante adjunto</span> : <span className="text-primary text-sm">Haz clic para subir comprobante</span>}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
      )}

      <div><label className="block text-sm font-medium text-slate-300 mb-2">Notas adicionales</label><textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} className="input-glass w-full resize-none" rows={2}></textarea></div>
      {error && <p className="text-rose-400 text-sm bg-rose-500/10 p-3 rounded-xl">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Procesando...' : 'Confirmar Reserva'}</button>
    </form>
  )
}