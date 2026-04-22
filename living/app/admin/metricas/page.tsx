export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { eventos, invitaciones, reservas } from '@/lib/db/schema'
import { and, count, desc, eq, isNull, ne, sql } from 'drizzle-orm'

type EventoResumen = {
  id: string
  nombre: string
  tipo: string
  fecha: Date
  cuposTotal: number
  cuposDisponibles: number
  invitacionesTotal: number
  invitacionesUsadas: number
  reservasShowPersonas: number
}

function pct(numerador: number, denominador: number): number {
  if (!denominador || denominador <= 0) return 0
  return Math.round((numerador / denominador) * 100)
}

function formatFecha(fecha: Date): string {
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'America/Santiago',
  })
}

export default async function AdminMetricasPage() {
  const [
    [{ totalEventos }],
    [{ totalActivos }],
    [{ totalCumpleanos }],
    [{ totalInvitados }],
    [{ totalInvitadosUsados }],
    [{ totalReservas }],
    [{ totalPersonasReservas }],
    [{ totalShowVendidos }],
  ] = await Promise.all([
    db.select({ totalEventos: count(eventos.id) }).from(eventos).where(isNull(eventos.deletedAt)),
    db.select({ totalActivos: count(eventos.id) }).from(eventos).where(and(eq(eventos.activo, true), isNull(eventos.deletedAt))),
    db.select({ totalCumpleanos: count(eventos.id) }).from(eventos).where(and(eq(eventos.tipo, 'cumpleanos'), isNull(eventos.deletedAt))),
    db.select({ totalInvitados: count(invitaciones.id) }).from(invitaciones),
    db.select({ totalInvitadosUsados: count(invitaciones.id) }).from(invitaciones).where(eq(invitaciones.estado, 'usada')),
    db.select({ totalReservas: count(reservas.id) }).from(reservas).where(isNull(reservas.deletedAt)),
    db.select({ totalPersonasReservas: sql<number>`COALESCE(SUM(${reservas.personas}), 0)` }).from(reservas).where(and(isNull(reservas.deletedAt), ne(reservas.estado, 'rechazada'))),
    db.select({ totalShowVendidos: sql<number>`COALESCE(SUM(${reservas.personas}), 0)` }).from(reservas).where(and(eq(reservas.tipo, 'show'), ne(reservas.estado, 'rechazada'), isNull(reservas.deletedAt))),
  ])

  const eventosBase = await db
    .select({
      id: eventos.id,
      nombre: eventos.nombre,
      tipo: eventos.tipo,
      fecha: eventos.fecha,
      cuposTotal: eventos.cuposTotal,
      cuposDisponibles: eventos.cuposDisponibles,
    })
    .from(eventos)
    .where(isNull(eventos.deletedAt))
    .orderBy(desc(eventos.fecha))

  const invitacionesPorEvento = await db
    .select({
      eventoId: invitaciones.eventoId,
      total: count(invitaciones.id),
      usadas: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${invitaciones.estado} = 'usada'), 0)`,
    })
    .from(invitaciones)
    .groupBy(invitaciones.eventoId)

  const reservasShowPorEvento = await db
    .select({
      eventoId: reservas.eventoId,
      personas: sql<number>`COALESCE(SUM(${reservas.personas}), 0)`,
    })
    .from(reservas)
    .where(and(eq(reservas.tipo, 'show'), ne(reservas.estado, 'rechazada'), isNull(reservas.deletedAt)))
    .groupBy(reservas.eventoId)

  const invMap = new Map(
    invitacionesPorEvento.map((row) => [row.eventoId, { total: Number(row.total) || 0, usadas: Number(row.usadas) || 0 }])
  )
  const showMap = new Map(
    reservasShowPorEvento
      .filter((row) => !!row.eventoId)
      .map((row) => [row.eventoId as string, Number(row.personas) || 0])
  )

  const detalle: EventoResumen[] = eventosBase.map((ev) => {
    const inv = invMap.get(ev.id) ?? { total: 0, usadas: 0 }
    return {
      ...ev,
      invitacionesTotal: inv.total,
      invitacionesUsadas: inv.usadas,
      reservasShowPersonas: showMap.get(ev.id) ?? 0,
    }
  })

  const cuposTotales = detalle.reduce((acc, ev) => acc + (ev.cuposTotal || 0), 0)
  const cuposVendidos = detalle.reduce((acc, ev) => acc + Math.max(0, (ev.cuposTotal || 0) - (ev.cuposDisponibles || 0)), 0)
  const ocupacionGlobal = pct(cuposVendidos, cuposTotales)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl text-primary tracking-widest uppercase">Metricas</h1>
        <p className="text-zinc-500 text-sm">Resumen global de eventos, invitados, ventas y ocupacion.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-primary/20">
          <p className="text-zinc-500 text-xs uppercase tracking-wide">Eventos</p>
          <p className="text-3xl font-black text-white mt-1">{Number(totalEventos) || 0}</p>
          <p className="text-xs text-zinc-400 mt-1">Activos: {Number(totalActivos) || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-primary/20">
          <p className="text-zinc-500 text-xs uppercase tracking-wide">Invitados</p>
          <p className="text-3xl font-black text-white mt-1">{Number(totalInvitados) || 0}</p>
          <p className="text-xs text-zinc-400 mt-1">Usaron QR: {Number(totalInvitadosUsados) || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-primary/20">
          <p className="text-zinc-500 text-xs uppercase tracking-wide">Reservas</p>
          <p className="text-3xl font-black text-white mt-1">{Number(totalReservas) || 0}</p>
          <p className="text-xs text-zinc-400 mt-1">Personas: {Number(totalPersonasReservas) || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-primary/20">
          <p className="text-zinc-500 text-xs uppercase tracking-wide">Ocupacion</p>
          <p className="text-3xl font-black text-white mt-1">{ocupacionGlobal}%</p>
          <p className="text-xs text-zinc-400 mt-1">Shows vendidos: {Number(totalShowVendidos) || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wide">Cumpleanos</p>
          <p className="text-2xl font-black text-white mt-1">{Number(totalCumpleanos) || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wide">Cupos Totales</p>
          <p className="text-2xl font-black text-white mt-1">{cuposTotales}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wide">Cupos Vendidos</p>
          <p className="text-2xl font-black text-white mt-1">{cuposVendidos}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-bold">Detalle por evento</h2>
          <span className="text-xs text-zinc-500">{detalle.length} eventos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-white/10">
                <th className="text-left px-4 py-3">Evento</th>
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-right px-4 py-3">Invitados</th>
                <th className="text-right px-4 py-3">QR usados</th>
                <th className="text-right px-4 py-3">Show vendidos</th>
                <th className="text-right px-4 py-3">Cupos</th>
                <th className="text-right px-4 py-3">Ocupacion</th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((ev) => {
                const vendidos = Math.max(0, (ev.cuposTotal || 0) - (ev.cuposDisponibles || 0))
                const ocupacion = pct(vendidos, ev.cuposTotal || 0)
                return (
                  <tr key={ev.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-white font-medium">{ev.nombre}</td>
                    <td className="px-4 py-3 text-zinc-400">{ev.tipo === 'cumpleanos' ? 'Cumpleanos' : 'Regular'}</td>
                    <td className="px-4 py-3 text-zinc-400">{formatFecha(ev.fecha)}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{ev.invitacionesTotal}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{ev.invitacionesUsadas}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{ev.reservasShowPersonas}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{vendidos}/{ev.cuposTotal}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${ocupacion >= 80 ? 'text-rose-400' : ocupacion >= 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {ocupacion}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
