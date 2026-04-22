import type { ChatbotDoc } from '@/lib/db/schema'

export type Message = { role: 'user' | 'assistant'; content: string }

export interface ReservationData {
  nombre?: string
  fecha?: string
  hora?: string
  personas?: number
  contacto?: string
}

// ── Keyword maps ──────────────────────────────────────────────────────────────

const KW = {
  saludo:    ['hola', 'buenas', 'buen día', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'hello', 'saludos', 'buenas!'],
  horario:   ['horario', 'abierto', 'abre', 'cierra', 'cuando abren', 'cuando cierran', 'atiende', 'funcionan', 'abren'],
  menu:      ['menú', 'menu', 'comer', 'comida', 'beber', 'bebida', 'trago', 'cerveza', 'vino', 'precio', 'cuánto cuesta', 'cuanto cuesta', 'cuesta', 'vale', 'plato', 'cocktail', 'coctel', 'cóctel', 'carta', 'tragos'],
  reserva:   ['reserva', 'reservar', 'reservación', 'quiero una mesa', 'mesa para', 'quiero ir', 'ir al local', 'visitar'],
  evento:    ['evento', 'eventos', 'próximo', 'proximo', 'invitación', 'invitacion', 'entrada', 'show', 'concierto', 'tributo', 'que hay', 'qué hay'],
  ubicacion: ['dirección', 'direccion', 'donde', 'dónde', 'ubicación', 'ubicacion', 'llegar', 'queda', 'local', 'cómo llego'],
  cumple:    ['cumpleaños', 'cumpleano', 'cumple', 'birthday', 'celebrar', 'celebración', 'celebracion', 'aniversario'],
  whatsapp:  ['whatsapp', 'persona real', 'humano', 'hablar con alguien', 'llamar', 'contactar'],
  presupuesto: ['cuánto gastar', 'cuanto gastar', 'presupuesto', 'cuánto dinero', 'cuanto dinero', 'cuánto sale', 'cuenta aproximada', 'cuánto nos sale', 'cuánto me sale'],
  faq:       ['puedo', 'puedes', 'permiten', 'política', 'politic', 'permitido', 'edad', 'estacionamiento', 'parking', 'vegetariano', 'vegano', 'niños', 'aforo', 'capacidad'],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function lower(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function matches(text: string, keywords: string[]): boolean {
  const t = lower(text)
  return keywords.some(kw => t.includes(lower(kw)))
}

function docsByCategory(docs: ChatbotDoc[], cat: string): ChatbotDoc[] {
  return docs.filter(d => d.activo && d.categoria === cat).sort((a, b) => a.orden - b.orden)
}

function formatDocs(docs: ChatbotDoc[]): string {
  return docs.map(d => `**${d.titulo}**\n${d.contenido}`).join('\n\n')
}

function getWhatsApp(docs: ChatbotDoc[]): string {
  const info = docs.find(d => d.clave === 'info_general')
  if (info) {
    const m = info.contenido.match(/WhatsApp[:\s]+([+\d\s\-()]+)/i)
    if (m) return m[1].trim().replace(/\D/g, '')
  }
  return '56912345678'
}

// ── Reservation flow tracking ─────────────────────────────────────────────────

const ASK = {
  nombre:   'nombre completo para la reserva',
  fecha:    'para qué fecha',
  hora:     'a qué hora',
  personas: 'para cuántas personas',
  contacto: 'teléfono o correo de contacto',
}

/** Returns what the last bot message was asking for */
function lastBotQuestion(messages: Message[]): keyof typeof ASK | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      const c = lower(messages[i].content)
      if (c.includes(lower(ASK.contacto))) return 'contacto'
      if (c.includes(lower(ASK.personas)))  return 'personas'
      if (c.includes(lower(ASK.hora)))      return 'hora'
      if (c.includes(lower(ASK.fecha)))     return 'fecha'
      if (c.includes(lower(ASK.nombre)))    return 'nombre'
      return null
    }
  }
  return null
}

/** Extracts reservation data collected so far by scanning message pairs */
function extractReservationData(messages: Message[]): ReservationData {
  const data: ReservationData = {}
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === 'assistant') {
      const c = lower(messages[i].content)
      const next = messages[i + 1]
      if (next?.role !== 'user') continue
      if (c.includes(lower(ASK.nombre)))    data.nombre   = next.content.trim()
      if (c.includes(lower(ASK.fecha)))     data.fecha    = next.content.trim()
      if (c.includes(lower(ASK.hora)))      data.hora     = next.content.trim()
      if (c.includes(lower(ASK.personas))) {
        const n = parseInt(next.content)
        if (!isNaN(n)) data.personas = n
      }
      if (c.includes(lower(ASK.contacto))) data.contacto = next.content.trim()
    }
  }
  return data
}

/** True if we're inside an active reservation flow */
function isInReservationFlow(messages: Message[]): boolean {
  return lastBotQuestion(messages) !== null
}

