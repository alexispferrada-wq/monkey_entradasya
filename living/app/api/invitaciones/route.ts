export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invitaciones, eventos } from '@/lib/db/schema'
import { eq, and, or, gt, sql } from 'drizzle-orm'
import { uploadQR, cloudinary } from '@/lib/cloudinary'
import { enviarInvitacion } from '@/lib/email'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { isDisposableEmail } from '@/lib/email-validation'

function validarRutChileno(rut: string): boolean {
  const clean = rut.replace(/[.\-\s]/g, '').toUpperCase()
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(body)) return false
  if (!/^[\dK]$/.test(dv)) return false

  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const rest = 11 - (sum % 11)
  const expected = rest === 11 ? '0' : rest === 10 ? 'K' : String(rest)
  return dv === expected
}

const invitacionSchema = z.object({
  eventoId: z.string().uuid(),
  nombre: z.string().min(2).max(150).trim(),
  rut: z.string()
    .min(7, 'RUT inválido')
    .max(12)
    .refine(validarRutChileno, { message: 'RUT inválido' }),
  email: z.string().email().trim(),
})

// Emails de prueba — sin límites de cupos ni restricción de duplicados
const TEST_EMAILS = [
  'alexispferrada@gmail.com',
  ...(process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL.toLowerCase()] : []),
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventoId, nombre, rut, email } = invitacionSchema.parse(body)
    // Normalizar RUT: solo dígitos + dígito verificador, sin puntos ni guión
    const rutNorm = rut.replace(/[.\-\s]/g, '').toUpperCase()
    const emailNorm = email.toLowerCase()

    if (isDisposableEmail(emailNorm)) {
      return NextResponse.json(
        { error: 'No se permiten correos temporales o descartables.' },
        { status: 400 }
      )
    }

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

    // 2. Verificar duplicados (no aplica a emails de prueba)
    if (!isTestEmail) {
      // Duplicado por email
      const [existenteEmail] = await db
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

      if (existenteEmail) {
        return NextResponse.json(
          { error: 'Ya existe una invitación para este correo en este evento.' },
          { status: 409 }
        )
      }

      // Duplicado por RUT
      if (rutNorm) {
        const [existenteRut] = await db
          .select({ id: invitaciones.id })
          .from(invitaciones)
          .where(
            and(
              eq(invitaciones.eventoId, eventoId),
              eq(invitaciones.rut, rutNorm),
              or(
                eq(invitaciones.estado, 'enviada'),
                eq(invitaciones.estado, 'pendiente')
              )
            )
          )
          .limit(1)

        if (existenteRut) {
          return NextResponse.json(
            { error: 'Este RUT ya tiene una invitación registrada para este evento.' },
            { status: 409 }
          )
        }
      }
    }

    // 3. Crear token y QR
    const token = uuidv4()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://living.entradasya.cl'
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
        rut: rutNorm,
        email: emailNorm,
        token,
        estado: 'enviada',
        qrImageUrl,
        qrPublicId: qrPubId,
      })
      .returning()

    // 6. Decrementar cupos de forma atómica (no aplica a emails de prueba)
    // WHERE cuposDisponibles > 0 previene race conditions con requests simultáneas
    if (!isTestEmail) {
      const [eventoActualizado] = await db
        .update(eventos)
        .set({ cuposDisponibles: sql`${eventos.cuposDisponibles} - 1` })
        .where(and(eq(eventos.id, eventoId), gt(eventos.cuposDisponibles, 0)))
        .returning({ cuposDisponibles: eventos.cuposDisponibles })

      if (!eventoActualizado) {
        // Otro request tomó el último cupo entre nuestra verificación y este update
        await db.delete(invitaciones).where(eq(invitaciones.id, nuevaInvitacion.id))
        if (qrPubId) cloudinary.uploader.destroy(qrPubId, { resource_type: 'image' }).catch(() => {})
        return NextResponse.json({ error: 'No hay cupos disponibles para este evento.' }, { status: 409 })
      }
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
