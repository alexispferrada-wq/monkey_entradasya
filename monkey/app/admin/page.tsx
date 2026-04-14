import { db } from '@/lib/db'
import { eventos, invitaciones } from '@/lib/db/schema'
import { eq, count, sql, and, lt } from 'drizzle-orm'
import Link from 'next/link'
import DeleteEventButton from './DeleteEventButton'
import DashboardFilters from './DashboardFilters'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function formatFecha(fecha: Date) {
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Santiago',
  })
}

// Un evento se considera pasado cuando han pasado 2h desde su inicio
const DOS_HORAS_MS = 2 * 60 * 60 * 1000
function esPasado(fecha: Date): boolean {
  return new Date(fecha).getTime() + DOS_HORAS_MS < Date.now()
}

type EventoRow = {
  id: string
  nombre: string
  fecha: Date
  lugar: string
  cuposTotal: number
  cuposDisponibles: number
  activo: boolean
  slug: string
  tipo: string
  total: number
  usadas: number
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; lugar?: string }>
}) {
  const params = await searchParams
  const vista = params.vista ?? 'activos'
  const lugarFiltro = params.lugar ?? ''

  // Auto-marcar como inactivos los eventos cuya fecha + 2h ya pasó
  const corte = new Date(Date.now() - DOS_HORAS_MS)
  await db
    .update(eventos)
    .set({ activo: false })
    .where(and(eq(eventos.activo, true), lt(eventos.fecha, corte)))

  // Traer todos los eventos ordenados por fecha ascendente
  const lista = (await db
    .select({
      id: eventos.id,
      nombre: eventos.nombre,
      fecha: eventos.fecha,
      lugar: eventos.lugar,
      cuposTotal: eventos.cuposTotal,
      cuposDisponibles: eventos.cuposDisponibles,
      activo: eventos.activo,
      slug: eventos.slug,
      tipo: eventos.tipo,
      total: count(invitaciones.id),
      usadas: sql`count(*) FILTER (WHERE ${invitaciones.estado} = 'usada')`,
    })
    .from(eventos)
    .leftJoin(invitaciones, eq(eventos.id, invitaciones.eventoId))
    .groupBy(eventos.id)
    .orderBy(eventos.fecha)) as EventoRow[]

  const listaNormalizada: EventoRow[] = lista.map((e) => ({
    ...e,
    total: Number(e.total),
    usadas: Number(e.usadas),
  }))

  // Separar activos / pasados
  const todosActivos = listaNormalizada.filter((e) => !esPasado(e.fecha))
  const todosPasados = listaNormalizada
    .filter((e) => esPasado(e.fecha))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()) // más reciente primero

  // Extraer lugares únicos del conjunto visible
  const lugares = [...new Set(listaNormalizada.map((e) => e.lugar))].sort()

  // Aplicar filtro de lugar
  const filtrar = (arr: EventoRow[]) =>
    lugarFiltro ? arr.filter((e) => e.lugar === lugarFiltro) : arr

  const eventosVisibles = vista === 'pasados' ? filtrar(todosPasados) : filtrar(todosActivos)

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            {todosActivos.length} próximo{todosActivos.length !== 1 ? 's' : ''} · {todosPasados.length} pasado{todosPasados.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/eventos/nuevo" className="btn-primary text-sm px-5 py-2.5">
          + Nuevo evento
        </Link>
      </div>

      {/* Filtros */}
      <Suspense>
        <DashboardFilters
          lugares={lugares}
          totalActivos={filtrar(todosActivos).length}
          totalPasados={filtrar(todosPasados).length}
        />
      </Suspense>

      {/* Lista */}
      {eventosVisibles.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">{vista === 'pasados' ? '📦' : '🎭'}</div>
          <p className="text-slate-400 mb-4">
            {vista === 'pasados'
              ? 'No hay eventos pasados' + (lugarFiltro ? ` en ${lugarFiltro}` : '') + '.'
              : 'No hay eventos próximos' + (lugarFiltro ? ` en ${lugarFiltro}` : '') + '.'}
          </p>
          {vista === 'activos' && (
            <Link href="/admin/eventos/nuevo" className="btn-primary inline-block text-sm">
              Crear primer evento →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {eventosVisibles.map((evento) => {
            const pct =
              evento.cuposTotal > 0
                ? Math.round(
                    ((evento.cuposTotal - evento.cuposDisponibles) / evento.cuposTotal) * 100
                  )
                : 0

            const pasado = esPasado(evento.fecha)

            return (
              <div
                key={evento.id}
                className={`glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                  pasado ? 'opacity-70' : ''
                }`}
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-white font-bold text-lg truncate">{evento.nombre}</h2>

                    {/* Tipo badge */}
                    {evento.tipo === 'cumpleanos' && (
                      <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                        🎂 Cumpleaños
                      </span>
                    )}

                    {/* Estado badge */}
                    {pasado ? (
                      <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
                        Evento Pasado
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                        Activo
                      </span>
                    )}
                  </div>

                  <p className="text-slate-500 text-sm">
                    {formatFecha(evento.fecha)} · {evento.lugar}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="text-slate-300 font-medium">{evento.total} invitaciones</span>
                    <span>{evento.usadas} usadas</span>
                    <span>{evento.cuposDisponibles} cupos restantes</span>
                  </div>

                  {/* Barra de ocupación */}
                  <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden w-full max-w-xs">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: pasado
                          ? 'linear-gradient(90deg,#475569,#64748b)'
                          : pct > 80
                          ? 'linear-gradient(90deg,#f43f5e,#fb923c)'
                          : 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                      }}
                    />
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Link
                    href={`/admin/eventos/${evento.id}`}
                    className="text-sm px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:border-primary/50 hover:text-white transition-all"
                  >
                    Editar
                  </Link>
                  <Link
                    href={`/admin/eventos/${evento.id}/invitaciones`}
                    className="text-sm px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all"
                  >
                    Ver lista
                  </Link>
                  {!pasado && (
                    <Link
                      href="/scanner"
                      className="text-sm px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:border-white/30 hover:text-white transition-all"
                    >
                      Scan QR
                    </Link>
                  )}
                  <DeleteEventButton eventoId={evento.id} nombreEvento={evento.nombre} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
