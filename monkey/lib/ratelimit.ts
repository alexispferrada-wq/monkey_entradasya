import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Solo inicializar Redis si las variables están configuradas
const hasRedis = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

let redis: Redis | null = null
let rateLimiters: {
  invitations: Ratelimit
  scanner: Ratelimit
  login: Ratelimit
  chat: Ratelimit
  api: Ratelimit
} | null = null

if (hasRedis) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  rateLimiters = {
    invitations: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      prefix: 'ratelimit:invitations',
    }),
    scanner: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      prefix: 'ratelimit:scanner',
    }),
    login: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 m'),
      prefix: 'ratelimit:login',
    }),
    chat: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      prefix: 'ratelimit:chat',
    }),
    api: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      prefix: 'ratelimit:api',
    }),
  }
}

export { rateLimiters }

export async function checkRateLimit(
  limiter: Ratelimit | undefined | null,
  identifier: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (!limiter) {
    // Sin Redis configurado: permitir todas las requests
    return { allowed: true, remaining: 999 }
  }
  try {
    const result = await limiter.limit(identifier)
    return { allowed: result.success, remaining: result.remaining }
  } catch (error) {
    console.error('Rate limit error:', error)
    return { allowed: true, remaining: 0 }
  }
}
