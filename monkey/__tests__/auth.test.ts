import { hashPassword, verifyPassword } from '@/lib/auth'

describe('auth utilities', () => {
  it('hashes and verifies a password successfully', async () => {
    const password = 'SuperSecret123!'
    const hash = await hashPassword(password)

    expect(typeof hash).toBe('string')
    expect(hash.length).toBeGreaterThan(0)

    const valid = await verifyPassword(password, hash)
    expect(valid).toBe(true)
  })

  it('rejects incorrect password against hash', async () => {
    const password = 'SuperSecret123!'
    const hash = await hashPassword(password)
    const valid = await verifyPassword('wrong-password', hash)

    expect(valid).toBe(false)
  })
})
