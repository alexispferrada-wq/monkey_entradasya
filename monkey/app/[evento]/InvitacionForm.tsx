'use client'

import { useState } from 'react'

interface Props {
  eventoId: string
  eventoNombre: string
}

type Estado = 'idle' | 'loading' | 'success' | 'error' | 'duplicado'

// Client-side field validation (mirrors server Zod schema for instant feedback)
function validateNombre(v: string): string {
  if (!v.trim()) return 'Ingresa tu nombre'
  if (v.trim().length < 2) return 'Mínimo 2 caracteres'
  if (v.trim().length > 100) return 'Máximo 100 caracteres'
  return ''
}

function validateEmail(v: string): string {
  if (!v.trim()) return 'Ingresa tu correo'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Correo inválido'
  // Warn about common disposable domains (non-exhaustive, just UX hint)
  const domain = v.split('@')[1]?.toLowerCase() ?? ''
  const warnDomains = ['mailinator.com', 'guerrillamail.com', 'yopmail.com', 'tempmail.com', 'trashmail.com', 'maildrop.cc']
  if (warnDomains.includes(domain)) return 'No se permiten correos temporales'
  return ''
}

export default function InvitacionForm({ eventoId, eventoNombre }: Props) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState<Estado>('idle')
  const [mensaje, setMensaje] = useState('')
  // Field-level validation errors (shown only after the field has been touched)
  const [touched, setTouched] = useState({ nombre: false, email: false })

  const nombreError = touched.nombre ? validateNombre(nombre) : ''
  const emailError  = touched.email  ? validateEmail(email)   : ''
  const hasFieldErrors = !!validateNombre(nombre) || !!validateEmail(email)

  async function handleSubmit(e: React.FormEvent) {
    // Mark all fields as touched to surface any errors
    setTouched({ nombre: true, email: true })
    if (hasFieldErrors) { e.preventDefault(); return }
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
        setMensaje(typeof data.error === 'string' ? data.error : data.error?.message || 'Ya tienes una invitación registrada.')
        return
      }

      if (!res.ok) {
        setEstado('error')
        setMensaje(typeof data.error === 'string' ? data.error : data.error?.message || 'Hubo un error. Intenta de nuevo.')
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
          onBlur={() => setTouched(t => ({ ...t, nombre: true }))}
          placeholder="Ej: María González"
          required
          minLength={2}
          className={`input-glass transition-colors ${nombreError ? 'border-rose-500/60 focus:border-rose-500' : nombre && !nombreError ? 'border-green-500/40' : ''}`}
          disabled={estado === 'loading'}
          aria-invalid={!!nombreError}
          aria-describedby={nombreError ? 'nombre-error' : undefined}
        />
        {nombreError && (
          <p id="nombre-error" className="text-rose-400 text-xs mt-1 animate-fade-in">
            {nombreError}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Tu correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, email: true }))}
          placeholder="tu@correo.com"
          required
          className={`input-glass transition-colors ${emailError ? 'border-rose-500/60 focus:border-rose-500' : email && !emailError ? 'border-green-500/40' : ''}`}
          disabled={estado === 'loading'}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'email-error' : undefined}
        />
        {emailError ? (
          <p id="email-error" className="text-rose-400 text-xs mt-1 animate-fade-in">
            {emailError}
          </p>
        ) : (
          <p className="text-slate-600 text-xs mt-1">
            Tu invitación con QR llegará a este correo
          </p>
        )}
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
        className="evento-btn w-full flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
