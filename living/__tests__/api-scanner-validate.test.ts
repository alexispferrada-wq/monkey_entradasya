import { eventos, invitaciones } from '@/lib/db/schema'
import { createJsonRequest } from './test-utils'

let POST: any

jest.mock('@/lib/db', () => ({
  db: {
    transaction: jest.fn(),
  },
}))

const { db: mockDb } = require('@/lib/db')

describe('POST /api/scanner/validate', () => {
  beforeAll(async () => {
    const route = await import('@/app/api/scanner/validate/route')
    POST = route.POST
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  function createFakeTx(result: { invitationExists?: boolean; estado?: string }) {
    const event = {
      id: 'event-1',
      nombre: 'Evento Test',
      lugar: 'Living Club',
    }

    const invitation = {
      id: 'inv-1',
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      token: 'token-123',
      estado: result.estado || 'enviada',
      usedAt: result.estado === 'usada' ? new Date('2024-01-01T12:00:00Z') : null,
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
        innerJoin: (table: unknown, cond: unknown) => {
          state.joinTable = table
          state.joinCond = cond
          return q
        },
        where: (cond: unknown) => {
          state.where = cond
          return q
        },
        limit: async () => {
          if (!result.invitationExists) return []
          return [{ invitacion: invitation, evento: event }]
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
        returning: async () => [{ ...invitation, estado: 'usada', usedAt: new Date() }],
      }
      return q
    }

    return {
      select: () => query(),
      update: () => query(),
    }
  }

  it('validates a token successfully', async () => {
    mockDb.transaction.mockImplementation(async (callback: any) => callback(createFakeTx({ invitationExists: true, estado: 'enviada' })))

    const req = createJsonRequest({ token: 'token-123' })
    const res = await POST(req as any)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toMatchObject({ valido: true, nombre: 'Ana Pérez', evento: 'Evento Test' })
  })

  it('returns 409 when invitation is already used', async () => {
    mockDb.transaction.mockImplementation(async (callback: any) => callback(createFakeTx({ invitationExists: true, estado: 'usada' })))

    const req = createJsonRequest({ token: 'token-123' })
    const res = await POST(req as any)
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body).toMatchObject({ valido: false, razon: 'Esta invitación ya fue utilizada.' })
  })

  it('returns 404 when token is not found', async () => {
    mockDb.transaction.mockImplementation(async (callback: any) => callback(createFakeTx({ invitationExists: false })))

    const req = createJsonRequest({ token: 'token-missing' })
    const res = await POST(req as any)
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body).toMatchObject({ valido: false, razon: 'QR no reconocido. No corresponde a ninguna invitación.' })
  })
})
