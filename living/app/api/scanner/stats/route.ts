export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eventos, invitaciones } from '@/lib/db/schema'
import { eq, and, gte, lt, count, sql } from 'drizzle-orm'

export async function GET() {
  try {
    // Ventana de 24h: 12h hacia atrás y 12h hacia adelante desde ahora
    // Esto captura todos los eventos "de hoy" independiente de zona horaria
    const desde = new Date(Date.now() - 12 * 60 * 60 * 1000)
    const hasta = new Date(Date.now() + 12 * 60 * 60 * 1000)

    const rows = await db
      .select({
        id: eventos.id,
        nombre: eventos.nombre,
        fecha: eventos.fecha,
        lugar: eventos.lugar,
        cuposTotal: eventos.cuposTotal,
        cuposDisponibles: eventos.cuposDisponibles,
        tipo: eventos.tipo,
        totalInvitaciones: count(invitaciones.id),
        ingresados: sql<number>`count(*) FILTER (WHERE ${invitaciones.estado} = 'usada')`,
        pendientes: sql<number>`count(*) FILTER (WHERE ${invitaciones.estado} = 'pendiente')`,
      })
      .from(eventos)
      .leftJoin(invitaciones, eq(eventos.id, invitaciones.eventoId))
      .where(and(gte(eventos.fecha, desde), lt(eventos.fecha, hasta)))
      .groupBy(eventos.id)
      .orderBy(eventos.fecha)

    const data = rows.map((r) => ({
      ...r,
      totalInvitaciones: Number(r.totalInvitaciones),
      ingresados: Number(r.ingresados),
      pendientes: Number(r.pendientes),
    }))

    return NextResponse.json({ eventos: data })
  } catch (error) {
    console.error('[GET /api/scanner/stats]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
