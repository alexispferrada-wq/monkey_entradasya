import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { db } from '@/lib/db'
import { eventos, chatbotDocs, reservasChatbot, type ChatbotDoc } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { Resend } from 'resend'
import { buildSystemPromptFromDocs } from '@/lib/chatbot/system-prompt'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

const GROQ_MODEL = 'llama-3.3-70b-versatile'

// Tool definition (formato OpenAI/Groq)
const TOOLS: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'crear_reserva',
      description: 'Crea una reserva de mesa en Monkey Restobar. Llama esta herramienta cuando tengas todos los datos necesarios del cliente.',
      parameters: {
        type: 'object',
        properties: {
          nombre:   { type: 'string', description: 'Nombre completo del cliente' },
          fecha:    { type: 'string', description: 'Fecha de la reserva (ej: "sábado 15 de junio")' },
          hora:     { type: 'string', description: 'Hora de llegada (ej: "21:00")' },
          personas: { type: 'number', description: 'Número de personas' },
          contacto: { type: 'string', description: 'Teléfono o correo electrónico de contacto' },
          notas:    { type: 'string', description: 'Notas adicionales o requerimientos especiales (opcional)' },
        },
        required: ['nombre', 'fecha', 'hora', 'personas', 'contacto'],
      },
    },
  },
]

