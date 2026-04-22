export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invitaciones } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lista = await db
    .select()
    .from(invitaciones)
    .where(eq(invitaciones.eventoId, id))
    .orderBy(desc(invitaciones.createdAt))
    .limit(1000)

  return NextResponse.json(lista)
}
