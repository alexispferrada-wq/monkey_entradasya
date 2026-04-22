'use client'

import { useState } from 'react'
import type { Socio } from '@/lib/db/schema'
import { NIVELES } from '@/lib/wallet/config'

type Nivel = 'bronze' | 'silver' | 'gold' | 'vip'

const NIVEL_COLORS: Record<Nivel, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#F5C200',
  vip: '#F5C200',
}

const NIVEL_ICONS: Record<Nivel, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  vip: '👑',
}

interface Props {
  sociosIniciales: Socio[]
}

export default function SociosPanel({ sociosIniciales }: Props) {
  const [socios, setSocios] = useState<Socio[]>(sociosIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [seleccionado, setSeleccionado] = useState<Socio | null>(null)
  const [puntos, setPuntos] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  const filtrados = socios.filter(s =>
    s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  async function ajustarPuntos(e: React.FormEvent) {
    e.preventDefault()
    if (!seleccionado || !puntos || !motivo) return
    setLoading(true)
    setMsg(null)

    try {
      const res = await fetch(`/api/admin/socios/${seleccionado.id}/puntos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puntos: Number(puntos), motivo }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMsg({ tipo: 'err', texto: typeof data.error === 'string' ? data.error : data.error?.message || 'Error al actualizar puntos' })
      } else {
        setSocios(prev => prev.map(s => s.id === data.id ? data : s))
        setSeleccionado(data)
        setMsg({ tipo: 'ok', texto: `✓ ${puntos > '0' ? '+' : ''}${puntos} puntos aplicados` })
        setPuntos('')
        setMotivo('')
      }
    } catch {
      setMsg({ tipo: 'err', texto: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Lista de socios ── */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-white tracking-wide">
            Socios <span className="text-primary">({socios.length})</span>
          </h2>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-primary/60 text-sm"
        />

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filtrados.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-8">Sin resultados</p>
          )}
          {filtrados.map(socio => (
            <button
              key={socio.id}
              onClick={() => { setSeleccionado(socio); setMsg(null); setPuntos(''); setMotivo('') }}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                seleccionado?.id === socio.id
                  ? 'border-primary/60 bg-primary/10'
                  : 'border-zinc-800/60 bg-black/20 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-semibold">{socio.nombre}</p>
                  <p className="text-zinc-500 text-xs">{socio.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold text-sm">{socio.puntos} pts</p>
                  <p className="text-xs" style={{ color: NIVEL_COLORS[socio.nivel as Nivel] }}>
                    {NIVEL_ICONS[socio.nivel as Nivel]} {NIVELES[socio.nivel as Nivel].label}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Panel de puntos ── */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        {seleccionado ? (
          <>
            {/* Info socio */}
            <div className="text-center space-y-2 pb-4 border-b border-zinc-800">
              <div className="text-4xl">{NIVEL_ICONS[seleccionado.nivel as Nivel]}</div>
              <h3 className="font-display text-2xl text-white tracking-wide">{seleccionado.nombre}</h3>
              <p className="text-zinc-500 text-sm">{seleccionado.email}</p>
              {seleccionado.telefono && <p className="text-zinc-600 text-xs">{seleccionado.telefono}</p>}

              {/* Puntos y nivel */}
              <div className="flex justify-center gap-8 pt-2">
                <div>
                  <p className="text-primary font-black text-3xl">{seleccionado.puntos}</p>
                  <p className="text-zinc-600 text-xs uppercase tracking-widest">Puntos</p>
                </div>
                <div>
                  <p className="font-bold text-2xl" style={{ color: NIVEL_COLORS[seleccionado.nivel as Nivel] }}>
                    {NIVELES[seleccionado.nivel as Nivel].label}
                  </p>
                  <p className="text-zinc-600 text-xs uppercase tracking-widest">Nivel</p>
                </div>
              </div>

              {/* Barra de progreso al siguiente nivel */}
              <BarraProgreso puntos={seleccionado.puntos} nivel={seleccionado.nivel as Nivel} />
            </div>

            {/* Formulario puntos */}
            <form onSubmit={ajustarPuntos} className="space-y-4">
              <h4 className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">Ajustar puntos</h4>

              <div className="grid grid-cols-2 gap-2">
                {[50, 100, 200, 500].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPuntos(String(n))}
                    className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                      puntos === String(n)
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    +{n} pts
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={puntos}
                  onChange={e => setPuntos(e.target.value)}
                  placeholder="Ej: 150 o -50"
                  className="flex-1 bg-black/40 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-primary/60 text-sm"
                />
                <span className="text-zinc-600 self-center text-sm">puntos</span>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Motivo (ej: Asistencia evento Selena)"
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-primary/60 text-sm"
                />
              </div>

              {msg && (
                <p className={`text-sm text-center ${msg.tipo === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                  {msg.texto}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !puntos || !motivo}
                className="btn-primary w-full py-3 font-black tracking-widest uppercase disabled:opacity-40"
              >
                {loading ? 'Guardando...' : 'Aplicar puntos'}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-3">
            <div className="opacity-30"><img src="/living-logo.png" alt="Living" className="w-16 h-16 object-contain mx-auto" /></div>
            <p className="text-zinc-600">Selecciona un socio de la lista para gestionar sus puntos</p>
          </div>
        )}
      </div>
    </div>
  )
}

function BarraProgreso({ puntos, nivel }: { puntos: number; nivel: Nivel }) {
  const limites: Record<Nivel, { min: number; max: number; siguiente: string }> = {
    bronze: { min: 0,    max: 499,  siguiente: 'Silver' },
    silver: { min: 500,  max: 1499, siguiente: 'Gold' },
    gold:   { min: 1500, max: 2999, siguiente: 'VIP' },
    vip:    { min: 3000, max: 3000, siguiente: '' },
  }
  const { min, max, siguiente } = limites[nivel]
  if (nivel === 'vip') return <p className="text-xs text-yellow-500/70">Nivel máximo alcanzado 👑</p>

  const progreso = Math.min(100, Math.round(((puntos - min) / (max - min + 1)) * 100))

  return (
    <div className="space-y-1 text-left">
      <div className="flex justify-between text-xs text-zinc-600">
        <span>{puntos - min} / {max - min + 1} pts para {siguiente}</span>
        <span>{progreso}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progreso}%`, background: '#F5C200' }}
        />
      </div>
    </div>
  )
}