// ── Main engine ───────────────────────────────────────────────────────────────

export interface ChatbotResult {
  reply: string
  reservationData?: ReservationData  // set when reservation is complete and ready to save
}

export function processMessage(
  userText: string,
  messages: Message[],  // full history including latest user message
  docs: ChatbotDoc[],
  eventos: Array<{ nombre: string; fecha: Date; slug: string; cuposDisponibles: number }>,
): ChatbotResult {

  const t = userText.trim()
  const wa = getWhatsApp(docs)
  const waUrl = `https://wa.me/${wa}`

  // ── 1. Reservation flow ───────────────────────────────────────────────────
  if (isInReservationFlow(messages.slice(0, -1))) {
    // The last user message is t — answer the last bot question
    const prevMessages = messages.slice(0, -1) // exclude current user msg
    const step = lastBotQuestion(prevMessages)

    // Add current user message to history for extraction
    const updatedMessages = [...prevMessages, { role: 'user' as const, content: t }]
    const data = extractReservationData(updatedMessages)

    if (step === 'nombre') {
      return { reply: `Perfecto, **${t}** 👍\n\n¿Para qué fecha te gustaría reservar? (ej: "sábado 21 de junio")` }
    }

    if (step === 'fecha') {
      return { reply: `¿A qué hora llegarían? (ej: "21:00" o "9 de la noche")` }
    }

    if (step === 'hora') {
      return { reply: `¿Para cuántas personas sería la reserva?` }
    }

    if (step === 'personas') {
      const n = parseInt(t)
      if (isNaN(n) || n < 1) {
        return { reply: `No entendí la cantidad. ¿Para cuántas personas sería la reserva? (ej: "4")` }
      }
      return { reply: `¿Cuál es tu teléfono o correo de contacto para confirmar la reserva?` }
    }

    if (step === 'contacto') {
      // All data collected — confirm
      const summary = `📋 **Resumen de tu reserva:**\n\n👤 Nombre: ${data.nombre}\n📅 Fecha: ${data.fecha}\n🕐 Hora: ${data.hora}\n👥 Personas: ${data.personas}\n📞 Contacto: ${data.contacto}\n\n¡Reserva enviada! Nuestro equipo te confirmará a la brevedad. También puedes escribirnos por [WhatsApp](${waUrl}) si necesitas algo más.`
      return {
        reply: summary,
        reservationData: data,
      }
    }
  }

  // ── 2. WhatsApp / human escalation ────────────────────────────────────────
  if (matches(t, KW.whatsapp)) {
    return { reply: `¡Con gusto! Puedes escribirnos directamente por WhatsApp y te atendemos al tiro 👉 [Contactar por WhatsApp](${waUrl})` }
  }

  // ── 3. Greeting ───────────────────────────────────────────────────────────
  if (matches(t, KW.saludo) && t.split(' ').length <= 5) {
    const hoy = new Date().toLocaleDateString('es-CL', { weekday: 'long' })
    return {
      reply: `¡Hola! Soy el asistente de **Living Club**. ¡Buen ${hoy}!\n\n¿En qué te puedo ayudar? Puedo contarte sobre el menú, horarios, eventos próximos o ayudarte a hacer una reserva.`,
    }
  }

  // ── 4. Cumpleaños / celebration ───────────────────────────────────────────
  if (matches(t, KW.cumple)) {
    const templateDocs = docs.filter(d => d.activo && d.categoria === 'template' && lower(d.titulo).includes('cumple'))
    const reservaDocs = docsByCategory(docs, 'reservas')
    if (templateDocs.length > 0) {
      return { reply: `¡En Living Club armamos cumpleaños memorables! 🎂\n\n${formatDocs(templateDocs)}\n\n¿Quieres hacer una reserva para celebrarlo con nosotros? Escribe "reservar" y te ayudo.` }
    }
    if (reservaDocs.length > 0) {
      return { reply: `¡Para celebraciones nos encanta ponernos creativos! 🎉\n\n${formatDocs(reservaDocs)}\n\n¿Quieres reservar para tu festejo? Escribe "reservar".` }
    }
    return { reply: `¡Celebremos juntos en Living Club! 🎂 Para coordinar tu evento especial, escríbenos por [WhatsApp](${waUrl}) y te armamos algo único.` }
  }

  // ── 5. Reservation intent ─────────────────────────────────────────────────
  if (matches(t, KW.reserva)) {
    const reservaDocs = docsByCategory(docs, 'reservas')
    const policyText = reservaDocs.length > 0 ? `\n\n${formatDocs(reservaDocs)}\n\n---\n` : '\n\n'
    return { reply: `¡Perfecto, te ayudo con la reserva!${policyText}Para empezar, ¿cuál es tu **nombre completo para la reserva**?` }
  }

  // ── 6. Events ─────────────────────────────────────────────────────────────
  if (matches(t, KW.evento)) {
    if (eventos.length === 0) {
      return { reply: `Aún no hay eventos activos publicados, pero seguimos organizando noches increíbles 🎉\n\nSeguinos en Instagram o escríbenos por [WhatsApp](${waUrl}) para estar al tanto de lo próximo.` }
    }
    const lista = eventos.map(e => {
      const fecha = new Date(e.fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
      return `🎟️ **${e.nombre}** — ${fecha} — ${e.cuposDisponibles} cupos\n   👉 Invitación gratuita en: living.entradasya.cl/${e.slug}`
    }).join('\n\n')
    return { reply: `¡Estos son los próximos eventos en Living Club! 🎉\n\n${lista}\n\nLas invitaciones son **gratuitas**, solo completas el formulario y te llega el QR al correo.` }
  }

  // ── 7. Menu ───────────────────────────────────────────────────────────────
  if (matches(t, KW.menu)) {
    const menuDocs = docsByCategory(docs, 'menu')
    if (menuDocs.length > 0) {
      return { reply: `Aquí te va nuestra carta 🍹🍖\n\n${formatDocs(menuDocs)}\n\n¿Quieres hacer una reserva o tienes alguna pregunta sobre el menú?` }
    }
    return { reply: `Para ver el menú completo y precios actualizados, escríbenos por [WhatsApp](${waUrl}) y te lo mandamos al tiro 🍹` }
  }

  // ── 8. Budget estimate ────────────────────────────────────────────────────
  if (matches(t, KW.presupuesto)) {
    const menuDocs = docsByCategory(docs, 'menu')
    if (menuDocs.length > 0) {
      return { reply: `Para estimarte el presupuesto te paso la carta y así puedes calcular 💰\n\n${formatDocs(menuDocs)}\n\nSi necesitas ayuda más específica, escríbenos por [WhatsApp](${waUrl}) y te orientamos según cuántas personas van y el tipo de noche que quieren.` }
    }
    return { reply: `Para darte un presupuesto ajustado necesitamos algunos datos. Escríbenos por [WhatsApp](${waUrl}) con cuántas personas son y qué tipo de noche planean 🍹` }
  }

  // ── 9. Horario ────────────────────────────────────────────────────────────
  if (matches(t, KW.horario)) {
    const horarioDocs = docsByCategory(docs, 'horarios')
    if (horarioDocs.length > 0) {
      return { reply: `Estos son nuestros horarios 🕐\n\n${formatDocs(horarioDocs)}` }
    }
    // Fallback to info_general
    const infoDocs = docsByCategory(docs, 'info')
    if (infoDocs.length > 0) {
      return { reply: formatDocs(infoDocs) }
    }
    return { reply: `Abrimos jueves a domingo desde las 20:00 hrs. Para confirmar horarios de un día específico, escríbenos por [WhatsApp](${waUrl})` }
  }

  // ── 10. Location ──────────────────────────────────────────────────────────
  if (matches(t, KW.ubicacion)) {
    const infoDocs = docsByCategory(docs, 'info')
    if (infoDocs.length > 0) {
      return { reply: `📍 La ubicación se define por evento:\n\n${formatDocs(infoDocs)}` }
    }
    return { reply: `📍 La ubicación puede cambiar según la fecha. Revisa la ficha del evento o escríbenos por [WhatsApp](${waUrl})` }
  }

  // ── 11. FAQ ───────────────────────────────────────────────────────────────
  if (matches(t, KW.faq)) {
    const faqDocs = docsByCategory(docs, 'faq')
    if (faqDocs.length > 0) {
      // Try to find a specific FAQ that matches
      const relevant = faqDocs.filter(d => {
        const keywords = lower(t).split(' ').filter(w => w.length > 3)
        return keywords.some(kw => lower(d.titulo + ' ' + d.contenido).includes(kw))
      })
      const toShow = relevant.length > 0 ? relevant : faqDocs.slice(0, 3)
      return { reply: `${formatDocs(toShow)}\n\n¿Tienes alguna otra consulta?` }
    }
  }

  // ── 12. Fallback ──────────────────────────────────────────────────────────
  const allDocs = docs.filter(d => d.activo)
  if (allDocs.length > 0) {
    // Try a broad keyword search across all docs
    const tWords = lower(t).split(/\s+/).filter(w => w.length > 3)
    const relevant = allDocs.filter(d => {
      const haystack = lower(d.titulo + ' ' + d.contenido)
      return tWords.some(w => haystack.includes(w))
    })
    if (relevant.length > 0) {
      return { reply: `${formatDocs(relevant.slice(0, 2))}\n\n¿Necesitas algo más?` }
    }
  }

  return {
    reply: `Mmm, no estoy seguro de cómo ayudarte con eso 😅\n\nPuedo contarte sobre el **menú**, **horarios**, **eventos** o **registro**. O si prefieres hablar directamente con alguien del equipo, por acá 👉 [WhatsApp](${waUrl})`,
  }
}
