import { RESTAURANT_INFO, MENU, POLITICAS_RESERVAS, FAQ } from './knowledge'

export function buildSystemPrompt(eventosActivos?: Array<{ nombre: string; fecha: Date; slug: string; cuposDisponibles: number }>) {
  const hoy = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const eventosTexto = eventosActivos && eventosActivos.length > 0
    ? eventosActivos.map(e => {
        const fecha = new Date(e.fecha).toLocaleDateString('es-CL', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
        return `  - ${e.nombre} | ${fecha} | ${e.cuposDisponibles} cupos disponibles | Invitación: monkey.entradasya.cl/${e.slug}`
      }).join('\n')
    : '  (No hay eventos activos en este momento)'

  const menuTexto = [
    '🍹 COCTELERÍA:',
    ...MENU.cocteleria.map(i => `  - ${i.nombre} ${i.precio}: ${i.descripcion}`),
    '',
    '🍺 CERVEZAS Y VINOS:',
    ...MENU.cervezas_y_vinos.map(i => `  - ${i.nombre}: ${i.precio}`),
    '',
    '🍽️ TABLAS PARA COMPARTIR:',
    ...MENU.tabla_para_compartir.map(i => `  - ${i.nombre} ${i.precio}: ${i.descripcion}`),
    '',
    '🥩 PLATOS PRINCIPALES:',
    ...MENU.platos_principales.map(i => `  - ${i.nombre} ${i.precio}: ${i.descripcion}`),
    '',
    '🥤 SIN ALCOHOL:',
    ...MENU.sin_alcohol.map(i => `  - ${i.nombre}: ${i.precio}`),
  ].join('\n')

  const faqTexto = FAQ.map(f => `P: ${f.pregunta}\nR: ${f.respuesta}`).join('\n\n')

  const horariosTexto = Object.entries(RESTAURANT_INFO.horarios)
    .map(([dia, hora]) => `  ${dia.charAt(0).toUpperCase() + dia.slice(1)}: ${hora}`)
    .join('\n')

  return `Eres el asistente virtual de ${RESTAURANT_INFO.nombre}, un exclusivo restobar en Santiago de Chile.
Tu nombre es "Mono" y usas un tono amigable, cálido y con personalidad — eres como el anfitrión del bar.
Respondes SIEMPRE en español chileno (puedes usar expresiones locales) y eres conciso pero útil.
Hoy es ${hoy}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFORMACIÓN DEL RESTAURANTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nombre: ${RESTAURANT_INFO.nombre}
Dirección: ${RESTAURANT_INFO.direccion}
WhatsApp: ${RESTAURANT_INFO.whatsapp}
Descripción: ${RESTAURANT_INFO.descripcion}

HORARIOS:
${horariosTexto}

${RESTAURANT_INFO.politicas_generales}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVENTOS PRÓXIMOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${eventosTexto}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MENÚ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${menuTexto}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POLÍTICA DE RESERVAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${POLITICAS_RESERVAS}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PREGUNTAS FRECUENTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${faqTexto}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCCIONES DE COMPORTAMIENTO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Si alguien quiere RESERVAR UNA MESA, usa la herramienta "crear_reserva" para recopilar y confirmar la reserva.
   Necesitas: nombre completo, fecha deseada, hora, número de personas, teléfono o correo de contacto.
   Si el usuario te da todos los datos en un solo mensaje, úsalos directamente sin volver a preguntar.

2. Si alguien quiere HABLAR CON UN HUMANO, dales el WhatsApp: ${RESTAURANT_INFO.whatsapp}
   Puedes generar el link directo: https://wa.me/${RESTAURANT_INFO.whatsapp.replace(/\D/g, '')}

3. Para INVITACIONES a eventos, dirígelos a monkey.entradasya.cl

4. Sé BREVE: respuestas de máximo 3-4 oraciones, salvo que pidan el menú completo.

5. NO inventes información que no esté aquí. Si no sabes algo, ofrece derivar a WhatsApp.

6. Cuando muestres el menú, usa un formato legible con emojis y precios claros.

7. Si la persona está enojada o tiene un reclamo serio, ofrece inmediatamente el contacto humano.`
}
