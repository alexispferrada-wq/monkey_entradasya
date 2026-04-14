import { z } from 'zod';

export const eventoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre del evento debe tener al menos 3 caracteres')
    .max(200, 'El nombre del evento no puede exceder 200 caracteres'),
  
  descripcion: z
    .string()
    .trim()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .default(''),
  
  fecha: z
    .coerce.date()
    .refine(
      (date) => date.getTime() > Date.now(),
      'La fecha del evento debe ser en el futuro'
    ),
  
  lugar: z
    .string()
    .trim()
    .min(3, 'El lugar debe tener al menos 3 caracteres')
    .max(200, 'El lugar no puede exceder 200 caracteres'),
  
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9-]+$/,
      'El slug solo puede contener letras, números y guiones'
    )
    .max(100, 'El slug no puede exceder 100 caracteres'),
  
  cupos: z
    .coerce.number()
    .int('Los cupos deben ser un número entero')
    .positive('Los cupos deben ser un número positivo')
    .max(1000, 'Los cupos no pueden exceder 1000')
    .default(100),
  
  imagenUrl: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine(
      (value) => !value || z.string().url().safeParse(value).success,
      'URL de imagen inválida'
    ),
  
  activo: z.boolean().optional().default(true),
  destacado: z.boolean().optional().default(false),
});

export type EventoInput = z.infer<typeof eventoSchema>;

export const eventoCreateSchema = eventoSchema.extend({
  cuposTotal: z
    .coerce.number()
    .int('Los cupos deben ser un número entero')
    .positive('Los cupos deben ser un número positivo')
    .max(1000, 'Los cupos no pueden exceder 1000')
    .optional(),
  precioBase: z.coerce.number().int().min(0).optional().default(0),
  cuposReserva: z.coerce.number().int().min(0).optional().default(0),
});

export type EventoCreateInput = z.infer<typeof eventoCreateSchema>;

export const eventoUpdateSchema = z.object({
  nombre: z.string().trim().min(3).max(200).optional(),
  descripcion: z.string().trim().max(1000).optional(),
  fecha: z.coerce.date().refine((date) => date > new Date(), 'La fecha del evento debe ser en el futuro').optional(),
  lugar: z.string().trim().min(3).max(200).optional(),
  cuposTotal: z
    .coerce.number()
    .int('Los cupos deben ser un número entero')
    .positive('Los cupos deben ser un número positivo')
    .max(1000, 'Los cupos no pueden exceder 1000')
    .optional(),
  cuposDisponibles: z
    .coerce.number()
    .int('Los cupos deben ser un número entero')
    .min(0, 'Los cupos disponibles no pueden ser negativos')
    .max(1000, 'Los cupos disponibles no pueden exceder 1000')
    .optional(),
  activo: z.boolean().optional(),
  destacado: z.boolean().optional(),
  imagenUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || z.string().url().safeParse(value).success,
      'URL de imagen inválida'
    ),
  precioBase: z.coerce.number().int().min(0).optional(),
  cuposReserva: z.coerce.number().int().min(0).optional(),
});

export type EventoUpdateInput = z.infer<typeof eventoUpdateSchema>;