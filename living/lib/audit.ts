import { db } from '@/lib/db'
import { auditLog } from '@/lib/db/schema'
import { NextRequest } from 'next/server'

type AuditEntidad = 'evento' | 'socio' | 'chatbot_doc' | 'invitacion'

export async function logAudit(
  req: NextRequest,
  accion: string,
  entidad: AuditEntidad,
  entidadId?: string,
  detalle?: Record<string, unknown>
) {
  try {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    await db.insert(auditLog).values({
      accion,
      entidad,
      entidadId,
      detalle: detalle ? JSON.stringify(detalle) : null,
      ip,
    })
  } catch (err) {
    // Nunca bloquear la respuesta principal por un error de logging
    console.error('[audit] Error escribiendo log:', err)
  }
}
