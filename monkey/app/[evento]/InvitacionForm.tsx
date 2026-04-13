'use client'

import { useState } from 'react'

interface Props {
  eventoId: string
  eventoNombre: string
}

type Estado = 'idle' | 'loading' | 'success' | 'error' | 'duplicado'

// ─── Validaciones ──────────────────────────────────────────────

function validateNombre(v: string): string {
  if (!v.trim()) return 'Ingresa tu nombre y apellidos'
  if (v.trim().length < 3) return 'Mínimo 3 caracteres'
  if (v.trim().length > 150) return 'Máximo 150 caracteres'
  return ''
}

function validateEmail(v: string): string {
  if (!v.trim()) return 'Ingresa tu correo'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Correo inválido'
  const domain = v.split('@')[1]?.toLowerCase() ?? ''
  const blocked = ['mailinator.com', 'guerrillamail.com', 'yopmail.com', 'tempmail.com', 'trashmail.com', 'maildrop.cc']
  if (blocked.includes(domain)) return 'No se permiten correos temporales'
  return ''
}

function validarRut(rut: string): boolean {
  const clean = rut.replace(/[.\-\s]/g, '').toUpperCase()
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(body)) return false
  if (!/^[\dK]$/.test(dv)) return false

  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const rest = 11 - (sum % 11)
  const expected = rest === 11 ? '0' : rest === 10 ? 'K' : String(rest)
  return dv === expected
}

function validateRut(v: string): string {
  if (!v.trim()) return 'Ingresa tu RUT'
  if (!validarRut(v)) return 'RUT inválido — verifica el número y dígito verificador'
  return ''
}

// Formatea RUT mientras el usuario escribe: 12.345.678-9
function formatRut(raw: string): string {
  const clean = raw.replace(/[^\dkK]/g, '').toUpperCase()
  if (clean.length === 0) return ''
  const dv = clean.slice(-1)
  const body = clean.slice(0, -1)
  if (body.length === 0) return dv
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

// ─── Componente ────────────────────────────────────────────────

export default function InvitacionForm({ eventoId, eventoNombre }: Props) {
  const [nombre, setNombre] = useState('')
  const [rut, setRut] = useState('')
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState<Estado>('idle')
  const [mensaje, setMensaje] = useState('')
  const [touched, setTouched] = useState({ nombre: false, rut: false, email: false })

  const nombreError = touched.nombre ? validateNombre(nombre) : ''
  const rutError    = touched.rut    ? validateRut(rut)       : ''
  const emailError  = touched.email  ? validateEmail(email)   : ''

  const hasErrors = !!validateNombre(nombre) || !!validateRut(rut) || !!validateEmail(email)

  function handleRutChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\dkK]/g, '').toUpperCase()
    // Limitar a 9 caracteres (8 dígitos + DV)
    if (raw.length > 9) return
    setRut(formatRut(raw))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ nombre: true, rut: true, email: true })
    if (hasErrors) return
    setEstado('loading')

    try {
      const res = await fetch('/api/invitaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId,
          nombre: nombre.trim(),
          rut: rut.trim(),
          email: email.trim().toLowerCase(),
        }),
      })

      const data = await res.json()

      if (res.status === 409) {
        setEstado('duplicado')
        setMensaje(typeof data.error === 'string' ? data.error : 'Ya tienes una invitación registrada.')
        return
      }

      if (!res.ok) {
        setEstado('error')
        setMensaje(typeof data.error === 'string' ? data.error : 'Hubo un error. Intenta de nuevo.')
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

      {/* Nombre y apellidos */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Nombre y apellidos
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, nombre: true }))}
          placeholder="Ej: María González Rojas"
          required
          autoComplete="name"
          className={`input-glass transition-colors ${nombreError ? 'border-rose-500/60 focus:border-rose-500' : nombre && !nombreError ? 'border-green-500/40' : ''}`}
          disabled={estado === 'loading'}
          aria-invalid={!!nombreError}
        />
        {nombreError && (
          <p className="text-rose-400 text-xs mt-1 animate-fade-in">{nombreError}</p>
        )}
      </div>

      {/* RUT */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          RUT
        </label>
        <input
          type="text"
          value={rut}
          onChange={handleRutChange}
          onBlur={() => setTouched(t => ({ ...t, rut: true }))}
          placeholder="Ej: 12.345.678-9"
          required
          className={`input-glass transition-colors ${rutError ? 'border-rose-500/60 focus:border-rose-500' : rut && !rutError && touched.rut ? 'border-green-500/40' : ''}`}
          disabled={estado === 'loading'}
          aria-invalid={!!rutError}
          inputMode="numeric"
        />
        {rutError ? (
          <p className="text-rose-400 text-xs mt-1 animate-fade-in">{rutError}</p>
        ) : (
          <p className="text-slate-600 text-xs mt-1 leading-relaxed">
            🔒 Tu RUT es requerido para verificar tu identidad y mayoría de edad, conforme a la{' '}
            <span className="text-slate-500">Ley 19.925</span> sobre expendio de bebidas alcohólicas. Solo se usa en el contexto de este evento.
          </p>
        )}
      </div>

      {/* Correo */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, email: true }))}
          placeholder="tu@correo.com"
          required
          autoComplete="email"
          inputMode="email"
          className={`input-glass transition-colors ${emailError ? 'border-rose-500/60 focus:border-rose-500' : email && !emailError ? 'border-green-500/40' : ''}`}
          disabled={estado === 'loading'}
          aria-invalid={!!emailError}
        />
        {emailError ? (
          <p className="text-rose-400 text-xs mt-1 animate-fade-in">{emailError}</p>
        ) : (
          <p className="text-slate-600 text-xs mt-1">Tu invitación con QR llegará a este correo</p>
        )}
      </div>

      {/* Error / duplicado */}
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
