import { POST } from '@/app/api/auth/login/route'

function createJsonRequest(body: unknown) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    process.env.ADMIN_USER = 'admin'
    process.env.ADMIN_JWT_SECRET = 'test-secret-should-be-long'
    process.env.ADMIN_PASSWORD = 'changeme'
    delete process.env.ADMIN_PASSWORD_HASH
  })

  it('returns ok and sets admin token cookie when credentials are valid', async () => {
    const req = createJsonRequest({ usuario: 'admin', password: 'changeme' })
    const res = await POST(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true })
    expect(res.headers.get('set-cookie') || res.headers.get('Set-Cookie')).toBeTruthy()
  })

  it('returns 401 when credentials are invalid', async () => {
    const req = createJsonRequest({ usuario: 'admin', password: 'badpass' })
    const res = await POST(req)

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toHaveProperty('error', 'Credenciales incorrectas')
  })

  it('returns 400 when body is invalid', async () => {
    const req = createJsonRequest({ user: 'admin' })
    const res = await POST(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })
})
