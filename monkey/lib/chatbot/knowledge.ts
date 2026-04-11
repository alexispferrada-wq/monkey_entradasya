// ============================================================
// CONOCIMIENTO CENTRALIZADO DE MONKEY RESTOBAR
// Edita este archivo para actualizar lo que sabe el chatbot
// ============================================================

export const RESTAURANT_INFO = {
  nombre: 'Monkey Restobar',
  direccion: 'Av. Concha y Toro 1060, Local 3, Puente Alto',
  telefono: '+56 9 XXXX XXXX', // ← REEMPLAZAR
  whatsapp: '+56912345678',     // ← REEMPLAZAR con número real
  email_reservas: 'reservas@monkeyrestobar.cl', // ← REEMPLAZAR
  instagram: '@monkeyrestobar', // ← REEMPLAZAR si aplica
  horarios: {
    jueves: '20:00 - 02:00',
    viernes: '20:00 - 03:00',
    sabado: '20:00 - 04:00',
    domingo: 'Cerrado',
    lunes: 'Cerrado',
    martes: 'Cerrado',
    miercoles: 'Cerrado',
  },
  descripcion: `Monkey Restobar es un exclusivo bar y restaurante en Puente Alto con ambiente único,
música en vivo, coctelería de autor y los mejores eventos de la zona.
Nos especializamos en noches temáticas, tributos musicales y experiencias gastronómicas únicas.
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
    { nombre: 'Monkey Sour', descripcion: 'Pisco sour de la casa con toque tropical', precio: '$6.000' },
    { nombre: 'Jungle Mojito', descripcion: 'Mojito con frutas tropicales y menta fresca', precio: '$6.500' },
    { nombre: 'Golden Monkey', descripcion: 'Whisky, maracuyá, jengibre y limón', precio: '$7.500' },
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
    { nombre: 'Tabla Monkey', descripcion: 'Tabla de quesos, embutidos, frutos secos y pan artesanal', precio: '$14.000' },
    { nombre: 'Tabla de Frutos del Mar', descripcion: 'Camarones, ostras y pulpo al ajillo', precio: '$18.000' },
    // ← AGREGAR MÁS
  ],

  platos_principales: [
    { nombre: 'Costillar BBQ', descripcion: 'Costillar de cerdo con salsa BBQ casera, papas rústicas', precio: '$16.000' },
    { nombre: 'Salmon a la Plancha', descripcion: 'Salmón fresco con mantequilla de limón y vegetales', precio: '$15.000' },
    { nombre: 'Burguer Monkey', descripcion: 'Hamburguesa doble con cheddar, cebolla caramelizada y papas fritas', precio: '$11.000' },
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
RESERVAS EN MONKEY RESTOBAR:

1. Las reservas se pueden hacer para grupos de 2 a 30 personas
2. Se requiere confirmación con mínimo 24 horas de anticipación
3. Para grupos de 10 o más personas, se solicita un consumo mínimo a acordar
4. Las reservas se confirman una vez que nuestro equipo lo contacta
5. Cancelaciones: avisar con al menos 6 horas de anticipación
6. Para eventos especiales (noches de tributo, conciertos), el acceso es solo mediante invitación —
   se puede solicitar gratuitamente en monkey.entradasya.cl

CÓMO HACER UNA RESERVA:
- Por WhatsApp (más rápido): el chatbot puede enviar los datos directamente
- O completar el formulario que el chatbot te guiará a llenar
`

// ============================================================
// PREGUNTAS FRECUENTES
// ============================================================
export const FAQ = [
  {
    pregunta: '¿Cómo consigo una invitación para un evento?',
    respuesta: 'Las invitaciones son gratuitas. Entra a monkey.entradasya.cl, elige el evento y completa el formulario. Recibirás tu QR por correo en minutos.',
  },
  {
    pregunta: '¿Hay estacionamiento?',
    respuesta: 'No contamos con estacionamiento propio, pero hay estacionamientos públicos cercanos en Av. Concha y Toro.',
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
