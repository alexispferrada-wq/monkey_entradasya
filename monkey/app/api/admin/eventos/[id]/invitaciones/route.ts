import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invitaciones } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const lista = await db
    .select()
    .from(invitaciones)
    .where(eq(invitaciones.eventoId, params.id))
    .orderBy(desc(invitaciones.createdAt))

  return NextResponse.json(lista)
}
