import { handleError, ValidationError } from '@/lib/errors'
import { ZodError, z } from 'zod'

describe('error utilities', () => {
  it('formats AppError instances consistently', () => {
    const error = new ValidationError('Test failed', { field: ['error'] })
    const payload = handleError(error)

    expect(payload).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Test failed',
        details: { field: ['error'] },
      },
    })
  })

  it('formats ZodError validation failures correctly', () => {
    const schema = z.object({ email: z.string().email() })
    const result = schema.safeParse({ email: 'invalid' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const payload = handleError(result.error)
      expect(payload.success).toBe(false)
      expect(payload.error.code).toBe('VALIDATION_ERROR')
      expect(payload.error.details).toHaveProperty('email')
    }
  })
})
