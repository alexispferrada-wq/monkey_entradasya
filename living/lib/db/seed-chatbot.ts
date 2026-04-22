/**
 * Seed inicial del chatbot de Living Club
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
    titulo: 'Living Lounge — Salón 1° piso',
    orden: 1,
    contenido: `LIVING LOUNGE (Salón principal, 1° piso)
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
    titulo: 'Living Grill — 2° piso',
    orden: 2,
    contenido: `LIVING GRILL (2° piso)
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
    contenido: `¡Vive la fiesta en Living Club! 🥳🐒

📍 Reservas GRATIS en el Salón Lounge:
✨ DJ en vivo, Animador y Karaoke 🎤
✨ Premios sorpresa y Atención VIP 🥂

📌 Desde 2 personas. Llegada de 20:00 a 22:00 hrs.
⏰ Tolerancia de espera: 15 minutos.

Para reservar envíanos: Tu nombre, Fecha, Hora de llegada y Cantidad de personas.
¡Te esperamos para la mejor fiesta! 🔥🐒`,
  },
  {
    clave: 'template_reserva_cumpleanos',
    categoria: 'template',
    titulo: 'Respuesta: reserva de cumpleaños',
    orden: 11,
    contenido: `¡Celebra tu cumple en Living Club! 🥳🎂
Valor: $10.000 total por cumpleañero e invitados.

✨ Incluye:
✅ Ingreso sin fila 🚫🧍‍♂️
✅ Mesa reservada sin costo extra 🍽️
✅ Trago de cortesía al cumpleañero/a 🥂
✅ DJ en vivo, karaoke y animación 🎤

📌 Llegada: 20:00 a 22:00 hrs.
Solo danos fecha, hora y número de personas. ¡Nosotros nos encargamos! 🎉`,
  },

  // ──────────────────────────────────────────
  // HORARIOS
  // ──────────────────────────────────────────
  {
    clave: 'horarios',
    categoria: 'horarios',
    titulo: 'Horarios de atención',
    orden: 20,
    contenido: `HORARIOS LIVING CLUB:
(Completar con horarios reales)
Jueves: XX:XX - XX:XX
Viernes: XX:XX - XX:XX
Sábado: XX:XX - XX:XX
Domingo: Cerrado
Lunes a Miércoles: Cerrado

Living Lounge (fiesta): 22:00 a 02:00 AM
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
    contenido: `LIVING CLUB
Dirección: Av. Concha y Toro 1060, Local 3, Puente Alto
WhatsApp: +56 9 XXXX XXXX (COMPLETAR)
Instagram: @livingclub (COMPLETAR)

Descripción: Living Club es el lugar de moda en Puente Alto.
Contamos con 3 ambientes únicos: Living Lounge (1° piso), Living Grill (2° piso) y Terraza.
Música en vivo, shows, DJ, karaoke y la mejor coctelería de la zona.`,
  },
  {
    clave: 'politicas_generales',
    categoria: 'info',
    titulo: 'Políticas y reglamento',
    orden: 31,
    contenido: `POLÍTICAS LIVING CLUB:
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
Entra a living.entradasya.cl, elige el evento y completa el formulario.
Recibirás tu QR personal por correo en minutos.
El QR es personal e intransferible — debes presentarlo al ingresar.`,
  },
  {
    clave: 'faq_reservas_cumple',
    categoria: 'faq',
    titulo: 'FAQ: ¿Puedo reservar para mi cumpleaños?',
    orden: 41,
    contenido: `¡Claro que sí! Para cumpleaños tenemos un paquete especial en el Living Lounge.
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
  // ARTISTAS / STAFF
  // ──────────────────────────────────────────
  {
    clave: 'staff_djs_animadores',
    categoria: 'info',
    titulo: 'DJs Residentes, Animadores e Invitados Especiales',
    orden: 32,
    contenido: `En Living Club contamos con un equipo recurrente encargado de prender las noches. Los DJs que se presentan habitualmente son DJ Xhuxhu, DJ Cepo y DJ Shano Roots. La animación oficial del local está a cargo de Sholo MC y Migue Anima. Además, el restobar trae constantemente invitados especiales, como por ejemplo DJ Janyi.`,
  },

  // ──────────────────────────────────────────
  // EVENTOS TEMÁTICOS Y TRIBUTOS
  // ──────────────────────────────────────────
  {
    clave: 'historial_tributos_fiestas',
    categoria: 'info',
    titulo: 'Tributos de Artistas y Fiestas Temáticas',
    orden: 33,
    contenido: `Living Club destaca por sus eventos temáticos y tributos a grandes exponentes del género urbano. Entre los tributos más destacados que se han realizado están el Tributo a J Alvarez y el Tributo a Bad Bunny (fiesta temática "El Conejo en la Jungla"). Además, el local organiza conceptos exitosos como "Bellakona 2.0" (enfocado en Reggaetón Old School y New School) y batallas musicales como "Black Music: Old School vs Dancehall".`,
  },

  // ──────────────────────────────────────────
  // SERVICIOS Y UBICACIÓN
  // ──────────────────────────────────────────
  {
    clave: 'servicios_ubicacion_amenidades',
    categoria: 'info',
    titulo: 'Ubicación, Carta y Servicios del Restobar',
    orden: 34,
    contenido: `Ubicados en Av. Concha y Toro 1060, Local 3. Ofrecemos una experiencia completa: excelente carta de comidas y coctelería, DJs en vivo y Karaoke. Contamos con estacionamiento de mall, sector VIP, opciones de After Office y Happy Hour. Además, entregamos diversión asegurada con concursos, premios y sorpresas toda la noche.`,
  },

  // ──────────────────────────────────────────
  // MENÚ CON PRECIOS (actualizar con precios reales)
  // ──────────────────────────────────────────
  {
    clave: 'menu_precios',
    categoria: 'menu',
    titulo: 'Carta y precios',
    orden: 50,
    contenido: `CARTA LIVING CLUB (Referencial)

🍺 BEBIDAS:
Cervezas (330ml-1L): $2.500-$9.000
Vino (copa/botella): $4.000-$18.000
Bebidas/Jugos: $2.000-$3.000

🍹 COCTELERÍA:
Sours tradicionales: $5.000-$6.500
Cocteles de autor: $6.000-$7.500
Tragos largos: $7.000-$9.000

🔥 COMIDAS:
Hamburguesas/Costillar: $10.000-$18.000
Tablas para compartir: $12.000-$16.000
Picoteos/Anticuchos: $8.000-$10.000

⚠️ Pide la carta exacta al llegar.`,
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
