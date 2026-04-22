import { eventos, invitaciones } from '@/lib/db/schema'
import { createJsonRequest } from './test-utils'

let POST: any

jest.mock('@/lib/cloudinary', () => ({
  uploadQR: jest.fn(async () => ({ url: 'https://cloudinary/fake.png', publicId: 'fake-id' })),
  cloudinary: { uploader: { destroy: jest.fn(async () => ({ result: 'ok' })) } },
}))

jest.mock('@/lib/email', () => ({
  enviarInvitacion: jest.fn(async () => true),
}))

const mockDelete = jest.fn(async () => ({ count: 1 }))

jest.mock('@/lib/db', () => ({
  db: {
    transaction: jest.fn(),
    delete: jest.fn(() => ({ where: mockDelete })),
  },
}))

const { db: mockDb } = require('@/lib/db')

describe('POST /api/invitaciones', () => {
  beforeAll(async () => {
    const route = await import('@/app/api/invitaciones/route')
    POST = route.POST
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  function createFakeTx(result: { eventExists?: boolean; invitationExists?: boolean; sendEmailFails?: boolean }) {
    const event = {
      id: '00000000-0000-0000-0000-000000000001',
      nombre: 'Evento Test',
      fecha: new Date('2099-12-31T20:00:00'),
      lugar: 'Living Club',
      activo: true,
      cuposDisponibles: 10,
      cuposTotal: 10,
      slug: 'evento-test',
      descripcion: 'Prueba',
      imagenUrl: 'https://example.com/image.jpg',
    }

    const query = () => {
      let state: any = { action: 'select', table: null, where: null, values: null }

      const q: any = {
        select: (args: unknown) => {
          state.action = 'select'
          state.selectArgs = args
          return q
        },
        from: (table: unknown) => {
          state.table = table
          return q
        },
        where: (cond: unknown) => {
          state.where = cond
          return q
        },
        limit: async () => {
          if (state.table === eventos) {
            return result.eventExists ? [event] : []
          }
          if (state.table === invitaciones) {
            return result.invitationExists ? [{ id: 'inv-1' }] : []
          }
          return []
        },
        insert: (table: unknown) => {
          state.action = 'insert'
          state.table = table
          return q
        },
        values: (vals: unknown) => {
          state.values = vals
          return q
        },
        returning: async () => {
          if (state.action === 'insert') {
            return [
              {
                id: 'inv-1',
                eventoId: state.values.eventoId,
                nombre: state.values.nombre,
                email: state.values.email,
                token: 'token-123',
                estado: 'enviada',
                qrImageUrl: 'https://cloudinary/fake.png',
                qrPublicId: 'fake-id',
              },
            ]
          }
          return []
        },
        update: (table: unknown) => {
          state.action = 'update'
          state.table = table
          return q
        },
        set: (vals: unknown) => {
          state.values = vals
          return q
        },
      }

      return q
    }

    return {
      select: () => query(),
      insert: (table: unknown) => query().insert(table),
      update: (table: unknown) => query().update(table),
    }
  }

  it('creates an invitation successfully', async () => {
    mockDb.transaction.mockImplementation(async (callback: any) => callback(createFakeTx({ eventExists: true, invitationExists: false })))

    const req = createJsonRequest({ eventoId: '00000000-0000-0000-0000-000000000001', nombre: 'Ana Pérez', email: 'ana@example.com' })
    const res = await POST(req as any)
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body).toHaveProperty('ok', true)
    expect(body).toHaveProperty('token', 'token-123')
  })

  it('returns 409 when duplicate invitation exists', async () => {
    mockDb.transaction.mockImplementation(async (callback: any) => callback(createFakeTx({ eventExists: true, invitationExists: true })))

    const req = createJsonRequest({ eventoId: '00000000-0000-0000-0000-000000000001', nombre: 'Ana Pérez', email: 'ana@example.com' })
    const res = await POST(req as any)
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body).toHaveProperty('error')
  })

  it('returns 404 when event does not exist', async () => {
    mockDb.transaction.mockImplementation(async (callback: any) => callback(createFakeTx({ eventExists: false, invitationExists: false })))

    const req = createJsonRequest({ eventoId: '00000000-0000-0000-0000-000000000001', nombre: 'Ana Pérez', email: 'ana@example.com' })
    const res = await POST(req as any)
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body).toHaveProperty('error')
  })
})
