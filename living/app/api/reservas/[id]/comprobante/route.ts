export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reservas } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_SIZE = 10 * 1024 * 1024

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [reserva] = await db
      .select()
      .from(reservas)
      .where(eq(reservas.id, id))
      .limit(1)

    if (!reserva) {
      return NextResponse.json({ error: 'Reserva no encontrada.' }, { status: 404 })
    }
    if (reserva.tipo !== 'grill') {
      return NextResponse.json({ error: 'Solo solicitudes VIP requieren comprobante.' }, { status: 400 })
    }
    if (reserva.estado === 'aprobada' || reserva.estado === 'rechazada') {
      return NextResponse.json({ error: 'Esta reserva ya fue procesada.' }, { status: 409 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Formato no permitido. Sube una imagen (JPG, PNG, WebP, HEIC).' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'El archivo supera el límite de 10 MB.' }, { status: 400 })
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder:        'entradasya/comprobantes',
      resource_type: 'image',
      tags:          ['comprobante', 'living', 'grill'],
    })

    await db
      .update(reservas)
      .set({
        comprobantePagoUrl:  result.secure_url,
        comprobantePublicId: result.public_id,
        estado:              'comprobante_subido',
      })
      .where(eq(reservas.id, id))

    return NextResponse.json({ ok: true, url: result.secure_url })
  } catch (error) {
    console.error('[POST /api/reservas/[id]/comprobante]', error)
    return NextResponse.json({ error: 'Error al subir comprobante.' }, { status: 500 })
  }
}
