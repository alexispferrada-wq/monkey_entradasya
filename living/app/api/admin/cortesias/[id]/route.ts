export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { cortesias } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateQR } from '@/lib/qr'

const schema = z.object({
  accion:     z.enum(['aprobar', 'rechazar']),
  adminNotas: z.string().max(500).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { accion, adminNotas } = schema.parse(body)

    const [cortesia] = await db
      .select()
      .from(cortesias)
      .where(eq(cortesias.id, id))
      .limit(1)

    if (!cortesia) {
      return NextResponse.json({ error: 'Cortesía no encontrada.' }, { status: 404 })
    }

    if (accion === 'aprobar') {
      const { url: qrImageUrl, publicId: qrPublicId } = await generateQR(cortesia.token)
      await db
        .update(cortesias)
        .set({
          estado:      'aprobada',
          qrImageUrl,
          qrPublicId,
          adminNotas:  adminNotas ?? null,
          adminAt:     new Date(),
        })
        .where(eq(cortesias.id, id))
    } else {
      await db
        .update(cortesias)
        .set({
          estado:     'rechazada',
          adminNotas: adminNotas ?? null,
          adminAt:    new Date(),
        })
        .where(eq(cortesias.id, id))
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos.' }, { status: 422 })
    }
    console.error('[PATCH /api/admin/cortesias/[id]]', error)
    return NextResponse.json({ error: 'Error al procesar cortesía.' }, { status: 500 })
  }
}