async function enviarEmailReserva(reserva: {
  nombre: string
  fecha: string
  hora: string
  personas: number
  contacto: string
  notas?: string
}) {
  const resend = getResend()
  if (!resend) throw new Error('RESEND_API_KEY no configurado')

  const emailReservas = process.env.RESERVAS_EMAIL || 'reservas@monkeyrestobar.cl'

  const htmlRestaurant = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Nueva Reserva</title></head>
<body style="margin:0;padding:24px;background:#050505;font-family:Arial,sans-serif;color:#e5e7eb;">
  <div style="max-width:480px;margin:0 auto;background:#0a0a0a;border:1px solid rgba(245,194,0,0.3);border-radius:16px;padding:32px;">
    <div style="font-size:28px;font-weight:900;color:#F5C200;letter-spacing:4px;text-transform:uppercase;margin-bottom:4px;">MONKEY</div>
    <div style="font-size:11px;color:#6b7280;letter-spacing:4px;margin-bottom:24px;">NUEVA RESERVA</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Cliente</td><td style="padding:8px 0;color:#fff;font-weight:700;">${reserva.nombre}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Fecha</td><td style="padding:8px 0;color:#F5C200;font-weight:700;">${reserva.fecha}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Hora</td><td style="padding:8px 0;color:#F5C200;font-weight:700;">${reserva.hora}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Personas</td><td style="padding:8px 0;color:#fff;font-weight:700;">${reserva.personas} persona${reserva.personas !== 1 ? 's' : ''}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">Contacto</td><td style="padding:8px 0;color:#fff;">${reserva.contacto}</td></tr>
      ${reserva.notas ? `<tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;vertical-align:top;">Notas</td><td style="padding:8px 0;color:#d1d5db;">${reserva.notas}</td></tr>` : ''}
    </table>
    <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(245,194,0,0.15);font-size:11px;color:#374151;">
      Solicitud recibida vía chatbot · Monkey Restobar
    </div>
  </div>
</body></html>`

  await resend.emails.send({
    from: 'Chatbot Monkey <invitaciones@entradasya.cl>',
    to: emailReservas,
    subject: `🐒 Nueva reserva: ${reserva.nombre} — ${reserva.fecha} ${reserva.hora} (${reserva.personas}p)`,
    html: htmlRestaurant,
  })

  if (reserva.contacto.includes('@')) {
    const htmlCliente = `
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reserva confirmada</title></head>
<body style="margin:0;padding:24px;background:#050505;font-family:Arial,sans-serif;color:#e5e7eb;">
  <div style="max-width:480px;margin:0 auto;background:#0a0a0a;border:1px solid rgba(245,194,0,0.3);border-radius:16px;padding:32px;text-align:center;">
    <div style="font-size:32px;margin-bottom:8px;">🐒</div>
    <div style="font-size:28px;font-weight:900;color:#F5C200;letter-spacing:4px;text-transform:uppercase;">MONKEY</div>
    <div style="font-size:11px;color:#6b7280;letter-spacing:4px;margin-bottom:24px;">RESTOBAR</div>
    <div style="background:#111;border:1px solid rgba(245,194,0,0.2);border-radius:12px;padding:24px;margin-bottom:24px;text-align:left;">
      <div style="color:#9ca3af;font-size:12px;letter-spacing:2px;margin-bottom:4px;">SOLICITUD DE RESERVA</div>
      <div style="color:#fff;font-size:20px;font-weight:900;margin-bottom:16px;">${reserva.nombre}</div>
      <div style="color:#F5C200;font-weight:700;margin-bottom:4px;">📅 ${reserva.fecha} a las ${reserva.hora}</div>
      <div style="color:#d1d5db;">👥 ${reserva.personas} persona${reserva.personas !== 1 ? 's' : ''}</div>
      ${reserva.notas ? `<div style="margin-top:12px;color:#9ca3af;font-size:13px;">📝 ${reserva.notas}</div>` : ''}
    </div>
    <p style="color:#9ca3af;font-size:14px;line-height:1.6;">
      Recibimos tu solicitud de reserva. Nuestro equipo la confirmará a la brevedad.<br><br>
      ¿Dudas? Escríbenos por WhatsApp:
    </p>
    <a href="https://wa.me/${(process.env.WHATSAPP_NUMBER || '56912345678').replace(/\D/g, '')}"
       style="background:#F5C200;color:#000;text-decoration:none;padding:12px 32px;border-radius:10px;font-weight:900;display:inline-block;margin-top:8px;letter-spacing:1px;">
      CONTACTAR POR WHATSAPP
    </a>
    <div style="margin-top:24px;color:#374151;font-size:11px;">
      Av. Concha y Toro 1060, Local 3, Puente Alto
    </div>
  </div>
</body></html>`

    await resend.emails.send({
      from: 'Monkey Restobar <invitaciones@entradasya.cl>',
      to: reserva.contacto,
      subject: `🐒 Solicitud de reserva recibida — Monkey Restobar`,
      html: htmlCliente,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Mensajes inválidos' }, { status: 400 })
    }

    // Fetch active events and chatbot docs in parallel
    let eventosActivos: Array<{ nombre: string; fecha: Date; slug: string; cuposDisponibles: number }> = []
    let knowledgeDocs: ChatbotDoc[] = []
    try {
      const [evts, docs] = await Promise.all([
        db.select({ nombre: eventos.nombre, fecha: eventos.fecha, slug: eventos.slug, cuposDisponibles: eventos.cuposDisponibles })
          .from(eventos).where(eq(eventos.activo, true)).orderBy(eventos.fecha),
        db.select().from(chatbotDocs).orderBy(asc(chatbotDocs.orden)),
      ])
      eventosActivos = evts
      knowledgeDocs = docs
    } catch {
      // Si la DB falla, continúa sin contexto
    }

    const systemPrompt = buildSystemPromptFromDocs(knowledgeDocs, eventosActivos)

    // Construir historial de mensajes (formato OpenAI/Groq)
    const chatMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = messages
      .filter((m: { role: string; content: string }) => m.role === 'user' || m.role === 'assistant')
      .map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

    if (chatMessages.length === 0) {
      return NextResponse.json({ error: 'No hay mensajes válidos' }, { status: 400 })
    }

    // Primera llamada a Groq
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatMessages,
      ],
      tools: TOOLS,
      tool_choice: 'auto',
    })

    const choice = response.choices[0]

    // Manejar tool call (crear reserva)
    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls?.length) {
      const toolCall = choice.message.tool_calls[0]

      if (toolCall.function.name === 'crear_reserva') {
        // Validar argumentos del tool con Zod antes de usarlos
        const reservaSchema = z.object({
          nombre:   z.string().min(1).max(200),
          fecha:    z.string().min(1).max(100),
          hora:     z.string().min(1).max(20),
          personas: z.number().int().min(1).max(500),
          contacto: z.string().min(1).max(200),
          notas:    z.string().max(500).optional(),
        })

        let reservaData: z.infer<typeof reservaSchema>
        try {
          reservaData = reservaSchema.parse(JSON.parse(toolCall.function.arguments))
        } catch {
          return NextResponse.json({ reply: 'Hubo un problema procesando los datos de la reserva. ¿Puedes repetirlos?' })
        }

        // Guardar reserva en DB primero (garantiza que no se pierda aunque falle el email)
        let reservaId: string | undefined
        try {
          const [reservaGuardada] = await db
            .insert(reservasChatbot)
            .values({
              nombre:   reservaData.nombre,
              fecha:    reservaData.fecha,
              hora:     reservaData.hora,
              personas: reservaData.personas,
              contacto: reservaData.contacto,
              notas:    reservaData.notas,
            })
            .returning({ id: reservasChatbot.id })
          reservaId = reservaGuardada.id
        } catch (err) {
          console.error('[chat] Error guardando reserva en DB:', err)
        }

        let emailEnviado = false
        let emailError = ''
        try {
          await enviarEmailReserva(reservaData)
          emailEnviado = true
          // Marcar email como enviado
          if (reservaId) {
            await db.update(reservasChatbot)
              .set({ emailEnviado: true })
              .where(eq(reservasChatbot.id, reservaId))
          }
        } catch (err) {
          emailError = err instanceof Error ? err.message : 'Error desconocido'
        }

        // Continuar la conversación con el resultado del tool
        const followUp = await groq.chat.completions.create({
          model: GROQ_MODEL,
          max_tokens: 512,
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatMessages,
            choice.message,
            {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: emailEnviado
                ? `Reserva guardada y confirmada. Email enviado al restaurante${reservaData.contacto.includes('@') ? ' y al cliente' : ''}.`
                : `Reserva guardada en el sistema${reservaId ? ` (ID: ${reservaId.slice(0,8)})` : ''}. Error al enviar email: ${emailError}. Indica al cliente que contacte por WhatsApp para confirmar.`,
            },
          ],
        })

        const reply = followUp.choices[0].message.content
        return NextResponse.json({ reply: reply || '¡Reserva recibida! Te contactaremos pronto.' })
      }
    }

    // Respuesta normal de texto
    const reply = choice.message.content
    return NextResponse.json({ reply: reply || 'Disculpa, no pude procesar tu consulta. ¿Puedo ayudarte con algo más?' })

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[Chat API Error]', msg)
    return NextResponse.json(
      { error: msg || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
