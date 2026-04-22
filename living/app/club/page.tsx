'use client'

import { useState } from 'react'
import { NIVELES } from '@/lib/wallet/config'

type Nivel = 'bronze' | 'silver' | 'gold' | 'vip'

const NIVEL_ICONS: Record<Nivel, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold:   '🥇',
  vip:    '👑',
}

const BENEFICIOS: Record<Nivel, string[]> = {
  bronze: ['Descuento 5% en consumo', 'Acceso anticipado a eventos', 'Invitaciones exclusivas'],
  silver: ['Descuento 10% en consumo', 'Acceso VIP en eventos', '1 trago de bienvenida / mes', 'Mesa reservada en eventos'],
  gold:   ['Descuento 15% en consumo', 'Acceso VIP garantizado', '2 tragos de bienvenida / mes', 'Mesa preferencial', 'Invitación a eventos privados'],
  vip:    ['Descuento 20% en consumo', 'Lista VIP permanente', 'Barra libre en eventos especiales', 'Mesa VIP fija', 'Acceso backstage', 'Experiencias exclusivas con artistas'],
}

export default function ClubPage() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' })
  const [estado, setEstado] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [socioId, setSocioId] = useState<string | null>(null)
  const [walletLink, setWalletLink] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function registrar(e: React.FormEvent) {
    e.preventDefault()
    setEstado('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/socios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(typeof data.error === 'string' ? data.error : data.error?.message || 'Error al registrarse')
        setEstado('error')
        return
      }

      setSocioId(data.id)
      setEstado('success')

      // Generar link de Google Wallet automáticamente
      obtenerWalletLink(data.id)
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.')
      setEstado('error')
    }
  }

  async function obtenerWalletLink(id: string) {
    try {
      const res = await fetch('/api/wallet/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socioId: id }),
      })
      if (res.ok) {
        const { link } = await res.json()
        setWalletLink(link)
      }
    } catch {
      // No bloquear el flujo si el wallet falla
    }
  }

  const niveles = Object.entries(NIVELES) as [Nivel, typeof NIVELES[Nivel]][]

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8 sm:space-y-12">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-4xl sm:text-5xl mb-1">✨</div>
          <h1 className="font-display text-4xl sm:text-5xl text-primary tracking-widest uppercase">Club Living</h1>
          <p className="text-zinc-400 text-base">El club de lealtad de Living Club</p>
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        {estado === 'success' ? (
          /* ── ÉXITO ── */
          <div className="glass-card rounded-2xl p-8 text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <h2 className="font-display text-3xl text-primary tracking-wide">¡Bienvenido al club!</h2>
            <p className="text-zinc-400">
              Ya eres miembro <span className="text-amber-600 font-bold uppercase tracking-widest">Bronze</span> de Club Living.
              Acumula puntos en cada visita y sube de nivel.
            </p>

            {walletLink ? (
              <div className="space-y-3">
                <p className="text-zinc-500 text-sm">Agrega tu tarjeta de lealtad a tu teléfono:</p>
                <a
                  href={walletLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors"
                >
                  <img
                    src="https://pay.google.com/about/static/images/social/logo_googlewallet.png"
                    alt="Google Wallet"
                    className="h-5"
                  />
                  Agregar a Google Wallet
                </a>
              </div>
            ) : (
              <p className="text-zinc-600 text-sm animate-pulse">Preparando tu tarjeta digital...</p>
            )}

            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <p className="text-zinc-600 text-xs">
              Presenta tu nombre en la barra para que el staff registre tus puntos.
            </p>
          </div>
        ) : (
          <>
            {/* ── FORMULARIO DE REGISTRO ── */}
            <div className="glass-card rounded-2xl p-4 sm:p-8 space-y-5">
              <h2 className="font-display text-2xl text-white tracking-wide">Únete gratis</h2>

              <form onSubmit={registrar} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-1.5">Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Tu nombre"
                    className="input-glass"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="tu@email.com"
                    className="input-glass"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-1.5">
                    Teléfono <span className="text-zinc-600 normal-case">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                    placeholder="+56 9 xxxx xxxx"
                    className="input-glass"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>

                {estado === 'error' && (
                  <p className="text-red-400 text-sm text-center">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={estado === 'loading'}
                  className="btn-primary w-full py-4 text-lg font-black tracking-widest uppercase disabled:opacity-50"
                >
                  {estado === 'loading' ? 'Registrando...' : 'Unirme al club'}
                </button>
              </form>
            </div>

            {/* ── NIVELES ── */}
            <div className="space-y-4">
              <h2 className="font-display text-2xl text-white tracking-wide text-center">Niveles del club</h2>
              <div className="grid gap-3">
                {niveles.map(([key, nivel]) => (
                  <div key={key} className="glass-card rounded-xl p-5 flex items-start gap-4">
                    <span className="text-3xl mt-0.5">{NIVEL_ICONS[key]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-display text-lg tracking-widest uppercase" style={{ color: nivel.color }}>
                          {nivel.label}
                        </span>
                        <span className="text-zinc-600 text-xs">
                          {key === 'vip'
                            ? `${nivel.puntosMin}+ pts`
                            : `${nivel.puntosMin} – ${nivel.puntosMax} pts`}
                        </span>
                      </div>
                      <ul className="space-y-0.5">
                        {BENEFICIOS[key].map(b => (
                          <li key={b} className="text-zinc-400 text-sm flex items-center gap-2">
                            <span className="text-primary text-xs">◆</span> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
