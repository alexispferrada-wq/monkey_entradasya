import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { chatbotDocs } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CATEGORIAS_VALIDAS = ['ambiente', 'template', 'horarios', 'info', 'faq', 'menu', 'reservas'] as const

const chatbotDocSchema = z.object({
  clave:     z.string().min(2).max(100).regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guiones bajos'),
  categoria: z.enum(CATEGORIAS_VALIDAS),
  titulo:    z.string().min(2).max(200).trim(),
  contenido: z.string().min(10).max(10000).trim(),
  orden:     z.number().int().min(0).max(9999).default(0),
})

export async function GET() {
  const docs = await db.select().from(chatbotDocs)
    .orderBy(asc(chatbotDocs.orden), asc(chatbotDocs.categoria))
    .limit(200)
  return NextResponse.json(docs)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = chatbotDocSchema.parse(body)

    const [doc] = await db
      .insert(chatbotDocs)
      .values({ ...validated, activo: true, updatedAt: new Date() })
      .returning()

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const msg = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
