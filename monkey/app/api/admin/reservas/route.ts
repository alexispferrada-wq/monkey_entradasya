export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reservas } from '@/lib/db/schema'
import { isNull, desc } from 'drizzle-orm'

export async function GET() {
  const lista = await db
    .select()
    .from(reservas)
    .where(isNull(reservas.deletedAt))
    .orderBy(desc(reservas.createdAt))
    .limit(200)

  return NextResponse.json(lista)
}
