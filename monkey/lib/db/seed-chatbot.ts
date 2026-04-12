/**
 * Seed inicial del chatbot de Monkey Restobar
 * Ejecutar: npm run db:seed-chatbot
 *
 * También puedes editar directamente desde /admin/chatbot
 */
import 'dotenv/config'
import { db } from './index'
import { chatbotDocs } from './schema'
import { sql } from 'drizzle-orm'

const docs = [
  // ──────────────────────────────────────────
  // AMBIENTES
  // ──────────────────────────────────────────
  {
    clave: 'ambiente_lounge',
    categoria: 'ambiente',
    titulo: 'Monkey Lounge — Salón 1° piso',
    orden: 1,
    contenido: `MONKEY LOUNGE (Salón principal, 1° piso)
Horario fiesta: 22:00 a 02:00 AM
Ambiente: Fiesta estilo discoteque con DJ en vivo, karaoke, animador y premios sorpresa.
Las reservas en este salón son GRATUITAS.
Horario para reservar: desde las 20:00 hasta las 22:00 hrs.
Reservas desde 2 personas en adelante.
IMPORTANTE: Solo se espera 15 minutos desde la hora de llegada indicada.

Qué incluye:
- DJ en vivo
- Animador
- Karaoke
- Premios sorpresa
- Atención VIP`,
  },
  {
    clave: 'ambiente_grill',
    categoria: 'ambiente',
    titulo: 'Monkey Grill — 2° piso',
    orden: 2,
    contenido: `MONKEY GRILL (2° piso)
Ambiente: Shows en vivo, artistas y espectáculos especiales.
Las reservas en este sector son PAGADAS (valor a confirmar según fecha y show).
Ideal para grupos que quieren disfrutar los shows con mesa garantizada.
Consultar disponibilidad y valor por WhatsApp.`,
  },
  {
    clave: 'ambiente_terraza',
    categoria: 'ambiente',
    titulo: 'Terraza',
    orden: 3,
    contenido: `TERRAZA
Ambiente: Espacio al aire libre, ideal para grupos y celebraciones.
Las reservas en la terraza son disponibles bajo consulta.
Capacidad y disponibilidad a confirmar según la fecha.
Consultar por WhatsApp.`,
  },

  // ──────────────────────────────────────────
  // TEMPLATES DE RESPUESTA (textos exactos que debe usar el bot)
  // ──────────────────────────────────────────
  {
    clave: 'template_reserva_lounge',
    categoria: 'template',
    titulo: 'Respuesta: reserva en Lounge',
    orden: 10,
    contenido: `¡Nos encanta que quieras vivir la fiesta con nosotros en Monkey RestoBar! 🥳🐒
¡Sí, encantados de recibirte! 🎉

📍 Nuestras reservas son GRATIS en el Salón Lounge:
✨ DJ en vivo
✨ Animador
✨ Karaoke para soltar la voz
✨ Premios sorpresa 🎁
✨ Atención VIP 🥂
¡Y mucho, mucho más!

📌 Las reservas son desde 2 personas en adelante
🕗 El horario para reservar es de 20:00 a 22:00 hrs

Para reservar solo necesitamos:
👤 Tu nombre
📅 La fecha de la reserva
🕗 Hora de llegada
👥 Cantidad de personas

⏰ ¡Ojo! Te esperaremos solo 15 minutos desde la hora que nos indiques 😊

¡Te esperamos! 🔥
Reserva con nosotros y vive la mejor fiesta en Monkey RestoBar 🐒🎶`,
  },
  {
    clave: 'template_reserva_cumpleanos',
    categoria: 'template',
    titulo: 'Respuesta: reserva de cumpleaños',
    orden: 11,
    contenido: `Hola! 🐒🎉
¡Nos encanta que quieras celebrar tu cumple en Monkey RestoBar! 🥳🍹
Tenemos todo listo para que vivas una noche inolvidable:
Valor de reserva $10.000 en total por el cumpleañero y invitados 🎂

✨ ¿Qué incluye tu reserva?
✅ Ingreso sin fila 🚫🧍‍♂️
✅ Mesa reservada y lista sin costo adicional 🍽️
✅ Trago de cortesía para el/la cumpleañero/a 🥂🎂
✅ Ambiente increíble con karaoke, DJ en vivo y animación 🎤🎧🎺

📌 La hora de llegada es entre las 8:00 PM y 10:00 PM para que aproveches al máximo la experiencia 🌟

Solo cuéntanos la fecha, hora y número de personas, ¡y nosotros nos encargamos del resto!
🎂 ¡Tu cumple se celebra en Monkey RestoBar! 🎉`,
  },

  // ──────────────────────────────────────────
  // HORARIOS
  // ──────────────────────────────────────────
  {
    clave: 'horarios',
    categoria: 'horarios',
    titulo: 'Horarios de atención',
    orden: 20,
    contenido: `HORARIOS MONKEY RESTOBAR:
(Completar con horarios reales)
Jueves: XX:XX - XX:XX
Viernes: XX:XX - XX:XX
Sábado: XX:XX - XX:XX
Domingo: Cerrado
Lunes a Miércoles: Cerrado

Monkey Lounge (fiesta): 22:00 a 02:00 AM
Reservas recibidas: 20:00 a 22:00 hrs`,
  },

  // ──────────────────────────────────────────
  // INFORMACIÓN GENERAL
  // ──────────────────────────────────────────
  {
    clave: 'info_general',
    categoria: 'info',
    titulo: 'Información general del local',
    orden: 30,
    contenido: `MONKEY RESTOBAR
Dirección: Av. Concha y Toro 1060, Local 3, Puente Alto
WhatsApp: +56 9 XXXX XXXX (COMPLETAR)
Instagram: @monkeyrestobar (COMPLETAR)

Descripción: Monkey Restobar es el lugar de moda en Puente Alto.
Contamos con 3 ambientes únicos: Monkey Lounge (1° piso), Monkey Grill (2° piso) y Terraza.
Música en vivo, shows, DJ, karaoke y la mejor coctelería de la zona.`,
  },
  {
    clave: 'politicas_generales',
    categoria: 'info',
    titulo: 'Políticas y reglamento',
    orden: 31,
    contenido: `POLÍTICAS MONKEY RESTOBAR:
- Edad mínima: 18 años (se exige cédula de identidad)
- Código de vestimenta: Smart casual (no ropa deportiva ni zapatillas en eventos especiales)
- Las invitaciones a eventos especiales son personales e intransferibles
- Para la terraza y el Grill se requiere reserva previa
- No se permiten bebidas externas
- El local se reserva el derecho de admisión`,
  },

  // ──────────────────────────────────────────
  // FAQ
  // ──────────────────────────────────────────
  {
    clave: 'faq_invitaciones',
    categoria: 'faq',
    titulo: 'FAQ: ¿Cómo consigo invitación para un evento?',
    orden: 40,
    contenido: `Las invitaciones a eventos especiales son gratuitas.
Entra a monkey.entradasya.cl, elige el evento y completa el formulario.
Recibirás tu QR personal por correo en minutos.
El QR es personal e intransferible — debes presentarlo al ingresar.`,
  },
  {
    clave: 'faq_reservas_cumple',
    categoria: 'faq',
    titulo: 'FAQ: ¿Puedo reservar para mi cumpleaños?',
    orden: 41,
    contenido: `¡Claro que sí! Para cumpleaños tenemos un paquete especial en el Monkey Lounge.
Incluye mesa reservada, trago de cortesía para el/la cumpleañero/a, ingreso sin fila y el mejor ambiente.
El valor es $10.000 en total por el cumpleañero y sus invitados.
Contáctanos por WhatsApp para coordinar.`,
  },
  {
    clave: 'faq_estacionamiento',
    categoria: 'faq',
    titulo: 'FAQ: ¿Hay estacionamiento?',
    orden: 42,
    contenido: `No contamos con estacionamiento propio, pero hay estacionamientos públicos disponibles cerca de Av. Concha y Toro.`,
  },
  {
    clave: 'faq_menú',
    categoria: 'faq',
    titulo: 'FAQ: ¿Tienen menú de comida y tragos?',
    orden: 43,
    contenido: `Sí, contamos con carta de coctelería, cervezas, vinos, grill y platos para compartir.
Los precios están disponibles en nuestra carta — abajo te damos una idea de los valores aproximados.`,
  },

  // ──────────────────────────────────────────
  // MENÚ CON PRECIOS (actualizar con precios reales)
  // ──────────────────────────────────────────
  {
    clave: 'menu_precios',
    categoria: 'menu',
    titulo: 'Carta y precios',
    orden: 50,
    contenido: `CARTA MONKEY RESTOBAR — PRECIOS APROXIMADOS
(Actualizar con los precios reales del local)

🍺 CERVEZAS Y BEBESTIBLES:
- Cerveza en lata / botella (330ml): $2.500 – $3.000
- Cerveza artesanal / porrón (500ml): $4.000 – $5.000
- Jarro de cerveza (1L): $7.000 – $9.000
- Copa de vino tinto / blanco: $4.000
- Botella de vino: desde $18.000
- Agua mineral: $1.500 – $2.000
- Bebidas / jugos: $2.000 – $3.000

🍹 COCTELERÍA:
- Pisco sour / sours en general: $5.000 – $6.500
- Cocteles de autor (Monkey Sour, Jungle Mojito, etc.): $6.000 – $7.500
- Trago doble / largo: $7.000 – $9.000

🔥 GRILL / PLATOS PRINCIPALES:
- Hamburguesa completa con papas: $10.000 – $12.000
- Costillar BBQ con acompañamiento: $15.000 – $18.000
- Picoteo / tabla para compartir (2-4 personas): $12.000 – $16.000
- Anticuchos o brochetas (porción): $8.000 – $10.000
- Ensaladas / entradas: $5.000 – $8.000

⚠️ Nota: Precios referenciales. Para la carta exacta del día, consulta al llegar o por WhatsApp.`,
  },
]

async function seedChatbot() {
  console.log('🤖 Iniciando seed del chatbot...')

  for (const doc of docs) {
    await db
      .insert(chatbotDocs)
      .values({ ...doc, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: chatbotDocs.clave,
        set: {
          titulo: doc.titulo,
          contenido: doc.contenido,
          categoria: doc.categoria,
          orden: doc.orden,
          updatedAt: new Date(),
        },
      })
    console.log(`  ✓ ${doc.clave}`)
  }

  console.log(`\n✅ Seed completado — ${docs.length} documentos cargados`)
  process.exit(0)
}

seedChatbot().catch((err) => {
  console.error('❌ Error en seed:', err)
  process.exit(1)
})
