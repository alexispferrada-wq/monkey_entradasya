import { db } from '@/lib/db'
import { eventos, invitaciones } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

const estadoStyles = {
  pendiente: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  enviada: 'bg-green-500/20 text-green-400 border-green-500/30',
  usada: 'bg-slate-700 text-slate-400 border-slate-600',
  cancelada: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
}

function formatFecha(fecha: Date) {
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Santiago',
  })
}

export const revalidate = 0

export default async function InvitacionesPage({ params }: Props) {
  const { id } = await params
  const [evento] = await db
    .select()
    .from(eventos)
    .where(eq(eventos.id, id))
    .limit(1)

  if (!evento) notFound()

  const lista = await db
    .select()
    .from(invitaciones)
    .where(eq(invitaciones.eventoId, id))
    .orderBy(desc(invitaciones.createdAt))

  const stats = {
    total: lista.length,
    enviadas: lista.filter((i) => i.estado === 'enviada').length,
    usadas: lista.filter((i) => i.estado === 'usada').length,
    canceladas: lista.filter((i) => i.estado === 'cancelada').length,
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href={`/admin/eventos/${id}`} className="text-slate-400 hover:text-white text-sm transition-colors">
          ← Editar evento
        </Link>
      </div>
      <h1 className="text-2xl font-black text-white mb-1">{evento.nombre}</h1>
      <p className="text-slate-500 text-sm mb-8">Lista de invitaciones</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Enviadas', value: stats.enviadas, color: 'text-green-400' },
          { label: 'Usadas', value: stats.usadas, color: 'text-slate-400' },
          { label: 'Canceladas', value: stats.canceladas, color: 'text-rose-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      {lista.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-slate-400">No hay invitaciones aún.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-500">
                  <th className="text-left px-5 py-3 font-medium">Nombre</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Estado</th>
                  <th className="text-left px-5 py-3 font-medium">Solicitado</th>
                  <th className="text-left px-5 py-3 font-medium">Usado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {lista.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className={`border-b border-white/5 hover:bg-white/2 transition-colors ${
                      i === lista.length - 1 ? 'border-0' : ''
                    }`}
                  >
                    <td className="px-5 py-3 text-white font-medium">{inv.nombre}</td>
                    <td className="px-5 py-3 text-slate-400">{inv.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${estadoStyles[inv.estado]}`}>
                        {inv.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatFecha(inv.createdAt)}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {inv.usedAt ? formatFecha(inv.usedAt) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/invitacion/${inv.token}`}
                        target="_blank"
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Ver QR ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
