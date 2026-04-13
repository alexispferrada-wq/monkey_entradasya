import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const estadoInvitacion = pgEnum('estado_invitacion', [
  'pendiente',
  'enviada',
  'usada',
  'cancelada',
])

export const tipoReserva = pgEnum('tipo_reserva', [
  'terraza',
  'grill',
  'cumpleanos',
])

export const estadoReserva = pgEnum('estado_reserva', [
  'pendiente',
  'comprobante_subido',
  'aprobada',
  'rechazada',
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
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  emailIdx: index('socios_email_idx').on(t.email),
  puntosIdx: index('socios_puntos_idx').on(t.puntos),
}))

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
  destacado: boolean('destacado').default(false).notNull(),
  slug: text('slug').unique().notNull(),
  // Cumpleaños
  tipo: text('tipo').default('regular').notNull(),       // 'regular' | 'cumpleanos'
  clave: text('clave'),                                  // passphrase, solo cumpleaños
  organizadorEmail: text('organizador_email'),           // quien recibe la clave
  cumpleañeroNombre: text('cumpleanero_nombre'),         // nombre del cumpleañero
  edadCumpleanos: integer('edad_cumpleanos'),            // edad que cumple
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  fechaIdx: index('eventos_fecha_idx').on(t.fecha),
  slugIdx: index('eventos_slug_idx').on(t.slug),
  activoFechaIdx: index('eventos_activo_fecha_idx').on(t.activo, t.fecha),
}))

export const invitaciones = pgTable('invitaciones', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventoId: uuid('evento_id')
    .references(() => eventos.id, { onDelete: 'cascade' })
    .notNull(),
  nombre: text('nombre').notNull(),
  rut: text('rut'),
  email: text('email').notNull(),
  token: uuid('token').defaultRandom().unique().notNull(),
  estado: estadoInvitacion('estado').default('pendiente').notNull(),
  qrImageUrl: text('qr_image_url'),
  qrPublicId: text('qr_public_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  usedAt: timestamp('used_at'),
}, (t) => ({
  eventoIdIdx: index('invitaciones_evento_id_idx').on(t.eventoId),
  tokenIdx: index('invitaciones_token_idx').on(t.token),
  emailIdx: index('invitaciones_email_idx').on(t.email),
}))

// ============================================================
// RESERVAS — sistema de reservas por sector
// ============================================================
export const reservas = pgTable('reservas', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  tipo:                tipoReserva('tipo').notNull(),
  estado:              estadoReserva('estado').default('pendiente').notNull(),
  // Datos del solicitante
  nombre:              text('nombre').notNull(),
  email:               text('email').notNull(),
  telefono:            text('telefono').notNull(),
  fecha:               text('fecha').notNull(),      // 'DD/MM/YYYY'
  hora:                text('hora').notNull(),        // 'HH:MM'
  personas:            integer('personas').notNull(),
  notas:               text('notas'),
  // Cumpleaños
  nombreEvento:        text('nombre_evento'),         // para el evento de cumpleaños
  // Pago (Grill)
  monto:               integer('monto').default(0).notNull(),
  comprobantePagoUrl:  text('comprobante_pago_url'),
  comprobantePublicId: text('comprobante_public_id'),
  // Admin
  adminNotas:          text('admin_notas'),
  adminAt:             timestamp('admin_at'),
  emailEnviado:        boolean('email_enviado').default(false).notNull(),
  // Evento creado (para cumpleaños aprobados)
  eventoId:            uuid('evento_id'),
  // Standard
  deletedAt:           timestamp('deleted_at'),
  createdAt:           timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  estadoIdx: index('reservas_estado_idx').on(t.estado),
  tipoIdx:   index('reservas_tipo_idx').on(t.tipo),
  emailIdx:  index('reservas_email_idx').on(t.email),
}))

export type Reserva = typeof reservas.$inferSelect
export type NuevaReserva = typeof reservas.$inferInsert

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
// entidad is text (not enum) so existing rows can be migrated safely;
// application-layer type enforcement is in lib/audit.ts (AuditEntidad type)
export const auditLog = pgTable('audit_log', {
  id:        uuid('id').defaultRandom().primaryKey(),
  accion:    text('accion').notNull(),     // 'delete_evento', 'update_puntos', etc.
  entidad:   text('entidad').notNull(),    // 'evento' | 'socio' | 'chatbot_doc' | 'invitacion'
  entidadId: text('entidad_id'),          // UUID del objeto afectado
  detalle:   text('detalle'),             // JSON con cambios relevantes
  ip:        text('ip'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  entidadIdIdx: index('audit_log_entidad_id_idx').on(t.entidad, t.entidadId),
  createdAtIdx: index('audit_log_created_at_idx').on(t.createdAt),
}))

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
