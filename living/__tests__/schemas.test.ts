import { invitacionSchema, eventoCreateSchema, eventoUpdateSchema, loginSchema } from '@/lib/schemas'

describe('Zod schemas', () => {
  it('validates invitacion input correctly', () => {
    const input = {
      nombre: 'Ana Pérez',
      email: 'ana.perez@example.com',
      eventoId: '00000000-0000-0000-0000-000000000000',
    }

    const result = invitacionSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('rejects invalid email in invitacion schema', () => {
    const result = invitacionSchema.safeParse({
      nombre: 'Ana',
      email: 'correo-invalido',
      eventoId: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('validates event creation input', () => {
    const input = {
      nombre: 'Evento Test',
      descripcion: 'Descripción corta',
      fecha: '2099-12-31T20:00:00',
      lugar: 'Living Club',
      slug: 'evento-test-2099',
      cuposTotal: '50',
      imagenUrl: 'https://example.com/image.jpg',
    }

    const result = eventoCreateSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cuposTotal).toBe(50)
      expect(result.data.fecha).toBeInstanceOf(Date)
    }
  })

  it('rejects past dates for event creation', () => {
    const result = eventoCreateSchema.safeParse({
      nombre: 'Evento Viejo',
      fecha: '2000-01-01T10:00:00',
      lugar: 'Living Club',
      slug: 'evento-viejo',
      cuposTotal: 10,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors.some((issue) => issue.path.includes('fecha'))).toBe(true)
    }
  })

  it('validates login payload', () => {
    const result = loginSchema.safeParse({ usuario: 'admin', password: 'secret' })
    expect(result.success).toBe(true)
  })
})
