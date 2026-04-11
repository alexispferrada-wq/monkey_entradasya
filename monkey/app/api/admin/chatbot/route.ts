import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { chatbotDocs } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/auth'
import { asc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const docs = await db.select().from(chatbotDocs).orderBy(asc(chatbotDocs.orden), asc(chatbotDocs.categoria))
  return NextResponse.json(docs)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { clave, categoria, titulo, contenido, orden = 0 } = body

  if (!clave || !categoria || !titulo || !contenido) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const [doc] = await db
    .insert(chatbotDocs)
    .values({ clave, categoria, titulo, contenido, orden, activo: true, updatedAt: new Date() })
    .returning()

  return NextResponse.json(doc, { status: 201 })
}
