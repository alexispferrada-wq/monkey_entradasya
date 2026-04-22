export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { reservas } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import AdminReservasList from './AdminReservasList'

export default async function AdminReservasPage() {
  const lista = await db
    .select()
    .from(reservas)
    .orderBy(desc(reservas.createdAt))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-primary tracking-widest uppercase">Reservas</h1>
        <p className="text-zinc-500 text-sm">Gestiona y aprueba solicitudes de reservas.</p>
      </div>
      <AdminReservasList reservas={lista} />
    </div>
  )
}