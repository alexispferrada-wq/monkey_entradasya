'use client'

import { useState, useEffect } from 'react'
import InvitacionForm from './InvitacionForm'

interface Props {
  slug: string
  eventoId: string
  eventoNombre: string
}

const SESSION_KEY = (slug: string) => `clave_verified_${slug}`

export default function ClaveGate({ slug, eventoId, eventoNombre }: Props) {
  const [verificado, setVerificado] = useState(false)
  const [clave, setClave] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  // Revisar si ya fue verificado en esta sesión
  useEffect(() => {
    try {
      const ok = sessionStorage.getItem(SESSION_KEY(slug))
      if (ok === 'true') setVerificado(true)
    } catch {}
    setChecking(false)
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clave.trim()) { setError('Ingresa la clave del evento.'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/eventos/${slug}/verificar-clave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave: clave.trim() }),
      })

      if (res.ok) {
        try { sessionStorage.setItem(SESSION_KEY(slug), 'true') } catch {}
        setVerificado(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Clave incorrecta.')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) return null

  if (verificado) {
    return <InvitacionForm eventoId={eventoId} eventoNombre={eventoNombre} />
  }

  return (
    <div className="animate-fade-in">
      {/* Explicación */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-3xl">
          🔑
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Evento privado</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Este es un evento de cumpleaños privado. El organizador te compartió <strong className="text-zinc-200">4 palabras clave</strong> — ingresa <strong className="text-zinc-200">cualquiera de ellas</strong> para registrarte y recibir tu QR de acceso.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Clave del evento
          </label>
          <input
            type="text"
            value={clave}
            onChange={e => { setClave(e.target.value.toUpperCase()); setError('') }}
            placeholder="Ej: JUNGLA"
            className="input-glass uppercase tracking-widest text-center font-bold text-lg"
            autoComplete="off"
            disabled={loading}
          />
          {error ? (
            <p className="text-rose-400 text-xs mt-1 animate-fade-in">{error}</p>
          ) : (
            <p className="text-zinc-600 text-xs mt-1 text-center">Una sola palabra de las 4 que te enviaron es suficiente</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !clave.trim()}
          className="w-full py-3.5 px-8 rounded-xl font-black text-black bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm tracking-wider uppercase"
        >
          {loading ? 'Verificando...' : 'Ingresar al evento →'}
        </button>
      </form>

      <div className="mt-5 p-4 rounded-xl bg-zinc-900/60 border border-white/5 text-xs text-zinc-500 leading-relaxed">
        ⚠️ <strong className="text-zinc-400">Por razones de seguridad y control,</strong> al ingresar al local se podría solicitar tu carnet de identidad para verificar que eres el portador del QR de acceso.
      </div>
    </div>
  )
}
