export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { socios } from '@/lib/db/schema'
import { desc, isNull } from 'drizzle-orm'

// GET /api/admin/socios — listar todos los socios (protegido por middleware)
export async function GET() {
  const lista = await db.select().from(socios)
    .where(isNull(socios.deletedAt))
    .orderBy(desc(socios.puntos))
    .limit(500)
  return NextResponse.json(lista)
}
