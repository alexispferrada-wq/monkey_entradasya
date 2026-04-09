import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invitaciones, eventos } from '@/lib/db/schema'
import { eq, and, or } from 'drizzle-orm'
import { uploadQR, cloudinary } from '@/lib/cloudinary'
import { enviarInvitacion } from '@/lib/email'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import { ZodError } from 'zod'
import { invitacionSchema } from '@/lib/schemas'
import { handleError, ConflictError, NotFoundError, ValidationError } from '@/lib/errors'

// Email de prueba — actualizado desde env var
const TEST_EMAILS = process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : []

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input with Zod
    const { eventoId, nombre, email } = invitacionSchema.parse(body)
    
    const emailNorm = email.toLowerCase()
    const isTestEmail = TEST_EMAILS.includes(emailNorm)

    // Use transaction for atomicity
    const resultado = await db.transaction(async (tx) => {
      // 1. Verificar que el evento existe y tiene cupos
      const [evento] = await tx
        .select()
        .from(eventos)
        .where(and(eq(eventos.id, eventoId), eq(eventos.activo, true)))
        .limit(1)

      if (!evento) {
        throw new NotFoundError('Evento', eventoId)
      }

      if (!isTestEmail && evento.cuposDisponibles <= 0) {
        throw new ConflictError('No hay cupos disponibles para este evento')
      }

      // 2. Verificar duplicado por email en el mismo evento
      if (!isTestEmail) {
        const [existente] = await tx
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
          throw new ConflictError(
            'Ya existe una invitación para este correo en este evento'
          )
        }
      }

      // 3. Crear token y enlace de invitación
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

      // 6. Insertar invitación en la transacción
      const [nuevaInvitacion] = await tx
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

      // 7. Decrementar cupos (no aplica a emails de prueba)
      if (!isTestEmail) {
        await tx
          .update(eventos)
          .set({ cuposDisponibles: evento.cuposDisponibles - 1 })
          .where(eq(eventos.id, eventoId))
      }

      return { invitacion: nuevaInvitacion, evento, qrPubId }
    })

    // 8. Enviar email fuera de la transacción
    try {
      await enviarInvitacion(resultado.invitacion, resultado.evento)
      return NextResponse.json({ ok: true, token: resultado.invitacion.token }, { status: 201 })
    } catch (emailError) {
      // En caso de error de email, hacer rollback manual
      console.error('[POST /api/invitaciones] email error', emailError)

      try {
        // Delete invitation
        await db.delete(invitaciones).where(eq(invitaciones.id, resultado.invitacion.id))

        // Restore cupos
        if (!isTestEmail) {
          await db
            .update(eventos)
            .set({ cuposDisponibles: resultado.evento.cuposDisponibles + 1 })
            .where(eq(eventos.id, resultado.evento.id))
        }

        // Delete QR from Cloudinary
        if (resultado.qrPubId) {
          await cloudinary.uploader
            .destroy(resultado.qrPubId, { resource_type: 'image' })
            .catch((destroyError) => {
              console.error('[POST /api/invitaciones] rollback cloudinary failed', destroyError)
            })
        }
      } catch (rollbackError) {
        console.error('[POST /api/invitaciones] rollback failed:', rollbackError)
      }

      return NextResponse.json(
        { error: 'No fue posible enviar la invitación. Intenta de nuevo.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[POST /api/invitaciones]', error)

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 400 }
      )
    }

    if (error instanceof ConflictError) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      handleError(error),
      { status: 500 }
    )
  }
}
