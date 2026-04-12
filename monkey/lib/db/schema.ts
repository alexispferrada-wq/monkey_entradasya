import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const estadoInvitacion = pgEnum('estado_invitacion', [
  'pendiente',
  'enviada',
  'usada',
  'cancelada',
])

export const nivelSocio = pgEnum('nivel_socio', [
  'bronze',
  'silver',
  'gold',
  'vip',
])

export const socios = pgTable('socios', {
  id: uuid('id').defaultRandom().primaryKey(),
  nombre: text('nombre').notNull(),
  email: text('email').unique().notNull(),
  telefono: text('telefono'),
  puntos: integer('puntos').notNull().default(0),
  nivel: nivelSocio('nivel').notNull().default('bronze'),
  googlePassObjectId: text('google_pass_object_id'),
  activo: boolean('activo').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const movimientosPuntos = pgTable('movimientos_puntos', {
  id: uuid('id').defaultRandom().primaryKey(),
  socioId: uuid('socio_id')
    .references(() => socios.id, { onDelete: 'cascade' })
    .notNull(),
  puntos: integer('puntos').notNull(),
  motivo: text('motivo').notNull(),
  operadorNombre: text('operador_nombre'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const eventos = pgTable('eventos', {
  id: uuid('id').defaultRandom().primaryKey(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  fecha: timestamp('fecha').notNull(),
  lugar: text('lugar').notNull(),
  imagenUrl: text('imagen_url'),
  imagenPublicId: text('imagen_public_id'),
  cuposTotal: integer('cupos_total').notNull().default(100),
  cuposDisponibles: integer('cupos_disponibles').notNull().default(100),
  activo: boolean('activo').default(true).notNull(),
  slug: text('slug').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const invitaciones = pgTable('invitaciones', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventoId: uuid('evento_id')
    .references(() => eventos.id, { onDelete: 'cascade' })
    .notNull(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull(),
  token: uuid('token').defaultRandom().unique().notNull(),
  estado: estadoInvitacion('estado').default('pendiente').notNull(),
  qrImageUrl: text('qr_image_url'),
  qrPublicId: text('qr_public_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  usedAt: timestamp('used_at'),
})

// ============================================================
// CHATBOT — base de conocimiento editable desde el admin
// ============================================================
export const chatbotDocs = pgTable('chatbot_docs', {
  id:        uuid('id').defaultRandom().primaryKey(),
  clave:     text('clave').unique().notNull(),     // ej: 'ambiente_lounge', 'template_reservas'
  categoria: text('categoria').notNull(),          // 'ambiente' | 'reservas' | 'template' | 'horarios' | 'info' | 'faq'
  titulo:    text('titulo').notNull(),
  contenido: text('contenido').notNull(),
  activo:    boolean('activo').default(true).notNull(),
  orden:     integer('orden').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type ChatbotDoc    = typeof chatbotDocs.$inferSelect
export type NuevoChatbotDoc = typeof chatbotDocs.$inferInsert

// ============================================================
// RESERVAS — guardadas por el chatbot antes de enviar email
// ============================================================
export const reservasChatbot = pgTable('reservas_chatbot', {
  id:           uuid('id').defaultRandom().primaryKey(),
  nombre:       text('nombre').notNull(),
  fecha:        text('fecha').notNull(),
  hora:         text('hora').notNull(),
  personas:     integer('personas').notNull(),
  contacto:     text('contacto').notNull(),
  notas:        text('notas'),
  emailEnviado: boolean('email_enviado').default(false).notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
})

export type ReservaChatbot = typeof reservasChatbot.$inferSelect

// ============================================================
// AUDIT LOG — registro de acciones del panel admin
// ============================================================
export const auditLog = pgTable('audit_log', {
  id:        uuid('id').defaultRandom().primaryKey(),
  accion:    text('accion').notNull(),     // 'delete_evento', 'update_puntos', etc.
  entidad:   text('entidad').notNull(),    // 'evento', 'socio', 'chatbot_doc'
  entidadId: text('entidad_id'),          // UUID del objeto afectado
  detalle:   text('detalle'),             // JSON con cambios relevantes
  ip:        text('ip'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const eventosRelations = relations(eventos, ({ many }) => ({
  invitaciones: many(invitaciones),
}))

export const invitacionesRelations = relations(invitaciones, ({ one }) => ({
  evento: one(eventos, {
    fields: [invitaciones.eventoId],
    references: [eventos.id],
  }),
}))

export const sociosRelations = relations(socios, ({ many }) => ({
  movimientos: many(movimientosPuntos),
}))

export const movimientosPuntosRelations = relations(movimientosPuntos, ({ one }) => ({
  socio: one(socios, {
    fields: [movimientosPuntos.socioId],
    references: [socios.id],
  }),
}))

export type Evento = typeof eventos.$inferSelect
export type NuevoEvento = typeof eventos.$inferInsert
export type Invitacion = typeof invitaciones.$inferSelect
export type NuevaInvitacion = typeof invitaciones.$inferInsert
export type Socio = typeof socios.$inferSelect
export type NuevoSocio = typeof socios.$inferInsert
export type MovimientoPuntos = typeof movimientosPuntos.$inferSelect
