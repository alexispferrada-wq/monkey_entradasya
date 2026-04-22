'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  lugares: string[]
  totalActivos: number
  totalPasados: number
}

export default function DashboardFilters({ lugares, totalActivos, totalPasados }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const vista = searchParams.get('vista') ?? 'activos'
  const lugarActivo = searchParams.get('lugar') ?? ''

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/admin?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Tabs Próximos / Pasados */}
      <div className="flex bg-white/5 rounded-xl p-1 gap-1">
        <button
          onClick={() => update('vista', 'activos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            vista === 'activos'
              ? 'bg-primary text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Próximos
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            vista === 'activos' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            {totalActivos}
          </span>
        </button>
        <button
          onClick={() => update('vista', 'pasados')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            vista === 'pasados'
              ? 'bg-slate-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Evento Pasado
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            vista === 'pasados' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            {totalPasados}
          </span>
        </button>
      </div>

      {/* Filtro por espacio */}
      <select
        value={lugarActivo}
        onChange={(e) => update('lugar', e.target.value)}
        className="bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
      >
        <option value="">Todos los espacios</option>
        {lugares.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </div>
  )
}
