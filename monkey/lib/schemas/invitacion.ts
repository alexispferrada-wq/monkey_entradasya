import { z } from 'zod';

export const invitacionSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Email inválido')
    .max(255, 'Email no puede exceder 255 caracteres'),
  
  eventoId: z
    .string()
    .uuid('ID de evento inválido'),
});

export type InvitacionInput = z.infer<typeof invitacionSchema>;
