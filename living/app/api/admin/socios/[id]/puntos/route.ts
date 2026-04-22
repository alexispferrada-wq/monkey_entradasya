export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { socios, movimientosPuntos } from '@/lib/db/schema'
import { logAudit } from '@/lib/audit'
import { eq } from 'drizzle-orm'
import { calcularNivel, actualizarPuntosWallet } from '@/lib/wallet/google'
import { z } from 'zod'

const puntosSchema = z.object({
  puntos: z.number().int().refine(n => n !== 0, 'No puede ser 0'),
  motivo: z.string().min(2).max(200),
})

// POST /api/admin/socios/[id]/puntos — sumar o restar puntos (protegido por middleware)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const { puntos, motivo } = puntosSchema.parse(body)

    const [socio] = await db
      .select()
      .from(socios)
      .where(eq(socios.id, id))
      .limit(1)

    if (!socio) return NextResponse.json({ error: 'Socio no encontrado.' }, { status: 404 })

    const nuevosPuntos = Math.max(0, socio.puntos + puntos)
    const nuevoNivel = calcularNivel(nuevosPuntos)

    const [actualizado] = await db
      .update(socios)
      .set({ puntos: nuevosPuntos, nivel: nuevoNivel, updatedAt: new Date() })
      .where(eq(socios.id, id))
      .returning()

    await db.insert(movimientosPuntos).values({
      socioId: id,
      puntos,
      motivo,
      operadorNombre: 'admin',
    })

    // Audit log + Google Wallet sin bloquear respuesta
    logAudit(req, 'update_puntos', 'socio', id, { puntos, motivo, puntosAntes: socio.puntos, puntosAhora: nuevosPuntos })
    actualizarPuntosWallet(actualizado).catch(err =>
      console.error('[wallet] Error actualizando puntos:', err)
    )

    return NextResponse.json(actualizado)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: err.errors }, { status: 400 })
    }
    console.error('[POST /api/admin/socios/[id]/puntos]', err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
