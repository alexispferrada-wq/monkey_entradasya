import { db } from '@/lib/db'
import { eventos, invitaciones } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import Link from 'next/link'

export const revalidate = 0

async function getStats(eventoId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(invitaciones)
    .where(eq(invitaciones.eventoId, eventoId))

  const [{ usadas }] = await db
    .select({ usadas: count() })
    .from(invitaciones)
    .where(eq(invitaciones.eventoId, eventoId))

  return { total: Number(total), usadas: Number(usadas) }
}

function formatFecha(fecha: Date) {
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export default async function AdminPage() {
  const lista = await db.select().from(eventos).orderBy(eventos.fecha)

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">{lista.length} evento{lista.length !== 1 ? 's' : ''} en total</p>
        </div>
        <Link href="/admin/eventos/nuevo" className="btn-primary text-sm px-5 py-2.5">
          + Nuevo evento
        </Link>
      </div>

      {lista.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">🎭</div>
          <p className="text-slate-400 mb-4">No hay eventos creados aún.</p>
          <Link href="/admin/eventos/nuevo" className="btn-primary inline-block text-sm">
            Crear primer evento →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {await Promise.all(lista.map(async (evento) => {
            const stats = await getStats(evento.id)
            const pct = evento.cuposTotal > 0
              ? Math.round(((evento.cuposTotal - evento.cuposDisponibles) / evento.cuposTotal) * 100)
              : 0

            return (
              <div key={evento.id} className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-white font-bold text-lg truncate">{evento.nombre}</h2>
                    <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                      evento.activo
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {evento.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm">{formatFecha(evento.fecha)} · {evento.lugar}</p>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="text-slate-300 font-medium">{stats.total} invitaciones</span>
                    <span>{stats.usadas} usadas</span>
                    <span>{evento.cuposDisponibles} cupos restantes</span>
                  </div>

                  {/* Barra */}
                  <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden w-full max-w-xs">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: pct > 80
                          ? 'linear-gradient(90deg,#f43f5e,#fb923c)'
                          : 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                      }}
                    />
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 shrink-0">
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
                </div>
              </div>
            )
          }))}
        </div>
      )}
    </div>
  )
}
