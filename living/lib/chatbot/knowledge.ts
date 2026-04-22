// ============================================================
// CONOCIMIENTO CENTRALIZADO DE LIVING CLUB
// Edita este archivo para actualizar lo que sabe el chatbot
// ============================================================

export const RESTAURANT_INFO = {
  nombre: 'Living Club',
  direccion: 'Ubicacion variable segun evento',
  telefono: '+56 9 XXXX XXXX', // ← REEMPLAZAR
  whatsapp: '+56912345678',     // ← REEMPLAZAR con número real
  email_reservas: 'reservas@entradasya.cl', // ← REEMPLAZAR
  instagram: '@livingclub', // ← REEMPLAZAR si aplica
  horarios: {
    jueves: '20:00 - 02:00',
    viernes: '20:00 - 03:00',
    sabado: '20:00 - 04:00',
    domingo: 'Cerrado',
    lunes: 'Cerrado',
    martes: 'Cerrado',
    miercoles: 'Cerrado',
  },
  descripcion: `Living Club es una productora de eventos y experiencias con ambiente unico,
música, coctelería de autor y noches especiales.
Nos especializamos en eventos temáticos, celebraciones privadas y experiencias memorables.
El acceso a eventos especiales es mediante invitación personal gratuita — se solicita en nuestra web.`,
  politicas_generales: `
- Código de vestimenta: Smart casual (no se permite ropa deportiva ni zapatillas en eventos especiales)
- Edad mínima: 18 años (se exige cédula de identidad)
- Las invitaciones a eventos son personales e intransferibles
- Se puede llegar hasta 30 minutos después del horario indicado, sujeto a disponibilidad
- No se permiten bebidas externas
- El restaurante se reserva el derecho de admisión`,
}

// ============================================================
// MENÚ — REEMPLAZAR CON EL MENÚ REAL
// ============================================================
export const MENU = {
  nota: 'Los precios pueden variar. Consulta disponibilidad con nuestro equipo.',

  cocteleria: [
    { nombre: 'Living Sour', descripcion: 'Pisco sour de la casa con toque tropical', precio: '$6.000' },
    { nombre: 'Club Mojito', descripcion: 'Mojito con frutas tropicales y menta fresca', precio: '$6.500' },
    { nombre: 'Golden Living', descripcion: 'Whisky, maracuyá, jengibre y limón', precio: '$7.500' },
    { nombre: 'Tropical Storm', descripcion: 'Ron oscuro, coco, piña y lima', precio: '$6.500' },
    // ← AGREGAR MÁS TRAGOS
  ],

  cervezas_y_vinos: [
    { nombre: 'Cerveza artesanal (500ml)', precio: '$4.500' },
    { nombre: 'Copa de vino tinto', precio: '$4.000' },
    { nombre: 'Copa de vino blanco', precio: '$4.000' },
    { nombre: 'Botella de vino', precio: 'desde $18.000' },
    // ← AGREGAR MÁS
  ],

  tabla_para_compartir: [
    { nombre: 'Tabla Living', descripcion: 'Tabla de quesos, embutidos, frutos secos y pan artesanal', precio: '$14.000' },
    { nombre: 'Tabla de Frutos del Mar', descripcion: 'Camarones, ostras y pulpo al ajillo', precio: '$18.000' },
    // ← AGREGAR MÁS
  ],

  platos_principales: [
    { nombre: 'Costillar BBQ', descripcion: 'Costillar de cerdo con salsa BBQ casera, papas rústicas', precio: '$16.000' },
    { nombre: 'Salmon a la Plancha', descripcion: 'Salmón fresco con mantequilla de limón y vegetales', precio: '$15.000' },
    { nombre: 'Burger Living', descripcion: 'Hamburguesa doble con cheddar, cebolla caramelizada y papas fritas', precio: '$11.000' },
    // ← AGREGAR MÁS
  ],

  sin_alcohol: [
    { nombre: 'Limonada de la casa', precio: '$3.500' },
    { nombre: 'Agua mineral', precio: '$2.000' },
    { nombre: 'Jugos naturales', precio: '$3.500' },
    // ← AGREGAR MÁS
  ],
}

// ============================================================
// POLÍTICA DE RESERVAS
// ============================================================
export const POLITICAS_RESERVAS = `
RESERVAS LIVING CLUB:
1. Grupos de 2 a 30 personas.
2. Confirmar con 24h de anticipación.
3. Grupos 10+ requieren consumo mínimo.
4. Cancelaciones: avisar con 6h de anticipación.
5. Eventos especiales: acceso exclusivo con invitación gratis (living.entradasya.cl).

CÓMO RESERVAR:
Escríbenos por WhatsApp o completa el formulario web.
`

// ============================================================
// PREGUNTAS FRECUENTES
// ============================================================
export const FAQ = [
  {
    pregunta: '¿Cómo consigo una invitación para un evento?',
    respuesta: 'Las invitaciones son gratuitas. Entra a living.entradasya.cl, elige el evento y completa el formulario. Recibirás tu QR por correo en minutos.',
  },
  {
    pregunta: '¿Hay estacionamiento?',
    respuesta: 'Depende de cada evento. La ubicacion y recomendaciones de acceso se informan en la ficha de cada fecha.',
  },
  {
    pregunta: '¿Puedo celebrar un cumpleaños o evento privado?',
    respuesta: '¡Sí! Ofrecemos espacios para eventos privados y celebraciones. Contáctanos por WhatsApp para coordinar los detalles.',
  },
  {
    pregunta: '¿Tienen opciones vegetarianas o veganas?',
    respuesta: 'Sí, contamos con opciones vegetarianas. Consulta disponibilidad al momento de tu visita o reserva.',
  },
  {
    pregunta: '¿Cuál es el aforo máximo del local?',
    respuesta: 'Nuestro local tiene capacidad para aproximadamente 150 personas en eventos especiales.',
  },
]
