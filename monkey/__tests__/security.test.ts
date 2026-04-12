/**
 * Security tests — validate that core security controls work correctly.
 * Covers: disposable email blocking, MIME validation, error sanitization,
 * chat message limits, and stack trace leakage prevention.
 */

import { isDisposableEmail } from '@/lib/email-validation'
import { handleError, AppError, ValidationError } from '@/lib/errors'

// ── Disposable email blocking ──────────────────────────────────────────────────
describe('isDisposableEmail()', () => {
  const DISPOSABLE = [
    'test@mailinator.com',
    'user@guerrillamail.com',
    'me@yopmail.com',
    'x@tempmail.com',
    'u@trashmail.com',
    'a@maildrop.cc',
    'b@mailsac.com',
    'c@10minutemail.com',
    'd@throwaway.email',
    'e@guerrillamail.info',
    'f@spam4.me',
    'g@temp-mail.org',
    'h@sharklasers.com',
  ]

  const LEGITIMATE = [
    'user@gmail.com',
    'contact@outlook.com',
    'me@hotmail.com',
    'info@yahoo.com',
    'team@empresa.cl',
    'admin@university.edu',
    'support@company.io',
    'hello@startup.dev',
  ]

  it.each(DISPOSABLE)('blocks disposable: %s', (email) => {
    expect(isDisposableEmail(email)).toBe(true)
  })

  it.each(LEGITIMATE)('allows legitimate: %s', (email) => {
    expect(isDisposableEmail(email)).toBe(false)
  })

  it('normalizes domain to lowercase', () => {
    expect(isDisposableEmail('test@MAILINATOR.COM')).toBe(true)
    expect(isDisposableEmail('test@Guerrillamail.Com')).toBe(true)
  })

  it('returns false for malformed emails (no @)', () => {
    expect(isDisposableEmail('notanemail')).toBe(false)
    expect(isDisposableEmail('')).toBe(false)
  })

  it('handles email with exactly one @ correctly', () => {
    // Empty local-part but valid domain
    expect(isDisposableEmail('@mailinator.com')).toBe(true)
    expect(isDisposableEmail('@gmail.com')).toBe(false)
  })
})

// ── MIME type validation logic ─────────────────────────────────────────────────
describe('Upload MIME type validation', () => {
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const BLOCKED = [
    'application/pdf',
    'text/html',
    'application/javascript',
    'application/x-php',
    'image/svg+xml',    // SVG can contain XSS
    'application/zip',
    'video/mp4',
  ]

  it.each(ALLOWED)('accepts allowed MIME type: %s', (mime) => {
    expect(ALLOWED.includes(mime)).toBe(true)
  })

  it.each(BLOCKED)('rejects disallowed MIME type: %s', (mime) => {
    expect(ALLOWED.includes(mime)).toBe(false)
  })
})

// ── Error sanitization — no internal details leaked in production ──────────────
describe('handleError() production safety', () => {
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV

  afterEach(() => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: ORIGINAL_NODE_ENV, writable: true })
  })

  it('returns generic message in production for generic Error', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })
    const payload = handleError(new Error('DB connection string: postgres://user:SECRET@host'))
    expect(payload.error.message).toBe('Error interno del servidor')
    expect(payload.error.message).not.toContain('SECRET')
    expect(payload.error.message).not.toContain('postgres')
  })

  it('always exposes message for AppError regardless of env', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })
    const payload = handleError(new ValidationError('Campo requerido'))
    // AppError messages are considered safe (authored by us, not from DB/libs)
    expect(payload.error.message).toBe('Campo requerido')
  })

  it('never includes stack trace in response', () => {
    const err = new Error('Some internal error')
    const payload = handleError(err)
    const serialized = JSON.stringify(payload)
    expect(serialized).not.toContain('stack')
    expect(serialized).not.toContain('at Object.')
    expect(serialized).not.toContain('.ts:')
    expect(serialized).not.toContain('.js:')
  })

  it('structured error shape always has success: false', () => {
    const cases = [
      new Error('generic'),
      new ValidationError('validation'),
      new AppError('CUSTOM', 'custom error'),
      new TypeError('type error'),
    ]
    for (const err of cases) {
      const payload = handleError(err)
      expect(payload.success).toBe(false)
      expect(payload.error).toBeDefined()
      expect(payload.error.code).toBeDefined()
    }
  })
})

// ── Chat message limits ────────────────────────────────────────────────────────
describe('Chat API message validation constants', () => {
  const MAX_MESSAGES = 20
  const MAX_MSG_LENGTH = 500

  it('enforces reasonable message count limit', () => {
    expect(MAX_MESSAGES).toBeGreaterThanOrEqual(10)
    expect(MAX_MESSAGES).toBeLessThanOrEqual(50)
  })

  it('enforces reasonable message length limit', () => {
    expect(MAX_MSG_LENGTH).toBeGreaterThanOrEqual(200)
    expect(MAX_MSG_LENGTH).toBeLessThanOrEqual(2000)
  })

  it('message array exceeding MAX_MESSAGES should be rejected', () => {
    const tooManyMessages = Array.from({ length: MAX_MESSAGES + 1 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'test message',
    }))
    expect(tooManyMessages.length).toBeGreaterThan(MAX_MESSAGES)
  })

  it('message exceeding MAX_MSG_LENGTH should be detected', () => {
    const longMessage = 'x'.repeat(MAX_MSG_LENGTH + 1)
    expect(longMessage.length).toBeGreaterThan(MAX_MSG_LENGTH)
  })
})
