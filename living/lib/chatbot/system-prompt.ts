import type { ChatbotDoc } from '@/lib/db/schema'

export function buildSystemPromptFromDocs(
  docs: ChatbotDoc[],
  eventosActivos?: Array<{ nombre: string; fecha: Date; slug: string; cuposDisponibles: number }>
) {
  const hoy = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  // Get whatsapp from info_general doc
  const infoDoc = docs.find(d => d.clave === 'info_general')
  const whatsappMatch = infoDoc?.contenido.match(/WhatsApp:\s*([+\d\s]+)/)
  const whatsapp = whatsappMatch?.[1]?.trim().replace(/\D/g, '') || '56912345678'

  // Build events context
  const eventosTexto = eventosActivos && eventosActivos.length > 0
    ? eventosActivos.map(e => {
        const fecha = new Date(e.fecha).toLocaleDateString('es-CL', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
        return `  - ${e.nombre} | ${fecha} | ${e.cuposDisponibles} cupos | Invitación: living.entradasya.cl/${e.slug}`
      }).join('\n')
    : '  (No hay eventos activos en este momento)'

  // Group active docs by category for the prompt
  const activeDocs = docs.filter(d => d.activo)

  const sections = [
    { key: 'info',      label: 'INFORMACIÓN GENERAL' },
    { key: 'ambiente',  label: 'AMBIENTES DEL LOCAL' },
    { key: 'horarios',  label: 'HORARIOS' },
    { key: 'template',  label: 'RESPUESTAS PREDEFINIDAS (usa estas palabras cuando aplique)' },
    { key: 'reservas',  label: 'POLÍTICAS DE RESERVAS' },
    { key: 'menu',      label: 'MENÚ' },
    { key: 'faq',       label: 'PREGUNTAS FRECUENTES' },
  ]

  const knowledgeSections = sections.map(({ key, label }) => {
    const catDocs = activeDocs.filter(d => d.categoria === key)
    if (catDocs.length === 0) return null
    const content = catDocs.map(d => `### ${d.titulo}\n${d.contenido}`).join('\n\n')
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${label}:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${content}`
  }).filter(Boolean).join('\n\n')

  return `Eres el asistente virtual de Living Club, un espacio de eventos y experiencias en Santiago de Chile.
Te presentas como el asistente de Living Club y usas un tono amigable, cálido y con personalidad.
Respondes SIEMPRE en español chileno y eres conciso pero útil. Puedes usar emojis de forma moderada.
Hoy es ${hoy}.

${knowledgeSections}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVENTOS PRÓXIMOS CON INVITACIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${eventosTexto}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCCIONES DE COMPORTAMIENTO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. RESERVAS: Cuando alguien quiera reservar, usa la herramienta "crear_reserva".
   Necesitas: nombre completo, fecha, hora, número de personas, y teléfono o correo de contacto.
   Si tienes template predefinido para ese tipo de reserva (cumpleaños, lounge, etc.), úsalo como base.

2. Si el cliente menciona CUMPLEAÑOS, usa el template de cumpleaños.
   Si pregunta por el LOUNGE, usa el template del lounge.
   Adapta los templates al contexto de la conversación.

3. HUMANO: Si alguien quiere hablar con una persona, dales el WhatsApp: https://wa.me/${whatsapp}

4. INVITACIONES a eventos especiales: dirígelos a living.entradasya.cl

5. Sé BREVE: máximo 3-4 párrafos por respuesta, salvo que pidan el menú completo.

6. NO inventes información. Si no sabes algo, ofrece derivar a WhatsApp.

7. Si hay reclamos o problemas serios, ofrece WhatsApp de inmediato.

8. ESTIMACIÓN DE CONSUMO Y CUENTA APROXIMADA:
   Cuando alguien pregunte cuánto dinero necesita, cuánto le saldrá la cuenta, o cuánto gastar para X personas en Y horas, SIEMPRE:
   a) Busca los precios en la sección MENÚ de tu conocimiento.
   b) Estima consumo realista por persona según el tiempo:
      - Cervezas: ~1 cerveza por persona por hora (mínimo), puede ser 1.5-2 en ambiente festivo.
      - Tragos/cocktails: ~1 cada 1.5 horas por persona.
      - Comida: 1 plato por persona es suficiente para compartir, o 1 entre 2 si van a beber más.
   c) Calcula el rango MÍNIMO (consumo conservador) y MÁXIMO (consumo festivo).
   d) Agrega propina sugerida del 10% al total.
   e) Presenta la respuesta con desglose claro: bebidas, comida, subtotal, propina, TOTAL estimado.
   f) Usa rangos (ej: "$35.000 – $50.000") para ser honesto con la variabilidad.
   g) Si no tienes precios exactos en el menú para algo que mencionan, indícalo y ofrece WhatsApp para consultar.
   h) Al final, siempre sugiere que con reserva anticipada el anfitrión puede orientarlos mejor.`
}
