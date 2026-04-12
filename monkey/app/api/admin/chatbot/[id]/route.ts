import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { chatbotDocs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const CATEGORIAS_VALIDAS = ['ambiente', 'template', 'horarios', 'info', 'faq', 'menu', 'reservas'] as const

const chatbotDocUpdateSchema = z.object({
  titulo:    z.string().min(2).max(200).trim().optional(),
  contenido: z.string().min(10).max(10000).trim().optional(),
  categoria: z.enum(CATEGORIAS_VALIDAS).optional(),
  activo:    z.boolean().optional(),
  orden:     z.number().int().min(0).max(9999).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const validated = chatbotDocUpdateSchema.parse(body)

    const [updated] = await db
      .update(chatbotDocs)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(chatbotDocs.id, id))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const msg = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [doc] = await db.select({ clave: chatbotDocs.clave, titulo: chatbotDocs.titulo }).from(chatbotDocs).where(eq(chatbotDocs.id, id)).limit(1)
  await db.delete(chatbotDocs).where(eq(chatbotDocs.id, id))
  await logAudit(req, 'delete_chatbot_doc', 'chatbot_doc', id, { clave: doc?.clave, titulo: doc?.titulo })
  return NextResponse.json({ ok: true })
}
