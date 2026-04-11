import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { chatbotDocs } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { titulo, contenido, categoria, activo, orden } = body

  const [updated] = await db
    .update(chatbotDocs)
    .set({ titulo, contenido, categoria, activo, orden, updatedAt: new Date() })
    .where(eq(chatbotDocs.id, params.id))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  await db.delete(chatbotDocs).where(eq(chatbotDocs.id, params.id))
  return NextResponse.json({ ok: true })
}
