import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { chatbotDocs } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

// Auth is handled by middleware for all /api/admin/* routes

export async function GET() {
  const docs = await db.select().from(chatbotDocs).orderBy(asc(chatbotDocs.orden), asc(chatbotDocs.categoria))
  return NextResponse.json(docs)
}

export async function POST(req: NextRequest) {
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
