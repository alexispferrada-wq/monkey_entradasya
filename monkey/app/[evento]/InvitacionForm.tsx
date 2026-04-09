'use client'

import { useState } from 'react'

interface Props {
  eventoId: string
  eventoNombre: string
}

type Estado = 'idle' | 'loading' | 'success' | 'error' | 'duplicado'

export default function InvitacionForm({ eventoId, eventoNombre }: Props) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState<Estado>('idle')
  const [mensaje, setMensaje] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEstado('loading')

    try {
      const res = await fetch('/api/invitaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId, nombre: nombre.trim(), email: email.trim().toLowerCase() }),
      })

      const data = await res.json()

      if (res.status === 409) {
        setEstado('duplicado')
        setMensaje(data.error)
        return
      }

      if (!res.ok) {
        setEstado('error')
        setMensaje(data.error || 'Hubo un error. Intenta de nuevo.')
        return
      }

      setEstado('success')
    } catch {
      setEstado('error')
      setMensaje('Error de conexión. Intenta de nuevo.')
    }
  }

  if (estado === 'success') {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-4xl">
          ✅
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">¡Invitación enviada!</h3>
        <p className="text-slate-400 mb-1">
          Revisa tu correo <span className="text-primary font-medium">{email}</span>
        </p>
        <p className="text-slate-500 text-sm">
          Te enviamos tu QR de acceso para <strong className="text-slate-300">{eventoNombre}</strong>
        </p>
        <div className="mt-6 glass-card rounded-xl p-4 text-left">
          <p className="text-slate-400 text-sm">
            💡 <strong className="text-slate-300">Tip:</strong> Guarda el correo con tu QR.
            Lo necesitarás para ingresar al evento.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Tu nombre completo
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: María González"
          required
          minLength={2}
          className="input-glass"
          disabled={estado === 'loading'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Tu correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          required
          className="input-glass"
          disabled={estado === 'loading'}
        />
        <p className="text-slate-600 text-xs mt-1">
          Tu invitación con QR llegará a este correo
        </p>
      </div>

      {(estado === 'error' || estado === 'duplicado') && (
        <div className={`rounded-xl p-4 border text-sm animate-fade-in ${
          estado === 'duplicado'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {estado === 'duplicado' ? '⚠️ ' : '❌ '}
          {mensaje}
        </div>
      )}

      <button
        type="submit"
        disabled={estado === 'loading'}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {estado === 'loading' ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando invitación...
          </>
        ) : (
          'Solicitar mi invitación →'
        )}
      </button>

      <p className="text-slate-600 text-xs text-center">
        Solo una invitación por correo. Recibirás tu QR en minutos.
      </p>
    </form>
  )
}
