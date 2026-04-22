export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'
import { eventos, chatbotDocs, reservasChatbot, type ChatbotDoc } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { Resend } from 'resend'
import { processMessage, type Message } from '@/lib/chatbot/engine'

const MAX_MESSAGES   = 40
const MAX_MSG_LENGTH = 500

const getCachedChatbotDocs = unstable_cache(
  async (): Promise<ChatbotDoc[]> =>
    db.select().from(chatbotDocs).orderBy(asc(chatbotDocs.orden)),
  ['chatbot-docs'],
  { revalidate: 60, tags: ['chatbot-docs'] }
)

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

async function enviarEmailReserva(reserva: {
  nombre: string
  fecha: string
  hora: string
  personas: number
  contacto: string
}) {
  const resend = getResend()
  if (!resend) return

  const emailReservas = process.env.RESERVAS_EMAIL || 'reservas@entradasya.cl'

  const html = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#050505;font-family:Arial,sans-serif;color:#e5e7eb;">
  <div style="max-width:480px;margin:0 auto;background:#0a0a0a;border:1px solid rgba(245,194,0,0.3);border-radius:16px;padding:32px;">
    <div style="font-size:28px;font-weight:900;color:#F5C200;letter-spacing:4px;margin-bottom:4px;">LIVING CLUB</div>
    <div style="font-size:11px;color:#6b7280;letter-spacing:4px;margin-bottom:24px;">NUEVA RESERVA</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Cliente</td><td style="padding:8px 0;color:#fff;font-weight:700;">${reserva.nombre}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Fecha</td><td style="padding:8px 0;color:#F5C200;font-weight:700;">${reserva.fecha}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Hora</td><td style="padding:8px 0;color:#F5C200;font-weight:700;">${reserva.hora}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Personas</td><td style="padding:8px 0;color:#fff;font-weight:700;">${reserva.personas}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Contacto</td><td style="padding:8px 0;color:#fff;">${reserva.contacto}</td></tr>
    </table>
  </div>
</body></html>`

  await resend.emails.send({
    from: 'Chatbot Living Club <invitaciones@entradasya.cl>',
    to: emailReservas,
    subject: `Nueva reserva: ${reserva.nombre} — ${reserva.fecha} ${reserva.hora} (${reserva.personas}p)`,
    html,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Mensajes inválidos' }, { status: 400 })
    }
    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json({ error: `Máximo ${MAX_MESSAGES} mensajes.` }, { status: 400 })
    }
    const oversized = messages.find(
      (m: Message) => typeof m.content === 'string' && m.content.length > MAX_MSG_LENGTH
    )
    if (oversized) {
      return NextResponse.json({ error: `Cada mensaje no puede superar ${MAX_MSG_LENGTH} caracteres.` }, { status: 400 })
    }

    // Load knowledge base + active events in parallel
    let docs: ChatbotDoc[] = []
    let eventosActivos: Array<{ nombre: string; fecha: Date; slug: string; cuposDisponibles: number }> = []

    try {
      const [docsResult, eventosResult] = await Promise.all([
        getCachedChatbotDocs(),
        db.select({ nombre: eventos.nombre, fecha: eventos.fecha, slug: eventos.slug, cuposDisponibles: eventos.cuposDisponibles })
          .from(eventos).where(eq(eventos.activo, true)).orderBy(eventos.fecha),
      ])
      docs = docsResult
      eventosActivos = eventosResult
    } catch (err) {
      console.error('[Chat] DB error:', err)
    }

    // Get last user message
    const lastUserMsg = [...messages].reverse().find((m: Message) => m.role === 'user')
    if (!lastUserMsg) {
      return NextResponse.json({ error: 'No hay mensaje del usuario' }, { status: 400 })
    }

    // Process with rule-based engine
    const result = processMessage(lastUserMsg.content, messages, docs, eventosActivos)

    // If reservation data is complete — save to DB and send email
    if (result.reservationData) {
      const { nombre, fecha, hora, personas, contacto } = result.reservationData
      if (nombre && fecha && hora && personas && contacto) {
        try {
          await db.insert(reservasChatbot).values({ nombre, fecha, hora, personas, contacto })
        } catch (err) {
          console.error('[Chat] Error guardando reserva:', err)
        }
        try {
          await enviarEmailReserva({ nombre, fecha, hora, personas, contacto })
        } catch (err) {
          console.error('[Chat] Error enviando email reserva:', err)
        }
      }
    }

    return NextResponse.json({ reply: result.reply })
  } catch (error) {
    console.error('[Chat API Error]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/*
// ── VERSIÓN CON GROQ AI (comentada) ──────────────────────────────────────────
// import Groq from 'groq-sdk'
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
// ...
*/
