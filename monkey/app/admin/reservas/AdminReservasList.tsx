'use client'

import { useState } from 'react'
import type { Reserva } from '@/lib/db/schema'

export default function AdminReservasList({ reservas: iniciales }: { reservas: Reserva[] }) {
  const [reservas, setReservas] = useState(iniciales)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleEstado(id: string, estado: 'aprobada' | 'rechazada') {
    if (!confirm(`¿Marcar como ${estado}?`)) return
    setLoading(id)
    try {
      const res = await fetch(`/api/admin/reservas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      const data = await res.json()
      setReservas(reservas.map(r => r.id === id ? data.reserva : r))
    } catch (e) {
      alert('Error al actualizar reserva')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
      <table className="w-full text-left text-sm text-zinc-300">
        <thead className="bg-zinc-900 text-zinc-500">
          <tr>
            <th className="p-4">Solicitante</th>
            <th className="p-4">Tipo</th>
            <th className="p-4">Fecha/Hora</th>
            <th className="p-4">Personas</th>
            <th className="p-4">Estado</th>
            <th className="p-4">Comprobante</th>
            <th className="p-4">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {reservas.map(r => (
            <tr key={r.id} className="hover:bg-white/5 transition-colors">
              <td className="p-4">
                <div className="font-bold text-white">{r.nombre}</div>
                <div className="text-xs text-zinc-500">{r.email}</div>
                <div className="text-xs text-zinc-500">{r.telefono}</div>
              </td>
              <td className="p-4 uppercase text-xs font-bold text-primary">{r.tipo}</td>
              <td className="p-4">{r.fecha} <br /> {r.hora}</td>
              <td className="p-4">{r.personas}</td>
              <td className="p-4">
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${ r.estado === 'aprobada' ? 'bg-green-500/20 text-green-400' : r.estado === 'rechazada' ? 'bg-rose-500/20 text-rose-400' : r.estado === 'comprobante_subido' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400' }`}>
                  {r.estado}
                </span>
              </td>
              <td className="p-4">
                {r.comprobantePagoUrl ? (
                  <a href={r.comprobantePagoUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Ver pago</a>
                ) : '-'}
              </td>
              <td className="p-4">
                {r.estado !== 'aprobada' && r.estado !== 'rechazada' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEstado(r.id, 'aprobada')} disabled={loading === r.id} className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-xs font-bold">Aprobar</button>
                    <button onClick={() => handleEstado(r.id, 'rechazada')} disabled={loading === r.id} className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/30 text-xs font-bold">Rechazar</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {reservas.length === 0 && (
            <tr><td colSpan={7} className="p-8 text-center text-zinc-500">No hay reservas</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}