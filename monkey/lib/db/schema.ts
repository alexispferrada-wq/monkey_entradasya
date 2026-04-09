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

export const eventosRelations = relations(eventos, ({ many }) => ({
  invitaciones: many(invitaciones),
}))

export const invitacionesRelations = relations(invitaciones, ({ one }) => ({
  evento: one(eventos, {
    fields: [invitaciones.eventoId],
    references: [eventos.id],
  }),
}))

export type Evento = typeof eventos.$inferSelect
export type NuevoEvento = typeof eventos.$inferInsert
export type Invitacion = typeof invitaciones.$inferSelect
export type NuevaInvitacion = typeof invitaciones.$inferInsert
