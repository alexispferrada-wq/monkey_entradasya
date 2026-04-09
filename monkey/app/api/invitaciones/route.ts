import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invitaciones, eventos } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { uploadQR } from '@/lib/cloudinary'
import { enviarInvitacion } from '@/lib/email'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { eventoId, nombre, email } = await req.json()

    if (!eventoId || !nombre?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Faltan datos requeridos.' }, { status: 400 })
    }

    const emailNorm = email.trim().toLowerCase()

    // 1. Verificar que el evento existe y tiene cupos
    const [evento] = await db
      .select()
      .from(eventos)
      .where(and(eq(eventos.id, eventoId), eq(eventos.activo, true)))
      .limit(1)

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado.' }, { status: 404 })
    }

    if (evento.cuposDisponibles <= 0) {
      return NextResponse.json({ error: 'No hay cupos disponibles.' }, { status: 409 })
    }

    // 2. Verificar duplicado por email en el mismo evento
    const [existente] = await db
      .select({ id: invitaciones.id })
      .from(invitaciones)
      .where(and(eq(invitaciones.eventoId, eventoId), eq(invitaciones.email, emailNorm)))
      .limit(1)

    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe una invitación para este correo en este evento.' },
        { status: 409 }
      )
    }

    // 3. Crear el token
    const token = uuidv4()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://monkey.entradasya.cl'
    const linkInvitacion = `${baseUrl}/invitacion/${token}`

    // 4. Generar QR como base64
    const qrBase64 = await QRCode.toDataURL(linkInvitacion, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })

    // 5. Subir QR a Cloudinary
    const qrPublicId = `inv_${token.replace(/-/g, '').slice(0, 12)}`
    const { url: qrImageUrl, publicId: qrPubId } = await uploadQR(qrBase64, qrPublicId)

    // 6. Insertar invitación
    const [nuevaInvitacion] = await db
      .insert(invitaciones)
      .values({
        eventoId,
        nombre: nombre.trim(),
        email: emailNorm,
        token,
        estado: 'enviada',
        qrImageUrl,
        qrPublicId: qrPubId,
      })
      .returning()

    // 7. Decrementar cupos
    await db
      .update(eventos)
      .set({ cuposDisponibles: evento.cuposDisponibles - 1 })
      .where(eq(eventos.id, eventoId))

    // 8. Enviar email con Resend
    await enviarInvitacion(nuevaInvitacion, evento)

    return NextResponse.json({ ok: true, token }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/invitaciones]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
