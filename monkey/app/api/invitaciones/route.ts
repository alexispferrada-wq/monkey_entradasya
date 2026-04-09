import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invitaciones, eventos } from '@/lib/db/schema'
import { eq, and, or } from 'drizzle-orm'
import { uploadQR, cloudinary } from '@/lib/cloudinary'
import { enviarInvitacion } from '@/lib/email'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const invitacionSchema = z.object({
  eventoId: z.string().uuid(),
  nombre: z.string().min(2).max(100).trim(),
  email: z.string().email().trim(),
})

// Emails de prueba — sin límites de cupos ni restricción de duplicados
const TEST_EMAILS = process.env.ADMIN_EMAIL
  ? [process.env.ADMIN_EMAIL.toLowerCase()]
  : []

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventoId, nombre, email } = invitacionSchema.parse(body)
    const emailNorm = email.toLowerCase()
    const isTestEmail = TEST_EMAILS.includes(emailNorm)

    // 1. Verificar que el evento existe y está activo
    const [evento] = await db
      .select()
      .from(eventos)
      .where(and(eq(eventos.id, eventoId), eq(eventos.activo, true)))
      .limit(1)

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado.' }, { status: 404 })
    }

    if (!isTestEmail && evento.cuposDisponibles <= 0) {
      return NextResponse.json({ error: 'No hay cupos disponibles para este evento.' }, { status: 409 })
    }

    // 2. Verificar duplicado (no aplica a emails de prueba)
    if (!isTestEmail) {
      const [existente] = await db
        .select({ id: invitaciones.id })
        .from(invitaciones)
        .where(
          and(
            eq(invitaciones.eventoId, eventoId),
            eq(invitaciones.email, emailNorm),
            or(
              eq(invitaciones.estado, 'enviada'),
              eq(invitaciones.estado, 'pendiente')
            )
          )
        )
        .limit(1)

      if (existente) {
        return NextResponse.json(
          { error: 'Ya existe una invitación para este correo en este evento.' },
          { status: 409 }
        )
      }
    }

    // 3. Crear token y QR
    const token = uuidv4()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://monkey.entradasya.cl'
    const linkInvitacion = `${baseUrl}/invitacion/${token}`

    const qrBase64 = await QRCode.toDataURL(linkInvitacion, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })

    // 4. Subir QR a Cloudinary
    const qrPublicId = `inv_${token.replace(/-/g, '').slice(0, 12)}`
    const { url: qrImageUrl, publicId: qrPubId } = await uploadQR(qrBase64, qrPublicId)

    // 5. Insertar invitación
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

    // 6. Decrementar cupos (no aplica a emails de prueba)
    if (!isTestEmail) {
      await db
        .update(eventos)
        .set({ cuposDisponibles: evento.cuposDisponibles - 1 })
        .where(eq(eventos.id, eventoId))
    }

    // 7. Enviar email
    try {
      await enviarInvitacion(nuevaInvitacion, evento)
      return NextResponse.json({ ok: true, token }, { status: 201 })
    } catch (emailError) {
      console.error('[POST /api/invitaciones] email error', emailError)

      // Rollback manual: borrar invitación + restaurar cupos + borrar QR
      await db.delete(invitaciones).where(eq(invitaciones.id, nuevaInvitacion.id))

      if (!isTestEmail) {
        await db
          .update(eventos)
          .set({ cuposDisponibles: evento.cuposDisponibles })
          .where(eq(eventos.id, eventoId))
      }

      if (qrPubId) {
        cloudinary.uploader
          .destroy(qrPubId, { resource_type: 'image' })
          .catch(err => console.error('[rollback] cloudinary destroy failed', err))
      }

      return NextResponse.json(
        { error: 'No fue posible enviar la invitación. Intenta de nuevo.' },
        { status: 500 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos.', details: error.errors }, { status: 400 })
    }
    console.error('[POST /api/invitaciones]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
