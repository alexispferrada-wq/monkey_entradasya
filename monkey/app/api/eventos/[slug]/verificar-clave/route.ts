export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { clave } = await req.json()

    if (!clave || typeof clave !== 'string') {
      return NextResponse.json({ error: 'Clave requerida.' }, { status: 400 })
    }

    const [evento] = await db
      .select({ clave: eventos.clave, tipo: eventos.tipo, activo: eventos.activo })
      .from(eventos)
      .where(eq(eventos.slug, slug))
      .limit(1)

    if (!evento || !evento.activo) {
      return NextResponse.json({ error: 'Evento no encontrado.' }, { status: 404 })
    }

    if (evento.tipo !== 'cumpleanos' || !evento.clave) {
      return NextResponse.json({ error: 'Este evento no requiere clave.' }, { status: 400 })
    }

    // Aceptar cualquiera de las 4 palabras de la clave, o la frase completa
    const palabrasStored = evento.clave.trim().toUpperCase().split(/\s+/)
    const claveNorm = clave.trim().toUpperCase()

    const esValida =
      claveNorm === evento.clave.trim().toUpperCase() || // frase completa
      palabrasStored.includes(claveNorm)                 // cualquier palabra individual

    if (!esValida) {
      return NextResponse.json({ error: 'Palabra incorrecta. Pídela al organizador del evento.' }, { status: 401 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })

  } catch (err) {
    console.error('[POST /api/eventos/[slug]/verificar-clave]', err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
