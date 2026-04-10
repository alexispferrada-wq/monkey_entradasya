export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { socios } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { crearPaseSocio, generarLinkWallet, ensureLoyaltyClass } from '@/lib/wallet/google'

// POST /api/wallet/google
// Body: { socioId: string }
// Crea el pass en Google Wallet y retorna el link "Add to Google Wallet"
export async function POST(req: NextRequest) {
  try {
    const { socioId } = await req.json()
    if (!socioId) return NextResponse.json({ error: 'socioId requerido' }, { status: 400 })

    const [socio] = await db
      .select()
      .from(socios)
      .where(eq(socios.id, socioId))
      .limit(1)

    if (!socio) return NextResponse.json({ error: 'Socio no encontrado' }, { status: 404 })

    // Asegurar que la clase de lealtad exista
    await ensureLoyaltyClass()

    // Crear o actualizar el pass object del socio
    const objectId = await crearPaseSocio(socio)

    // Guardar el objectId si no lo tenía
    if (!socio.googlePassObjectId) {
      await db
        .update(socios)
        .set({ googlePassObjectId: objectId, updatedAt: new Date() })
        .where(eq(socios.id, socioId))
    }

    // Generar el link firmado
    const link = await generarLinkWallet({ ...socio, googlePassObjectId: objectId })

    return NextResponse.json({ link })
  } catch (err) {
    console.error('[POST /api/wallet/google]', err)
    return NextResponse.json({ error: 'Error generando el pase de wallet.' }, { status: 500 })
  }
}
