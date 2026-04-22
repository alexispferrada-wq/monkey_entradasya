'use client'

import { useState, useEffect } from 'react'
import ScannerClient from './ScannerClient'

const STORAGE_KEY = 'scanner_auth_living'
const CLAVE_CORRECTA = 'living2026'

export default function ScannerGate() {
  const [autenticado, setAutenticado] = useState(false)
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === '1') setAutenticado(true)
    setMontado(true)
  }, [])

  function verificar(e: React.FormEvent) {
    e.preventDefault()
    if (clave.toLowerCase() === CLAVE_CORRECTA) {
      localStorage.setItem(STORAGE_KEY, '1')
      setAutenticado(true)
      setError('')
    } else {
      setError('Clave incorrecta.')
      setClave('')
    }
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY)
    setAutenticado(false)
    setClave('')
    setError('')
  }

  // Evitar flash antes de leer localStorage
  if (!montado) return null

  if (autenticado) return <ScannerClient onLogout={handleLogout} />

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo / ícono */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-purple-600 opacity-20 animate-pulse-slow" />
            <div className="absolute inset-0 flex items-center justify-center text-5xl">🔐</div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Scanner Living Club</h1>
          <p className="text-slate-400 text-sm">Ingresa la clave para acceder al modo anfitrión</p>
        </div>

        <form onSubmit={verificar} className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-widest">
              Clave de acceso
            </label>
            <input
              type="password"
              value={clave}
              onChange={(e) => {
                setClave(e.target.value)
                setError('')
              }}
              placeholder="••••••••••"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg text-center tracking-widest focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all placeholder:tracking-normal placeholder:text-slate-600"
            />
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl p-3 text-sm text-center">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full text-base py-3">
            Ingresar al Scanner →
          </button>
        </form>

        <p className="text-slate-600 text-xs text-center mt-6">Solo para uso del personal de Living Club</p>
      </div>
    </div>
  )
}
