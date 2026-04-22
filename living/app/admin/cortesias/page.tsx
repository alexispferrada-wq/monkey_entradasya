export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { cortesias, eventos } from '@/lib/db/schema'
import { isNull, desc, eq, and, gt } from 'drizzle-orm'
import CortesiasPanel from './CortesiasPanel'

export default async function AdminCortesiasPage() {
  const [lista, eventosDisponibles] = await Promise.all([
    db
      .select({ cortesia: cortesias, eventoNombre: eventos.nombre })
      .from(cortesias)
      .leftJoin(eventos, eq(cortesias.eventoId, eventos.id))
      .where(isNull(cortesias.deletedAt))
      .orderBy(desc(cortesias.createdAt)),
    db
      .select({ id: eventos.id, nombre: eventos.nombre, fecha: eventos.fecha })
      .from(eventos)
      .where(and(eq(eventos.activo, true), isNull(eventos.deletedAt)))
      .orderBy(eventos.fecha),
  ])

  const pendientes = lista.filter(r => r.cortesia.estado === 'pendiente').length
  const aprobadas  = lista.filter(r => r.cortesia.estado === 'aprobada').length

  return (
    <div className="min-h-screen pt-14 px-4 py-8">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-white tracking-widest uppercase">
              Cortesías
            </h1>
            <p className="text-zinc-600 text-sm mt-1">
              {pendientes} pendientes · {aprobadas} aprobadas
            </p>
          </div>
        </div>

        <CortesiasPanel
          lista={lista.map(r => ({ ...r.cortesia, eventoNombre: r.eventoNombre ?? null }))}
          eventos={eventosDisponibles}
        />
      </div>
    </div>
  )
}
